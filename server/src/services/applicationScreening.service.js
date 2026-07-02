import { Application } from "../models/Application.model.js";
import { Profile } from "../models/Profile.model.js";
import { Job } from "../models/Job.model.js";
import { User } from "../models/User.model.js";
import { Experience } from "../models/Experience.model.js";
import { Education } from "../models/Education.model.js";
import { Certification } from "../models/Certificate.model.js";
import { calculateMatchScore } from "./jobMatching.service.js";

/**
 * Perform resume screening on the application using Gemini API with fallback scoring logic.
 * @param {string} applicationId - Application ID
 */
export const screenApplication = async (applicationId) => {
    try {
        const application = await Application.findById(applicationId);
        if (!application) {
            return;
        }

        const job = await Job.findById(application.job);
        if (!job) {
            return;
        }

        const applicantUser = await User.findById(application.applicant).select("name email");
        const profile = await Profile.findOne({ user: application.applicant });

        const experiences = await Experience.find({ user: application.applicant, isDeleted: false });
        const educations = await Education.find({ user: application.applicant });
        const certifications = await Certification.find({ user: application.applicant, isDeleted: false });

        const candidateInfo = {
            name: applicantUser ? applicantUser.name : "Unknown Candidate",
            email: applicantUser ? applicantUser.email : "Unknown Email",
            title: profile ? profile.title : "",
            about: profile ? profile.about : "",
            skills: profile ? profile.skills : [],
            experienceLevel: profile ? profile.experienceLevel : "fresher",
            experiences: experiences.map(exp => ({
                company: exp.company,
                title: exp.title,
                experienceLevel: exp.experienceLevel,
                description: exp.description,
                startDate: exp.startDate,
                endDate: exp.endDate,
                currentlyWorking: exp.currentlyWorking
            })),
            educations: educations.map(edu => ({
                institution: edu.institution,
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                educationLevel: edu.educationLevel
            })),
            certifications: certifications.map(cert => ({
                certificationName: cert.certificationName,
                issuingOrganization: cert.issuingOrganization
            }))
        };

        const apiKey = process.env.GEMINI_API_KEY;
        let aiResult = null;

        if (apiKey) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const promptText = `
Analyze the candidate's application details against the job requirements.

Job Details:
Title: ${job.title}
Description: ${job.description}
Department: ${job.department}
Employment Type: ${job.employmentType}
Experience Level: ${job.experienceLevel}
Skills Required: ${job.skills ? job.skills.join(", ") : "None specified"}

Candidate Details:
Name: ${candidateInfo.name}
Title: ${candidateInfo.title || "Not specified"}
About: ${candidateInfo.about || "Not specified"}
Self-declared Skills: ${candidateInfo.skills.join(", ")}
Experience Level: ${candidateInfo.experienceLevel}
Work Experiences: ${JSON.stringify(candidateInfo.experiences)}
Educations: ${JSON.stringify(candidateInfo.educations)}
Certifications: ${JSON.stringify(candidateInfo.certifications)}
Resume Snapshot URL: ${application.resume || "Not specified"}

Perform a detailed match assessment. Evaluate:
1. Skills Match: How closely do candidate skills match job requirements? (0-100)
2. Experience Match: Does candidate experience level and history fit the job requirements? (0-100)
3. Project Match: Do the candidate's projects/accomplishments align with job goals? (0-100)
4. Portfolio Match: Does the candidate's portfolio/github/linkedin links look professional and align? (0-100)
5. Overall Score: An aggregate score reflecting overall fitness for the role. (0-100)
6. Summary: A short summary of candidate suitability (max 150 words).

You must respond with a JSON object strictly matching this schema:
{
  "score": number, // integer 0-100
  "skillsMatch": number, // integer 0-100
  "experienceMatch": number, // integer 0-100
  "projectMatch": number, // integer 0-100
  "portfolioMatch": number, // integer 0-100
  "summary": "string"
}

Ensure the response contains only valid JSON. Do not wrap the JSON output in markdown formatting (like \`\`\`json).
`;

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: promptText }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                });

                if (response.ok) {
                    const resData = await response.json();
                    const textResult = resData.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textResult) {
                        aiResult = JSON.parse(textResult.trim());
                    }
                }
            } catch {
            }
        }

        // Apply fallback logic if AI response was not successfully parsed
        if (!aiResult) {
            const { score: calculatedSkillsScore } = calculateMatchScore(candidateInfo.skills, job.skills);
            
            let experienceScore = 50;
            if (job.experienceLevel === candidateInfo.experienceLevel) {
                experienceScore = 100;
            } else if (
                (job.experienceLevel === "fresher" && candidateInfo.experienceLevel === "junior") ||
                (job.experienceLevel === "junior" && candidateInfo.experienceLevel === "mid") ||
                (job.experienceLevel === "mid" && candidateInfo.experienceLevel === "senior")
            ) {
                experienceScore = 80;
            }

            const projectScore = candidateInfo.experiences.length > 0 ? 80 : 50;
            const portfolioScore = profile?.socialLinks?.linkedin || profile?.socialLinks?.github ? 85 : 55;
            
            const overallScore = Math.round((calculatedSkillsScore + experienceScore + projectScore + portfolioScore) / 4);

            aiResult = {
                score: overallScore,
                skillsMatch: calculatedSkillsScore,
                experienceMatch: experienceScore,
                projectMatch: projectScore,
                portfolioMatch: portfolioScore,
                summary: `System computed profile analysis: skills match is ${calculatedSkillsScore}%, experience matches ${experienceScore}%.`
            };
        }

        // Update application document with screening scores
        application.aiScore = aiResult.score;
        application.skillsMatch = aiResult.skillsMatch;
        application.experienceMatch = aiResult.experienceMatch;
        application.projectMatch = aiResult.projectMatch;
        application.portfolioMatch = aiResult.portfolioMatch;
        application.aiSummary = aiResult.summary;
        application.internalStatus = "AI_SCREENED";

        await application.save();

        console.log(`Application ${applicationId} screened successfully. Score: ${aiResult.score}`);

        // Trigger dynamic queue rankings updates for all applications of the job
        await assignQueuesForJob(job._id);

    } catch {
    }
};

/**
 * Recalculate rank and queues for all active applications of a job.
 * @param {string} jobId - Job ID
 */
export const assignQueuesForJob = async (jobId) => {
    try {
        // Find all applications for the job, sorted descending by aiScore
        const applications = await Application.find({ job: jobId }).sort({ aiScore: -1 });

        for (let i = 0; i < applications.length; i++) {
            const app = applications[i];
            const rank = i + 1;
            app.queueRank = rank;

            // Update queue statuses only if the application has not been manually touched by HR
            const isManualStatus = [
                "SHORTLISTED",
                "INTERVIEW_SCHEDULED",
                "SELECTED",
                "HIRED",
                "NOT_SELECTED"
            ].includes(app.internalStatus);

            if (!isManualStatus) {
                if (rank <= 30) {
                    app.queueStatus = "shortlist_queue";
                    app.internalStatus = "SHORTLIST_QUEUE";
                } else if (rank <= 60) {
                    app.queueStatus = "hold_queue";
                    app.internalStatus = "HOLD_QUEUE";
                } else {
                    app.queueStatus = "review_queue";
                    app.internalStatus = "UNDER_HR_REVIEW";
                }
            }

            await app.save();
        }

        console.log(`Recalculated queue ranks and statuses for job ${jobId}. Total applications: ${applications.length}`);
    } catch {
    }
};
