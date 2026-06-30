// Component/Hrms/HrmsHome/WorkingDetails.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const services = [
  {
    id: "01",
    title: "Task Management",
    description:
      "Efficiently assign, organize, and monitor employee tasks with a centralized task management system. Managers can create priorities, set deadlines, track project progress, and receive real-time updates. Employees stay informed about responsibilities while teams collaborate smoothly, ensuring better productivity, reduced delays, and improved project completion rates across departments.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60",
  },

  {
    id: "02",
    title: "Attendance Management",
    description:
      "Simplify workforce attendance tracking with automated check-ins, shift scheduling, leave records, and working hour calculations. The system helps HR teams reduce manual effort while ensuring accuracy in attendance reporting. Employees can easily view attendance history, request leaves, and maintain transparency for payroll and performance evaluations.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
  },

  {
    id: "03",
    title: "Employee Management",
    description:
      "Manage employee records, personal information, department details, and job roles from one secure platform. HR professionals can onboard new employees, update profiles, track performance history, and maintain organizational structure efficiently. This feature ensures streamlined communication, quick access to employee data, and better workforce management.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60",
  },

  {
    id: "04",
    title: "Leave Request",
    description:
      "Make leave management simple and transparent with digital approval workflows. Employees can submit leave requests, track approval status, and manage leave balances without paperwork. HR managers gain better visibility into workforce availability, reduce scheduling conflicts, and maintain seamless operations through automated notifications and approvals.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60",
  },

  {
    id: "05",
    title: "Payroll Management",
    description:
      "Automate salary processing, tax deductions, incentives, and payroll reporting with a secure payroll system. HR teams can generate salary slips, maintain payment history, and ensure timely compensation for employees. This feature minimizes calculation errors, saves administrative time, and improves overall financial transparency in organizations.",
    image:
      "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=800&q=60",
  },

  {
    id: "06",
    title: "Analytics Dashboard",
    description:
      "Gain valuable workforce insights with advanced analytics and reporting tools. Track employee performance, attendance trends, productivity levels, and HR metrics through interactive dashboards. Managers can make data-driven decisions, identify areas of improvement, and enhance employee engagement while maintaining overall organizational efficiency and growth.",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60",
  },
];

const WorkingDetails = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Corrected structural sync path
  const handleExplore = (serviceId) => {
    navigate(`/hrmsintrodetails/${serviceId}`);
  };

  return (
    <section className="py-24 px-5 bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="px-5 py-2 rounded-full bg-orange-100 text-[#FA7B3D] font-medium text-sm">
            HRMS Features
          </span>

          <h1 className="text-4xl md:text-5xl font-bold mt-6 text-gray-900 leading-tight">
            Smart HR Solutions
            <br />
            For Modern Teams
          </h1>

          <p className="mt-5 text-gray-600 text-lg">
            Explore how our HRMS system transforms workforce management.
          </p>
        </div>

        <div className="space-y-5">
          {services.map((service, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={service.id}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => setActiveIndex(index)}
                layout
                transition={{ duration: 0.5 }}
                className={`overflow-hidden border border-orange-200 rounded-[28px] transition-all duration-700 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#FA7B3D] to-[#ff9559] shadow-2xl"
                    : "bg-white hover:shadow-lg"
                }`}
              >
                <div className="grid lg:grid-cols-[80px_1fr_100px] items-center px-6 py-5">
                  <div className={`text-2xl font-bold ${isActive ? "text-white" : "text-gray-700"}`}>
                    {service.id}
                  </div>

                  <div>
                    <h2 className={`text-2xl font-bold ${isActive ? "text-white" : "text-gray-900"}`}>
                      {service.title}
                    </h2>
                  </div>

                  <div className="text-right">
                    <button className={`font-semibold ${isActive ? "text-white" : "text-[#FA7B3D]"}`}>
                      VIEW DETAILS ↗
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5 }}
                      className="overflow-hidden"
                    >
                      <div className="grid lg:grid-cols-2 gap-6 px-6 pb-6 items-center">
                        <motion.div
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                        >
                          <p className="text-lg text-orange-50 leading-8 mb-8">
                            {service.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExplore(service.id);
                            }}
                            className="bg-white text-[#FA7B3D] px-7 py-4 rounded-2xl font-semibold hover:scale-105 transition-all"
                          >
                            Explore Feature
                          </button>
                        </motion.div>

                        <motion.div
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex justify-center"
                        >
                          <img
                            src={service.image}
                            alt={service.title}
                            className="rounded-[28px] shadow-2xl w-full max-w-[450px] h-[250px] object-cover hover:scale-[1.02] transition-all duration-500"
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkingDetails;