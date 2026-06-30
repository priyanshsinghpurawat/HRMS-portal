import { toast } from "react-hot-toast";
import {
  User, Mail, Briefcase, Phone, Tag, Loader2, ArrowLeft,
  Crown, AlertTriangle, CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function CreateHrCompany() {
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [justActivated, setJustActivated] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    personalEmail: "",
    category: "technical",
    designation: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if coming from successful payment
  useEffect(() => {
    if (location.state?.subscriptionActivated) {
      setJustActivated(true);
      toast.success("🎉 Subscription activated! You can now create HR executives.", {
        duration: 5000,
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
      });
      // Clear the state so refresh doesn't show it again
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = 
          sessionStorage.getItem("companyToken") || 
          localStorage.getItem("companyToken") ||
          sessionStorage.getItem("accessToken") ||
          localStorage.getItem("accessToken");

        const res = await fetch(
          window.API_BASE_URL + "/company/subscription/current",
          { 
            credentials: "include",
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
          }
        );
        const data = await res.json();
        
        // Handle both response formats
        const sub = data?.subscription || data?.data || data;
        setSubscription(sub);
      } catch (err) {
        console.error("Subscription check error:", err);
        toast.error("Failed to check subscription status");
      } finally {
        setLoadingSub(false);
      }
    };
    checkSubscription();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.personalEmail || !formData.designation || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating HR Profile...");

    try {
      const token = 
        sessionStorage.getItem("companyToken") || 
        localStorage.getItem("companyToken") ||
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        window.API_BASE_URL + "/company/hr",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("✅ HR Executive created successfully!", { id: toastId });
        setFormData({ name: "", personalEmail: "", category: "technical", designation: "", phone: "" });
        
        // Optionally redirect to dashboard after success
        setTimeout(() => {
          navigate("/company-dashboard");
        }, 1500);
      } else {
        // Handle specific error cases
        if (data?.message?.toLowerCase().includes("subscription") || response.status === 403) {
          toast.error("🔒 Active subscription required! Please purchase a plan.", { 
            id: toastId, 
            duration: 5000 
          });
          setSubscription(null); // Force recheck
        } else if (response.status === 401) {
          toast.error("🔒 Session expired. Please login again.", { id: toastId });
          setTimeout(() => navigate("/hrm-login"), 2000);
        } else {
          toast.error(data?.message || "Failed to create HR profile", { id: toastId });
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error. Please try again", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (loadingSub) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-orange-50 to-[#FBE8DD]">
        <Loader2 className="w-8 h-8 animate-spin text-[#EA580C]" />
      </div>
    );
  }

  // Check if subscription is active
  const hasActiveSub = subscription?.status === "active" || 
                       subscription?.isActive === true ||
                       (subscription?.expiresAt && new Date(subscription.expiresAt) > new Date());

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50 to-[#FBE8DD] py-12 px-4">
      <div className="max-w-2xl mx-auto mb-4">
        <button
          onClick={() => navigate("/company-dashboard")}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#EA580C] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-[28px] shadow-xl border border-orange-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#EA580C] to-[#F97316] px-8 py-8 text-white">
          <h2 className="text-3xl font-bold">Create HR Executive</h2>
          <p className="text-orange-100 mt-2">Add a new HR member to your organization</p>
        </div>

        <div className="p-8">
          {/* Success Banner - Just Activated */}
          {justActivated && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800">Subscription Active!</h3>
                <p className="text-sm text-green-700 mt-1">
                  Your payment was successful. You can now create HR executives.
                </p>
              </div>
            </div>
          )}

          {/* Subscription Alert */}
          {!hasActiveSub && !justActivated && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800">Subscription Required</h3>
                <p className="text-sm text-amber-700 mt-1">
                  You need an active subscription to create HR executives.
                </p>
                <button
                  onClick={() => navigate("/subscription")}
                  className="mt-3 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Full Name"
              icon={<User size={18} />}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith"
              disabled={!hasActiveSub}
            />

            <InputField
              label="Personal Email"
              icon={<Mail size={18} />}
              name="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={handleChange}
              placeholder="j.smith@company.com"
              disabled={!hasActiveSub}
            />

            <InputField
              label="Phone Number"
              icon={<Phone size={18} />}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 555 0123"
              disabled={!hasActiveSub}
            />

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                    <Tag size={18} />
                  </span>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={!hasActiveSub}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#EA580C] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non Technical</option>
                    <option value="management">Management</option>
                    <option value="operations">Operations</option>
                  </select>
                </div>
              </div>

              <InputField
                label="Designation"
                icon={<Briefcase size={18} />}
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="HR Manager"
                disabled={!hasActiveSub}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !hasActiveSub}
              className="w-full bg-[#EA580C] hover:bg-orange-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  Creating HR...
                </span>
              ) : !hasActiveSub ? (
                "Upgrade to Create HR"
              ) : (
                "Create HR Executive"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon, disabled, ...props }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-700 mb-2 block">{label}</label>
      <div className="relative">
        <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          {...props}
          required
          disabled={disabled}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-[#EA580C] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

export default CreateHrCompany;