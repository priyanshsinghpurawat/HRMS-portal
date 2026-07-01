import { useContext, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Home } from "lucide-react";
import { toast } from "react-hot-toast";
import { AuthContext } from "../../Context/AppContext";
import logo from "../../../assets/img/pngLogo.png";

function Login() {
  const { loginUser, userAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await loginUser(formData);
      if (response?.success) {
        setFormData({ email: "", password: "" });
        if (response.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          const redirectPath = location.state?.from || "/jobs";
          navigate(redirectPath, { replace: true });
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
  }

  return (
    <div className="min-h-screen relative flex bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="absolute top-5 left-5 z-50">
        <button onClick={() => navigate("/jobs")} className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md border border-orange-100 hover:shadow-lg hover:bg-orange-50 transition-all font-medium text-gray-700 cursor-pointer">
          <Home size={18} /> Home
        </button>
      </div>

      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-b from-[#f5c2a2] to-orange-400 text-white flex-col justify-center px-16 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">Welcome Back to<br />JobDekho</h1>
          <p className="text-lg text-orange-100 max-w-md leading-8">Discover better job opportunities, connect with recruiters, and take the next step in your professional journey.</p>
          <div className="mt-10 flex gap-4">
            <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl">
              <h3 className="font-bold text-2xl">10K+</h3>
              <p className="text-orange-100">Active Jobs</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl">
              <h3 className="font-bold text-2xl">5K+</h3>
              <p className="text-orange-100">Companies</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full" />
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl p-8 border border-orange-100">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src={logo} alt="JobDekho Logo" className="w-36 h-auto object-contain mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back 👋</h2>
            <p className="text-gray-500 mt-2">Login to continue your job journey</p>
          </div>

          {/* HRMS / Employee Portal Link */}
          <div className="mb-6 p-3.5 bg-orange-50/50 border border-orange-100 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl text-[#EA590D]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-xs text-orange-800 text-left">
              <span className="font-semibold">Employer / HR / Employee?</span>
              <Link to="/hrm-login" className="ml-1 text-[#EA590D] font-bold hover:underline">
                Go to HRMS Portal →
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#EA590D] focus:bg-white transition-all" />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#EA590D] focus:bg-white transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EA590D]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#EA590D] hover:underline">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={userAuthLoading} className="w-full bg-[#EA590D] hover:bg-orange-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center">
              {userAuthLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#EA590D] font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;