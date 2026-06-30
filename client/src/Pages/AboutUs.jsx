import { motion } from "framer-motion";

function AboutUs() {
  return (
    <div className="min-h-screen bg-[#fff7f2] py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#EA580C]">
            About JobDekho
          </h1>

          <p className="text-gray-600 mt-5 text-lg max-w-3xl mx-auto">
            JobDekho is a modern Job Portal + HRMS platform designed
            to connect talented professionals with top companies while
            helping organizations manage hiring and workforce efficiently.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl shadow-md p-8 border border-orange-100"
          >
            <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
              Our Mission
            </h2>

            <p className="text-gray-600 leading-8">
              Our mission is to simplify hiring, job searching,
              and workforce management through a single smart platform.
              We want every candidate to find meaningful opportunities
              and every business to hire the right talent faster.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white rounded-3xl shadow-md p-8 border border-orange-100"
          >
            <h2 className="text-2xl font-bold text-[#EA580C] mb-4">
              Our Vision
            </h2>

            <p className="text-gray-600 leading-8">
              We envision JobDekho becoming one of India’s most trusted
              recruitment and HR management ecosystems, empowering
              startups, enterprises, HR teams, and job seekers.
            </p>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-white rounded-[40px] p-10 shadow-lg border border-orange-100"
        >
          <h2 className="text-3xl font-bold text-center text-[#EA580C] mb-10">
            Why Choose JobDekho?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              "Smart Job Search",
              "Company Hiring Dashboard",
              "HR Management System",
              "Modern User Experience",
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#fff7f2] rounded-2xl p-6 text-center border border-orange-100 hover:shadow-md transition-all"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {item}
                </h3>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold text-[#EA580C]">
            Contact Us
          </h2>

          <p className="text-gray-600 mt-4">
            Have questions or feedback? We'd love to hear from you.
          </p>

          <a
            href="mailto:jigneshramawat21@gmail.com"
            className="inline-block mt-6 bg-[#EA580C] text-white px-8 py-3 rounded-xl hover:scale-105 transition-all"
          >
            Contact Support
          </a>
        </div>

      </div>
    </div>
  );
}

export default AboutUs;