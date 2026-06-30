import dashboardImage from "../../../assets/img/cardhrm1.png";

const HrmIntro = () => {
  return (
    <section className="w-full py-16 px-4 bg-gradient-to-b from-[#e9d3c6] via-orange-50 to-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center rounded-[30px] bg-gradient-to-r from-[#FA7B3D] to-[#ff9a5c] shadow-2xl p-6 md:p-10 overflow-hidden">

          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Smart HR & Employee
              <br />
              Management System
            </h1>

            <p className="mt-5 text-sm md:text-lg text-orange-50 leading-7 max-w-lg">
              Streamline your HR operations with employee management,
              attendance tracking, payroll handling, leave management,
              and performance analytics — all in one platform.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[
                "Attendance",
                "Payroll",
                "Recruitment",
                "Leave Management",
              ].map((item, index) => (
                <span
                  key={index}
                  className="bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-xs md:text-sm font-medium"
                >
                  {item}
                </span>
              ))}
            </div>




          </div>

          <div className="flex justify-center">
            <div className="bg-transparent rounded-[20px] overflow-hidden p-2 w-full max-w-[550px]">
              <img
                src={dashboardImage}
                alt="HRMS Dashboard"
                className="w-full h-[220px] md:h-[400px] object-cover rounded-[15px]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HrmIntro;