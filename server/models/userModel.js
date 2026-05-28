import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Full name is required"],
            minLength: [3, "Full name must be at least 3 characters"],
            maxLength: [64, "Full name cannot exceed 64 characters"]
        },

        title: {
            type: String,
            trim: true,
            maxLength: [80, "Professional headline cannot exceed 80 characters"],
            default: ""
        },

        about: {
            type: String,
            trim: true,
            maxLength: [1000, "About section cannot exceed 1000 characters"],
            default: ""
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },

        skills: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Skill",
            default: [],
            validate: {
                validator: (value) =>
                    new Set(value.map(String)).size === value.length,
                message: "Duplicate skills are not allowed"
            }
        },

        phone: {
            type: String,
            trim: true,
            unique: true,
            required: [true, "Phone number is required"],
            match: [/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile number"]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: [true, "Email address is required"],
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
                "Enter a valid email address"
            ]
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minLength: [8, "Password must be at least 8 characters"],
            select: false
        },

        role: {
            type: String,
            enum: ["user", "company", "hr", "employee", "admin"],
            default: "user"
        },

        profileImage: {
            type: String,
            trim: true,
            default: "placeholder"
        },

        resume: {
            type: String,
            trim: true,
            validate: {
                validator: (v) =>
                    !v ||
                    /^(https?:\/\/.+\.(pdf|doc|docx)|.+\.(pdf|doc|docx))$/i.test(v),
                message:
                    "Only PDF, DOC, and DOCX files or document links are supported"
            },
            default: ""
        },

        languages: {
            type: [String],
            default: [],
            set: (value) =>
                [...new Set(value.map((lang) => lang.trim().toLowerCase()))]
        },

        experience: {
            type: String,
            enum: [
                "fresher",
                "0-1 years",
                "1-3 years",
                "3-5 years",
                "5-7 years",
                "7-10 years",
                "10-15 years",
                "15+ years"
            ],
            default: "fresher"
        },

        education: [
            {
                institution: {
                    type: String,
                    trim: true,
                    // required: [true, "Institution name is required"],
                    maxLength: [100, "Institution name cannot exceed 100 characters"]
                },

                degree: {
                    type: String,
                    trim: true,
                    // required: [true, "Degree is required"],
                    maxLength: [100, "Degree cannot exceed 100 characters"]
                },

                fieldOfStudy: {
                    type: String,
                    trim: true,
                    // required: [true, "Field of study is required"],
                    maxLength: [100, "Field of study cannot exceed 100 characters"]
                },

                educationLevel: {
                    type: String,
                    enum: [
                        "high-school",
                        "diploma",
                        "bachelor",
                        "master",
                        "phd",
                        "certification",
                        "other"
                    ],
                    // required: [true, "Education level is required"]
                },

                startDate: {
                    type: Date,
                    // required: [true, "Start date is required"]
                },

                endDate: {
                    type: Date
                },

                currentlyStudying: {
                    type: Boolean,
                    default: false
                },

                grade: {
                    type: String,
                    trim: true,
                    maxLength: [20, "Grade cannot exceed 20 characters"]
                },

                description: {
                    type: String,
                    trim: true,
                    maxLength: [500, "Description cannot exceed 500 characters"]
                }
            }
        ],

        certificates: [
            {
                url: {
                    type: String,
                    trim: true,
                    // required: true,
                    match: [/^https?:\/\/.+/, "Invalid certificate URL"]
                },

                issuingAuthority: {
                    type: String,
                    trim: true,
                    // required: [true, "Issuing authority is required"]
                },

                issuingDate: {
                    type: Date,
                    // required: [true, "Issuing date is required"]
                }
            }
        ],

        location: {
            country: {
                type: String,
                trim: true,
                // required: [true, "Country is required"]
            },

            state: {
                type: String,
                trim: true,
                // required: [true, "State is required"]
            },

            city: {
                type: String,
                trim: true,
                // required: [true, "City is required"]
            },

            address: {
                type: String,
                trim: true,
                maxLength: [200, "Address cannot exceed 200 characters"],
                default: ""
            },

            pincode: {
                type: String,
                trim: true,
                match: [/^[1-9][0-9]{5}$/, "Enter a valid pincode"]
            }
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isProfileCompleted: {
            type: Boolean,
            default: false
        },

        lastLogin: {
            type: Date
        }
    },
    {
        timestamps:true
    }
);

const User = mongoose.model('user',userSchema);
export default User;


