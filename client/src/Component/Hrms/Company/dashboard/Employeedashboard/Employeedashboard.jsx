import React, { useState, useEffect } from 'react';
import heroImage from '../../../../../assets/img/pngLogo.png';
import NotificationBell from '../../../../NotificationBell';
import {
  Search,
  Calendar,
  FileText,
  Clock,
  Briefcase,
  User,
  Bell,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ClipboardCheck,
  Wallet,
  Award,
  BarChart3,
  CalendarDays,
  FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const NavbarEmployee = () => (
  <nav className="bg-white border-b border-emerald-100 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
      <Link to="/employee">
        <img src={heroImage} alt="HRMS" className="w-25 max-w-5xl object-contain rounded-3xl" />
      </Link>
    </div>
    <div className="flex items-center gap-4">
      <NotificationBell />
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-emerald-200">
        EM
      </div>
    </div>
  </nav>
);

const StatCard = ({ number, label, icon: Icon, delay, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = parseInt(number);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 100 }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
      className="bg-white rounded-2xl p-8 shadow-lg shadow-emerald-100/50 border border-emerald-50 cursor-pointer group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity duration-500`} />
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
          className="flex items-center gap-1 text-emerald-500 text-sm font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          <span>+5%</span>
        </motion.div>
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

const ActionCard = ({ title, icon: Icon, delay, color, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, type: "spring", stiffness: 120 }}
    whileHover={{ y: -12, scale: 1.05, boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25)", transition: { duration: 0.3 } }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-8 shadow-lg shadow-emerald-100/30 border border-emerald-50/50 cursor-pointer group relative overflow-hidden"
  >
    <motion.div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full bg-gradient-to-br ${color} opacity-20`}
          animate={{ y: [0, -30, 0], x: [0, i * 10 - 10, 0], opacity: [0, 0.3, 0], scale: [1, 1.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
          style={{ left: `${30 + i * 25}%`, top: "60%" }}
        />
      ))}
    </div>
    <div className="flex flex-col items-center text-center relative z-10">
      <motion.div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg shadow-emerald-200/50 group-hover:shadow-xl group-hover:shadow-emerald-300/50 transition-shadow duration-300`}
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>
      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors duration-300">{title}</h3>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 text-emerald-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <span>Click to open</span>
        <ArrowUpRight className="w-4 h-4" />
      </motion.div>
    </div>
    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <ChevronRight className={`w-5 h-5 bg-gradient-to-br ${color} text-white rounded-full p-1`} />
    </div>
  </motion.div>
);

const Employeedashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { number: "12", label: "Leave Balance (Days)", icon: Calendar, color: "from-emerald-500 to-emerald-600" },
    { number: "3", label: "Pending Requests", icon: Clock, color: "from-teal-500 to-teal-600" },
  ];

  const actions = [
    { title: "My Profile", icon: User, color: "from-emerald-500 to-emerald-600", path: "/employee/profile" },
    { title: "Apply Leave", icon: CalendarDays, color: "from-teal-500 to-teal-600", path: "/employee/leave" },
    { title: "My Attendance", icon: ClipboardCheck, color: "from-green-500 to-green-600", path: "/employee/attendance" },
    { title: "Payslips", icon: Wallet, color: "from-emerald-600 to-emerald-700", path: "/employee/payslips" },
    { title: "My Applications", icon: FileText, color: "from-teal-400 to-teal-500", path: "/employee/my-applications" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30">
      <NavbarEmployee />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Employee Dashboard
            <motion.span className="inline-block ml-2" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              👋
            </motion.span>
          </h1>
          <p className="text-gray-500">Manage your work and personal information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search leaves, payslips, or actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 bg-white shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-4 flex items-center p-1 hover:bg-gray-100 rounded-full">
              <span className="text-gray-400 text-sm">✕</span>
            </button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} delay={index * 0.15} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <ActionCard key={action.title} {...action} delay={0.5 + index * 0.1} onClick={() => navigate(action.path)} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { label: "Attendance Rate", value: "98%", icon: BarChart3 },
            { label: "Completed Tasks", value: "24", icon: FileCheck },
            { label: "Years of Service", value: "3.5", icon: Award },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.02 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50 flex items-center gap-4"
            >
              <div className="p-2 bg-emerald-100 rounded-lg">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-xl font-bold text-gray-800">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Employeedashboard;
