// CompanySubscription.jsx — FIXED VERSION
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Check, Crown, Zap, Building2, ArrowLeft, Loader2,
  Shield, Clock, Calendar, AlertCircle, Sparkles,
  TrendingUp, Users, BarChart3, Mail, Headphones,
  Infinity, Workflow, ChevronRight, X, Star,
  Lock, LogIn, AlertTriangle, Info, Phone,
  MessageCircle, WifiOff, KeyRound
} from "lucide-react";

const API_BASE = window.API_BASE_URL + "/company";

// ============================================
// AUTH HELPER
// ============================================
function getAuthToken() {
  const token = 
    sessionStorage.getItem("companyToken") || 
    localStorage.getItem("companyToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token");
  return token;
}

function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ============================================
// SAFE FETCH
// ============================================
async function safeFetch(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
  const token = getAuthToken();
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: "Invalid JSON: " + text.substring(0, 100) };
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      raw: text,
    };

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return {
        ok: false,
        status: 0,
        data: { message: "Request timed out. Server may be waking up. Retry in 30s." },
      };
    }
    return {
      ok: false,
      status: 0,
      data: { message: err.message || "Network error" },
    };
  }
}

// ============================================
// ERROR HANDLER
// ============================================
function handleError(result, navigate) {
  const { status, data } = result;

  if (status === 401) {
    toast.error(`🔒 ${data?.message || "Unauthorized — Please login"}`, { duration: 5000 });
    sessionStorage.removeItem("companyToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("companyToken");
    localStorage.removeItem("accessToken");
    setTimeout(() => {
      navigate("/hrm-login", { state: { from: location.pathname, reason: "session_expired" } });
    }, 2000);
    return { handled: true, type: "auth" };
  }

  if (status === 403) {
    toast(`ℹ️ ${data?.message || "Active subscription required"}`, { duration: 6000, icon: "🔒" });
    return { handled: true, type: "subscription" };
  }

  if (status === 404) {
    toast.error(`🏢 ${data?.message || "Company not found"}`, { duration: 5000 });
    return { handled: true, type: "company" };
  }

  if (status === 400) {
    const errors = data?.errors || [];
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(`❌ ${err.field}: ${err.message}`, { duration: 5000 }));
    } else {
      toast.error(`⚠️ ${data?.message || "Validation failed"}`, { duration: 4000 });
    }
    return { handled: true, type: "validation" };
  }

  if (status >= 500) {
    toast.error(`🔥 Server error ${status}. Please try again later.`, { duration: 5000 });
    return { handled: true, type: "server" };
  }

  return { handled: false, type: "unknown" };
}

