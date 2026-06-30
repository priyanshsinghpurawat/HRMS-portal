import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../../../../../assets/img/pngLogo.png'
import {
  Building2,
  UserPlus,
  Globe,
  CheckSquare,
  Sliders,
  MessageSquareShare,
  PlusCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Bell,
  ChevronRight,
  Sparkles
} from 'lucide-react';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

const CompanyHero = () => {
  const navigate = useNavigate();

  const coreFeatures = [
    { 
      id: 1, 
      title: 'Master Overview', 
      subtitle: 'Company dashboard analytics',
      icon: <Building2 className="w-7 h-7" />, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverColor: 'group-hover:text-blue-700',
      link: '/company/master-overview',
      badge: null
    },
    { 
      id: 2, 
      title: 'Create HR', 
      subtitle: 'Add new HR manager',
      icon: <UserPlus className="w-7 h-7" />, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      hoverColor: 'group-hover:text-indigo-700',
      link: '/creteHr',
      badge: 'HR'
    },
    { 
      id: 3, 
      title: 'HR Directory', 
      subtitle: 'View all HR personnel',
      icon: <Globe className="w-7 h-7" />, 
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      hoverColor: 'group-hover:text-teal-700',
      link: '/company/hrdirectory',
      badge: null
    },
    { 
      id: 4, 
      title: 'Leave Approvals', 
      subtitle: 'Manage leave requests',
      icon: <CheckSquare className="w-7 h-7" />, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      hoverColor: 'group-hover:text-green-700',
      link: '/leave-approvals',
      badge: '3'
    },

    { 
      id: 6, 
      title: 'Feedback', 
      subtitle: 'Employee feedback hub',
      icon: <MessageSquareShare className="w-7 h-7" />, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      hoverColor: 'group-hover:text-orange-700',
      link: '/feedback',
      badge: 'New'
    },
  ];

  const advancedFeatures = [

  ];

  const stats = [
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-white to-orange-50/30 font-sans antialiased">
      {/* Top Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto  flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200"
            >
              <Building2 className="w-5 h-5 text-white" />
            </motion.div>
            <div className='w-30'>
              <h1 className="text-xl   font-bold text-gray-800">
                <Link to="/hrms"> <img className='w-full' src={logo} alt="" /></Link>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </motion.button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
              C
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 pt-10 pb-6"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-3"
            >
              <Sparkles className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">Welcome Back</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Company Dashboard
            </h1>
            <p className="text-lg text-gray-500 max-w-xl">
              Manage your HR team and company operations from one central hub.
            </p>
          </div>

          {/* Stats Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-3 flex-wrap"
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={cardVariants}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className={`${stat.bg} rounded-2xl p-4 min-w-[120px] border border-transparent hover:border-orange-200 transition-all cursor-pointer`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Core Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >


          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {coreFeatures.map((item, index) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(item.link)}
                className="group relative bg-white rounded-3xl shadow-lg shadow-orange-100/20 border border-orange-50 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/40 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Animated gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* Floating particles */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    variants={floatingVariants}
                    animate="animate"
                  >
                    <ArrowRight className={`w-5 h-5 ${item.textColor}`} />
                  </motion.div>
                </div>

                <div className="relative p-8">
                  {/* Badge */}
                  {item.badge && (
                    <motion.span
                      variants={pulseVariants}
                      animate="animate"
                      className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700"
                    >
                      {item.badge}
                    </motion.span>
                  )}

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mb-5 group-hover:shadow-md transition-shadow ${item.textColor}`}
                  >
                    {item.icon}
                  </motion.div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold text-gray-800 mb-1 ${item.hoverColor} transition-colors`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.subtitle}</p>

                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />
        </div>

        {/* Advanced Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >


          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {advancedFeatures.map((item, index) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigate(item.link)}
                className="group relative bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-orange-200/60 hover:border-solid hover:border-orange-300 hover:bg-white hover:shadow-xl hover:shadow-orange-100/40 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Tag */}
                <span className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${item.tagColor}`}>
                  {item.tag}
                </span>

                <div className="p-8">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`w-14 h-14 rounded-2xl ${item.bgColor} flex items-center justify-center mb-5 group-hover:shadow-md transition-shadow ${item.textColor}`}
                  >
                    {item.icon}
                  </motion.div>

                  <h3 className={`text-xl font-bold text-gray-800 mb-1 ${item.hoverColor} transition-colors`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.subtitle}</p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={item.textColor}>Explore</span>
                    <ChevronRight className={`w-4 h-4 ${item.textColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-16 -mb-16" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Quick Actions</h3>
              <p className="text-orange-100">Get started with the most common tasks</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { label: 'Create HR', path: '/creteHr', icon: UserPlus },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.path}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigate(action.path)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl font-semibold hover:bg-white/30 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CompanyHero;