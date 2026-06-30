import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowLeft,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Power,
  PowerOff,
  Mail,
  Phone,
  Building2,
  Briefcase,
  CalendarDays,
  Shield,
  MapPin,
  Contact,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  Filter,
  Download,
  MoreHorizontal,
  IdCard,
  Hash,
  Clock,
} from "lucide-react";

// ==========================
// AUTH HELPERS (reusable)
// ==========================
const getToken = () => sessionStorage.getItem("companyToken");
const clearAuth = () => {
  sessionStorage.removeItem("companyToken");
  sessionStorage.removeItem("companyUser");
};

const handleApiError = (error, navigate) => {
  const status = error?.response?.status;
  const message = (error?.response?.data?.message || "").toLowerCase();
  const isUnauthorized = status === 401;
  const isTokenExpired =
    message.includes("jwt expired") ||
    message.includes("unauthorized") ||
    message.includes("invalid token") ||
    message.includes("token expired") ||
    message.includes("no token");

  if (isUnauthorized || isTokenExpired) {
    clearAuth();
    toast.error("Session expired. Please login again.", {
      duration: 4000,
      position: "top-center",
    });
    navigate("/company-login", { replace: true });
    return true;
  }
  return false;
};

// ==========================
// ANIMATION VARIANTS
// ==========================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const slideOverVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { x: "100%", transition: { duration: 0.3 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ==========================
// STATUS BADGE COMPONENT
// ==========================
const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-red-50 text-red-700 border-red-200",
    terminated: "bg-gray-100 text-gray-600 border-gray-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  };
  const icons = {
    active: <CheckCircle2 className="w-3.5 h-3.5" />,
    inactive: <PowerOff className="w-3.5 h-3.5" />,
    terminated: <AlertCircle className="w-3.5 h-3.5" />,
    pending: <Clock className="w-3.5 h-3.5" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}
    >
      {icons[status] || icons.pending}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// ==========================
// SKELETON LOADER
// ==========================
const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-100 rounded-t-xl mb-1" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-50 border-b border-gray-100" />
    ))}
  </div>
);

// ==========================
// EMPTY STATE
// ==========================
const EmptyState = ({ searchQuery, onClear }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
      <Users className="w-10 h-10 text-orange-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-1">
      {searchQuery ? "No employees found" : "No employees yet"}
    </h3>
    <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
      {searchQuery
        ? `No results matching "${searchQuery}". Try different search terms.`
        : "Your employee list is empty. Add employees to get started."}
    </p>
    {searchQuery && (
      <button
        onClick={onClear}
        className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg font-medium hover:bg-orange-100 transition-colors"
      >
        Clear Search
      </button>
    )}
  </motion.div>
);

