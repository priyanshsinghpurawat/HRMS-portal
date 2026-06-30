import SearchBar from "./SearchBar";
import heroImage from "../../../../assets/img/hero1.webp";


const HeroSection = () => {
  return (
    <section className="pt-10 p px-5 bg-gradient-to-b from-white via-orange-50 to-[#e9d3c6]">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-semibold text-gray-900">
          Search Your Dream Job
        </h1>

        <p className="mt-4 text-gray-600 text-lg pb-10">
          Discover 5 lakh+ Job Opportunities
        </p>

        <div className="mt-8">
          <SearchBar />
        </div>

        <div className="mt-6 flex justify-center">
          <img
            src={heroImage}
            alt="Job search hero"
            className="w-full max-w-5xl object-contain rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;