// ============================================
// PLANS — MUST MATCH BACKEND EXACTLY
// ============================================
const plans = [
  {
    id: "1-month",
    name: "Starter",
    price: 499,
    period: "1 Month",
    periodLabel: "/month",
    badge: null,
    icon: <Zap className="w-6 h-6" />,
    description: "Perfect for small teams getting started",
    features: [
      { icon: <Users size={16} />, text: "2 HR Accounts", included: true },
      { icon: <BarChart3 size={16} />, text: "Basic Analytics", included: true },
      { icon: <Infinity size={16} />, text: "10 Job Posts", included: true },
      { icon: <Headphones size={16} />, text: "Email Support", included: true },
      { icon: <Workflow size={16} />, text: "Hiring Workflow", included: false },
      { icon: <Sparkles size={16} />, text: "Premium Dashboard", included: false },
    ],
    color: "from-gray-50 via-white to-gray-50",
    borderColor: "border-gray-200",
    buttonColor: "bg-gray-900 hover:bg-gray-800",
    accentColor: "text-gray-900",
    featured: false,
  },
  {
    id: "3-month",
    name: "Professional",
    price: 999,
    period: "3 Months",
    periodLabel: "/3 Months",
    badge: "Most Popular",
    icon: <Crown className="w-6 h-6" />,
    description: "Best value for growing companies",
    features: [
      { icon: <Users size={16} />, text: "5 HR Accounts", included: true },
      { icon: <BarChart3 size={16} />, text: "Advanced Analytics", included: true },
      { icon: <Infinity size={16} />, text: "Unlimited Job Posts", included: true },
      { icon: <Headphones size={16} />, text: "Priority Support", included: true },
      { icon: <Workflow size={16} />, text: "Hiring Workflow", included: true },
      { icon: <Sparkles size={16} />, text: "Premium Dashboard", included: false },
      { icon: <Building2 size={16} />, text: "API Access", included: false },
    ],
    color: "from-orange-50 via-orange-50/50 to-white",
    borderColor: "border-[#EA580C]",
    buttonColor: "bg-[#EA580C] hover:bg-[#d44f0a]",
    accentColor: "text-[#EA580C]",
    featured: true,
  },
  {
    id: "6-month",
    name: "Enterprise",
    price: 1999,
    period: "6 Months",
    periodLabel: "/6 Months",
    badge: "Best Value",
    icon: <Building2 className="w-6 h-6" />,
    description: "Full power for large organizations",
    features: [
      { icon: <Users size={16} />, text: "Unlimited HR Accounts", included: true },
      { icon: <BarChart3 size={16} />, text: "Advanced Analytics", included: true },
      { icon: <Infinity size={16} />, text: "Unlimited Job Posts", included: true },
      { icon: <Headphones size={16} />, text: "24/7 Priority Support", included: true },
      { icon: <Workflow size={16} />, text: "Hiring Workflow", included: true },
      { icon: <Sparkles size={16} />, text: "Premium Dashboard", included: true },
      { icon: <Building2 size={16} />, text: "API Access", included: true },
    ],
    color: "from-purple-50 via-purple-50/50 to-white",
    borderColor: "border-purple-500",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    accentColor: "text-purple-600",
    featured: false,
  },
];

