import { useEffect, useState } from "react";
import heroImage from "../../../assets/img/heroHrm.png";

const partnerCompanies = [
  { name: "Tech Mahindra", url: "https://www.techmahindra.com" },
  { name: "Infosys", url: "https://www.infosys.com" },
  { name: "TCS", url: "https://www.tcs.com" },
  { name: "Wipro", url: "https://www.wipro.com" },
  { name: "HCL Tech", url: "https://www.hcltech.com" },
  { name: "Cognizant", url: "https://www.cognizant.com" },
];

const phrases = [
  "Smarter",
  "Faster",
  "Better",
  "Efficient",
];

const HrmHero = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(
        (prevIndex) =>
          (prevIndex + 1) % phrases.length
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-20 pb-20 px-5 bg-gradient-to-b from-white via-orange-50 to-[#e9d3c6] overflow-hidden">
      <div className="max-w-7xl mt-16 mx-auto text-center">

        <h1 className="text-4xl md:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
          The New Era Of HR
          <br />

          <span className="text-[#FA7B3D] transition-all duration-500">
            {phrases[index]}
          </span>
        </h1>

        <p className="mt-6 text-gray-600 text-lg pb-10">
          Helping Management Work Smarter, Not Harder
        </p>

        <div className="relative overflow-visible py-2">
          <div className="flex w-max animate-infiniteScroll gap-4 md:gap-6 p-5">

            {[
              ...partnerCompanies,
              ...partnerCompanies,
              ...partnerCompanies,
            ].map((partner, i) => (
              <a
                key={i}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-5 py-3 md:px-6 md:py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-600 hover:text-[#FA7B3D] hover:border-[#FA7B3D] hover:bg-orange-50 transition-all shadow-sm min-w-[160px] md:min-w-[190px] text-sm md:text-base whitespace-nowrap hover:scale-105"
              >
                {partner.name}
              </a>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-5 flex justify-center">
          <img
            src={heroImage}
            alt="HRMS Hero"
            className="w-full h-[400px] md:h-[400px] max-w-5xl object-contain rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HrmHero;