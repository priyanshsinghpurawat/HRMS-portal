import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "../../../assets/img/pngLogo.png";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(window.API_BASE_URL + "/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setSent(true);
      toast.success(data.message || "Reset link sent to your email");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl p-8 border border-orange-100">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={logo} alt="JobDekho" className="w-36 h-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Check Your Email</h3>
            <p className="text-gray-500 text-sm mb-6">
              We've sent a password reset link to <strong>{email}</strong>. The link expires in 15 minutes.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-[#EA580C] hover:bg-orange-700 text-white py-3 rounded-2xl font-semibold transition-all"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#EA580C] hover:bg-orange-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-70 shadow-lg flex items-center justify-center"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 mt-6">
          <Link to="/login" className="text-[#EA580C] font-semibold hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
