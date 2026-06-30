import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Building2, FileSpreadsheet, FileText, ArrowRight, Loader2, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast"; 
import { AppContext } from "../../Context/AppContext";

export default function CompanyRegister() {
  const navigate = useNavigate();
  const { registerCompany, verifyCompanyOtp, resendCompanyOtp, companyAuthLoading } = useContext(AppContext);

  const [step, setStep] = useState("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    tanId: "",
    gstId: "",
  });

  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.tanId || !formData.gstId) {
      toast.error("Please fill out all enterprise identity fields.", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    const result = await registerCompany({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      tanId: formData.tanId,
      gstId: formData.gstId,
    });

    if (result?.success) {
      setRegisteredEmail(formData.email);
      setStep("otp");
      toast.success("OTP sent to your email! Please verify.", {
        position: "top-center",
        duration: 3000,
      });
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setOtpLoading(true);

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP", {
        position: "top-center",
        duration: 3000,
      });
      setOtpLoading(false);
      return;
    }

    const result = await verifyCompanyOtp(registeredEmail, otp);

    if (result?.success) {
      setStep("success");
      setFormData({ name: "", email: "", password: "", tanId: "", gstId: "" });
      setOtp("");
      toast.success("Email verified successfully!", {
        position: "top-center",
        duration: 3000,
      });
    } else {
      toast.error(result?.message || "OTP verification failed", {
        position: "top-center",
        duration: 3000,
      });
    }

    setOtpLoading(false);
  };

  const handleResendOtp = async () => {
    await resendCompanyOtp(registeredEmail);
  };

  if (step === "register") {
    return (
      <section className="min-h-screen bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] py-12 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white/80 backdrop-blur-md rounded-[32px] border border-white p-8 md:p-12 shadow-2xl shadow-orange-900/5">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Register <span className="text-[#EA580C]">Company Hub</span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Configure your enterprise workspace console
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 pl-1">Company Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Building2 size={18} /></span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Acme Corp"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 transition-all text-gray-900 font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 pl-1">Corporate Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Mail size={18} /></span>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="company@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 transition-all text-gray-900 font-medium" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 pl-1">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><Lock size={18} /></span>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 transition-all text-gray-900 font-medium" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 pl-1">TAN ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><FileText size={18} /></span>
                  <input type="text" name="tanId" value={formData.tanId} onChange={handleChange} placeholder="XXAAAA1111A2Z1"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 transition-all text-gray-900 font-medium uppercase" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 pl-1">GST ID</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400"><FileSpreadsheet size={18} /></span>
                  <input type="text" name="gstId" value={formData.gstId} onChange={handleChange} placeholder="XXAAAAA1111A2Z1"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 transition-all text-gray-900 font-medium uppercase" />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={companyAuthLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#d44f0a] text-white py-4 rounded-2xl font-semibold shadow-lg shadow-orange-600/20 transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 disabled:hover:scale-100 cursor-pointer">
                {companyAuthLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Creating Corporate Console...</>
                ) : (
                  <>Register Corporate Portal <ArrowRight size={18} /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
            Already registered? <Link to="/hrm-login" className="text-[#EA580C] font-semibold hover:underline">Login to Admin Console</Link>
          </div>
        </div>
      </section>
    );
  }

  // ==========================
  // RENDER: OTP VERIFICATION
  // ==========================
  if (step === "otp") {
    return (
      <section className="min-h-screen bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-[32px] border border-white p-8 md:p-12 shadow-2xl shadow-orange-900/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#EA580C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-[#EA580C]" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Verify Your Email</h2>
            <p className="text-gray-500 mt-2 text-sm">
              We've sent a 6-digit OTP to <span className="font-semibold text-gray-700">{registeredEmail}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Please check your inbox and spam folder</p>
          </div>

          <form onSubmit={handleOtpVerify} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 pl-1">Enter OTP Code</label>
              <input type="text" value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="XXXXXX" maxLength={6}
                className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 transition-all text-gray-900" />
            </div>

            <button type="submit" disabled={otpLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#d44f0a] text-white py-4 rounded-2xl font-semibold shadow-lg shadow-orange-600/20 transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 cursor-pointer">
              {otpLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Verifying...</>
              ) : (
                <>Verify Email <ShieldCheck size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive OTP? <button type="button" onClick={handleResendOtp}
                className="text-[#EA580C] font-semibold hover:underline cursor-pointer">Resend OTP</button>
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==========================
  // RENDER: SUCCESS
  // ==========================
  if (step === "success") {
    return (
      <section className="min-h-screen bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-[32px] border border-white p-8 md:p-12 shadow-2xl shadow-orange-900/5 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verification Successful!</h2>
          <p className="text-gray-500 mb-8">Your company account has been verified. You can now login to the HRMS portal.</p>
          <button onClick={() => navigate("/hrm-login")}
            className="w-full flex items-center justify-center gap-2 bg-[#EA580C] hover:bg-[#d44f0a] text-white py-4 rounded-2xl font-semibold shadow-lg shadow-orange-600/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer">
            Go to Login <ArrowRight size={18} />
          </button>
        </div>
      </section>
    );
  }
}