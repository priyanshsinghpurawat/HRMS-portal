import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../Pages/Navbar";
import FooterBanner from "../../Pages/Allhomepage/FooterBanner";

function LegalLayout({
  title,
  lastUpdated,
  sections = [],
  children,
}) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section) => {
        const el = document.getElementById(section.id);

        if (
          el &&
          el.offsetTop <= scrollPosition &&
          el.offsetTop + el.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setActiveSection(id);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#fff7f2] text-gray-800 pt-20">
        {/* Header */}
        <div className="bg-white border-b border-orange-100 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="bg-orange-100 text-[#EA580C] px-4 py-2 rounded-full text-sm font-semibold">
                Legal Center
              </span>

              <h1 className="text-4xl md:text-5xl font-bold mt-5 text-[#EA580C]">
                {title}
              </h1>

              <p className="mt-3 text-gray-500">
                Last Updated: {lastUpdated}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72">
            <div className="sticky top-28 bg-white p-5 rounded-2xl shadow-md border border-orange-100">
              <h3 className="font-bold text-[#EA580C] mb-4">
                Table of Contents
              </h3>

              <div className="space-y-2">
                {sections?.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left p-2 rounded-lg transition ${
                      activeSection === section.id
                        ? "bg-orange-100 text-[#EA580C]"
                        : "hover:bg-orange-50"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white p-8 rounded-3xl shadow-md">
            {children}
          </main>
        </div>
      </div>
      <FooterBanner hideCTA={true} />
    </>
  );
}

export default LegalLayout;