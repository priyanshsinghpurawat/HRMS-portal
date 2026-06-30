import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast"; // ✅ Use react-hot-toast
import { AppContext } from "../../Context/AppContext";
import FooterBanner from "../../../Pages/Allhomepage/FooterBanner";
import NavbarHrm from "./NavbarHrm";

function HrmLogin() {
  const { loginCompany, companyAuthLoading, companyUser } = useContext(AppContext);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (companyUser?.role) {
      redirectByRole(companyUser.role);
    }
  }, [companyUser, navigate]);

  const redirectByRole = (role) => {
    if (role === "company") navigate("/company-dashboard", { replace: true });
    else if (role === "hr") navigate("/hrdashboard", { replace: true });
    else if (role === "employee") navigate("/employeedashboard", { replace: true });
    else navigate("/hrms", { replace: true });
  };

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(null);

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
    setLoginError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const isValid = validate();
    if (!isValid) return;

    try {
      const response = await loginCompany(formData);

      if (!response?.success) {
        const errorMessage = response?.message || "Login failed";
        
        if (errorMessage.includes("not found") || errorMessage.includes("not exist")) {
          setLoginError({
            message: "Account not found. Please check your email or register.",
            action: "/company-register",
            actionText: "Register Company"
          });
        } else if (errorMessage.includes("verify") || errorMessage.includes("verified")) {
          setLoginError({
            message: "Email not verified. Please complete verification.",
            action: "/company-register",
            actionText: "Verify Email"
          });
        } else if (errorMessage.includes("Role") || errorMessage.includes("not allowed")) {
          setLoginError({
            message: "This account type cannot use this login. Please contact your company admin.",
            action: null
          });
        } else {
          setLoginError({
            message: errorMessage,
            action: null
          });
        }
        
        // ✅ Use react-hot-toast with center position
        toast.error(errorMessage, {
          position: "top-center",
          duration: 3000,
        });
        return;
      }

      // ✅ Success toast with center position
      toast.success(response.message || "Welcome back!", {
        position: "top-center",
        duration: 3000,
      });
      
      setFormData({ email: "", password: "" });
      setLoginError(null);

    } catch (error) {
      console.error("Login Error:", error);
      setLoginError({
        message: "Something went wrong. Please try again.",
        action: null
      });
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        duration: 3000,
      });
    }
  }

  // Loading state while redirecting
  if (companyUser?.role) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ❌ REMOVED: ToastContainer from react-toastify */}
      <NavbarHrm />

      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-[#e9d3c6] pt-24">
        <div className="flex min-h-[85vh]">
          <div className="w-full flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800">HRMS Login</h2>
                <p className="text-gray-500 mt-2">Company, HR & Employee Login</p>
              </div>

              {/* Job Portal Link */}
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                <User className="text-green-600" size={20} />
                <div className="text-sm text-green-800">
                  <span className="font-semibold">Job Seeker?</span>
                  <Link to="/login" className="ml-2 text-green-600 font-bold hover:underline">
                    Go to Job Portal →
                  </Link>
                </div>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-500 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-medium">{loginError.message}</p>
                      {loginError.action && (
                        <Link
                          to={loginError.action}
                          className="inline-block mt-2 text-sm text-red-600 font-semibold hover:underline"
                        >
                          {loginError.actionText} →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full mt-2 p-3 rounded-xl border outline-none transition ${
                      errors.email ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className={`w-full p-3 rounded-xl border outline-none transition ${
                        errors.password ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>



                <button
                  type="submit"
                  disabled={companyAuthLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {companyAuthLoading ? "Logging in..." : "Log In to HRMS"}
                </button>
              </form>

              <p className="text-center text-gray-500 mt-6">
                New company?{" "}
                <Link to="/company-register" className="text-orange-500 font-semibold hover:underline">
                  Register Company
                </Link>
              </p>
            </div>
          </div>
        </div>

        <FooterBanner />
      </div>
    </>
  );
}

export default HrmLogin;