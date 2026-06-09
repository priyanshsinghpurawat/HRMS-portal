import { Employee } from "../models/Employee.model.js";
import { Application } from "../models/Application.model.js";
import { User } from "../models/User.model.js";
import { Company } from "../models/Company.model.js";
import { Offer } from "../models/Offer.model.js";
import { Notification } from "../models/Notification.model.js";
import { sendEmployeeWelcomeEmail } from "./email.service.js";

/**
 * Automate candidate conversion into employee record during onboarding
 * @param {string} applicationId - The ID of the hired application
 * @returns {Promise<Object>} The created employee document
 */
export const createEmployeeFromApplication = async (applicationId) => {
    try {
        const application = await Application.findById(applicationId).populate("applicant job");
        if (!application) {
            throw new Error(`Application not found: ${applicationId}`);
        }

        const candidateUser = await User.findById(application.applicant._id);
        if (!candidateUser) {
            throw new Error(`User not found: ${application.applicant._id}`);
        }

        // Check if employee record already exists to prevent duplicate onboarding
        const existingEmployee = await Employee.findOne({ user: candidateUser._id });
        if (existingEmployee) {
            console.log(`Employee record already exists for user ${candidateUser._id}. Skipping.`);
            return existingEmployee;
        }

        const company = await Company.findById(application.job.company);
        if (!company) {
            throw new Error(`Company not found: ${application.job.company}`);
        }

        // Fetch accepted offer or fallback to latest offer for the application
        const offer = await Offer.findOne({ application: applicationId, status: "accepted" }) 
            || await Offer.findOne({ application: applicationId });

        // 1. Generate unique sequential Employee ID (EMP0001, EMP0002...)
        const totalCount = await Employee.countDocuments();
        let nextNum = totalCount + 1;
        let employeeId = `EMP${String(nextNum).padStart(4, "0")}`;

        while (await Employee.findOne({ employeeId })) {
            nextNum++;
            employeeId = `EMP${String(nextNum).padStart(4, "0")}`;
        }

        // 2. Generate unique name-based Company Email
        const nameParts = candidateUser.name.trim().split(/\s+/);
        const firstName = nameParts[0].toLowerCase().replace(/[^a-z0-9]/g, "");
        const lastName = nameParts.slice(1).join(".").toLowerCase().replace(/[^a-z0-9.]/g, "");
        const domain = company.name.toLowerCase().trim().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");

        let companyEmail = lastName 
            ? `${firstName}.${lastName}@${domain}.company` 
            : `${firstName}@${domain}.company`;

        // Resolve duplicates by falling back to employeeId email format
        if (await Employee.findOne({ companyEmail })) {
            companyEmail = `${employeeId.toLowerCase()}@${domain}.company`;
        }

        // 3. Save Employee Record
        const employee = await Employee.create({
            user: candidateUser._id,
            company: company._id,
            employeeId,
            personalEmail: candidateUser.email,
            companyEmail,
            department: offer?.department || application.job.department || "Engineering",
            designation: offer?.designation || application.job.title || "Software Engineer",
            joiningDate: offer?.joiningDate || new Date(),
            employmentStatus: "active"
        });

        // 4. Update user account role
        candidateUser.role = "employee";
        await candidateUser.save();

        // 5. Send Welcome DB Notification
        await Notification.create({
            user: candidateUser._id,
            type: "employee_onboarded",
            message: `Congratulations! You have officially joined ${company.name}.`,
            metadata: {
                employeeId: employee.employeeId,
                companyEmail: employee.companyEmail
            }
        });

        // 6. Send Welcome Email
        await sendEmployeeWelcomeEmail({
            to: candidateUser.email,
            name: candidateUser.name,
            employeeId: employee.employeeId,
            designation: employee.designation,
            department: employee.department,
            companyEmail: employee.companyEmail,
            joiningDate: employee.joiningDate,
            companyName: company.name
        });

        console.log(`Successfully onboarded candidate ${candidateUser.name} as employee ID: ${employee.employeeId}`);
        return employee;

    } catch (error) {
        console.error(`Error during employee onboarding for application ${applicationId}:`, error);
        throw error;
    }
};
