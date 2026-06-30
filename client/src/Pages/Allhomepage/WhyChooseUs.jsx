// Component/Jobportal/Home/WhyChooseUs.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Rocket,
  BriefcaseBusiness,
  TrendingUp,
  LayoutDashboard,
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

  return (
    <section className="bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] py-20 px-4">
      <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-16">
          <span className="text-[#EA580C] text-sm font-semibold uppercase tracking-[2px]">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">
            Why Choose <span className="text-[#EA580C]">JobDekho?</span>
          </h2>
          <p className="text-gray-600 mt-4 text-base md:text-lg max-w-2xl mx-auto">
            Explore smart tools that help you find jobs faster and manage your workflow efficiently.
          </p>
        </div>

        {/* STICKY CARDS LOOP */}
        <div className="relative flex flex-col gap-6 md:gap-12 pb-32">
          {whyChooseUsData.map((card, index) => (
            <div
              key={card.id}
              className={`sticky w-full rounded-[32px] shadow-2xl overflow-hidden transition-all duration-300 ${card.color}`}
              style={{
                top: `calc(6rem + ${index * 2.5}rem)`, 
                zIndex: index + 1,
              }}
            >
              <div className="grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16 bg-white/60 backdrop-blur-sm">
                
                {/* Text & Amenities Content */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm text-[#EA580C]">
                      {card.icon}
                    </span>
                    <span className="font-semibold text-gray-900 border border-gray-200 bg-white px-3 py-1 rounded-full text-sm">
                      {card.label}
                    </span>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 leading-tight">
                    {card.title}
                  </h3>
                  
                  <p className="text-gray-600 mt-4 text-base md:text-lg leading-relaxed max-w-md">
                    {card.desc}
                  </p>

                  {/* RENDERING AMENITIES FOR EACH CARD */}
                  {card.amenities && card.amenities.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                      {card.amenities.map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center bg-white/80 p-3 rounded-xl border border-gray-100 shadow-sm">
                          <img 
                            src={item.img} 
                            alt={item.title} 
                            className="w-12 h-12 object-cover rounded-lg mb-2"
                          />
                          <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</h4>
                          <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* NAVIGATION LINK */}
                  <button
                    onClick={() => navigate(`/mainwhydetails/${card.id}`)}
                    className="mt-8 px-6 py-3 bg-[#EA580C] text-white font-medium rounded-xl shadow-md hover:bg-[#d44f0a] transition-colors w-full sm:w-auto"
                  >
                    Learn More →
                  </button>
                </div>

                {/* Cover Image Frame */}
                <div className="relative w-full h-full min-h-[300px] lg:min-h-[450px]">
                  <div className="absolute inset-0 bg-[#EA580C] blur-[80px] opacity-10 rounded-full"></div>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-lg border border-white/50"
                  />
                </div>
                
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}