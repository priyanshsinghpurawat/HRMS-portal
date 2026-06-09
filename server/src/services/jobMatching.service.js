import { Profile } from "../models/Profile.model.js";
import { Notification } from "../models/Notification.model.js";
import { Company } from "../models/Company.model.js";
import { Job } from "../models/Job.model.js";
import { sendJobMatchEmail } from "./email.service.js";

const MATCH_THRESHOLD = 60;

/**
 * Calculates match score between candidate and job skills (case-insensitive)
 * @param {string[]} candidateSkills - Candidate skills list
 * @param {string[]} jobSkills - Required job skills list
 * @returns {Object} { score: number, matchedSkills: string[] }
 */
export const calculateMatchScore = (candidateSkills = [], jobSkills = []) => {
    if (!jobSkills || jobSkills.length === 0) {
        return { score: 100, matchedSkills: [] };
    }

    const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase().trim()));
    const matched = [];

    for (const skill of jobSkills) {
        if (candidateSet.has(skill.toLowerCase().trim())) {
            matched.push(skill);
        }
    }

    const score = Math.round((matched.length / jobSkills.length) * 100);
    return { score, matchedSkills: matched };
};

/**
 * Scan candidates, calculate match scores, create database notifications and email alerts
 * @param {Object} job - The mongoose job document
 */
export const processJobMatchNotifications = async (job) => {
    try {
        if (!job || !job.skills || job.skills.length === 0) {
            return;
        }

        // Find candidates having at least one matching skill
        const candidates = await Profile.find({
            skills: { $in: job.skills },
            isProfileCompleted: true // Match only completed profiles
        }).populate("user", "name email");

        const company = await Company.findById(job.company);
        const companyName = company ? company.name : "Unknown Company";

        for (const candidate of candidates) {
            if (!candidate.user) continue;

            const { score, matchedSkills } = calculateMatchScore(candidate.skills, job.skills);

            if (score >= MATCH_THRESHOLD) {
                // 1. Create DB Notification
                await Notification.create({
                    user: candidate.user._id,
                    type: "job_match",
                    message: `A new job "${job.title}" matches your skills.`,
                    metadata: {
                        jobId: job._id,
                        companyId: job.company,
                        matchScore: score
                    }
                });

                // 2. Send email alert
                await sendJobMatchEmail({
                    to: candidate.user.email,
                    candidateName: candidate.user.name,
                    jobTitle: job.title,
                    companyName,
                    matchScore: score,
                    matchedSkills
                });
            }
        }

        // Mark processed
        await Job.findByIdAndUpdate(job._id, { notificationProcessed: true });
        console.log(`Job match notifications completed successfully for job: ${job.title} (${job._id})`);
    } catch (error) {
        console.error(`Error processing job match notifications for job ${job?._id}:`, error);
    }
};
