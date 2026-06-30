import React from "react";
import { ArrowUpRight } from "lucide-react";
import Button from "../../Reuse/Button";

function CTASection() {
  const cards = [
    {
      id: 1,
      title: "Verified Jobs",
      desc: "Trusted opportunities from top companies.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000",
    },
    {
      id: 2,
      title: "Workflow Manage",
      desc: "Manage hiring and applications easily.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1000",
    },
    {
      id: 3,
      title: "Career Growth",
      desc: "Grow professionally with better opportunities.",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000",
    },
    {
      id: 4,
      title: "Fast Apply",
      desc: "Apply instantly without long forms.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000",
    },
  ];

  // Duplicate the array so it seamlessly loops without an empty gap
  const duplicatedCards = [...cards, ...cards];

  return (
    <section className="py-32 bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] overflow-hidden">
      
      {/* 
        Inline CSS for the infinite marquee animation. 
        Moving it to exactly -50% ensures the second half lines up perfectly 
        with the start when it loops.
      */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 20s linear infinite;
          }
          /* Optional: Pauses the scroll when the user hovers so they can click the button */
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="max-w-[92%] 2xl:max-w-[1440px] mx-auto px-4 mb-12">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-5">
          <div>
            <span className="bg-orange-100 text-[#EA580C] px-4 py-2 rounded-full text-sm font-medium">
              Your Career, Our Mission
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mt-4 leading-tight text-gray-900">
              Empowering Growth
              <br />
              With <span className="text-[#EA580C]">Smart Solutions</span>
            </h2>
          </div>

          <button  className="px-4 rounded-2xl transition-all cursor-pointer   hover:bg-[#ea470c] py-4 bg-[#EA580C] flex items-center gap-1 text-white font-bold " >  
               View Services
            <ArrowUpRight className="pt-1" size={20} />
          </button>
        </div>
      </div>

      {/* INFINITE SCROLLING CARDS CONTAINER */}
      <div className="relative w-full overflow-hidden">
        
        {/* The Animated Track */}
        <div className="animate-marquee gap-6 px-4">
          {duplicatedCards.map((card, index) => (
      
            <div
              key={`${card.id}-${index}`}
              className="w-[300px] md:w-[350px] lg:w-[400px] shrink-0 group cursor-pointer"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden rounded-[28px] shadow-lg">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-[220px] md:h-[260px] object-cover rounded-[28px] group-hover:scale-105 transition duration-500"
                />

                {/* Arrow Button */}
                <button className="absolute bottom-4 right-4 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md hover:bg-[#EA580C] hover:text-white transition">
                  <ArrowUpRight size={20} />
                </button>
              </div>

              {/* CONTENT */}
              <div className="mt-5 px-2">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#EA580C] transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-sm md:text-base leading-6">
                  {card.desc}
                </p>
                <div className="border-b border-gray-200 mt-5"></div>
              </div>
            </div>

          ))}
        </div>
      </div>
      
    </section>
  );
}

export default CTASection;