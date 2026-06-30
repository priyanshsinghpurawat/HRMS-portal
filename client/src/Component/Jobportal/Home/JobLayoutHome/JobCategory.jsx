import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Loader from "../../../../Reuse/Loader";

import {
  FaCode,
  FaBullhorn,
  FaChartLine,
  FaUserTie,
  FaPaintBrush,
  FaBriefcase,
  FaLaptopCode,
  FaHospital,
  FaBuilding,
  FaShoppingBag,
  FaDatabase,
  FaUsers,
} from "react-icons/fa";

// Each category maps to Alljobs.jsx URL params.
// department must match exactly one of: MERN, Frontend, Backend, Engineering,
// Full Stack, Java, Python, DevOps, Mobile, Data Science
const categories = [
  { title: "IT & Software", jobs: "120+ Jobs Available", icon: <FaCode />,
    params: { department: "Engineering" } },
  { title: "Marketing", jobs: "85+ Jobs Available", icon: <FaBullhorn />,
    params: { search: "Marketing" } },
  { title: "Finance", jobs: "60+ Jobs Available", icon: <FaChartLine />,
    params: { search: "Finance" } },
  { title: "Human Resource", jobs: "40+ Jobs Available", icon: <FaUserTie />,
    params: { search: "Human Resource" } },
  { title: "UI/UX Design", jobs: "70+ Jobs Available", icon: <FaPaintBrush />,
    params: { search: "UI UX Designer" } },
  { title: "Business Development", jobs: "95+ Jobs Available", icon: <FaBriefcase />,
    params: { search: "Business Development" } },
  { title: "Web Developer", jobs: "150+ Jobs Available", icon: <FaLaptopCode />,
    params: { department: "Full Stack" } },
  { title: "Healthcare", jobs: "65+ Jobs Available", icon: <FaHospital />,
    params: { search: "Healthcare" } },
  { title: "Real Estate", jobs: "30+ Jobs Available", icon: <FaBuilding />,
    params: { search: "Real Estate" } },
  { title: "E-Commerce", jobs: "80+ Jobs Available", icon: <FaShoppingBag />,
    params: { search: "E-Commerce" } },
  { title: "Database", jobs: "55+ Jobs Available", icon: <FaDatabase />,
    params: { search: "Database" } },
  { title: "Management", jobs: "110+ Jobs Available", icon: <FaUsers />,
    params: { search: "Management" } },
];

const INITIAL_VISIBLE = 6;
const LOAD_COUNT = 3;

const JobCategory = () => {
  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(false);

  const visibleCategories = categories.slice(0, visibleCount);
  const hasMore = visibleCount < categories.length;

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + LOAD_COUNT);
      setLoading(false);
    }, 1200);
  };

  const handleCategoryClick = (params) => {
    const qs = new URLSearchParams(params).toString();
    navigate(`/jobportal/alljobs${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="bg-gradient-to-b from-white via-orange-50 to-[#e9d3c6] py-24 px-5">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-center text-5xl font-bold mb-4">
          Find Jobs By Category
        </h2>

        <p className="text-center text-gray-500 mb-14 text-lg">
          Explore jobs from different industries and categories
        </p>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCategories.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCategoryClick(item.params)}
              className="cursor-pointer bg-white rounded-[22px] p-12 flex items-center gap-5 hover:-translate-y-2 transition-all duration-300 shadow-xl border border-orange-100 hover:border-[#EA590D] group"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-[#EA590D] text-2xl group-hover:scale-110 transition">
                {item.icon}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                <p className="text-gray-500">{item.jobs}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="min-w-[180px] h-[54px] bg-[#EA590D] hover:bg-orange-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center"
            >
              {loading ? <Loader /> : "Load More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobCategory;