import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import LegalLayout from "./LegalLayout";

const BASE = window.API_BASE_URL;

/**
 * Emoji icons mapped to each FAQ category for visual distinction.
 */
const categoryIcons = {
  General: "💼",
  "Job Seekers": "🔍",
  Companies: "🏢",
  "HR & Employees": "👥",
  "Account & Login": "🔐",
  Subscriptions: "💳",
};

/**
 * Single FAQ accordion item with smooth expand/collapse animation.
 */
const AccordionItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border border-orange-100 rounded-xl overflow-hidden mb-3">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-orange-50/50 transition-colors"
    >
      <span className="font-medium text-gray-800 pr-4">{question}</span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0"
      >
        <ChevronDown className="w-5 h-5 text-[#EA580C]" />
      </motion.span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="px-4 pb-4 text-gray-600 leading-relaxed text-sm">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/**
 * FAQ Page
 * Fetches FAQs from the API and displays them in a searchable,
 * category-filtered accordion layout using the LegalLayout wrapper.
 */
function FaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${BASE}/faqs`);
        const data = await res.json();
        if (data.success) {
          setFaqs(data.data.faqs);
          setGrouped(data.data.grouped);
        }
      } catch {
        setError("Failed to load FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const categories = ["All", ...Object.keys(grouped)];

  /**
   * Filter FAQs based on search text and selected category.
   */
  const displayGrouped = activeCategory === "All"
    ? grouped
    : { [activeCategory]: grouped[activeCategory] || [] };

  /**
   * Sidebar table of contents sections (one per category).
   */
  const sidebarSections = Object.keys(grouped).map((cat) => ({
    id: cat.toLowerCase().replace(/[^a-z]/g, "-"),
    title: cat,
  }));

  return (
    <LegalLayout
      title="Frequently Asked Questions"
      lastUpdated="June 2026"
      sections={sidebarSections}
    >
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 text-sm"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-[#EA580C] text-white"
                : "bg-orange-50 text-gray-600 hover:bg-orange-100"
            }`}
          >
            {cat !== "All" && (
              <span className="mr-1">{categoryIcons[cat]}</span>
            )}
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Content */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
          <p>Loading FAQs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-400">
          <p>{error}</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No FAQs available yet.</p>
        </div>
      ) : (
        Object.entries(displayGrouped).map(([category, items]) => {
          if (!items || items.length === 0) return null;

          // Apply search filter within category
          const filtered = items.filter(
            (faq) =>
              !search ||
              faq.question.toLowerCase().includes(search.toLowerCase()) ||
              faq.answer.toLowerCase().includes(search.toLowerCase())
          );
          if (filtered.length === 0) return null;

          return (
            <div
              key={category}
              id={category.toLowerCase().replace(/[^a-z]/g, "-")}
              className="mb-10"
            >
              <h2 className="text-xl font-bold text-[#EA580C] mb-4 flex items-center gap-2">
                <span>{categoryIcons[category]}</span>
                {category}
              </h2>
              {filtered.map((faq) => (
                <AccordionItem
                  key={faq._id}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openId === faq._id}
                  onClick={() =>
                    setOpenId(openId === faq._id ? null : faq._id)
                  }
                />
              ))}
            </div>
          );
        })
      )}
    </LegalLayout>
  );
}

export default FaqPage;
