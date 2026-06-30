import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, ArrowLeft, Bell } from 'lucide-react';
import Navbar from '../Component/Jobportal/Home/JobLayoutHome/Navbar';

const ComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          className="bg-white/80 backdrop-blur-md p-10 md:p-14 rounded-3xl shadow-2xl shadow-orange-200/50 text-center max-w-2xl border border-white/50"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-300/50">
              <Rocket className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Coming <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Soon</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg mx-auto">
            We're working hard to bring you this feature. The backend systems are ready, and our frontend team is putting the final touches on it. Stay tuned!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-200 hover:bg-orange-50 rounded-xl font-semibold transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-200 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
