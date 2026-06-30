import { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, ChevronDown, LogOut, LayoutDashboard, UserCircle, Briefcase } from "lucide-react";

import Logo from "../../../../assets/img/pngLogo.png";
import Button from "../../../../Reuse/Button";
import { AuthContext } from "../../../Context/AppContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, isAuthenticated, authLoading, logoutUser, userAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logoutUser();
  };

  const navigateToProfile = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/userprofile");
  };

  const navigateToDashboard = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/myapplications");
  };

  const navigateToJobs = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/jobportal/alljobs");
  };
  const navigateToApllications = () => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/myapplications");
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (authLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex-shrink-0">
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          <div className="flex-shrink-0 cursor-pointer">
            <Link to="/" className="flex items-center h-full">
              <img className="h-40 w-auto object-contain sm:h-14 lg:h-60" src={Logo} alt="JobDekhoo Logo" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">

            {isAuthenticated && user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-full border border-orange-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-[#EA590D] rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs">{getUserInitials(user?.name)}</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700 hidden lg:block max-w-[120px] truncate">{user?.name || "My Profile"}</span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#EA590D] rounded-full flex items-center justify-center text-white font-semibold">
                          {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="text-sm">{getUserInitials(user?.name)}</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "User"}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button onClick={navigateToProfile} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 text-left">
                        <UserCircle size={18} className="text-gray-400" /> My Profile
                      </button>

                      <button onClick={navigateToJobs} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 text-left">
                        <Briefcase size={18} className="text-gray-400" /> Browse Jobs
                      </button>
                      <button onClick={navigateToApllications} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 text-left">
                        <Briefcase size={18} className="text-gray-400" /> My application
                      </button>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button onClick={handleLogout} disabled={userAuthLoading} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 text-left">
                      <LogOut size={18} /> {userAuthLoading ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button text="Login" variant="outline" to="/login" className="px-6 py-2" />
                <Button text="Register" to="/register" className="px-6 py-2" />
              </div>
            )}
          </div>

          <button type="button" className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100">
            <div className="flex flex-col gap-1 pt-4">
              <Link to="/jobportal/alljobs" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg"><Briefcase size={20} /> Jobs</Link>
              <div className="border-t border-gray-100 my-2"></div>

              {isAuthenticated && user ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-10 h-10 bg-[#EA590D] rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : <span>{getUserInitials(user?.name)}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <button onClick={navigateToProfile} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg text-left"><UserCircle size={20} /> My Profile</button>
                  <button onClick={navigateToDashboard} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg text-left"><LayoutDashboard size={20} /> Myapplication</button>
                  <button onClick={navigateToJobs} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg text-left"><Briefcase size={20} /> Browse Jobs</button>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button onClick={handleLogout} disabled={userAuthLoading} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 text-left"><LogOut size={20} /> {userAuthLoading ? "Logging out..." : "Logout"}</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-4">
                  <Button text="Login" variant="outline" to="/login" onClick={closeMobileMenu} className="w-full justify-center" />
                  <Button text="Register" to="/register" onClick={closeMobileMenu} className="w-full justify-center" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;