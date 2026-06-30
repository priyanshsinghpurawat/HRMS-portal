import React from "react";
import LegalLayout from "./LegalLayout";

function TermsCondition() {
  const sections = [
    { id: "user-accounts", title: "User Accounts & Portals" },
    { id: "job-seeker-terms", title: "Job Seeker Rules" },
    { id: "employer-terms", title: "Employer & HR Guidelines" },
    { id: "hrms-employee-rules", title: "HRMS & Attendance Policy" },
    { id: "subscriptions", title: "Subscriptions & Fees" },
    { id: "liability", title: "Limitation of Liability" },
  ];

  return (
    <LegalLayout
      title="Terms & Conditions"
      lastUpdated="June 2026"
      sections={sections}
    >
      <section id="user-accounts">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          1. User Accounts & Portals
        </h2>
        <p className="text-gray-600 leading-relaxed">
          JobDekho provides three distinct access portals: Candidate, Company Master/HR, and Employee. Users agree to access only the portal designated for their role. You must provide accurate, current, and complete registration information and protect your login credentials.
        </p>
      </section>

      <section id="job-seeker-terms" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          2. Job Seeker Rules
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Job seekers are solely responsible for the information provided in their profile, resume submissions, and applications. Fake resumes, duplicate profiles, or misleading professional histories will result in immediate suspension from the platform.
        </p>
      </section>

      <section id="employer-terms" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          3. Employer & HR Guidelines
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Employers and HR managers represent that they hold proper authorization to hire on behalf of their company. Companies agree not to post false job opportunities, collect applicant data for resale, or perform discriminatory screening practices.
        </p>
      </section>

      <section id="hrms-employee-rules" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          4. HRMS & Attendance Policy
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Employees registered under a company HRMS module agree to report accurate attendance check-in and check-out logs. Falsification of attendance logs or abuse of leave applications may result in disciplinary action from their employer.
        </p>
      </section>

      <section id="subscriptions" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          5. Subscriptions & Fees
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Access to certain HRMS features, including hiring tools, HR manager creation slots, and employee tracking limits, is subject to active paid subscriptions. Subscription fees are billed recurrently and are non-refundable unless specified otherwise.
        </p>
      </section>

      <section id="liability" className="mt-10">
        <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
          6. Limitation of Liability
        </h2>
        <p className="text-gray-600 leading-relaxed">
          JobDekho is not responsible for the hiring decisions made by employers, the performance of matched candidates, or the accuracy of internal HR calculation metrics. The platform is provided "as is" and "as available".
        </p>
      </section>
    </LegalLayout>
  );
}

export default TermsCondition;