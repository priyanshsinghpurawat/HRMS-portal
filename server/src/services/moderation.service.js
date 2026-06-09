import { ApiError } from "../utils/ApiError.js";

/**
 * Validate a job posting using the Gemini API.
 * Ensures the listing is safe, free of scams, cryptocurrency fees, etc.
 * @param {Object} jobData - The job details (title, description, department, employmentType, experienceLevel, salaryMin, salaryMax, location, skills)
 * @returns {Promise<Object>} The moderation result: { isSafe: boolean, riskScore: number, reasons: string[] }
 */
export const validateJobWithAI = async (jobData) => {
    const apiKey = process.env.GEMINI_API_KEY;

    // Fail closed if API key is missing
    if (!apiKey) {
        throw new ApiError(500, "Gemini API Key is missing in environment variables. Unable to moderate job posting.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const promptText = `
Analyze this job posting for potential fraud, scams, or recruitment policy violations.

Job Listing Information:
Title: ${jobData.title}
Description: ${jobData.description}
Department: ${jobData.department || "Not specified"}
Employment Type: ${jobData.employmentType}
Experience Level: ${jobData.experienceLevel}
Salary Range: Min ${jobData.salaryMin || "0"}, Max ${jobData.salaryMax || "0"}
Location: ${jobData.location}
Skills Required: ${jobData.skills ? jobData.skills.join(", ") : "None specified"}

Security/Rejection Rules:
You must reject (set isSafe = false) if the job listing fits any of the following categories:
1. Candidate is asked to pay money, registration fees, security deposits, application fees, or training fees.
2. Candidate is asked to buy products or make an investment (including cryptocurrency trading/funding).
3. Suspicious or contact-only hiring channels are mentioned (e.g. WhatsApp-only or Telegram-only contact info).
4. Unrealistic or exaggerated earning promises (e.g., "Earn ₹20,000 daily with no skills", "earn ₹5000/day without qualifications").
5. Multi-level marketing (MLM), pyramid schemes, or illegal activities.
6. Suspicious contact methods or misleading salary promises.

You must respond with a JSON object strictly matching this schema:
{
  "isSafe": boolean,
  "riskScore": number, // an integer from 0 (perfectly safe) to 100 (confirmed fraud)
  "reasons": string[] // list of reasons explaining the flags or safety assessment
}

Ensure the response contains only valid JSON. Do not wrap the JSON output in markdown formatting (like \`\`\`json).
`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: promptText
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API returned status ${response.status}`);
        }

        const resData = await response.json();
        const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResult) {
            throw new Error("Invalid response format received from Gemini API");
        }

        const result = JSON.parse(textResult.trim());

        return {
            isSafe: result.isSafe !== false,
            riskScore: typeof result.riskScore === "number" ? result.riskScore : 0,
            reasons: Array.isArray(result.reasons) ? result.reasons : []
        };
    } catch (error) {
        console.warn("AI Moderation API failed (using fallback verification):", error.message || error);
        const textToSearch = `${jobData.title} ${jobData.description} ${jobData.location}`.toLowerCase();
        
        // Scan for potential violations of our security rules offline
        const flags = [];
        if (textToSearch.includes("registration fee") || textToSearch.includes("deposit") || textToSearch.includes("pay money")) {
            flags.push("Mentions candidate fees or deposits");
        }
        if (textToSearch.includes("whatsapp-only") || textToSearch.includes("telegram-only")) {
            flags.push("Suspicious contact-only hiring channels");
        }
        if (textToSearch.includes("pyramid scheme") || textToSearch.includes("mlm")) {
            flags.push("Potential multi-level marketing or pyramid scheme");
        }
        if (textToSearch.includes("cryptocurrency") || textToSearch.includes("bitcoin") || textToSearch.includes("investment")) {
            flags.push("Request for investment or cryptocurrency funding");
        }

        const isSafe = flags.length === 0;
        return {
            isSafe,
            riskScore: isSafe ? 0 : 80,
            reasons: isSafe ? ["Passed offline fallback policy checks."] : flags
        };
    }
};
