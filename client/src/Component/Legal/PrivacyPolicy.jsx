import React from "react";
import LegalLayout from "./LegalLayout";

function PrivacyPolicy() {
  const sections = [
    { id: "information-collection", title: "Information We Collect" },
    { id: "information-usage", title: "How We Use Your Data" },
    { id: "data-sharing", title: "Data Sharing & Employers" },
    { id: "security-measures", title: "Data Protection & Security" },
    { id: "user-rights", title: "Your Rights & Control" },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="June 2026"
      sections={sections}
    >
      <section id="information-collection">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          1. Information We Collect
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          JobDekho collects different categories of information depending on your user role:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-2 mb-4">
          <li>
            <strong>Job Seekers:</strong> We collect personal details (name, email, phone number), uploaded resumes, educational history, professional experience, skills, and profile photos.
          </li>
          <li>
            <strong>Companies & Employers:</strong> We collect business registration details, corporate address, HR manager credentials, and payment/subscription logs.
          </li>
          <li>
            <strong>Employees:</strong> We log attendance check-in/check-out timestamps, leave requests, manager feedback, and department assignments.
          </li>
        </ul>
      </section>

      <section id="information-usage" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          2. How We Use Your Data
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          We use the collected information to operate our dual job board and HRMS system:
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-2">
          <li>To match candidates with relevant job postings and manage applications.</li>
          <li>To enable companies to build structured HR directories and manage internal teams.</li>
          <li>To track employee check-in times and calculate payroll-ready attendance metrics.</li>
          <li>To handle active subscriptions, prevent fraudulent accounts, and send OTP notifications.</li>
        </ul>
      </section>

      <section id="data-sharing" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          3. Data Sharing & Employers
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Candidate profiles and resumes are only shared with companies where a candidate explicitly submits an application. HRMS organization data, company employee lists, and attendance sheets are private, encrypted, and isolated to each respective employer's tenant and cannot be accessed by other companies or users.
        </p>
      </section>

      <section id="security-measures" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          4. Data Protection & Security
        </h2>
        <p className="text-gray-600 leading-relaxed">
          We secure accounts using JSON Web Tokens (JWT) stored in HTTP-only cookies, password hashing (bcrypt), and secured API headers. Data is processed over HTTPS connections to prevent unauthorized access or interception.
        </p>
      </section>

      <section id="user-rights" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          5. Your Rights & Control
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Users have the right to request deletion of their account profilge data at any time. Job Seekers can edit, download, or delete their profile information directly via their dashboard. Company administrators can manage employee records and revoke HR permissions in accordance with company policy.
        </p>
      </section>
    </LegalLayout>
  );
}

export default PrivacyPolicy;