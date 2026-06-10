import { Profile } from "../models/Profile.model.js";
import { Job } from "../models/Job.model.js";
import { calculateMatchScore } from "./jobMatching.service.js";

/**
 * Find recommended active jobs for a candidate based on skill matching percentage
 * @param {string} candidateId - The user ID of the candidate
 * @returns {Promise<Array>} List of recommended jobs with matchScore
 */
export const getRecommendedJobs = async (candidateId) => {
    try {
        const profile = await Profile.findOne({ user: candidateId });
        if (!profile || !profile.skills || profile.skills.length === 0) {
            return [];
        }

        // Find active jobs that are not deleted
        const activeJobs = await Job.find({ status: "active", isDeleted: false }).populate("company", "name");

        const recommendations = [];
        for (const job of activeJobs) {
            const { score } = calculateMatchScore(profile.skills, job.skills);
            if (score > 0) { // Include jobs with at least some match
                recommendations.push({
                    jobId: job._id,
                    title: job.title,
                    company: job.company?.name || "Unknown Company",
                    matchScore: score
                });
            }
        }

        // Sort descending by match score
        recommendations.sort((a, b) => b.matchScore - a.matchScore);

        // Return top 5 matching jobs
        return recommendations.slice(0, 5);
    } catch (error) {
        console.error(`Error calculating job recommendations for candidate ${candidateId}:`, error);
        return [];
    }
};
