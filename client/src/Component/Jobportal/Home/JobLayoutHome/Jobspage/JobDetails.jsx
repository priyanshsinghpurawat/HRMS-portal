// // Component/Jobportal/Home/JobLayoutHome/Jobspage/JobDetails.jsx
// import React from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, ArrowRight, MapPin, DollarSign } from "lucide-react";

// const categoryListingMockData = {
//   "frontend-developer": {
//     title: "Frontend Development",
//     desc: "Build highly interactive, beautiful interfaces using cutting-edge client architectures.",
//     subtitle: "Premium consumer-facing client engineering positions open globally.",
//     jobs: [
//       { role: "Senior React Engineer", company: "Aria Haus Tech", pay: "$120k - $140k", type: "Remote", loc: "San Francisco, CA", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800" },
//       { role: "UI Engineer (Next.js)", company: "Stitch Creative", pay: "$95k - $110k", type: "Hybrid", loc: "Austin, TX", img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800" },
//       { role: "Frontend Architect", company: "Envato Market Labs", pay: "$160k - $190k", type: "Remote", loc: "New York, NY", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" }
//     ]
//   },
//   "backend-developer": {
//     title: "Backend Development",
//     desc: "Architect enterprise server operations, system databases, and performant API web infrastructures.",
//     subtitle: "High-scale server computation systems and microservices deployment channels.",
//     jobs: [
//       { role: "Node.js Core Systems Architect", company: "DataFlow Systems", pay: "$130k - $160k", type: "Remote", loc: "Seattle, WA", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800" },
//       { role: "Database Engineer (PostgreSQL)", company: "OmniDB Corp", pay: "$110k - $130k", type: "On-Site", loc: "Chicago, IL", img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800" },
//       { role: "Senior DevOps & Cloud Engineer", company: "Apex Scale", pay: "$150k - $180k", type: "Remote", loc: "Denver, CO", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800" }
//     ]
//   },
//   "mern-stack": {
//     title: "MERN Stack Specialist",
//     desc: "Deliver full-stack web solutions from end-to-end utilizing MongoDB, Express, React, and Node.",
//     subtitle: "Rapid deployment engineering spaces built on unified JavaScript pipelines.",
//     jobs: [
//       { role: "Full Stack Engineer (MERN)", company: "Veloce Startup Studio", pay: "$100k - $130k", type: "Remote", loc: "Remote, US", img: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800" },
//       { role: "MERN Stack Product Lead", company: "SaaS Rocket", pay: "$140k - $165k", type: "Hybrid", loc: "Boston, MA", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800" },
//       { role: "Junior Software Integrator", company: "Alpha Beta Apps", pay: "$75k - $90k", type: "On-Site", loc: "Miami, FL", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800" }
//     ]
//   },
//   "ui-ux-designer": {
//     title: "UI/UX Product Design",
//     desc: "Map sophisticated user journeys, structural interactive flows, and build layout high-fidelity interactive wireframes.",
//     subtitle: "Human-centric aesthetic design environments that transform corporate accessibility maps.",
//     jobs: [
//       { role: "Product UX Designer", company: "Studio Aura", pay: "$90k - $115k", type: "Remote", loc: "Los Angeles, CA", img: "https://images.unsplash.com/photo-1541462608141-ad4979e408c9?w=800" },
//       { role: "Lead UI/UX System Architect", company: "Fintech Grid Labs", pay: "$140k - $170k", type: "Hybrid", loc: "New York, NY", img: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c/w=800" },
//       { role: "Interaction Motion Prototyper", company: "Nebula Digital", pay: "$105k - $125k", type: "Remote", loc: "Remote, UK", img: "https://images.unsplash.com/photo-1561070791-26c113006238?w=800" }
//     ]
//   },
//   "marketing": {
//     title: "Marketing & Growth",
//     desc: "Drive user acquisition, scaling pipelines, brand recognition, and conversion strategy.",
//     subtitle: "High impact communication spaces looking for growth specialists.",
//     jobs: [
//       { role: "Growth Marketing Director", company: "Scale Catalyst", pay: "$110k - $135k", type: "Remote", loc: "Austin, TX", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" }
//     ]
//   },
//   "remote-jobs": {
//     title: "Remote Work Ecosystems",
//     desc: "Unrestricted geographical assignments designed to function flawlessly across distributed teams.",
//     subtitle: "Work from anywhere in the world with fully asynchronous operational models.",
//     jobs: [
//       { role: "Distributed Workflow Leader", company: "Cloud Workspace", pay: "$115k - $140k", type: "Remote", loc: "Global Hub", img: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800" }
//     ]
//   },
//   "hr-manager": {
//     title: "Human Resource Management",
//     desc: "Oversee team culture initiatives, internal processing setups, and structural acquisition workflows.",
//     subtitle: "Build healthy corporate dynamics across modern remote organizations.",
//     jobs: [
//       { role: "People Operations Manager", company: "JobDekho Core Hub", pay: "$90k - $110k", type: "Hybrid", loc: "Jaipur, IN", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800" }
//     ]
//   },
//   "finance": {
//     title: "Financial Analytics & Strategy",
//     desc: "Manage equity programs, resource deployment, financial modeling, and risk assessments.",
//     subtitle: "Vetted application slots supporting corporate fiscal health lines.",
//     jobs: [
//       { role: "Senior Financial Modeler", company: "Ledger Stack", pay: "$130k - $155k", type: "On-Site", loc: "Mumbai, IN", img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800" }
//     ]
//   }
// };

