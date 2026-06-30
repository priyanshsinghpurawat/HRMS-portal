// Component/Hrms/HrmsHome/Hrmsintrodetails.jsx

import { useParams, useNavigate } from "react-router-dom";
import { hrmsFeatures } from "./hrmsData";
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

function Hrmsintrodetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const feature = hrmsFeatures.find(
    (item) => item.id === id
  );

  if (!feature) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold text-[#FA7B3D]">
          Feature Not Found
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center rounded-full bg-orange-100 gap-2 text-[#FA7B3D] font-medium hover:underline"
        >
          <ArrowLeft size={18} />
          Return to Features
        </button>
      </div>
    );
  }

  const midpoint = Math.ceil(
    feature.features.length / 2
  );

  const leftColFeatures =
    feature.features.slice(0, midpoint);

  const rightColFeatures =
    feature.features.slice(midpoint);

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white px-4 py-12 md:py-20">

      <div className="max-w-7xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2  text-[#FA7B3D] font-semibold hover:translate-x-[-4px] transition"
        >
          <ArrowLeft size={18} />
          Return Back
        </button>

        {/* Main Container */}
        <div className="rounded-[40px] overflow-hidden shadow-2xl bg-white border border-orange-100 p-8 lg:p-14">

          <div className="grid lg:grid-cols-12 gap-12">

            {/* LEFT SIDE */}
            <div className="lg:col-span-5 flex flex-col justify-between">

              <div>

                {/* Badge */}
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full  text-[#FA7B3D] text-sm font-semibold">
                  Our Expertise
                  <ArrowRight size={14} />
                </span>

                {/* Title */}
                <h1 className="text-4xl lg:text-5xl font-bold mt-6 text-gray-900 leading-tight">
                  {feature.title}
                </h1>

                {/* Subtitle */}
                <h2 className="text-2xl mt-3 text-[#FA7B3D] font-semibold">
                  {feature.subtitle}
                </h2>

                {/* Description */}
                <p className="mt-6 text-gray-600 leading-8 text-lg">
                  {feature.description}
                </p>

                {/* Benefits */}
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  {feature.benefits.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2
                          className="text-[#FA7B3D] mt-1 shrink-0"
                          size={18}
                        />

                        <span className="text-gray-700">
                          {item}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Button */}

            </div>

            {/* RIGHT SIDE */}
            <div className="lg:col-span-7 grid md:grid-cols-2 gap-x-10 gap-y-12 border-t lg:border-t-0 lg:border-l border-orange-100 pt-10 lg:pt-0 lg:pl-12">

              {/* LEFT COLUMN */}
              <div className="space-y-10">
                {leftColFeatures.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="group bg-orange-50 rounded-3xl p-5 hover:shadow-lg transition"
                    >
                      <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-[#FA7B3D] text-white font-bold text-lg shadow-md">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FA7B3D] transition">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 leading-7">
                        {item.desc}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-10 md:mt-10">
                {rightColFeatures.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="group bg-orange-50 rounded-3xl p-5 hover:shadow-lg transition"
                    >
                      <div className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-[#FA7B3D] text-white font-bold text-lg shadow-md">
                        {String(
                          index +
                            midpoint +
                            1
                        ).padStart(2, "0")}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#FA7B3D] transition">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 leading-7">
                        {item.desc}
                      </p>
                    </div>
                  )
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hrmsintrodetails;