// ==========================
// CONFIRMATION MODAL
// ==========================
const ConfirmModal = ({ isOpen, onClose, onConfirm, employeeName, status }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === "active" ? "bg-red-50" : "bg-green-50"
              }`}
            >
              <Power
                className={`w-5 h-5 ${status === "active" ? "text-red-500" : "text-green-500"}`}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {status === "active" ? "Deactivate" : "Activate"} Employee
              </h3>
              <p className="text-sm text-gray-500">{employeeName}</p>
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Are you sure you want to{" "}
            {status === "active" ? "deactivate" : "activate"} this employee?
            This will change their access to the HRMS system.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-white transition-colors ${
                status === "active"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {status === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ==========================
// SLIDE-OVER DETAIL PANEL
// ==========================
const EmployeeDetailPanel = ({ employee, onClose, onActivate }) => {
  if (!employee || typeof employee !== "object") {
    return null;
  }

  const sections = [
    {
      title: "Personal Information",
      icon: User,
      items: [
        {
          label: "Employee ID",
          value: employee.employeeId || "N/A",
          icon: Hash,
        },
        {
          label: "Full Name",
          value: employee.personalEmail?.split("@")[0] || "N/A",
          icon: User,
        },
        {
          label: "Personal Email",
          value: employee.personalEmail || "N/A",
          icon: Mail,
        },
        {
          label: "Company Email",
          value: employee.companyEmail || "N/A",
          icon: Mail,
        },
        { label: "Phone", value: employee.phone || "N/A", icon: Phone },
        {
          label: "Address",
          value: employee.address || "Not provided",
          icon: MapPin,
        },
        {
          label: "Emergency Contact",
          value: employee.emergencyContact || "Not provided",
          icon: Contact,
        },
      ],
    },
    {
      title: "Job Information",
      icon: Briefcase,
      items: [
        {
          label: "Department",
          value: employee.department || "N/A",
          icon: Building2,
        },
        {
          label: "Designation",
          value: employee.designation || "N/A",
          icon: Briefcase,
        },
        {
          label: "Reporting Manager",
          value: employee.reportingManager || "N/A",
          icon: Users,
        },
        {
          label: "Joining Date",
          value: employee.joiningDate || "N/A",
          icon: CalendarDays,
        },
        {
          label: "Employment Status",
          value: employee.employmentStatus || "N/A",
          icon: Shield,
        },
      ],
    },
    {
      title: "Company Information",
      icon: Building2,
      items: [
        {
          label: "Company ID",
          value:
            typeof employee.company === "object"
              ? employee.company?._id || "N/A"
              : employee.company || "N/A",
          icon: Building2,
        },

        {
          label: "Employee Name",
          value: employee.user?.name || "N/A",
          icon: User,
        },

        {
          label: "Employee Email",
          value: employee.user?.email || "N/A",
          icon: Mail,
        },

        {
          label: "Role",
          value: employee.user?.role || "N/A",
          icon: Shield,
        },

        {
          label: "Account Status",
          value: employee.user?.accountStatus || "N/A",
          icon: CheckCircle2,
        },

        {
          label: "User ID",
          value: employee.user?._id || "N/A",
          icon: IdCard,
        },
      ],
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50"
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          variants={slideOverVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                {employee?.personalEmail?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Employee Details</h2>
                <p className="text-xs text-gray-500">
                  ID: {employee.employeeId || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={employee.employmentStatus} />
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {sections.map((section, idx) => {
              const SectionIcon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-orange-50/30 rounded-2xl border border-orange-100/50 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-orange-100/50 flex items-center gap-2">
                    <SectionIcon className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-800">
                      {section.title}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-start gap-3"
                        >
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <ItemIcon className="w-4 h-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              {item.label}
                            </p>
                            <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">
                              {typeof item.value === "object"
                                ? JSON.stringify(item.value)
                                : item.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={() => onActivate(employee)}
                className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                  employee.employmentStatus === "active"
                    ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                    : "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200"
                }`}
              >
                <Power className="w-5 h-5" />
                {employee.employmentStatus === "active"
                  ? "Deactivate Employee"
                  : "Activate Employee"}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ==========================
