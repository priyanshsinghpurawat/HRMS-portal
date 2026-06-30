import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Navbar from "../Component/Jobportal/Home/JobLayoutHome/Navbar";
import ProtectedRoute, { PublicOnlyRoute, HRMSProtectedRoute } from "./ProtectedRoute";
import MasterHome from "../Pages/MasterHome";
import JobHome from "../Component/Jobportal/Home/JobHome";
import Login from "../Component/Jobportal/AuthPages/Login";
import Register from "../Component/Jobportal/AuthPages/Register";
import UserProfile from "../Component/Jobportal/Home/UserDetails/UserProfile";
import Alljobs from "../Component/Jobportal/Alljobs/Alljobs";
import JobDetails from "../Component/Jobportal/Alljobs/JobDetails";
import AboutUs from "../Pages/AboutUs";
import HrmsHome from "../Component/Hrms/HrmsHome/HrmsHome";
import CompanyRegister from "../Component/Hrms/HrmsHome/CompanyRegister";
import HrmLogin from "../Component/Hrms/HrmsHome/HrmLogin";
import Hrmsintrodetails from "../Component/Hrms/HrmsHome/Hrmsintrodetails";
import MainWhyDetails from "../Pages/Allhomepage/MainWhyDetails";
import CompanyDashboardHome from "../Component/Hrms/Company/dashboard/companyDashboardHome/CompanyDashboardHome";
import Hrdashboard from "../Component/Hrms/Company/dashboard/Hrdashboard/Hrdashboard";
import Employeedashboard from "../Component/Hrms/Company/dashboard/Employeedashboard/Employeedashboard";
import CreateHrCompany from "../Component/Hrms/Company/dashboard/companyDashboardHome/CreateHrCompany";
import CompanySubscription from "../Component/Hrms/Company/dashboard/companyDashboardHome/CompanySubscription";
import ApplyerDetails from "../Component/Hrms/Company/dashboard/Hrdashboard/ApplyerDetails";
import Attendance from "../Component/Hrms/Company/dashboard/Hrdashboard/Attendance";
import CreateEmployee from "../Component/Hrms/Company/dashboard/Hrdashboard/CreateEmployee";
import EmployeeDetail from "../Component/Hrms/Company/dashboard/Hrdashboard/EmployeeDetail";
import HrProfile from "../Component/Hrms/Company/dashboard/Hrdashboard/HrProfile";
import JobPost from "../Component/Hrms/Company/dashboard/Hrdashboard/JobPost";
import HrDirectory from "../Component/Hrms/Company/dashboard/companyDashboardHome/HrDirectory";
import HrApplications from "../Component/Hrms/Company/dashboard/Hrdashboard/HrApplications";
import MyApplications from "../Component/Jobportal/Home/JobLayoutHome/Jobspage/MyApplications";
import ProfileEM from "../Component/Hrms/Company/dashboard/Employeedashboard/ProfileEM";
import LeveApplyEm from "../Component/Hrms/Company/dashboard/Employeedashboard/LeveApplyEm";
import LeaveRequest from "../Component/Hrms/Company/dashboard/Hrdashboard/LeaveRequest.jsx";
import MasterOverview from "../Component/Hrms/Company/dashboard/companyDashboardHome/MasterOverview.jsx";
import AttendanceEm from "../Component/Hrms/Company/dashboard/Employeedashboard/AttendanceEm.jsx";
import PayslipsPage from "../Component/Hrms/Company/dashboard/Employeedashboard/PayslipsPage.jsx";
import PrivacyPolicy from "../Component/Legal/PrivacyPolicy";
import TermsCondition from "../Component/Legal/TermsCondition";
import FaqPage from "../Component/Legal/FaqPage";
import ForgotPassword from "../Component/Jobportal/AuthPages/ForgotPassword";
import ResetPassword from "../Component/Jobportal/AuthPages/ResetPassword";
import ComingSoon from "../Pages/ComingSoon";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); }, [pathname]);
  return null;
}

const PageTransition = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.15 }}>
    {children}
  </motion.div>
);

