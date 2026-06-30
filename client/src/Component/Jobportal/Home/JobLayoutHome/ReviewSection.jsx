import techMahindraLogo from "../../../../assets/img/logo/techmahindra.png";
import infosysLogo from "../../../../assets/img/logo/infosys.png";
import tcsLogo from "../../../../assets/img/logo/tcs.png";
import wiproLogo from "../../../../assets/img/logo/wipro.png";
import cognizantLogo from "../../../../assets/img/logo/cognizant.png";


const reviews = [
  {
    name: "Jignesh",
    role: "Placed",
    company: "Tech Mahindra",
    logo: techMahindraLogo,
    feedback:
      "JobDekhoo helped me find internship opportunities quickly. The UI is simple and easy to use.",
  },
  {
    name: "Rahul",
    role: "Placed",
    company: "Infosys",
    logo: infosysLogo,
    feedback:
      "Great platform for freshers. I got interview calls within a few days.",
  },
  {
    name: "Priya",
    role: "Placed",
    company: "TCS",
    logo: tcsLogo,
    feedback:
      "Clean interface and real opportunities. Highly recommended.",
  },
  {
    name: "Aman",
    role: "Frontend Developer",
    company: "Wipro",
    logo: wiproLogo,
    feedback:
      "Amazing experience. Easy to apply jobs and smooth interface.",
  },
  {
    name: "Sneha",
    role: "UI/UX Designer",
    company: "Cognizant",
    logo: cognizantLogo,
    feedback:
      "Loved the experience. Fast and clean platform for job seekers.",
  },
];

const ReviewSection = () => {
  const shouldScroll = reviews.length >= 3;

  return (
    <section className="bg-gradient-to-b from-white via-orange-50 to-[#e9d3c6] py-24 px-5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[38%_62%] gap-10 items-center">
          {/* Left Side */}
          <div className="bg-[#EA590D] rounded-[28px] text-white p-10 md:p-5 border-l-[5px] border-white shadow-xl">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              " Trusted by thousands of job seekers. See what they have to say "
            </h2>
          </div>

          {/* Right Side */}
          <div className="overflow-hidden relative py-4">
            <div
              className={`
                flex gap-12 h-[260px] w-auto
                ${shouldScroll ? "animate-scroll" : ""}
              `}
            >
              {[...reviews, ...reviews].map((review, index) => (
                <div
                  key={index}
                  className="w-[320px] bg-white rounded-[24px] p-6 shadow-lg border border-orange-100 hover:-translate-y-2 transition duration-300 flex-shrink-0"
                >
                  <div className="flex items-center justify-between gap-5 mb-5">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {review.name}
                      </h4>

                      <span className="text-[#EA590D] font-semibold text-sm">
                        {review.role}
                      </span>
                    </div>

                    <img
                      src={review.logo}
                      alt={review.company}
                      className="h-10 max-w-[120px] object-contain"
                    />
                  </div>

                  <p className="text-sm font-semibold text-gray-500">
                    {review.company}
                  </p>

                  <p className="mt-4 text-gray-600 leading-8">
                    {review.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes scroll {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }

          .animate-scroll {
            width: max-content;
            animation: scroll 28s linear infinite;
          }

          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}
      </style>
    </section>
  );
};

export default ReviewSection;