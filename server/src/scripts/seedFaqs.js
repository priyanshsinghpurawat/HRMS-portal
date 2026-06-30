/**
 * Seed script — populates the Faq collection with initial content.
 *
 * Usage:
 *   node src/scripts/seedFaqs.js
 *
 * Run this once after deploying to populate the FAQ page with data.
 * Safe to re-run — clears existing FAQs before inserting.
 */

import mongoose from "mongoose";
import { Faq } from "../models/Faq.model.js";
import { DB_NAME } from "../constants/index.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

const faqs = [
  // ── General ─────────────────────────────────────────────────────────────
  {
    question: "What is JobDekho?",
    answer:
      "JobDekho is a complete job portal and HR management platform. Job seekers can find and apply for jobs, while companies can post openings, manage HR workflows, track employee attendance, and handle payroll — all in one place.",
    category: "General",
    order: 1,
  },
  {
    question: "Is JobDekho free to use?",
    answer:
      "JobDekho offers a free tier for job seekers to browse and apply for jobs. Companies can register and post jobs with a free trial. Premium subscription plans unlock advanced HRMS features like payroll, bulk hiring, and analytics.",
    category: "General",
    order: 2,
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach us at support@jobdekho.com or through the Contact section on our website. Our team typically responds within 24 hours on business days.",
    category: "General",
    order: 3,
  },
  {
    question: "Is my data safe on JobDekho?",
    answer:
      "Yes. We use JWT-based authentication, bcrypt password hashing, HTTPS encryption, and strict tenant isolation. Your data is never shared with other companies or third parties without your explicit consent.",
    category: "General",
    order: 4,
  },

  // ── Job Seekers ──────────────────────────────────────────────────────────
  {
    question: "How do I create an account?",
    answer:
      "Click the Register button on the top right, fill in your name, email, and password, and you're ready to go. You can also sign up using Google OAuth for faster access.",
    category: "Job Seekers",
    order: 1,
  },
  {
    question: "How do I apply for a job?",
    answer:
      "Browse jobs from the Jobs page, click on a listing to view details, and hit the Apply button. You can upload your resume and write a cover note before submitting your application.",
    category: "Job Seekers",
    order: 2,
  },
  {
    question: "Can I track my applications?",
    answer:
      "Yes. Go to My Applications from your dashboard to see the status of every job you've applied to — whether it's under review, shortlisted, or rejected.",
    category: "Job Seekers",
    order: 3,
  },
  {
    question: "How do I update my resume?",
    answer:
      "Navigate to your Profile page, scroll to the Resume section, and upload a new file. You can also edit your education, experience, skills, and certifications directly from your profile.",
    category: "Job Seekers",
    order: 4,
  },

  // ── Companies ────────────────────────────────────────────────────────────
  {
    question: "How do I register my company?",
    answer:
      "Click HRMS on the navigation bar, then select Company Registration. Fill in your business details, verify your email with the OTP, and your company account is created instantly.",
    category: "Companies",
    order: 1,
  },
  {
    question: "How do I post a job?",
    answer:
      "After logging in as an HR or Company admin, go to Job Post from the dashboard sidebar. Fill in the job title, description, requirements, salary range, and location — then publish it. The listing goes live immediately.",
    category: "Companies",
    order: 2,
  },
  {
    question: "How do I add HR managers to my company?",
    answer:
      "From the Company Dashboard, go to Create HR. Enter the HR manager's details and assign them a role. They'll receive login credentials and can start managing applicants right away.",
    category: "Companies",
    order: 3,
  },
  {
    question: "Can I see who applied to my jobs?",
    answer:
      "Yes. Go to Applications from the HR dashboard to view all candidates who applied. You can filter by job, see resume details, and update application status (shortlisted, rejected, etc.).",
    category: "Companies",
    order: 4,
  },

  // ── HR & Employees ───────────────────────────────────────────────────────
  {
    question: "How does employee attendance work?",
    answer:
      "Employees check in and out through the Attendance page using GPS geofencing. The system verifies they're within the office radius before allowing check-in. HR can view daily attendance reports from their dashboard.",
    category: "HR & Employees",
    order: 1,
  },
  {
    question: "How do I apply for leave?",
    answer:
      "Employees can go to the Leave section on their dashboard, select a date, write a reason, and submit. The request goes to the HR manager for approval. You can track the status from the same page.",
    category: "HR & Employees",
    order: 2,
  },
  {
    question: "What is geofencing and why is it used?",
    answer:
      "Geofencing is a location-based feature that creates a virtual boundary around your office. Employees must be within this boundary to check in. This prevents attendance fraud and ensures accurate time tracking.",
    category: "HR & Employees",
    order: 3,
  },

  // ── Account & Login ──────────────────────────────────────────────────────
  {
    question: "I forgot my password. What do I do?",
    answer:
      "Click Login, then select Forgot Password. Enter your registered email address and we'll send you a reset link. Follow the link to set a new password.",
    category: "Account & Login",
    order: 1,
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to your Profile settings and click on Delete Account. This action is permanent and removes all your data from our servers. You can also email support@jobdekho.com to request deletion.",
    category: "Account & Login",
    order: 2,
  },
  {
    question: "Can I change my email address?",
    answer:
      "Yes. Go to your Profile page, click Edit on your personal information, update your email, and save. You may need to verify the new email via OTP.",
    category: "Account & Login",
    order: 3,
  },

  // ── Subscriptions ────────────────────────────────────────────────────────
  {
    question: "What subscription plans are available?",
    answer:
      "We offer Starter, Professional, and Enterprise plans with monthly and yearly billing. Each plan unlocks different levels of HRMS features — from basic job posting to full payroll and analytics.",
    category: "Subscriptions",
    order: 1,
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "Go to Subscription from your Company Dashboard. You can cancel anytime — your plan stays active until the end of the current billing period. No cancellation fees apply.",
    category: "Subscriptions",
    order: 2,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to MongoDB");

    const existingCount = await Faq.countDocuments();
    if (existingCount > 0) {
      console.log(`Clearing ${existingCount} existing FAQs...`);
      await Faq.deleteMany({});
    }

    const inserted = await Faq.insertMany(faqs);
    console.log(`Seeded ${inserted.length} FAQs successfully`);

    await mongoose.disconnect();
    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