// export default function JobDetails() {
//   const { category } = useParams();
//   const navigate = useNavigate();

//   // Defensive lookup approach preventing blank screen crashes if slug references misalign
//   const activeData = categoryListingMockData[category] || categoryListingMockData["mern-stack"];

//   return (
//     <section className="min-h-screen bg-gradient-to-b from-[#fff7f2] via-[#fffcfb] to-white py-16 px-6">
//       <div className="max-w-7xl mx-auto">
        
//         {/* UPPER BREADCRUMB BAR */}
//         <div className="border-b border-black/10 pb-4 mb-16 flex items-center justify-between">
//           <span className="text-xs uppercase tracking-widest text-gray-500 font-bold font-mono">
//             JobDekho Core / Categories / {activeData.title}
//           </span>
//           <button 
//             onClick={() => navigate(-1)} 
//             className="text-xs font-bold flex items-center gap-1 text-gray-700 hover:text-[#EA580C] transition-colors"
//           >
//             <ArrowLeft size={14} /> BACK
//           </button>
//         </div>

//         {/* HERO TITLE HEADER BLOCK */}
//         <div className="max-w-4xl mb-16">
//           <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-none">
//             An Oasis of <span className="text-[#EA580C]">Modern Growth</span>
//           </h1>
          
//           <p className="mt-6 text-gray-600 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
//             {activeData.desc} {activeData.subtitle}
//           </p>

//           <button className="mt-8 group inline-flex items-center gap-4 border border-gray-900 px-6 py-3 text-sm font-semibold hover:bg-gray-900 hover:text-white transition-all duration-300 rounded-sm">
//             Contact Now 
//             <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
//           </button>
//         </div>

//         {/* 3-COLUMN VISUAL GALLERY GRID */}
//         <div className="grid md:grid-cols-3 gap-8 items-stretch mt-12">
//           {activeData.jobs.map((job, index) => (
//             <div 
//               key={index} 
//               className="flex flex-col rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xl shadow-orange-900/5 transition-all duration-300 hover:-translate-y-2"
//             >
//               <div className="h-[280px] w-full overflow-hidden relative">
//                 <img 
//                   src={job.img} 
//                   alt={job.role} 
//                   className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
//                 />
//                 <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#EA580C]">
//                   {job.type}
//                 </div>
//               </div>

//               <div className="p-8 bg-[#fffcfb] flex-grow flex flex-col justify-between border-t border-gray-50">
//                 <div>
//                   <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider mb-1">
//                     {job.company}
//                   </span>
//                   <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-snug">
//                     {job.role}
//                   </h3>
                  
//                   <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
//                     <div className="flex items-center gap-2">
//                       <MapPin size={14} className="text-[#EA580C]" />
//                       <span>{job.loc}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <DollarSign size={14} className="text-[#EA580C]" />
//                       <span className="font-medium text-gray-900">{job.pay}</span>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
//                   <span className="text-xs font-bold text-gray-400">
//                     POSITION 0{index + 1}
//                   </span>
//                   <button className="text-sm font-bold text-[#EA580C] hover:underline flex items-center gap-1">
//                     Apply Now <ArrowRight size={14} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// }