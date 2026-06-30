import React, { useState, useEffect } from "react";
import axios from "axios";
import heroImage from "../../../../../assets/img/pngLogo.png";
import NotificationBell from "../../../../NotificationBell";
import {
  Search,
  Plus,
  Users,
  FolderOpen,
  FileText,
  CalendarCheck,
  Briefcase,
  UserCheck,
  Bell,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ClipboardList,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

// Navbar Component
const NavbarHrm = () => (
  <nav className="bg-white border-b border-orange-100 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
        <Briefcase className="w-4 h-4 text-white" />
      </div>
      <Link to="/hrms">
        <img
          src={heroImage}
          alt="HRMS Hero"
          className="w-25 max-w-5xl object-contain rounded-3xl"
        />
      </Link>
    </div>
    <div className="flex items-center gap-4">
      <NotificationBell />
      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-200">
        HR
      </div>
    </div>
  </nav>
);

// Stat Card Component
const StatCard = ({ number, label, icon: Icon, delay, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(number) || 0;

    if (target === 0) {
      setCount(0);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl p-8 shadow-lg shadow-orange-100/50 border border-orange-50 cursor-pointer group relative overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity duration-500`}
      />

      <div className="flex items-center justify-between mb-4">
        <motion.div
          className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.3 }}
          className="flex items-center gap-1"
        ></motion.div>
      </div>

      <motion.h2
        className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {count}
      </motion.h2>
      <p className="text-gray-500 font-medium text-sm">{label}</p>

    </motion.div>
  );
};

// Action Card Component
const ActionCard = ({ title, icon: Icon, delay, color, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: delay,
        type: "spring",
        stiffness: 120,
      }}
      whileHover={{
        y: -12,
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(249, 115, 22, 0.25)",
        transition: { duration: 0.3 },
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-white rounded-2xl p-8 shadow-lg shadow-orange-100/30 border border-orange-50/50 cursor-pointer group relative overflow-hidden"
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${color} opacity-20`}
            animate={{
              y: [0, -30, 0],
              x: [0, i * 10 - 10, 0],
              opacity: [0, 0.3, 0],
              scale: [1, 1.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut",
            }}
            style={{
              left: `${30 + i * 25}%`,
              top: "60%",
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center text-center relative z-10">
        <motion.div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg shadow-orange-200/50 group-hover:shadow-xl group-hover:shadow-orange-300/50 transition-shadow duration-300`}
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors duration-300">
          {title}
        </h3>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <span>Click to open</span>
          <ArrowUpRight className="w-4 h-4" />
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ChevronRight
          className={`w-5 h-5 bg-gradient-to-br ${color} text-white rounded-full p-1`}
        />
      </div>
    </motion.div>
  );
};

// Main Dashboard Component
const Hrdashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const [activeEmployeesCount, setActiveEmployeesCount] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = sessionStorage.getItem("companyToken");
        if (!token) return;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        };


        const [jobsRes, empRes] = await Promise.all([
          axios.get(
            window.API_BASE_URL + "/jobs",
            config,
          ),
          axios.get(
            window.API_BASE_URL + "/employees",
            config,
          ),
        ]);

        const allJobs = jobsRes.data?.data || [];
        const allEmployees = empRes.data?.data || [];


        const myJobsCount = allJobs.length;


        const activeEmpCount = allEmployees.filter(
          (emp) => emp.employmentStatus === "active",
        ).length;

        setActiveJobsCount(myJobsCount);
        setActiveEmployeesCount(activeEmpCount);
      } catch (error) {
      }
    };

    fetchDashboardStats();
  }, []);

  const stats = [
    {
      number: activeEmployeesCount.toString(),
      label: "Active Employees",
      icon: Users,
      color: "from-orange-500 to-orange-600",
    },
    {
      number: activeJobsCount.toString(),
      label: "Post Jobs",
      icon: Clock,
      color: "from-orange-400 to-orange-500",
    },
  ];

  const actions = [
    {
      title: "Create Employee",
      icon: Plus,
      color: "from-orange-500 to-orange-600",
      path: "/hr/create-employee",
    },
    {
      title: "Profile",
      icon: Users,
      color: "from-blue-400 to-blue-600",
      path: "/hr/profile",
    },
    {
      title: "Employee Detail",
      icon: FolderOpen,
      color: "from-emerald-400 to-emerald-600",
      path: "/hr/employee-detail",
    },
    {
      title: "Leave Request",
      icon: FileText,
      color: "from-violet-400 to-violet-600",
      path: "/hr/leave-requests",
    },
    {
      title: "Attendance Details",
      icon: CalendarCheck,
      color: "from-amber-400 to-amber-600",
      path: "/hr/attendance",
    },
    {
      title: "Job Post",
      icon: Briefcase,
      color: "from-rose-400 to-rose-600",
      path: "/hr/job-post",
    },
    {
      title: "Applications",
      icon: ClipboardList,
      color: "from-indigo-400 to-indigo-600",
      path: "/hr/applications",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30">
      <NavbarHrm />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            HR Dashboard
            <motion.span
              className="inline-block ml-2"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            ></motion.span>
          </h1>
          <p className="text-gray-500">
            Manage your team and operations efficiently
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>

          <motion.div
            className="absolute inset-y-0 right-4 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: searchQuery ? 1 : 0 }}
          >
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-gray-400 text-sm">✕</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.15} />
          ))}
        </div>

        {/* Action Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {actions.map((action, index) => (
            <ActionCard
              key={action.title}
              {...action}
              delay={0.5 + index * 0.1}
              onClick={() => navigate(action.path)}
            />
          ))}
        </motion.div>

        {/* Bottom Stats Row */}
      </div>
    </div>
  );
};

export default Hrdashboard;