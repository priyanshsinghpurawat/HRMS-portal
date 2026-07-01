// Component/Jobportal/Home/WhyChooseUs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Rocket,
  BriefcaseBusiness,
  TrendingUp,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

export const whyChooseUsData = [
  {
    id: "verified",
    label: "Verified",
    icon: <ShieldCheck size={16} />,
    title: "Verified Jobs",
    desc: "Find trusted job opportunities from verified companies and employers. We ensure that every listing goes through a verification process to help you avoid fake postings and apply with confidence for genuine career opportunities.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200",
    color: "bg-gray-50",
    detailsSubtitle: "Curated job markets verified with strict anti-fraud checks.",
    amenities: [
      { 
        img: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?w=400&auto=format&fit=crop&q=80", 
        title: "Manual Screening", 
        desc: "Every recruiter profile is individually screened by our internal team before activation." 
      },
      { 
        img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80", 
        title: "Secure Data Walls", 
        desc: "Your personal applications data and resumes are completely encrypted and protected." 
      },
      { 
        img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&auto=format&fit=crop&q=80", 
        title: "Direct Contact Desk", 
        desc: "Skip third-party agencies; communicate directly with verified headhunters." 
      }
    ]
  },
  {
    id: "fastApply",
    label: "Fast Apply",
    icon: <Rocket size={16} />,
    title: "Fast Apply",
    desc: "Speed up your job search with a quick and hassle-free application experience. Easily apply to multiple job opportunities without repeating unnecessary steps, helping you stay ahead of the competition and increase your chances of getting hired faster",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200",
    color: "bg-rose-100",
    detailsSubtitle: "One-tap submissions engineered for high-growth modern professions.",
    amenities: [
      { 
        img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80", 
        title: "Single-Click Submit", 
        desc: "Attach your saved core master profile onto job listings with a simple tap." 
      },
      { 
        img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80", 
        title: "Automated Autofill", 
        desc: "Our layout reads parsing rules to match client applications fields perfectly." 
      },
      { 
        img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80", 
        title: "Instant Receipt Status", 
        desc: "Get confirmation updates the millisecond managers open your folder." 
      }
    ]
  },
  {
    id: "workflow",
    label: "Workflow",
    icon: <BriefcaseBusiness size={16} />,
    title: "Workflow Manage",
    desc: "Easily organize and manage your job application process with a structured workflow system. Track application progress, monitor interview stages, and stay updated on every step, helping you manage opportunities more efficiently and never miss important updates.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200",
    color: "bg-red-100",
    detailsSubtitle: "Visual pipeline trackers mapped out step-by-step for candidates.",
    amenities: [
      { 
        img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80", 
        title: "Visual Board Sync", 
        desc: "A neat layout tracking your application status through review, test, and offer." 
      },
      { 
        img: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&auto=format&fit=crop&q=80", 
        title: "Dynamic Task Alerts", 
        desc: "Never miss an technical evaluation deadline with system calendar pushes." 
      },
      { 
        img: "https://images.unsplash.com/photo-1542435503-956c469947f6?w=400&auto=format&fit=crop&q=80", 
        title: "Archived Application Logs", 
        desc: "Look over historic communication logs and old review packages cleanly." 
      }
    ]
  },
  {
    id: "growth",
    label: "Growth",
    icon: <TrendingUp size={16} />,
    title: "Career Growth",
    desc: "Advance your professional journey by discovering better opportunities, connecting with trusted employers, and building the skills needed for success. Stay ahead in your career and move closer to achieving your professional goals.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200",
    color: "bg-rose-200",
    detailsSubtitle: "Accelerate your professional trajectory with structured career roadmaps.",
    amenities: [
      { 
        img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80", 
        title: "Skill Gap Audits", 
        desc: "Get personalized upskilling suggestions based on current market demands." 
      },
      { 
        img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&auto=format&fit=crop&q=80", 
        title: "Salary Benchmarking", 
        desc: "Compare local wage trends to secure maximum leverage during negotiations." 
      },
      { 
        img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&auto=format&fit=crop&q=80", 
        title: "Mentorship Networks", 
        desc: "Connect with industry veterans for direct 1-on-1 strategic guidance." 
      }
    ]
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    title: "Smart Dashboard",
    desc: "Manage job applications, track analytics, and monitor applicant activity from one centralized dashboard. Access important insights, organize recruitment workflows, and make better hiring decisions with a simple and user-friendly interface.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
    color: "bg-rose-200",
    detailsSubtitle: "A unified cockpit tracking every single active job metric simultaneously.",
    amenities: [
      { 
        img: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400&auto=format&fit=crop&q=80", 
        title: "Centralized Inbox", 
        desc: "Review recruiter direct messages, offer letters, and scheduling links in one stream." 
      },
      { 
        img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80", 
        title: "Success Analytics", 
        desc: "Monitor profile view tracking statistics and interview conversion rates." 
      },
      { 
        img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80", 
        title: "Granular UI Filters", 
        desc: "Sort high-paying operations cleanly by stack components or flexible filters." 
      }
    ]
  }
];

