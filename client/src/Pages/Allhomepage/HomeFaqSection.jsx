import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const BASE_URL = window.API_BASE_URL;

const categoryIcons = {
  General: "💼",
  "Job Seekers": "🔍",
  Companies: "🏢",
  "HR & Employees": "👥",
  "Account & Login": "🔐",
  Subscriptions: "💳",
};

const AccordionItem = ({ question, answer, isOpen, onClick }) => (
  <div className="bg-white/80 backdrop-blur-sm border border-orange-100/70 rounded-2xl overflow-hidden mb-4 shadow-sm hover:shadow-md hover:border-orange-200/50 transition-all duration-300">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 text-left hover:bg-orange-50/30 transition-colors"
    >
      <span className="font-semibold text-gray-800 pr-4 text-base md:text-lg">{question}</span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm md:text-base border-t border-orange-50/50 pt-4">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

function HomeFaqSection() {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/faqs`);
        const data = await res.json();
        if (data.success && data.data.grouped) {
          setGrouped(data.data.grouped);
          const firstCat = Object.keys(data.data.grouped)[0] || "";
          setActiveCategory(firstCat);
        }
      } catch (err) {
        console.error("Failed to load home FAQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const categories = Object.keys(grouped);
  const activeFaqs = grouped[activeCategory] || [];

  return (
    <section className="py-24 bg-gradient-to-b from-[#fffaf7] to-[#fff3eb] border-t border-orange-100/50">
      <div className="max-w-[92%] 2xl:max-w-[1280px] mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-6 mb-12">
          <div>
            <span className="bg-orange-100/80 text-[#EA580C] px-4 py-2 rounded-full text-sm font-semibold tracking-wide uppercase">
              Common Queries
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight text-gray-900 tracking-tight">
              Got Questions?
              <br />
              We Have <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Answers</span>
            </h2>
          </div>
          
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 hover:scale-[1.02] transition-all duration-300"
          >
            Visit Help Center
            <ArrowUpRight size={20} />
          </Link>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse text-orange-500" />
            <p className="font-medium">Fetching FAQ categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No FAQs available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Category Selector Side (4 cols) */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2.5 pb-4 lg:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenId(null);
                  }}
                  className={`flex-shrink-0 flex items-center gap-3 px-5 py-4 rounded-2xl text-left font-bold transition-all duration-300 border ${
                    activeCategory === cat
                      ? "bg-white border-orange-200 text-[#EA580C] shadow-md shadow-orange-100/50 scale-[1.02]"
                      : "bg-white/40 border-transparent text-gray-600 hover:bg-white/60 hover:text-gray-900"
                  }`}
                >
                  <span className="text-xl">{categoryIcons[cat] || "💬"}</span>
                  <span className="text-base truncate">{cat}</span>
                </button>
              ))}
            </div>

            {/* Accordion list (8 cols) */}
            <div className="lg:col-span-8">
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {activeFaqs.map((faq) => (
                  <AccordionItem
                    key={faq._id}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openId === faq._id}
                    onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                  />
                ))}
              </motion.div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
}

export default HomeFaqSection;
