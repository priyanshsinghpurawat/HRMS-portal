import { useNavigate } from "react-router-dom";

// Each card maps to the exact query params Alljobs.jsx expects.
// experienceLevel values must be lowercase (fresher/junior/mid/senior)
// employmentType values must be slug form (full-time, part-time, internship, contract)
const jobs = [
  {
    title: "Jobs for Freshers",
    tag: "TRENDING AT #1",
    bg: "Freshers",
    params: { experienceLevel: "fresher" },
  },
  {
    title: "Work from home Jobs",
    tag: "TRENDING AT #2",
    bg: "Remote",
    params: { location: "Remote" },
  },
  {
    title: "Part time Jobs",
    tag: "TRENDING AT #3",
    bg: "Part Time",
    params: { employmentType: "part-time" },
  },
  {
    title: "Jobs for Women",
    tag: "TRENDING AT #4",
    bg: "Women",
    params: { search: "women" }, // keyword search (no dedicated filter)
  },
];

const PopularSearch = () => {
  const navigate = useNavigate();

  const handleNavigate = (params) => {
    const qs = new URLSearchParams(params).toString();
    navigate(`/jobportal/alljobs${qs ? `?${qs}` : ""}`);
  };

  return (
    <section className="py-24 px-5 bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[350px_1fr] gap-8">
        {/* Left Side */}
        <div>
          <h2 className="text-5xl font-bold leading-tight">
            Popular <br />
            Searches on <br />
            JobDekhoo
          </h2>

          <p className="mt-5 text-gray-600 text-lg">
            Discover trending job opportunities and find your perfect role.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job, index) => (
            <div
              key={index}
              onClick={() => handleNavigate(job.params)}
              className="cursor-pointer relative h-[280px] bg-white rounded-[28px] border border-orange-100 p-8 overflow-hidden hover:-translate-y-2 transition duration-300 hover:border-[#EA590D] shadow-md"
            >
              <span className="text-gray-400 text-sm">{job.tag}</span>

              <h3 className="text-3xl font-bold mt-5 max-w-[220px]">
                {job.title}
              </h3>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate(job.params);
                }}
                className="absolute bottom-8 left-8 text-[#EA590D] font-semibold"
              >
                View all →
              </button>

              <span className="absolute text-6xl font-bold text-orange-300/40 top-6/9 left-8 -translate-y-1/2">
                {job.bg}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSearch;