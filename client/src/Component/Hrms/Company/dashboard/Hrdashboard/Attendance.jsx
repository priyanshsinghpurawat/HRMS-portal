// Attendance.jsx - HR View with Improved Company ID Resolution
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapPin, Clock, Users, CheckCircle, XCircle, AlertCircle,
  Plus, Trash2, RefreshCw, ChevronRight, Building2,
  Radio, CalendarDays, TrendingUp, Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = window.API_BASE_URL;

// ─── Token & Config Helpers ────────────────────────────────────────────────
const getToken = () => {
  return sessionStorage.getItem("companyToken") || sessionStorage.getItem("employeeToken");
};

const getConfig = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

// ─── Decode JWT to get user info ───────────────────────────────────────────
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(
      json.split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    ));
  } catch {
    return null;
  }
};

// ─── Get Company ID from Token ─────────────────────────────────────────────
const getCompanyIdFromToken = () => {
  const token = getToken();
  const decoded = decodeToken(token);
  return decoded?.companyId || decoded?.company || decoded?.cid || null;
};

// ─── Geofence Modal ─────────────────────────────────────────────────────────
const GeofenceModal = ({ onClose, onSaved, companyId }) => {
  const [form, setForm] = useState({
    branchName: "",
    latitude: "",
    longitude: "",
    allowedRadius: 100,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  // ── Detect Location ────────────────────────────────────────────────────
  const detectLocation = () => {
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      (err) => {
        setError("Could not detect location. Enter coordinates manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // ── Submit Geofence ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.branchName.trim()) {
      setError("Branch name is required.");
      return;
    }
    if (!form.latitude || !form.longitude) {
      setError("Latitude and longitude are required.");
      return;
    }
    if (!companyId) {
      setError("Company ID could not be resolved. Please refresh and try again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post(
        `${BASE}/geofence`,
        {
          companyId,
          branchName: form.branchName.trim(),
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          allowedRadius: form.allowedRadius,
          isActive: form.isActive,
        },
        getConfig()
      );
      onSaved();
      onClose();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create geofence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-500" /> Add Geofence
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ✕
          </button>
        </div>

        {companyId && (
          <div className="mb-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Company: <span className="font-mono truncate">{companyId}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Branch name <span className="text-red-400">*</span>
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="e.g. Main Office, Branch Name"
              value={form.branchName}
              onChange={(e) => setForm((f) => ({ ...f, branchName: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Latitude <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Latitude"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                Longitude <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                placeholder="Longitude"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              />
            </div>
          </div>

          <button
            onClick={detectLocation}
            disabled={locating}
            className="w-full flex items-center justify-center gap-2 border border-orange-200 text-orange-500 rounded-xl py-2.5 text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
          >
            {locating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Radio className="w-4 h-4" />
            )}
            {locating ? "Detecting…" : "Use my current location"}
          </button>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Allowed radius —{" "}
              <span className="text-orange-500 font-semibold">{form.allowedRadius}m</span>
            </label>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={form.allowedRadius}
              onChange={(e) =>
                setForm((f) => ({ ...f, allowedRadius: parseInt(e.target.value) }))
              }
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>50m</span>
              <span>1000m</span>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                form.isActive ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !companyId}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl py-2.5 text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {loading ? "Saving…" : "Save geofence"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main HR Attendance Component ──────────────────────────────────────────
const Attendance = () => {
  const [companyId, setCompanyId] = useState(null);
  const [geofences, setGeofences] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [deletingId, setDeletingId] = useState(null);

  // ── Resolve Company ID ──────────────────────────────────────────────────
  const resolveCompanyId = async () => {
    // Strategy 1: Get from token
    const tokenCompanyId = getCompanyIdFromToken();
    if (tokenCompanyId) {
      setCompanyId(tokenCompanyId);
      return tokenCompanyId;
    }

    // Strategy 2: Get from employees list
    try {
      const cfg = getConfig();
      const empRes = await axios.get(`${BASE}/employees`, cfg);
      const emps = empRes.data?.data || [];
      if (emps.length > 0) {
        const cid = typeof emps[0].company === "object" 
          ? emps[0].company._id 
          : emps[0].company;
        if (cid) {
          setCompanyId(cid);
          return cid;
        }
      }
    } catch (e) {
      console.error("Failed to get company from employees:", e);
    }

    // Strategy 3: Get from profile's company
    try {
      const cfg = getConfig();
      const profileRes = await axios.get(`${BASE}/profile`, cfg);
      const profile = profileRes.data?.data;
      if (profile?.company) {
        const cid = typeof profile.company === "object" 
          ? profile.company._id 
          : profile.company;
        setCompanyId(cid);
        return cid;
      }
    } catch (e) {
      console.error("Failed to get company from profile:", e);
    }

    return null;
  };

  // ── Delete Geofence ───────────────────────────────────────────────────────
  const handleDeleteGeofence = async (geofenceId) => {
    if (!window.confirm("Are you sure you want to delete this geofence?")) return;
    setDeletingId(geofenceId);
    try {
      await axios.delete(`${BASE}/geofence/${geofenceId}`, getConfig());
      setGeofences((prev) => prev.filter((g) => g._id !== geofenceId));
    } catch (e) {
      console.error("Failed to delete geofence:", e);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Fetch All Data ──────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const cfg = getConfig();

      // First, resolve company ID
      const cid = await resolveCompanyId();

      // Fetch employees and attendance in parallel
      const [empRes, attnRes] = await Promise.all([
        axios.get(`${BASE}/employees`, cfg),
        axios.get(`${BASE}/attendance`, cfg).catch(() => ({ data: { data: [] } })),
      ]);

      const emps = empRes.data?.data || [];
      const records = attnRes.data?.data || [];

      setEmployees(emps);
      setAttendance(records);

      // Fetch geofences if we have company ID
      if (cid) {
        const geoRes = await axios
          .get(`${BASE}/geofence/${cid}`, cfg)
          .catch(() => ({ data: { data: [] } }));
        setGeofences(geoRes.data?.data || []);
      }
    } catch (e) {
      console.error("Attendance fetchAll error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────
  const todayAttendance = attendance.filter((a) => {
    const d = a.date ? a.date.split("T")[0] : a.createdAt?.split("T")[0];
    return d === filterDate;
  });

  const filtered = filterStatus === "all"
    ? todayAttendance
    : todayAttendance.filter((a) => a.status === filterStatus);

  const present = todayAttendance.filter((a) => a.status === "present").length;
  const absent = todayAttendance.filter((a) => a.status === "absent").length;
  const late = todayAttendance.filter((a) => a.status === "late").length;
  const total = employees.length;

  const stats = [
    { label: "Total employees", value: total, icon: Users, color: "from-orange-500 to-orange-600" },
    { label: "Present today", value: present, icon: CheckCircle, color: "from-emerald-400 to-emerald-600" },
    { label: "Absent today", value: absent, icon: XCircle, color: "from-red-400 to-red-600" },
    { label: "Late today", value: late, icon: AlertCircle, color: "from-amber-400 to-amber-600" },
  ];

  const statusColor = (s) => {
    if (s === "present") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (s === "absent") return "text-red-500 bg-red-50 border-red-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  const statusIcon = (s) => {
    if (s === "present") return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === "absent") return <XCircle className="w-3.5 h-3.5" />;
    return <AlertCircle className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-6">
      <AnimatePresence>
        {showModal && (
          <GeofenceModal
            companyId={companyId}
            onClose={() => setShowModal(false)}
            onSaved={fetchAll}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
            <p className="text-gray-500 mt-1">Monitor daily attendance and manage geofences</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAll}
              className="flex items-center gap-2 px-4 py-2.5 border border-orange-200 text-orange-500 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200"
            >
              <Plus className="w-4 h-4" /> Add geofence
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance Table */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-orange-500" /> Daily attendance
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
                {["all", "present", "absent", "late"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 capitalize transition-colors ${
                      filterStatus === s
                        ? "bg-orange-500 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <CalendarDays className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No records for this date</p>
              <p className="text-sm mt-1">Employees mark attendance from their app</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((rec, i) => {
                const emp = employees.find((e) => e._id === rec.employee || e.user?._id === rec.employee);
                const name = emp?.user?.name || rec.employeeName || "Employee";
                const dept = emp?.department || "—";
                const checkIn = rec.checkIn
                  ? new Date(rec.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—";
                const checkOut = rec.checkOut
                  ? new Date(rec.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : "—";
                return (
                  <motion.div
                    key={rec._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-orange-50/40 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 text-sm truncate">{name}</p>
                      <p className="text-xs text-gray-400">{dept}</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-gray-400">In</p>
                      <p className="text-sm font-medium text-gray-700">{checkIn}</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-xs text-gray-400">Out</p>
                      <p className="text-sm font-medium text-gray-700">{checkOut}</p>
                    </div>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusColor(
                        rec.status
                      )}`}
                    >
                      {statusIcon(rec.status)} {rec.status || "unknown"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Geofences Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" /> Geofences
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {geofences.length} location{geofences.length !== 1 ? "s" : ""} configured
            </p>
          </div>

          {geofences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-gray-400">
              <MapPin className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium text-sm">No geofences yet</p>
              <p className="text-xs mt-1">Add an office location so employees can check in</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-4 py-2 bg-orange-50 text-orange-500 rounded-xl text-sm font-medium hover:bg-orange-100 transition-colors"
              >
                Add first geofence
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {geofences.map((g, i) => (
                <div key={g._id || i} className="p-4 hover:bg-orange-50/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm text-gray-800">{g.branchName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {g.latitude?.toFixed(4)}, {g.longitude?.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-400">Radius: {g.allowedRadius}m</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          g.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {g.isActive ? "Active" : "Off"}
                      </span>
                      <button
                        onClick={() => handleDeleteGeofence(g._id)}
                        disabled={deletingId === g._id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete geofence"
                      >
                        {deletingId === g._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Attendance;