function RouteMain() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
    
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<PageTransition><MasterHome /></PageTransition>} />
          <Route path="/jobs" element={<PageTransition><JobHome /></PageTransition>} />
          <Route path="/about-us" element={<PageTransition><AboutUs /></PageTransition>} />
          <Route path="/jobportal/alljobs" element={<PageTransition><Alljobs /></PageTransition>} />
          <Route path="/jobportal/alljobs/:id" element={<PageTransition><JobDetails /></PageTransition>} />
          <Route path="/mainwhydetails/:id" element={<PageTransition><MainWhyDetails /></PageTransition>} />
          <Route path="/hrms" element={<PageTransition><HrmsHome /></PageTransition>} />
          <Route path="/hrmsintrodetails/:id" element={<PageTransition><Hrmsintrodetails /></PageTransition>} />
          <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
          <Route path="/terms-conditions" element={<PageTransition><TermsCondition /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><FaqPage /></PageTransition>} />

          {/* Auth Routes - Public Only */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/company-register" element={<PageTransition><CompanyRegister /></PageTransition>} />
            <Route path="/hrm-login" element={<PageTransition><HrmLogin /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          </Route>

          {/* Protected Routes - Job Portal User */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/userprofile" element={<PageTransition><UserProfile /></PageTransition>} />
            <Route path="/u-profile" element={<PageTransition><UserProfile /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><JobHome /></PageTransition>} />
            <Route path="/myapplications" element={<PageTransition><MyApplications/></PageTransition>} />

          </Route>

          {/* HRMS Protected - Company */}
          <Route element={<HRMSProtectedRoute allowedRoles={["company"]} />}>
            <Route path="/company-dashboard" element={<PageTransition><CompanyDashboardHome /></PageTransition>} />
            <Route path="/company/master-overview" element={<PageTransition><MasterOverview /></PageTransition>} />
            <Route path="/creteHr" element={<PageTransition><CreateHrCompany /></PageTransition>} />
            <Route path="/company/hrdirectory" element={<PageTransition><HrDirectory /></PageTransition>} />
          </Route>

          {/* HRMS Protected - HR */}
          <Route element={<HRMSProtectedRoute allowedRoles={["hr"]} />}>
            <Route path="/hrdashboard" element={<PageTransition><Hrdashboard /></PageTransition>} />
            <Route path="/hr/applications" element={<PageTransition><HrApplications /></PageTransition>} />
            <Route path="/hr/create-employee" element={<PageTransition><CreateEmployee /></PageTransition>} />
            <Route path="/hr/profile" element={<PageTransition><HrProfile /></PageTransition>} />
            <Route path="/hr/employee-detail" element={<PageTransition><EmployeeDetail /></PageTransition>} />
            <Route path="/hr/leave-request" element={<PageTransition><LeaveRequest /></PageTransition>} />
            <Route path="/hr/attendance" element={<PageTransition><Attendance /></PageTransition>} />
            <Route path="/hr/job-post" element={<PageTransition><JobPost /></PageTransition>} />
            <Route path="/hr/applyer-details" element={<PageTransition><ApplyerDetails /></PageTransition>} />
          </Route>

          {/* HRMS Protected - Employee */}
          <Route element={<HRMSProtectedRoute allowedRoles={["employee"]} />}>
            <Route path="/employeedashboard" element={<PageTransition><Employeedashboard /></PageTransition>} />
            <Route path="/employee/profile" element={<PageTransition><ProfileEM /></PageTransition>} />
            <Route path="/employee/leave" element={<PageTransition><LeveApplyEm /></PageTransition>} />
            <Route path="/employee/attendance" element={<PageTransition><AttendanceEm /></PageTransition>} />
            <Route path="/employee/payslips" element={<PageTransition><PayslipsPage /></PageTransition>} />
            <Route path="/employee/my-applications" element={<PageTransition><ComingSoon /></PageTransition>} />
          </Route>

          {/* Shared HRMS Routes */}
          <Route element={<HRMSProtectedRoute allowedRoles={["company", "hr"]} />}>
            <Route path="/subscription" element={<PageTransition><CompanySubscription /></PageTransition>} />
          </Route>

          {/* Missing Features / Coming Soon Routes */}
          <Route path="/companies" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/salary-guide" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/resume-builder" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/blog" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/post-job" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/candidates" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/trust" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/accessibility" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/job-alerts" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/resources" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/partners" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/cookies" element={<PageTransition><ComingSoon /></PageTransition>} />
          <Route path="/admin/*" element={<PageTransition><ComingSoon /></PageTransition>} />

          {/* 404 */}
          <Route path="*" element={
            <PageTransition>
              <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <h1 className="text-6xl font-bold text-[#EA580C] mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
                <a href="/" className="px-6 py-3 bg-[#EA580C] text-white rounded-lg hover:bg-orange-700">Go Home</a>
              </div>
            </PageTransition>
          } />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default RouteMain;