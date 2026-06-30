import aboutImage from "../../../../assets/img/about.png";

const AboutSection = () => {
  return (
    <section className="bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white py-24 px-5">
      <div className="max-w-7xl mx-auto">

        {/* Top About Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Content */}
          <div>
            <span className="inline-block px-5 py-2 rounded-full bg-orange-100 text-[#EA590D] font-bold text-sm">
              ABOUT US
            </span>

            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mt-6 leading-tight">
              About{" "}
              <span className="text-[#EA590D]">
                JobDekhoo
              </span>
            </h2>

            <p className="text-xl text-gray-700 font-medium mt-6 leading-relaxed">
              Reshaping hiring with smart technology and
              connecting talent with the right opportunities.
            </p>

            <p className="text-gray-600 mt-6 leading-8 text-lg">
              At JobDekhoo, we help job seekers discover
              the best opportunities while enabling
              companies to find top talent faster and
              smarter.
            </p>

            <p className="text-gray-600 mt-5 leading-8 text-lg">
              Our platform is built to simplify hiring and
              create a seamless experience for both
              recruiters and candidates.
            </p>
          </div>

          {/* Right Image */}
          <div className="flex justify-center">
            <img
              src={aboutImage}
              alt="About JobDekhoo"
              className="w-full max-w-[600px] object-contain"
            />
          </div>
        </div>

        {/* Vision + Mission Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">

          {/* Vision */}
          <div className="bg-[#fff4ef] border-l-[5px] border-[#EA590D] rounded-[30px] p-10 shadow-lg hover:-translate-y-2 transition duration-300">
            <h3 className="text-3xl font-bold text-gray-900 mb-5">
              Our Vision
            </h3>

            <p className="text-gray-600 leading-8 text-lg">
              To become India's most trusted job platform
              where candidates and recruiters connect
              seamlessly.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white border-l-[5px] border-orange-400 rounded-[30px] p-10 shadow-lg hover:-translate-y-2 transition duration-300">
            <h3 className="text-3xl font-bold text-gray-900 mb-5">
              Our Mission
            </h3>

            <p className="text-gray-600 leading-8 text-lg">
              To simplify hiring through technology and
              provide meaningful career opportunities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;