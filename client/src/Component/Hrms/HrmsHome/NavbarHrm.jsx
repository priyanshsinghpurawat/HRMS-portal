import { Menu, X, LogOut, Building2, ChevronDown, Home } from "lucide-react";
import { useState, useContext } from "react";
import Button from "../../../Reuse/Button";
import Logo from "../../../assets/img/pngLogo.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";

function NavbarHrm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { companyUser, logoutCompany, companyAuthLoading } = useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isLoginPage = currentPath === "/hrm-login";
  const isRegisterPage = currentPath === "/company-register";

  // Go to dashboard based on role
  const goHome = () => {
    if (!companyUser) {
      navigate("/hrms");
      return;
    }

    const role = companyUser?.role;
    if (role === "company") {
      navigate("/company-dashboard");
    } else if (role === "hr") {
      navigate("/hrdashboard");
    } else if (role === "employee") {
      navigate("/employeedashboard");
    } else {
      navigate("/hrms");
    }
    setIsOpen(false);
    setShowDropdown(false);
  };

  const goLogin = () => {
    navigate("/hrm-login");
    setIsOpen(false);
  };

  const goRegister = () => {
    navigate("/company-register");
    setIsOpen(false);
  };

  const handleLogout = async () => {
    const result = await logoutCompany();
    if (result?.success) {
      setShowDropdown(false);
      setIsOpen(false);
      navigate("/hrms", { replace: true });
    }
  };

  return (
    <header className="w-full bg-gradient-to-b from-[#ffe4d6] via-[#fff3eb] to-[#fff7f2] fixed top-0 left-0 z-50 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="cursor-pointer flex items-center h-full">
            <Link to="/">
              <img className="h-60 w-auto object-contain" src={Logo} alt="JobDekhoo Logo" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {companyUser ? (
              <div className="relative">
                {/* User Dropdown Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 bg-white/80 hover:bg-white border border-orange-100 rounded-2xl px-4 py-2.5 cursor-pointer transition-all duration-200 shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#EA580C]/10 text-[#EA580C] flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs text-gray-400 font-medium leading-none">
                      {companyUser?.role?.toUpperCase()} Account
                    </p>
                    <p className="text-sm font-bold text-gray-800 mt-1 leading-none">
                      {companyUser.name || "Enterprise"}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="px-4 py-2 border-b border-gray-50 mb-1 lg:hidden">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{companyUser.name}</p>
                    </div>

                    <button
                      onClick={goHome}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#fff7f2] hover:text-[#EA580C] transition-colors font-medium text-left cursor-pointer"
                    >
                      <Home size={16} />
                      Dashboard Home
                    </button>

                    <button
                      disabled={companyAuthLoading}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-semibold text-left cursor-pointer border-t border-gray-50 mt-1 disabled:opacity-50"
                    >
                      <LogOut size={16} />
                      {companyAuthLoading ? "Logging Out..." : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in - show login/register buttons */
              <>
                {isLoginPage ? (
                  <>
                    <Button text="Home" onClick={() => navigate("/hrms")} />
                    <Button text="Register Company" onClick={goRegister} />
                  </>
                ) : isRegisterPage ? (
                  <>
                    <Button text="Login" onClick={goLogin} />
                    <Button text="Home" onClick={() => navigate("/hrms")} />
                  </>
                ) : (
                  <>
                    <Button text="Login" onClick={goLogin} />
                    <Button text="Register Company" onClick={goRegister} />
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="cursor-pointer lg:hidden text-gray-700 hover:text-[#FA7B3D] transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-6 px-6 absolute w-full shadow-lg left-0 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            {companyUser ? (
              <>
                {/* Mobile: Logged in */}
                <div className="flex items-center gap-3 bg-[#fff7f2] border border-orange-100/60 p-4 rounded-2xl mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#EA580C] text-white flex items-center justify-center font-bold shadow-md shadow-orange-600/10">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-orange-400 font-semibold uppercase tracking-wider">
                      {companyUser?.role?.toUpperCase()} Session
                    </p>
                    <p className="text-base font-bold text-gray-900">{companyUser.name}</p>
                  </div>
                </div>

                <Button text="Dashboard Home" onClick={goHome} className="w-full" />
                
                <button
                  onClick={handleLogout}
                  disabled={companyAuthLoading}
                  className="w-full flex items-center justify-center gap-2 border border-red-200 bg-red-50/40 text-red-600 py-3.5 rounded-2xl font-bold transition-all hover:bg-red-50 text-sm cursor-pointer disabled:opacity-50 mt-2"
                >
                  <LogOut size={16} />
                  {companyAuthLoading ? "Signing Out..." : "Sign Out"}
                </button>
              </>
            ) : (
              /* Mobile: Not logged in */
              <>
                {isLoginPage ? (
                  <>
                    <Button text="Home" onClick={() => navigate("/hrms")} className="w-full" />
                    <Button text="Register Company" onClick={goRegister} className="w-full" />
                  </>
                ) : isRegisterPage ? (
                  <>
                    <Button text="Login" onClick={goLogin} className="w-full" />
                    <Button text="Home" onClick={() => navigate("/hrms")} className="w-full" />
                  </>
                ) : (
                  <>
                    <Button text="Login" onClick={goLogin} className="w-full" />
                    <Button text="Register Company" onClick={goRegister} className="w-full" />
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default NavbarHrm;