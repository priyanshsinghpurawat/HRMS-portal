import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
    {
        job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: true,
            index: true
        },
        applicant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        status: {
            type: String,
            default: "APPLIED",
            index: true
        },
        resume: {
            type: String,
            trim: true,
            required: [true, "Resume is required for application"]
        },
        coverLetter: {
            type: String,
            trim: true,
            maxLength: 2000,
            default: ""
        },
        aiScore: {
            type: Number,
            default: 0
        },
        skillsMatch: {
            type: Number,
            default: 0
        },
        experienceMatch: {
            type: Number,
            default: 0
        },
        projectMatch: {
            type: Number,
            default: 0
        },
        portfolioMatch: {
            type: Number,
            default: 0
        },
        aiSummary: {
            type: String,
            default: ""
        },
        queueRank: {
            type: Number,
            default: null
        },
        queueStatus: {
            type: String,
            enum: ["shortlist_queue", "hold_queue", "review_queue", null],
            default: null
        },
        internalStatus: {
            type: String,
            enum: [
                "APPLIED",
                "AI_SCREENED",
                "SHORTLIST_QUEUE",
                "HOLD_QUEUE",
                "UNDER_HR_REVIEW",
                "SHORTLISTED",
                "INTERVIEW_SCHEDULED",
                "INTERVIEW_COMPLETED",
                "SELECTED",
                "OFFER_SENT",
                "OFFER_ACCEPTED",
                "HIRED",
                "NOT_SELECTED"
            ],
            default: "APPLIED",
            index: true
        },
        candidateStatus: {
            type: String,
            default: "Application Under Review",
            index: true
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Prevent user from applying to the same job multiple times
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Pre-save hook to synchronize status values and map to candidate status
applicationSchema.pre("save", function () {
    if (this.isModified("internalStatus") || this.isNew) {
        const statusMap = {
            "APPLIED": "Application Under Review",
            "AI_SCREENED": "Application Under Review",
            "SHORTLIST_QUEUE": "Application Under Review",
            "HOLD_QUEUE": "Application Under Review",
            "UNDER_HR_REVIEW": "Application Under Review",
            "SHORTLISTED": "Shortlisted",
            "INTERVIEW_SCHEDULED": "Interview Scheduled",
            "INTERVIEW_COMPLETED": "Application Under Review",
            "SELECTED": "Application Under Review",
            "OFFER_SENT": "Offer Sent",
            "OFFER_ACCEPTED": "Offer Accepted",
            "HIRED": "Hired",
            "NOT_SELECTED": "Not Selected For This Role"
        };
        this.candidateStatus = statusMap[this.internalStatus] || "Application Under Review";
        this.status = this.internalStatus;
    }
});

export const Application = mongoose.model("Application", applicationSchema);
