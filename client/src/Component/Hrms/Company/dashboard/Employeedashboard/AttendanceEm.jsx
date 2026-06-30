import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Clock, CheckCircle, XCircle, AlertCircle,
  RefreshCw, CalendarDays, LogIn, LogOut,
  Info, Wifi, WifiOff, Smartphone, Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = window.API_BASE_URL;

const getToken = () =>
  sessionStorage.getItem("employeeToken") || sessionStorage.getItem("companyToken");

const getConfig = () => {
  const token = getToken();
  return {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
};

const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(
      decodeURIComponent(
        json
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  } catch {
    return null;
  }
};

const getUserId = () => {
  const decoded = decodeToken(getToken());
  return decoded?._id || decoded?.id || decoded?.userId || decoded?.sub || null;
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeStatus = (s) => {
  if (!s) return "unknown";
  const lower = s.toLowerCase();
  if (lower === "present") return "present";
  if (lower === "absent") return "absent";
  if (lower === "late") return "late";
  if (lower === "half day") return "half day";
  if (lower === "leave") return "leave";
  return lower;
};

const statusColor = (s) => {
  const st = normalizeStatus(s);
  if (st === "present") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (st === "absent") return "text-red-500 bg-red-50 border-red-200";
  if (st === "late") return "text-amber-600 bg-amber-50 border-emerald-200";
  if (st === "leave") return "text-blue-600 bg-blue-50 border-blue-200";
  return "text-gray-500 bg-gray-50 border-gray-200";
};

const statusIcon = (s) => {
  const st = normalizeStatus(s);
  if (st === "present") return <CheckCircle className="w-3 h-3" />;
  if (st === "absent") return <XCircle className="w-3 h-3" />;
  if (st === "late") return <AlertCircle className="w-3 h-3" />;
  return null;
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <p className="text-5xl font-bold text-gray-800 tabular-nums">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </p>
      <p className="text-gray-400 text-sm mt-1">
        {time.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
};

const AttendanceEm = () => {
  const [location, setLocation] = useState(null);
  const [locError, setLocError] = useState("");
  const [geofences, setGeofences] = useState([]);
  const [nearestGeo, setNearestGeo] = useState(null);
  const [distance, setDistance] = useState(null);
  const [inZone, setInZone] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [actionType, setActionType] = useState("");
  const [apiError, setApiError] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [watchAccuracy, setWatchAccuracy] = useState(null);
  const watchRef = useRef(null);

  const userId = getUserId();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      let device = "Unknown Device";
      let os = "Unknown OS";

      if (/iPhone/i.test(ua)) { device = "iPhone"; os = "iOS"; }
      else if (/iPad/i.test(ua)) { device = "iPad"; os = "iOS"; }
      else if (/Android/i.test(ua)) { device = "Android Phone"; os = "Android"; }
      else if (/Windows/i.test(ua)) { device = "Windows PC"; os = "Windows"; }
      else if (/Mac/i.test(ua)) { device = "Mac"; os = "macOS"; }
      else if (/Linux/i.test(ua)) { device = "Linux PC"; os = "Linux"; }

      const browser =
        /Chrome/i.test(ua) ? "Chrome" :
        /Firefox/i.test(ua) ? "Firefox" :
        /Safari/i.test(ua) ? "Safari" :
        /Edge/i.test(ua) ? "Edge" : "Unknown Browser";

      return `${device}, ${os}, ${browser}`;
    };

    setDeviceInfo(getDeviceInfo());
  }, []);

  const showMsg = (msg, type = "success") => {
    setActionMsg(msg);
    setActionType(type);
    setTimeout(() => setActionMsg(""), 5000);
  };

  const parseGeofences = (data) => {
    return data
      .map((g) => {
        const coords = g.location?.coordinates;
        const lat = g.latitude ?? g.lat ?? (coords ? coords[1] : null);
        const lng = g.longitude ?? g.lng ?? (coords ? coords[0] : null);
        const radius = g.allowedRadius ?? g.radius ?? 100;
        const name = g.branchName ?? g.name ?? "Office";

        if (lat == null || lng == null) return null;

        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        if (isNaN(parsedLat) || isNaN(parsedLng)) return null;

        return {
          ...g,
          latitude: parsedLat,
          longitude: parsedLng,
          allowedRadius: parseFloat(radius) || 100,
          branchName: name,
        };
      })
      .filter(Boolean);
  };

  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      setApiError(null);

      try {
        if (!getToken()) {
          setApiError("No authentication token found. Please login again.");
          setPageLoading(false);
          return;
        }

        const cfg = getConfig();

        const todayPromise = axios
          .get(`${BASE}/attendance/me/today`, cfg)
          .then((r) => r.data?.data)
          .catch(() => null);

        const profilePromise = axios
          .get(`${BASE}/employee/profile`, cfg)
          .then((r) => r.data?.data)
          .catch(() => null);

        const [todayData, profile] = await Promise.all([todayPromise, profilePromise]);

        setTodayRecord(todayData || null);

        const cid =
          profile?.company?._id ||
          profile?.company ||
          sessionStorage.getItem("employeeCompanyId");

        if (!cid) {
          setApiError("Could not determine your company. Please contact HR.");
          setPageLoading(false);
          return;
        }

        setCompanyId(cid);
        sessionStorage.setItem("employeeCompanyId", cid);

        let geofenceData = [];
        try {
          const geoRes = await axios.get(`${BASE}/geofence/${cid}`, cfg);
          geofenceData = geoRes.data?.data || [];
        } catch {
          setApiError("Failed to fetch geofences. Please try again.");
        }

        const validGeofences = parseGeofences(geofenceData);
        setGeofences(validGeofences);

        if (validGeofences.length === 0 && geofenceData.length > 0) {
          setApiError(
            "Geofences exist but have no valid coordinates.\nPlease ask your HR to update them."
          );
        }

        const historyRes = await axios.get(`${BASE}/attendance/me`, cfg).catch(() => null);
        if (historyRes?.data?.data) {
          const historyData = Array.isArray(historyRes.data.data)
            ? historyRes.data.data
            : [];
          setHistory(historyData.slice(0, 30));
        }
      } catch {
        setApiError("Failed to load attendance data. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation || geofences.length === 0) return;

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setLocation({ latitude, longitude });
        setWatchAccuracy(accuracy);
        setLocError("");

        let nearest = null;
        let minDist = Infinity;

        geofences.forEach((g) => {
          const d = haversine(latitude, longitude, g.latitude, g.longitude);
          if (d < minDist) {
            minDist = d;
            nearest = g;
          }
        });

        if (nearest) {
          setNearestGeo(nearest);
          setDistance(Math.round(minDist));
          setInZone(Math.round(minDist) <= nearest.allowedRadius);
        } else {
          setNearestGeo(null);
          setDistance(null);
          setInZone(false);
        }
      },
      (err) => {
        if (err.code === 1) setLocError("Location access denied. Please enable location services.");
        else if (err.code === 2) setLocError("Location unavailable. Please check your GPS.");
        else if (err.code === 3) setLocError("GPS timeout. Please try again.");
        else setLocError("Enable location access to mark attendance.");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [geofences]);

  const handleCheckIn = async () => {
    if (!location) return showMsg("Location not available. Please enable GPS.", "error");
    if (!inZone)
      return showMsg(
        `Outside office zone. ${distance ?? "?"}m away (need ${nearestGeo?.allowedRadius ?? 100}m).`,
        "error"
      );
    if (!nearestGeo) return showMsg("No office location found. Contact HR.", "error");
    if (!getToken()) return showMsg("Please login again to check in.", "error");

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE}/attendance/check-in`,
        {
          latitude: location.latitude,
          longitude: location.longitude,
          branchName: nearestGeo.branchName || "Office",
          deviceInfo: deviceInfo || "Web Browser",
        },
        getConfig()
      );

      setTodayRecord({
        ...res.data?.data,
        status: "Present",
        checkIn: new Date().toISOString(),
        checkOut: null,
        branchName: nearestGeo.branchName,
      });
      showMsg(`Checked in at ${nearestGeo.branchName}!`);
    } catch (e) {
      showMsg(e?.response?.data?.message || e?.message || "Check-in failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!getToken()) return showMsg("Please login again to check out.", "error");

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE}/attendance/check-out`,
        {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          deviceInfo: deviceInfo || "Web Browser",
        },
        getConfig()
      );

      setTodayRecord((prev) => ({
        ...prev,
        checkOut: new Date().toISOString(),
        ...res.data?.data,
      }));
      showMsg("Checked out. See you tomorrow!");
    } catch (e) {
      showMsg(e?.response?.data?.message || e?.message || "Check-out failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkedIn = !!todayRecord?.checkIn;
  const checkedOut = !!todayRecord?.checkOut;
  const presentCount = history.filter((r) => normalizeStatus(r.status) === "present").length;
  const absentCount = history.filter((r) => normalizeStatus(r.status) === "absent").length;
  const lateCount = history.filter((r) => normalizeStatus(r.status) === "late").length;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 flex flex-col items-center justify-center p-6">
        <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Loading attendance data...</p>
      </div>
    );
  }

  if (apiError && geofences.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Attendance Issue</h2>
          <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{apiError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Mark your check-in and track your history
            </p>
          </div>
          <div className="flex items-center gap-2">
            {companyId && (
              <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                {companyId.slice(0, 8)}...
              </span>
            )}
            <span className="text-xs text-gray-400 bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{deviceInfo}</span>
            </span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${
              actionType === "error"
                ? "bg-red-500 text-white"
                : "bg-emerald-500 text-white"
            }`}
          >
            {actionType === "error" ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {actionMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-orange-50 p-6 text-center"
        >
          <LiveClock />

          <div className="mt-4 space-y-2">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                locError
                  ? "bg-red-50 text-red-500"
                  : !location
                  ? "bg-gray-50 text-gray-500"
                  : inZone
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {locError ? (
                <WifiOff className="w-3 h-3" />
              ) : location ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <RefreshCw className="w-3 h-3 animate-spin" />
              )}
              {locError
                ? locError
                : !location
                ? "Detecting location\u2026"
                : inZone
                ? `Inside ${nearestGeo?.branchName || "office"} zone`
                : `${distance ?? "?"}m from ${nearestGeo?.branchName || "office"} \u2014 move closer`}
            </div>

            {watchAccuracy && watchAccuracy > 50 && !locError && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 inline-flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Low GPS accuracy (\u00b1{Math.round(watchAccuracy)}m). Move to open area.
              </div>
            )}
          </div>

          {geofences.length === 0 && !locError && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-600">
                No valid geofences found. Contact your HR to set up office locations.
              </p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-orange-50 p-6"
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" /> Today's attendance
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Check-in</p>
              <p className="text-xl font-bold text-gray-800">
                {todayRecord?.checkIn
                  ? new Date(todayRecord.checkIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "\u2014"}
              </p>
              {todayRecord?.branchName && (
                <p className="text-xs text-gray-400 mt-1">{todayRecord.branchName}</p>
              )}
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Check-out</p>
              <p className="text-xl font-bold text-gray-800">
                {todayRecord?.checkOut
                  ? new Date(todayRecord.checkOut).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "\u2014"}
              </p>
            </div>
          </div>

          {todayRecord && (
            <div
              className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border mb-4 ${statusColor(
                todayRecord.status
              )}`}
            >
              {statusIcon(todayRecord.status)}
              Status: <span className="capitalize">{normalizeStatus(todayRecord.status)}</span>
              {todayRecord.branchName && (
                <span className="text-xs text-gray-500 ml-2">
                  \u2022 {todayRecord.branchName}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {!checkedIn && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckIn}
                disabled={loading || !inZone || !location || geofences.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Check in
              </motion.button>
            )}
            {checkedIn && !checkedOut && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckOut}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg shadow-gray-200 hover:from-gray-800 hover:to-gray-900 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                Check out
              </motion.button>
            )}
            {checkedIn && checkedOut && (
              <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle className="w-4 h-4" /> Day complete \u2014 see you tomorrow!
              </div>
            )}
          </div>

          {!inZone && !locError && location && geofences.length > 0 && (
            <p className="flex items-center gap-1.5 text-xs text-amber-500 mt-3">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              You need to be within {nearestGeo?.allowedRadius || 100}m of the office to check in.
              {distance !== null && <span> (Current: {distance}m)</span>}
            </p>
          )}

          {geofences.length === 0 && !locError && (
            <p className="flex items-center gap-1.5 text-xs text-amber-500 mt-3">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              No geofences found. Contact your HR to set up office locations.
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Present days", value: presentCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Absent days", value: absentCount, color: "text-red-500", bg: "bg-red-50" },
            { label: "Late days", value: lateCount, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`${s.bg} rounded-2xl p-4 text-center border border-white`}
            >
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden"
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-orange-500" /> Recent history
            </h2>
            <span className="text-xs text-gray-400">Last {history.length} records</span>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CalendarDays className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium text-sm">No attendance records yet</p>
              <p className="text-xs mt-1">Check in today to start tracking</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {history.map((rec, i) => {
                const date = rec.date || rec.createdAt;
                const checkIn = rec.checkIn
                  ? new Date(rec.checkIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "\u2014";
                const checkOut = rec.checkOut
                  ? new Date(rec.checkOut).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "\u2014";
                return (
                  <div
                    key={rec._id || i}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/30 transition-colors"
                  >
                    <div className="w-10 text-center">
                      <p className="text-lg font-bold text-gray-700">
                        {new Date(date).getDate()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(date).toLocaleString("default", { month: "short" })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">
                        {new Date(date).toLocaleString("default", { weekday: "long" })}
                      </p>
                      {rec.branchName && (
                        <p className="text-xs text-gray-400">{rec.branchName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="hidden sm:inline">
                        <span className="text-xs text-gray-400 mr-1">In</span>
                        {checkIn}
                      </span>
                      <span className="hidden sm:inline">
                        <span className="text-xs text-gray-400 mr-1">Out</span>
                        {checkOut}
                      </span>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusColor(
                        rec.status
                      )}`}
                    >
                      {statusIcon(rec.status)}
                      {normalizeStatus(rec.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AttendanceEm;
