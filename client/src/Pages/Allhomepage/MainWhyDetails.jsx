import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { whyChooseUsData } from "../Allhomepage/WhyChooseUs";
import { ArrowLeft } from "lucide-react";

export default function MainWhyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const detailData = whyChooseUsData.find(
    (item) => item.id === id
  );

  if (!detailData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-[#FA7B3D]">
          Details Not Found
        </h1>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-[#FA7B3D] transition"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* TOP BAR */}
        <div className="flex items-center justify-between border-b border-orange-200 pb-4 mb-10">
          <span className="text-xs uppercase tracking-widest text-[#FA7B3D] font-semibold">
            Why Choose Us / {detailData.title}
          </span>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#FA7B3D] transition"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* HERO SECTION */}
        <div className="max-w-3xl mb-10">
          <span className="bg-[#FA7B3D]/10 text-[#FA7B3D] px-4 py-2 rounded-full text-xs font-semibold">
            Premium Feature
          </span>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-5 leading-tight">
            {detailData.title}
          </h1>

          <p className="mt-4 text-gray-600 text-base md:text-lg leading-7">
            {detailData.desc}{" "}
            {detailData.detailsSubtitle}
          </p>
        </div>

        {/* SMALLER CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {detailData.amenities.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* IMAGE */}
              <div className="h-[200px] overflow-hidden relative">
                <img
                  /* FIXED: changed from detailData.amenities.img to item.img */
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />

                <div className="absolute top-3 right-3 bg-[#FA7B3D] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  0{index + 1}
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-5 bg-white">
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-6">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}