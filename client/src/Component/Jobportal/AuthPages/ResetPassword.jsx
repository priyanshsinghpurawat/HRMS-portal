import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../../assets/img/pngLogo.png";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
        <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl p-8 border border-orange-100 text-center">
          <img src={logo} alt="JobDekho" className="w-36 h-auto object-contain mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Link</h2>
          <p className="text-gray-500 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="inline-block bg-[#EA580C] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-orange-700 transition-all">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(window.API_BASE_URL + "/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl p-8 border border-orange-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logo} alt="JobDekho" className="w-36 h-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter your new password below</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Password Reset!</h3>
            <p className="text-gray-500 text-sm mb-6">Your password has been updated. You can now login with your new password.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#EA580C] hover:bg-orange-700 text-white py-3 rounded-2xl font-semibold transition-all"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full pl-12 pr-14 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EA580C]">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                  required
                  minLength={8}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              className="w-full bg-[#EA580C] hover:bg-orange-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-70 shadow-lg flex items-center justify-center"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