export default function CompanySubscription() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [authState, setAuthState] = useState("checking");
  const [subState, setSubState] = useState("unknown");

  // Load Razorpay
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error("Failed to load Razorpay");
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  // ============================================
  // FETCH SUBSCRIPTION
  // ============================================
  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    const toastId = toast.loading("Checking subscription...");
    
    const token = getAuthToken();
    if (!token) {
      toast.error("🔒 Not logged in. Please login first.", { id: toastId, duration: 4000 });
      setAuthState("unauthenticated");
      setLoading(false);
      setTimeout(() => navigate("/hrm-login", { state: { from: location.pathname } }), 1500);
      return;
    }

    const result = await safeFetch(`${API_BASE}/subscription/current`, {
      method: "GET",
      credentials: "include",
    });

    if (!result.ok) {
      const error = handleError(result, navigate);
      if (error.handled) {
        if (error.type === "auth") setAuthState("unauthenticated");
        if (error.type === "subscription") {
          setAuthState("authenticated");
          setSubState("none");
        }
        setLoading(false);
        return;
      }
    }

    toast.dismiss(toastId);
    setAuthState("authenticated");

    if (result.ok && result.data) {
      const sub = result.data.subscription || result.data;
      setCurrentSub(sub);
      
      const now = new Date();
      const expiresAt = sub?.expiresAt ? new Date(sub.expiresAt) : null;
      
      if (sub?.status === "active" && expiresAt && expiresAt > now) {
        setSubState("active");
      } else if (sub?.status === "expired" || (expiresAt && expiresAt <= now)) {
        setSubState("expired");
      } else {
        setSubState("none");
      }
    } else {
      setSubState("none");
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  // ============================================
  // CREATE ORDER
  // ============================================
  const handleCreateOrder = async (plan) => {
    if (!razorpayLoaded) {
      toast.error("Razorpay loading. Please wait...");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("🔒 Session expired. Please login.");
      navigate("/hrm-login");
      return;
    }

    setProcessingPlan(plan.id);
    const toastId = toast.loading("Creating order...");

    const result = await safeFetch(`${API_BASE}/subscription/create-order`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ plan: plan.id }),
    });

    if (!result.ok) {
      handleError(result, navigate);
      setProcessingPlan(null);
      toast.dismiss(toastId);
      return;
    }

    toast.dismiss(toastId);

    if (result.ok && result.data) {
      openRazorpay(result.data, plan);
    } else {
      toast.error("Unexpected response from server");
      setProcessingPlan(null);
    }
  };

  // ============================================
  // OPEN RAZORPAY
  // ============================================
  const openRazorpay = (response, plan) => {
    const orderData = response?.data || response; // Handle both {data: {...}} and direct response

    const key = import.meta.env.VITE_RAZORPAY_KEY;

    if (!key) {
      toast.error("Payment configuration error. Contact support.");
      setProcessingPlan(null);
      return;
    }

    const options = {
      key: key,
      amount: orderData.amount,
      currency: orderData.currency || "INR",
      name: "JobDekho",
      description: `${plan.name} Plan`,
      order_id: orderData.orderId || orderData.id,
      theme: { color: "#EA580C" },
      
      handler: async function (razorpayResponse) {
        await verifyPayment(razorpayResponse, plan);
      },

      modal: {
        ondismiss: () => {
          toast("Payment cancelled", { icon: "⚠️" });
          setProcessingPlan(null);
        },
      },
    };

    const razor = new window.Razorpay(options);

    razor.on("payment.failed", function (response) {
      toast.error(response.error?.description || "Payment failed");
      setProcessingPlan(null);
    });

    razor.open();
  };

  // ============================================
  // VERIFY PAYMENT — CRITICAL: This activates subscription
  // ============================================
  const verifyPayment = async (razorpayResponse, plan) => {
    const toastId = toast.loading("Verifying payment...");

    // Ensure we have all required fields
    const payload = {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
      plan: plan.id,
    };

    // Validate payload before sending
    if (!payload.razorpay_order_id || !payload.razorpay_payment_id || !payload.razorpay_signature) {
      toast.error("Missing payment details. Please contact support.", { id: toastId });
      setProcessingPlan(null);
      return;
    }

    const result = await safeFetch(`${API_BASE}/subscription/verify-payment`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!result.ok) {
      handleError(result, navigate);
      setProcessingPlan(null);
      return;
    }

    // ✅ SUCCESS: Subscription activated
    toast.success("🎉 Payment successful! Subscription activated.", { 
      id: toastId, 
      duration: 5000 
    });

    // Refresh subscription status
    await fetchSubscription();
    
    setShowConfirm(null);
    setProcessingPlan(null);

    // Redirect to HR creation page after 2 seconds
    setTimeout(() => {
      navigate("/create-hr", { 
        state: { 
          subscriptionActivated: true,
          plan: plan.id,
          paymentId: razorpayResponse.razorpay_payment_id
        } 
      });
    }, 2000);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A";
  const getDaysRemaining = (d) => {
    if (!d) return 0;
    const days = Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // ============================================
  // RENDER STATES
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-[#FBE8DD]/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#EA580C] mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Checking your account...</p>
        </div>
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-[#FBE8DD]/20 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-6">Your login session has expired.</p>
          <button
            onClick={() => navigate("/hrm-login", { state: { from: location.pathname } })}
            className="w-full bg-[#EA580C] hover:bg-[#d44f0a] text-white py-3 rounded-2xl font-semibold transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  const isActive = subState === "active";
  const isExpired = subState === "expired";
  const hasNoSub = subState === "none" || subState === "expired";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-[#FBE8DD]/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/company-dashboard")} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#EA580C] transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EA580C] rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">JobDekho</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Active Subscription Banner */}
        {isActive && currentSub && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-green-900 text-lg">Active Subscription</h3>
                <p className="text-green-700 text-sm">
                  Plan: <span className="font-semibold">{currentSub.plan}</span> • 
                  Expires: <span className="font-semibold">{formatDate(currentSub.expiresAt)}</span> • 
                  <span className="font-semibold"> {getDaysRemaining(currentSub.expiresAt)} days remaining</span>
                </p>
              </div>
              <button 
                onClick={() => navigate("/create-hr")}
                className="ml-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Create HR →
              </button>
            </div>
          </div>
        )}

        {/* No Sub Banner */}
        {hasNoSub && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">{isExpired ? "Subscription Expired" : "No Active Plan"}</h3>
              <p className="text-sm text-amber-700">{isExpired ? "Renew to continue using features." : "Purchase a plan to unlock HR creation and job posting."}</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#EA580C]/10 text-[#EA580C] rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" /> Upgrade Your Hiring
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Choose Your <span className="text-[#EA580C]">Plan</span></h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Unlock powerful hiring tools and manage your recruitment</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isProcessing = processingPlan === plan.id;
            const isCurrentPlan = currentSub?.plan === plan.id && isActive;

            return (
              <div key={plan.id} className={`relative group rounded-3xl border-2 ${plan.borderColor} bg-gradient-to-b ${plan.color} p-1 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.featured ? "md:-mt-4 md:mb-4 shadow-xl" : "shadow-lg"}`}>
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${plan.featured ? "bg-[#EA580C]" : "bg-amber-600"}`}>{plan.badge}</span>
                  </div>
                )}
                <div className="bg-white/70 backdrop-blur-sm rounded-[22px] p-8 h-full flex flex-col">
                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.featured ? "bg-[#EA580C]/10" : "bg-gray-100"}`}>
                      <span className={plan.accentColor}>{plan.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">₹</span>
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 text-sm font-medium ml-1">{plan.periodLabel}</span>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className={`flex items-center gap-3 ${feature.included ? "text-gray-700" : "text-gray-400"}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.included ? (plan.featured ? "bg-[#EA580C]/10 text-[#EA580C]" : "bg-green-100 text-green-600") : "bg-gray-100 text-gray-400"}`}>
                          {feature.included ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </div>
                        <span className="flex items-center gap-2 text-sm">{feature.included && <span className={plan.accentColor}>{feature.icon}</span>}{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { if (isCurrentPlan) return; setShowConfirm(plan); }}
                    disabled={isProcessing || isCurrentPlan || !razorpayLoaded}
                    className={`w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isCurrentPlan ? "bg-green-500 cursor-default" : plan.buttonColor}`}
                  >
                    {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : 
                     isCurrentPlan ? (<><Check className="w-5 h-5" /> Current Plan</>) : 
                     (<><>Get {plan.name}</><ChevronRight className="w-4 h-4" /></>)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="w-6 h-6" />, label: "Secure Payments", desc: "Razorpay Protected" },
              { icon: <Clock className="w-6 h-6" />, label: "Instant Activation", desc: "Auto-enabled" },
              { icon: <Headphones className="w-6 h-6" />, label: "24/7 Support", desc: "Always here" },
              { icon: <TrendingUp className="w-6 h-6" />, label: "Growth Focused", desc: "Scale faster" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-2xl bg-white/60 border border-orange-100/50 backdrop-blur-sm">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#EA580C] mb-3">{item.icon}</div>
                <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#EA580C]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-[#EA580C]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase</h3>
              <p className="text-gray-600">Purchasing <span className="font-semibold text-[#EA580C]">{showConfirm.name}</span> for <span className="font-bold text-gray-900">₹{showConfirm.price}</span></p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Plan</span><span className="font-semibold">{showConfirm.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Duration</span><span className="font-semibold">{showConfirm.period}</span></div>
              <div className="border-t border-gray-200 pt-2 flex justify-between"><span className="font-semibold text-gray-900">Total</span><span className="font-bold text-[#EA580C] text-lg">₹{showConfirm.price}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => { setShowConfirm(null); handleCreateOrder(showConfirm); }}
                disabled={processingPlan === showConfirm.id}
                className="flex-1 py-3 rounded-2xl bg-[#EA580C] hover:bg-[#d44f0a] text-white font-semibold flex items-center justify-center gap-2"
              >
                {processingPlan === showConfirm.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><>Pay ₹{showConfirm.price}</><ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}