// MAIN COMPONENT
// ==========================
const EmployeeDetail = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    employee: null,
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 10;

  // Fetch employees on mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { position: "top-center" });
        navigate("/company-login", { replace: true });
        return;
      }

      const { data } = await axios.get(
        window.API_BASE_URL + "/employees",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      setEmployees(data.data || []);
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch employees",
          {
            position: "top-center",
          },
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and search
  const filteredEmployees = useMemo(() => {
    let filtered = employees;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = employees.filter(
        (emp) =>
          emp.employeeId?.toLowerCase().includes(query) ||
          emp.department?.toLowerCase().includes(query) ||
          emp.designation?.toLowerCase().includes(query) ||
          emp.personalEmail?.toLowerCase().includes(query) ||
          emp.companyEmail?.toLowerCase().includes(query) ||
          emp.phone?.toLowerCase().includes(query),
      );
    }
    // Sort
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [employees, searchQuery, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleActivateClick = (employee) => {
    setConfirmModal({ isOpen: true, employee });
  };

  const handleConfirmActivate = async () => {
    const employee = confirmModal.employee;
    if (!employee) return;

    setConfirmModal({ isOpen: false, employee: null });
    const toastId = toast.loading(
      employee.employmentStatus === "active"
        ? "Deactivating..."
        : "Activating...",
    );

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login again", { id: toastId });
        navigate("/company-login", { replace: true });
        return;
      }

      await axios.patch(
        `${window.API_BASE_URL}/employees/${employee._id}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      // Update local state instantly
      const newStatus =
        employee.employmentStatus === "active" ? "inactive" : "active";
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === employee._id
            ? { ...emp, employmentStatus: newStatus }
            : emp,
        ),
      );

      // Update selected employee if open
      if (selectedEmployee?._id === employee._id) {
        setSelectedEmployee((prev) => ({
          ...prev,
          employmentStatus: newStatus,
        }));
      }

      toast.success(
        `Employee ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
        {
          id: toastId,
          icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        },
      );
    } catch (error) {
      const wasExpired = handleApiError(error, navigate);
      if (!wasExpired) {
        toast.error(error?.response?.data?.message || "Action failed", {
          id: toastId,
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Table headers with sort
  const headers = [
    { key: "employeeId", label: "Employee ID", width: "w-32" },
    { key: "personalEmail", label: "Name / Email", width: "w-48" },
    { key: "department", label: "Department", width: "w-32" },
    { key: "designation", label: "Designation", width: "w-40" },
    { key: "phone", label: "Phone", width: "w-36" },
    { key: "joiningDate", label: "Joining Date", width: "w-32" },
    { key: "employmentStatus", label: "Status", width: "w-28" },
    { key: "actions", label: "Actions", width: "w-24", sortable: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-orange-50/30">
      {/* Header */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/hrdashboard")}
                className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Employee Management
                </h1>
                <p className="text-sm text-gray-500">
                  Manage and view all employees
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                Total:{" "}
                <span className="font-semibold text-gray-800">
                  {employees.length}
                </span>
              </span>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg shadow-orange-100/20 border border-orange-50 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by ID, name, department, designation, email..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchEmployees}
                className="px-4 py-3 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl shadow-orange-100/30 border border-orange-50 overflow-hidden"
        >
          {loading ? (
            <TableSkeleton />
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              searchQuery={searchQuery}
              onClear={() => setSearchQuery("")}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-orange-50/50 border-b border-orange-100">
                      {headers.map((header) => (
                        <th
                          key={header.key}
                          onClick={() =>
                            header.sortable !== false && handleSort(header.key)
                          }
                          className={`px-4 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${header.width} ${
                            header.sortable !== false
                              ? "cursor-pointer hover:text-orange-600 transition-colors"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {header.label}
                            {header.sortable !== false &&
                              sortConfig.key === header.key &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              ))}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {paginatedEmployees.map((employee) => (
                      <motion.tr
                        key={employee._id}
                        variants={rowVariants}
                        whileHover={{
                          backgroundColor: "rgba(249, 115, 22, 0.03)",
                        }}
                        onClick={() => handleEmployeeClick(employee)}
                        className="border-b border-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {employee.employeeId || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                              {employee.personalEmail
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {employee?.personalEmail
                                  ? employee.personalEmail.split("@")[0]
                                  : "Unknown"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {employee.personalEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                            {employee.department || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">
                          {employee.designation || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {employee.phone || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(employee.joiningDate)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={employee.employmentStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEmployeeClick(employee);
                              }}
                              className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-600"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleActivateClick(employee);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                employee.employmentStatus === "active"
                                  ? "hover:bg-red-50 text-red-500"
                                  : "hover:bg-green-50 text-green-500"
                              }`}
                              title={
                                employee.employmentStatus === "active"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-4">
                {paginatedEmployees.map((employee) => (
                  <motion.div
                    key={employee._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleEmployeeClick(employee)}
                    className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                          employee?.personalEmail?.charAt(0)?.toUpperCase() ||
                          "U"
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {employee.personalEmail?.split("@")[0] || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {employee.employeeId}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={employee.employmentStatus} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-xs text-gray-400">Department</p>
                        <p className="font-medium text-gray-700">
                          {employee.department}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Designation</p>
                        <p className="font-medium text-gray-700">
                          {employee.designation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-medium text-gray-700">
                          {employee.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Joined</p>
                        <p className="font-medium text-gray-700">
                          {formatDate(employee.joiningDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmployeeClick(employee);
                        }}
                        className="flex-1 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivateClick(employee);
                        }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 ${
                          employee.employmentStatus === "active"
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        <Power className="w-4 h-4" />
                        {employee.employmentStatus === "active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-4 border-t border-orange-50 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredEmployees.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {filteredEmployees.length}
                    </span>{" "}
                    employees
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === i + 1
                              ? "bg-orange-500 text-white"
                              : "hover:bg-orange-50 text-gray-600"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailPanel
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onActivate={handleActivateClick}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, employee: null })}
        onConfirm={handleConfirmActivate}
        employeeName={
          confirmModal.employee?.personalEmail?.split("@")[0] || "Employee"
        }
        status={confirmModal.employee?.employmentStatus}
      />
    </div>
  );
};

export default EmployeeDetail;
