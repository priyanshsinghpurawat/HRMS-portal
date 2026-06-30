import { Menu, X, LogOut } from "lucide-react";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../Component/Context/AppContext";
import Logo from "../assets/img/pngLogo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logoutUser, companyUser, logoutCompany } = useContext(AuthContext);

  const handleLogout = async () => {
    if (companyUser) {
      await logoutCompany();
    } else {
      await logoutUser();
    }
  };

  const getHrmsDashboardLink = () => {
    if (!companyUser) return "/hrm-login";
    const role = companyUser.role;
    if (role === "company") return "/company-dashboard";
    if (role === "hr") return "/hrdashboard";
    if (role === "employee") return "/employeedashboard";
    return "/hrms";
  };

  return (
    <header className="w-full bg-gradient-to-r from-[#fff7f2] via-[#fff3eb] to-[#ffe4d6] fixed top-0 left-0 z-50">
      <div className="max-w-[96%] 2xl:max-w-[1440px] mx-auto px-6 lg:px-10">
        
        <div className="flex justify-between items-center h-20">
          
          <div className="cursor-pointer flex items-center h-full">
            <Link to="/" className="flex items-center h-full">
              <img className="h-60 w-auto object-contain" src={Logo} alt="JobDekhoo Logo" />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-7">
            {isAuthenticated && user ? (
              <>
                <Link 
                  to="/jobs" 
                  className="border-2 border-[#EA580C] text-[#EA580C] hover:bg-orange-50/50 px-4 py-2 lg:px-4 lg:py-2 xl:px-6 xl:py-2.5 rounded-xl font-bold transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
                >
                  Dashboard
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-[#EA580C] text-white hover:bg-orange-600 px-4 py-2 lg:px-4 lg:py-2 xl:px-6 xl:py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-sm xl:text-base whitespace-nowrap"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : companyUser ? (
              <>
                <Link 
                  to={getHrmsDashboardLink()} 
                  className="border-2 border-[#EA580C] text-[#EA580C] hover:bg-orange-50/50 px-4 py-2 lg:px-4 lg:py-2 xl:px-6 xl:py-2.5 rounded-xl font-bold transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
                >
                  HRMS Dashboard
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-[#EA580C] text-white hover:bg-orange-600 px-4 py-2 lg:px-4 lg:py-2 xl:px-6 xl:py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer text-sm xl:text-base whitespace-nowrap"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 lg:gap-2 xl:gap-2.5">
                  <Link 
                    to="/login" 
                    className="border-2 border-[#EA580C] text-black hover:bg-orange-50/50 px-4 py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 rounded-xl font-bold transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
                  >
                    Login
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="border-2 border-[#EA580C] text-black hover:bg-orange-50/50 px-4 py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 rounded-xl font-bold transition-all duration-300 text-sm xl:text-base whitespace-nowrap"
                  >
                    Register
                  </Link>
                </div>

                <div className="w-[1px] h-6 bg-gray-300 mx-0.5 lg:mx-0.5 xl:mx-1" />

                <Link 
                  to="/hrm-login" 
                  className="bg-[#EA580C] text-white hover:bg-orange-600 px-4 py-2 lg:px-4 lg:py-2 xl:px-5 xl:py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-1 group shadow-sm hover:shadow-md ml-1 lg:ml-1 xl:ml-3 text-sm xl:text-base whitespace-nowrap"
                >
                  HRMS 
                  <span className="group-hover:translate-x-1 transition-transform"></span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="cursor-pointer lg:hidden text-gray-700 hover:text-[#FA7B3D] transition-colors" 
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-6 px-6 absolute w-full shadow-lg left-0 z-50 animate-fade-in">
          <div className="flex flex-col gap-4">
            {isAuthenticated && user ? (
              <>
                <Link 
                  to="/jobs" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border-2 border-[#EA580C] text-[#EA580C] hover:bg-orange-50 py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Dashboard
                </Link>
                
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#EA580C] text-white hover:bg-orange-600 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : companyUser ? (
              <>
                <Link 
                  to={getHrmsDashboardLink()} 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border-2 border-[#EA580C] text-[#EA580C] hover:bg-orange-50 py-3 rounded-xl font-bold transition-all duration-300"
                >
                  HRMS Dashboard
                </Link>
                
                <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#EA580C] text-white hover:bg-orange-600 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm cursor-pointer"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border-2 border-[#EA580C] text-black hover:bg-orange-50 py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Login
                </Link>
                
                <Link 
                  to="/register" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center border-2 border-[#EA580C] text-black hover:bg-orange-50 py-3 rounded-xl font-bold transition-all duration-300"
                >
                  Register
                </Link>

                <hr className="border-gray-100 my-2" />

                <Link 
                  to="/hrm-login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-[#EA580C] text-white hover:bg-orange-600 py-3 rounded-xl font-bold transition-all duration-300 shadow-sm flex items-center justify-center gap-1 group"
                >
                  For HRMS 
                  <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
