import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";

const BASE_URL = window.API_BASE_URL;
const getToken = () => Cookies.get("jobdekho_token") || sessionStorage.getItem("companyToken") || sessionStorage.getItem("employeeToken") || sessionStorage.getItem("accessToken");

const NOTIFICATION_ICONS = {
  job_match: "💼",
  application_received: "📩",
  application_shortlisted: "✅",
  interview_scheduled: "📅",
  application_rejected: "❌",
  application_hired: "🎉",
  employee_onboarded: "👤",
  info: "ℹ️",
  system: "⚙️",
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const [notiRes, countRes] = await Promise.all([
        fetch(`${BASE_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (notiRes.ok) {
        const notiData = await notiRes.json();
        setNotifications(notiData.data || []);
      }
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(countData.data?.count || 0);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
    setLoading(false);
  };

  const markOneRead = async (id) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${BASE_URL}/notifications/read/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-orange-50 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-orange-100 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-xs text-[#EA580C] font-semibold hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => { if (!n.isRead) markOneRead(n._id); if (n.link) window.location.href = n.link; }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-orange-50/50 transition-colors border-b border-gray-50 ${
                      !n.isRead ? "bg-orange-50/30" : ""
                    }`}
                  >
                    <span className="text-lg mt-0.5">{NOTIFICATION_ICONS[n.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-600"} line-clamp-2`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-[#EA580C] rounded-full mt-2 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