export default function WhyChooseUs() {
  const navigate = useNavigate();

  const getGridSpan = (id) => {
    switch (id) {
      case "verified":
        return "lg:col-span-2 md:col-span-2 col-span-1";
      case "fastApply":
        return "lg:col-span-1 md:col-span-1 col-span-1";
      case "workflow":
        return "lg:col-span-1 md:col-span-1 col-span-1";
      case "growth":
        return "lg:col-span-2 md:col-span-2 col-span-1";
      case "dashboard":
        return "lg:col-span-3 md:col-span-2 col-span-1";
      default:
        return "col-span-1";
    }
  };

  const renderMockup = (id) => {
    switch (id) {
      case "verified":
        return (
          <div className="relative w-full bg-slate-950 text-white rounded-2xl p-5 border border-slate-800/80 shadow-2xl overflow-hidden font-sans">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EA580C]/20 flex items-center justify-center text-[#EA580C] font-bold text-sm">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">JobDekho Shield</h4>
                  <p className="text-[9px] text-gray-400">Security Audit</p>
                </div>
              </div>
              <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                100% Secure
              </span>
            </div>
            <div className="space-y-2 text-left">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                <span className="text-[11px] text-gray-300">Recruiter ID Verification</span>
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                <span className="text-[11px] text-gray-300">Anti-Fraud Spam Screening</span>
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[9px] text-gray-400">
              <span>Automatic screening desk</span>
              <span className="text-[#EA580C] font-semibold">Active protection</span>
            </div>
          </div>
        );
      case "fastApply":
        return (
          <div className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col gap-3 font-sans mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Resume: Priyansh_CV.pdf</span>
              <span className="text-[9px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">Ready</span>
            </div>
            <button className="w-full py-2.5 bg-gradient-to-r from-[#EA580C] to-rose-500 text-white rounded-xl text-[11px] font-bold shadow-sm hover:brightness-105 transition active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer">
              <Rocket size={12} className="animate-bounce" /> One-Click Apply
            </button>
            <div className="flex justify-between text-[9px] text-gray-400 border-t border-gray-100 pt-2 font-medium">
              <span>⚡ Instant Delivery</span>
              <span>•</span>
              <span>✓ Auto-Autofill</span>
            </div>
          </div>
        );
      case "workflow":
        return (
          <div className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col gap-3 font-sans mt-4 text-left">
            <h4 className="text-[11px] font-bold text-gray-700">Application Pipeline</h4>
            <div className="flex flex-col gap-3 relative pl-4 before:content-[''] before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-orange-100">
              <div className="flex items-center gap-2 text-[11px] relative">
                <span className="absolute -left-[14px] top-1 w-2 h-2 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100"></span>
                <span className="font-semibold text-gray-800">Applied</span>
                <span className="text-[8px] text-gray-400 ml-auto">Mon, 10:00 AM</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] relative">
                <span className="absolute -left-[14px] top-1 w-2 h-2 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100"></span>
                <span className="font-semibold text-gray-800">Screening Test</span>
                <span className="text-[8px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-semibold ml-auto">Passed</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] relative">
                <span className="absolute -left-[14px] top-1 w-2 h-2 rounded-full bg-[#EA580C] border-2 border-white ring-2 ring-orange-100 animate-pulse"></span>
                <span className="font-semibold text-gray-800">Interview</span>
                <span className="text-[8px] text-[#EA580C] bg-orange-50 px-1.5 py-0.5 rounded font-semibold ml-auto">Scheduled</span>
              </div>
            </div>
          </div>
        );
      case "growth":
        return (
          <div className="relative w-full bg-slate-950 text-white rounded-2xl p-5 border border-slate-800/80 shadow-2xl overflow-hidden font-sans text-left">
            <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Salary Benchmarking</h4>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-300">Junior Developer</span>
                  <span className="text-orange-400 font-bold">$60k - $80k</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[45%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-300">Senior Developer</span>
                  <span className="text-orange-400 font-bold">$110k - $140k</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-rose-500 h-full w-[75%] rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-300">Tech Lead / Architect</span>
                  <span className="text-orange-400 font-bold">$160k - $210k</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-violet-500 h-full w-[95%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      case "dashboard":
        return (
          <div className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-5 text-white shadow-2xl flex flex-col gap-4 font-sans max-w-sm mx-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              </div>
              <span className="text-[9px] text-gray-500 font-mono">jobdekho-dashboard.sh</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-gray-400 block mb-1 uppercase font-semibold">Profile Views</span>
                <span className="text-lg font-bold text-orange-400">1,842</span>
                <span className="text-[8px] text-green-400 block mt-0.5 font-medium">↑ +14.2%</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-850">
                <span className="text-[9px] text-gray-400 block mb-1 uppercase font-semibold">Interviews</span>
                <span className="text-lg font-bold text-rose-400">5 Active</span>
                <span className="text-[8px] text-gray-300 block mt-0.5 font-medium">Next: Wed 2 PM</span>
              </div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-xs">
                %
              </div>
              <div>
                <h5 className="text-[10px] font-bold text-white leading-none">Success Match Score</h5>
                <span className="text-[8px] text-gray-400">42 active skill tags matched</span>
              </div>
              <span className="text-[11px] font-bold text-green-400 ml-auto">94%</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#fff7f2] via-[#fffafd] to-[#fcf5f1] py-20 px-4 md:px-6 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-orange-200/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-rose-200/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-16 md:mb-20">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#EA580C] text-xs md:text-sm font-bold uppercase tracking-[3px] bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full"
          >
            Features System
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-gray-900 mt-6 tracking-tight leading-none"
          >
            Why Choose <span className="text-[#EA580C] relative">JobDekho<span className="absolute bottom-1 left-0 w-full h-[6px] bg-orange-500/10 -z-10 rounded"></span></span>?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 mt-4 text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Powering your job search with speed, security, and next-generation matching engines.
          </motion.p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {whyChooseUsData.map((card, index) => {
            const isWide = card.id === "verified" || card.id === "growth" || card.id === "dashboard";
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => navigate(`/mainwhydetails/${card.id}`)}
                className={`group cursor-pointer rounded-3xl border border-gray-100/80 bg-white/70 backdrop-blur-md p-6 md:p-8 flex flex-col justify-between transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_15px_40px_rgb(234,88,12,0.05)] hover:border-orange-100/50 ${getGridSpan(card.id)}`}
              >
                <div className={`flex flex-col h-full justify-between gap-6 ${isWide ? "lg:flex-row lg:items-center" : ""}`}>
                  
                  {/* Left Column / Text details */}
                  <div className={`flex flex-col justify-between h-full ${isWide ? "lg:w-[52%]" : "w-full"}`}>
                    <div>
                      {/* Badge / Category Header */}
                      <div className="flex items-center gap-2 mb-6">
                        <span className="flex items-center justify-center w-8 h-8 bg-orange-50 border border-orange-100 rounded-xl text-[#EA580C] shadow-sm">
                          {card.icon}
                        </span>
                        <span className="font-semibold text-gray-800 border border-gray-100 bg-gray-50/50 px-3 py-0.5 rounded-full text-[10px] md:text-xs tracking-wider uppercase">
                          {card.label}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 tracking-tight group-hover:text-[#EA580C] transition-colors leading-tight">
                        {card.title}
                      </h3>
                      
                      <p className="text-gray-500 mt-3 text-xs md:text-sm leading-relaxed">
                        {card.desc}
                      </p>
                    </div>

                    {/* Amenities rendering on wide cards */}
                    {isWide && card.amenities && card.amenities.length > 0 && (
                      <div className="mt-6 hidden sm:grid grid-cols-3 gap-3">
                        {card.amenities.map((item, i) => (
                          <div key={i} className="flex flex-col items-center text-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                            <img 
                              src={item.img} 
                              alt={item.title} 
                              className="w-8 h-8 object-cover rounded-lg mb-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                            <h4 className="text-[9px] font-bold text-gray-700 line-clamp-1">{item.title}</h4>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Navigation Link CTA */}
                    <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[#EA580C] group-hover:gap-3 transition-all duration-300">
                      <span>Learn More</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>

                  {/* Right Column / Interactive Mockup Preview */}
                  <div className={`flex items-center justify-center w-full ${isWide ? "lg:w-[44%] mt-6 lg:mt-0" : "mt-6"}`}>
                    <div className="relative w-full group-hover:scale-[1.02] transition-transform duration-300">
                      {/* Ambient background glow */}
                      <div className="absolute inset-0 bg-[#EA580C] blur-[40px] opacity-[0.03] group-hover:opacity-[0.06] rounded-full transition-opacity pointer-events-none"></div>
                      
                      {renderMockup(card.id)}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}