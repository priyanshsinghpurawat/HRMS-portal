import React, { useState, useEffect } from "react";
import { 
    getAdminUsers, 
    getAdminHRs, 
    getAdminCompanies, 
    blockCompany, 
    unblockCompany, 
    deleteCompany 
} from "../../services/admin.service";
import { 
    Users, 
    Building2, 
    ShieldAlert, 
    UserCheck, 
    Search, 
    Ban, 
    CheckCircle, 
    Trash2, 
    TrendingUp, 
    Filter, 
    LogOut,
    Eye,
    Briefcase
} from "lucide-react";
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

const AdminDashboard = () => {
    // State management
    const [activeTab, setActiveTab] = useState("overview");
    const [users, setUsers] = useState([]);
    const [hrs, setHrs] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Search and filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    
    // Modals
    const [blockModal, setBlockModal] = useState({ isOpen: false, companyId: null, companyName: "" });
    const [blockReason, setBlockReason] = useState("");
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, companyId: null, companyName: "" });
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch initial data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, hrsData, companiesData] = await Promise.all([
                getAdminUsers(),
                getAdminHRs(),
                getAdminCompanies()
            ]);
            setUsers(usersData || []);
            setHrs(hrsData || []);
            setCompanies(companiesData || []);
        } catch (error) {
            toast.error(error.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Logout handler
    const handleLogout = () => {
        document.cookie = "jobdekho_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/login";
    };

    // Block Company Action
    const handleBlockCompany = async () => {
        if (!blockReason.trim()) {
            toast.error("Please provide a block reason");
            return;
        }
        setActionLoading(true);
        try {
            await blockCompany(blockModal.companyId, blockReason);
            toast.success(`${blockModal.companyName} has been blocked`);
            setBlockModal({ isOpen: false, companyId: null, companyName: "" });
            setBlockReason("");
            fetchData(); // reload
        } catch (error) {
            toast.error(error.message || "Failed to block company");
        } finally {
            setActionLoading(false);
        }
    };

    // Unblock Company Action
    const handleUnblockCompany = async (id, name) => {
        if (!window.confirm(`Are you sure you want to unblock ${name}?`)) return;
        try {
            await unblockCompany(id);
            toast.success(`${name} has been unblocked`);
            fetchData(); // reload
        } catch (error) {
            toast.error(error.message || "Failed to unblock company");
        }
    };

    // Delete Company Action
    const handleDeleteCompany = async () => {
        setActionLoading(true);
        try {
            await deleteCompany(deleteModal.companyId);
            toast.success(`${deleteModal.companyName} has been deleted successfully`);
            setDeleteModal({ isOpen: false, companyId: null, companyName: "" });
            fetchData(); // reload
        } catch (error) {
            toast.error(error.message || "Failed to delete company");
        } finally {
            setActionLoading(false);
        }
    };

    // Stats calculations
    const totalUsers = users.length;
    const totalHRs = hrs.length;
    const totalCompanies = companies.length;
    const blockedCompanies = companies.filter(c => c.isBlocked).length;
    const activeCompanies = totalCompanies - blockedCompanies;
    const verifiedUsers = users.filter(u => u.isEmailVerified).length;

    // Chart Data calculations
    const chartData = [
        { name: "Users", count: totalUsers, color: "#3B82F6" },
        { name: "HRs", count: totalHRs, color: "#10B981" },
        { name: "Companies", count: totalCompanies, color: "#F59E0B" }
    ];

    // Filter logic
    const getFilteredData = () => {
        const query = searchQuery.toLowerCase().trim();
        if (activeTab === "users") {
            return users.filter(u => {
                const matchesSearch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
                const matchesStatus = statusFilter === "all" || 
                    (statusFilter === "verified" && u.isEmailVerified) || 
                    (statusFilter === "unverified" && !u.isEmailVerified);
                return matchesSearch && matchesStatus;
            });
        }
        if (activeTab === "hrs") {
            return hrs.filter(h => {
                return h.name.toLowerCase().includes(query) || h.email.toLowerCase().includes(query);
            });
        }
        if (activeTab === "companies") {
            return companies.filter(c => {
                const matchesSearch = c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
                const matchesStatus = statusFilter === "all" || 
                    (statusFilter === "blocked" && c.isBlocked) || 
                    (statusFilter === "active" && !c.isBlocked);
                return matchesSearch && matchesStatus;
            });
        }
        return [];
    };

    const filteredList = getFilteredData();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#0B0F19]">
                <div className="relative flex items-center justify-center">
                    <div className="h-20 w-20 animate-spin rounded-full border-t-4 border-b-4 border-[#FF5500]"></div>
                    <div className="absolute font-semibold text-white text-xs">JobDekho</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0B0F19] text-gray-200 overflow-hidden font-sans">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Side Panel / Sidebar */}
            <aside className="w-72 bg-[#111827]/80 backdrop-blur-xl border-r border-gray-800 flex flex-col justify-between p-6 z-10">
                <div>
                    {/* Brand Logo */}
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#FF3300] to-[#FF8800] flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">JobDekho<span className="text-[#FF5500] font-extrabold">+</span></h1>
                            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Admin Terminal</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="space-y-2">
                        {[
                            { id: "overview", label: "Overview", icon: TrendingUp },
                            { id: "users", label: "Manage Users", icon: Users },
                            { id: "hrs", label: "HR Directory", icon: UserCheck },
                            { id: "companies", label: "Companies", icon: Building2 },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                    }}
                                    className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive 
                                            ? "bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/25 font-semibold scale-[1.02]" 
                                            : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Logout Footer */}
                <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3.5 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-semibold">Exit Panel</span>
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#0F172A] to-[#0B0F19] p-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-8 pb-5 border-b border-gray-800">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {activeTab === "overview" && "Dashboard Overview"}
                            {activeTab === "users" && "User Account Management"}
                            {activeTab === "hrs" && "Corporate HR Directory"}
                            {activeTab === "companies" && "Registered Corporate entities"}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Real-time system state monitoring & management control.</p>
                    </div>
                    
                    {/* Live Indicator */}
                    <div className="flex items-center space-x-2 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Server Link Established</span>
                    </div>
                </header>

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { title: "Total Registered Users", val: totalUsers, desc: `${verifiedUsers} verified accounts`, icon: Users, color: "from-blue-600 to-indigo-600" },
                                { title: "Corporate Entities", val: totalCompanies, desc: `${activeCompanies} active companies`, icon: Building2, color: "from-amber-500 to-orange-600" },
                                { title: "Internal HRs", val: totalHRs, desc: "Connected to recruiters", icon: UserCheck, color: "from-emerald-500 to-teal-600" },
                                { title: "Blocked Entities", val: blockedCompanies, desc: "Restricted platform access", icon: ShieldAlert, color: "from-rose-500 to-pink-600" }
                            ].map((card, i) => {
                                const Icon = card.icon;
                                return (
                                    <motion.div 
                                        key={i}
                                        whileHover={{ y: -5 }}
                                        className="relative bg-gradient-to-br from-[#1E293B]/70 to-[#0F172A]/70 border border-gray-800 p-6 rounded-2xl shadow-xl overflow-hidden group"
                                    >
                                        <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:opacity-[0.08] blur-xl rounded-full transition-all duration-300`}></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">{card.title}</p>
                                                <h3 className="text-3xl font-extrabold text-white mt-3 tracking-tight">{card.val}</h3>
                                                <p className="text-xs text-gray-400 mt-2 font-medium">{card.desc}</p>
                                            </div>
                                            <div className={`p-3 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-lg`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Visual Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Area Chart: Entity Growth */}
                            <div className="lg:col-span-2 bg-[#1E293B]/40 border border-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                                <h3 className="text-md font-semibold text-white mb-6">Database Account Breakdown</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                            <XAxis dataKey="name" stroke="#94A3B8" />
                                            <YAxis stroke="#94A3B8" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "12px", color: "#fff" }}
                                            />
                                            <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Panel Actions / System Status */}
                            <div className="bg-[#1E293B]/40 border border-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl flex flex-col justify-between">
                                <div>
                                    <h3 className="text-md font-semibold text-white mb-4">System Utilities</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-800/30 border border-gray-800 rounded-xl flex items-center space-x-3.5">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase">API Gateway</p>
                                                <p className="text-sm font-semibold text-white">Online & Healthy</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-800/30 border border-gray-800 rounded-xl flex items-center space-x-3.5">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase">SMTP Server</p>
                                                <p className="text-sm font-semibold text-white">Connected (Fallback Active)</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gray-800/30 border border-gray-800 rounded-xl flex items-center space-x-3.5">
                                            <div className="h-3 w-3 rounded-full bg-orange-500 animate-pulse"></div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold uppercase">Cloudinary Service</p>
                                                <p className="text-sm font-semibold text-white">Operational</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={fetchData}
                                    className="w-full mt-6 py-3 bg-[#FF5500]/10 hover:bg-[#FF5500]/20 border border-[#FF5500]/30 text-[#FF5500] hover:text-orange-400 font-semibold rounded-xl transition duration-200 uppercase tracking-wider text-xs"
                                >
                                    Force Refresh Metrics
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Users, HRs, Companies (Table View) */}
                {activeTab !== "overview" && (
                    <div className="bg-[#1E293B]/30 border border-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* Search & Action Bar */}
                        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder={`Search by name, email, or identifier...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#0B0F19]/60 border border-gray-800 hover:border-gray-700 focus:border-[#FF5500]/60 focus:ring-1 focus:ring-[#FF5500]/40 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition duration-200"
                                />
                            </div>

                            {/* Dropdown status filters */}
                            <div className="flex items-center space-x-3">
                                {activeTab === "users" && (
                                    <>
                                        <Filter className="h-4 w-4 text-gray-400" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#FF5500]"
                                        >
                                            <option value="all">All Verification Statuses</option>
                                            <option value="verified">Verified Emails</option>
                                            <option value="unverified">Unverified Emails</option>
                                        </select>
                                    </>
                                )}

                                {activeTab === "companies" && (
                                    <>
                                        <Filter className="h-4 w-4 text-gray-400" />
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="bg-[#0B0F19]/60 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#FF5500]"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="active">Active Companies</option>
                                            <option value="blocked">Blocked Companies</option>
                                        </select>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Data Tables */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-gray-900/10">
                                        <th className="px-6 py-4">Account/Name</th>
                                        <th className="px-6 py-4">Credentials & Contact</th>
                                        {activeTab === "companies" ? (
                                            <>
                                                <th className="px-6 py-4">Corporate IDs (TAN/GST)</th>
                                                <th className="px-6 py-4">Status</th>
                                            </>
                                        ) : activeTab === "hrs" ? (
                                            <th className="px-6 py-4">Associated Company ID</th>
                                        ) : (
                                            <th className="px-6 py-4">Email Verification</th>
                                        )}
                                        <th className="px-6 py-4 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout">
                                        {filteredList.length > 0 ? (
                                            filteredList.map((item) => (
                                                <motion.tr 
                                                    key={item._id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="border-b border-gray-800 hover:bg-gray-800/10 transition-colors"
                                                >
                                                    {/* Column: Name/Avatar */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3.5">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-sm shadow">
                                                                {item.name ? item.name[0].toUpperCase() : "?"}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-white text-sm">{item.name || "N/A"}</h4>
                                                                <p className="text-xs text-gray-500 mt-0.5">ID: {item._id}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Column: Contact Info */}
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-semibold text-gray-300">{item.email}</p>
                                                        {item.phone && <p className="text-xs text-gray-500 mt-1">{item.phone}</p>}
                                                    </td>

                                                    {/* Columns conditional */}
                                                    {activeTab === "companies" && (
                                                        <>
                                                            <td className="px-6 py-4">
                                                                <p className="text-xs text-gray-300">TAN: <span className="font-semibold font-mono text-gray-400">{item.tanId || "N/A"}</span></p>
                                                                <p className="text-xs text-gray-300 mt-1">GST: <span className="font-semibold font-mono text-gray-400">{item.gstId || "N/A"}</span></p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {item.isBlocked ? (
                                                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                                                                        <Ban className="h-3.5 w-3.5" />
                                                                        <span>Blocked</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                                        <span>Active</span>
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </>
                                                    )}

                                                    {activeTab === "hrs" && (
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-xs text-gray-400 font-semibold bg-gray-800/40 px-2.5 py-1 rounded border border-gray-800">
                                                                {item.companyId || "N/A"}
                                                            </span>
                                                        </td>
                                                    )}

                                                    {activeTab === "users" && (
                                                        <td className="px-6 py-4">
                                                            {item.isEmailVerified ? (
                                                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    <span>Verified</span>
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                                                                    <ShieldAlert className="h-3 w-3" />
                                                                    <span>Unverified</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Column: Actions */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end space-x-2.5">
                                                            {activeTab === "companies" && (
                                                                <>
                                                                    {item.isBlocked ? (
                                                                        <button 
                                                                            onClick={() => handleUnblockCompany(item._id, item.name)}
                                                                            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/20 hover:border-emerald-500/30 transition duration-200"
                                                                        >
                                                                            Unblock
                                                                        </button>
                                                                    ) : (
                                                                        <button 
                                                                            onClick={() => setBlockModal({ isOpen: true, companyId: item._id, companyName: item.name })}
                                                                            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/20 hover:border-rose-500/30 transition duration-200"
                                                                        >
                                                                            Block
                                                                        </button>
                                                                    )}
                                                                    
                                                                    <button 
                                                                        onClick={() => setDeleteModal({ isOpen: true, companyId: item._id, companyName: item.name })}
                                                                        className="p-1.5 bg-gray-800 hover:bg-rose-500/10 border border-gray-700 hover:border-rose-500/30 text-gray-400 hover:text-rose-400 rounded-lg transition duration-200"
                                                                        title="Delete Company"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {activeTab !== "companies" && (
                                                                <span className="text-xs text-gray-500 font-medium italic">Read Only</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                                    No entries found matching filters.
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal: Block Company */}
            <AnimatePresence>
                {blockModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1E293B] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                        >
                            <h3 className="text-lg font-bold text-white mb-2">Block Corporate Access</h3>
                            <p className="text-sm text-gray-400 mb-6">
                                Specify the administrative block reason for company <span className="text-white font-semibold">{blockModal.companyName}</span>. All recruiter accounts connected to this entity will lose HRMS capabilities.
                            </p>

                            <textarea
                                placeholder="E.g., Repeated terms of service violations, inactive company TAN credentials..."
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                rows={4}
                                className="w-full bg-[#0B0F19] border border-gray-800 rounded-xl p-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition duration-200 mb-6"
                            />

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setBlockModal({ isOpen: false, companyId: null, companyName: "" })}
                                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBlockCompany}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-xl transition duration-200 flex items-center space-x-2"
                                >
                                    {actionLoading ? "Processing..." : "Confirm Block"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Delete Company Confirmation */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1E293B] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
                        >
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100/10 text-red-500 mb-4 border border-red-500/20">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-center text-white mb-2">Delete Corporate Entity</h3>
                            <p className="text-sm text-center text-gray-400 mb-6">
                                Are you sure you want to completely delete <span className="text-white font-semibold">{deleteModal.companyName}</span>? This action is <span className="text-red-400 font-semibold uppercase">irreversible</span> and will delete all associated job posts and payroll records.
                            </p>

                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setDeleteModal({ isOpen: false, companyId: null, companyName: "" })}
                                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-xl transition duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteCompany}
                                    disabled={actionLoading}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition duration-200"
                                >
                                    {actionLoading ? "Deleting..." : "Delete Permanently"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
