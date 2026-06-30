import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import Loader from "../../Reuse/Loader";
import { clearAllUserApplicationData } from './UserProfileContext';

// Job Portal APIs
import {
  checkAuthApi,
  loginApi,
  registerApi,
  logoutApi,
} from "../Api";

// HRMS APIs
import {
  registerCompanyApi,
  verifyCompanyEmailApi,
  resendCompanyOtpApi,
  loginCompanyApi,
  checkCompanyAuthApi,
  logoutCompanyApi,
} from "../HrmApi";

// ==========================
// CONTEXT DEFINITION
// ==========================
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// ==========================
// AUTH PROVIDER
// ==========================
export default function AuthProvider({ children }) {
  const navigate = useNavigate();

  // ─── Job Portal State ───
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [userAuthLoading, setUserAuthLoading] = useState(false);

  // ─── HRMS State ───
  const [companyUser, setCompanyUser] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyAuthLoading, setCompanyAuthLoading] = useState(false);

  // ─── Session Restore Flag ───
  const sessionRestored = useRef(false);

  // ─── Profile Fetch Trigger ───
  // This triggers UserProfileContext to fetch profile after login/register
  const [profileFetchTrigger, setProfileFetchTrigger] = useState(0);

  // ==========================
  // STEP 1: SESSION RESTORATION (on mount)
  // ==========================
  useEffect(() => {
    const savedUser = sessionStorage.getItem("jobdekho_user");
    const hasToken = !!Cookies.get("jobdekho_token");

    if (savedUser && hasToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        
        setUser(parsedUser);
        setIsAuthenticated(true);
        sessionRestored.current = true;
      } catch (e) {
        sessionStorage.removeItem("jobdekho_user");
      }
    } else {
    }
  }, []);

  // ==========================
  // STEP 2: BACKEND VERIFICATION (after restore)
  // ==========================
  const checkAuthStatus = useCallback(async () => {
    const hasToken = !!Cookies.get("jobdekho_token");
    if (!hasToken) {
      setAuthLoading(false);
      setCompanyLoading(false);
      return;
    }

    try {
      setAuthLoading(true);
      setCompanyLoading(true);

      // ─── Job Portal Auth Check ───
      const userResponse = await checkAuthApi();

      if (userResponse.response.status === 401) {
        clearJobPortalSession();
      } else if (userResponse.response.ok && userResponse.data?.data?.user) {
        const userData = userResponse.data.data.user;
        
        if (userData.role === "user") {
          setUser(userData);
          setIsAuthenticated(true);
          sessionStorage.setItem("jobdekho_user", JSON.stringify(userData));
        } else {
          clearJobPortalSession();
        }
      } else if (!userResponse.response.ok) {
      }

      // ─── HRMS Auth Check ───
      const companyResponse = await checkCompanyAuthApi();

      if (companyResponse.response.ok && companyResponse.data?.data?.user) {
        setCompanyUser(companyResponse.data.data.user);
      } else if (companyResponse.response.status === 401) {
        setCompanyUser(null);
      }

    } catch (error) {
    } finally {
      setAuthLoading(false);
      setCompanyLoading(false);
    }
  }, []);

  // Helper: Clear job portal session completely
  const clearJobPortalSession = () => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem("jobdekho_user");
    Cookies.remove("jobdekho_token");
    Cookies.remove("jobdekho_refresh_token");
  };

  // Run backend check AFTER initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // ==========================
  // LOGIN
  // ==========================
  const loginUser = async (credentials) => {
    try {
      setUserAuthLoading(true);

      const { response, data } = await loginApi(credentials);

      if (response.ok && data?.data?.user) {
        const loggedInUser = data.data.user;
        const accessToken = data?.data?.accessToken || data?.accessToken;
        const refreshToken = data?.data?.refreshToken || data?.refreshToken;

        // Role validation
        if (["company", "hr", "employee"].includes(loggedInUser?.role)) {
          toast.error("Company accounts must use HRMS portal");
          return { success: false, message: "Please login at HRMS portal" };
        }

        // Store tokens
        if (accessToken) {
          Cookies.set("jobdekho_token", accessToken, {
            expires: 7,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }
        if (refreshToken) {
          Cookies.set("jobdekho_refresh_token", refreshToken, {
            expires: 30,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }

        // Store user in sessionStorage
        sessionStorage.setItem("jobdekho_user", JSON.stringify(loggedInUser));

        setUser(loggedInUser);
        setIsAuthenticated(true);
        
        setProfileFetchTrigger(prev => prev + 1);
        
        toast.success(`Welcome back, ${loggedInUser?.name || "User"}!`);
        return {
          success: true,
          user: loggedInUser,
          role: loggedInUser?.role,
          message: data?.message,
        };
      }

      toast.error(data?.message || "Login failed");
      return { success: false, message: data?.message };
    } catch (error) {
      toast.error("Something went wrong during login");
      return { success: false };
    } finally {
      setUserAuthLoading(false);
    }
  };

  // ==========================
  // REGISTER
  // ==========================
  const registerUser = async (formData) => {
    try {
      setUserAuthLoading(true);

      const { response, data } = await registerApi({
        ...formData,
        role: "user",
      });

      if (!response.ok || !(data?.success || response.status === 201)) {
        toast.error(data?.message || "Registration failed");
        return { success: false, message: data?.message };
      }

      const registeredUser = data.data?.user || data.data;

      if (!registeredUser || !registeredUser._id) {
        toast.error("Registration succeeded but user data is missing");
        return { success: false, message: "Invalid registration response" };
      }

      const accessToken = data?.data?.accessToken || data?.accessToken;
      const refreshToken = data?.data?.refreshToken || data?.refreshToken;

      if (accessToken) {
        Cookies.set("jobdekho_token", accessToken, {
          expires: 7,
          secure: window.location.protocol === "https:",
          sameSite: "lax",
        });
        
        if (refreshToken) {
          Cookies.set("jobdekho_refresh_token", refreshToken, {
            expires: 30,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }

        sessionStorage.setItem("jobdekho_user", JSON.stringify(registeredUser));
        
        setUser(registeredUser);
        setIsAuthenticated(true);
        
        setProfileFetchTrigger(prev => prev + 1);
        
        toast.success("Account created successfully!");
        return { success: true, user: registeredUser };
      }

      // Auto-login fallback
      const loginResponse = await loginApi({
        email: formData.email,
        password: formData.password,
      });

      if (loginResponse.response.ok && loginResponse.data?.data?.user) {
        const loggedInUser = loginResponse.data.data.user;
        const loginAccessToken = loginResponse.data?.data?.accessToken || loginResponse.data?.accessToken;
        const loginRefreshToken = loginResponse.data?.data?.refreshToken || loginResponse.data?.refreshToken;

        if (loginAccessToken) {
          Cookies.set("jobdekho_token", loginAccessToken, {
            expires: 7,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }

        if (loginRefreshToken) {
          Cookies.set("jobdekho_refresh_token", loginRefreshToken, {
            expires: 30,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }

        sessionStorage.setItem("jobdekho_user", JSON.stringify(loggedInUser));
        
        setUser(loggedInUser);
        setIsAuthenticated(true);
        
        setProfileFetchTrigger(prev => prev + 1);
        
        toast.success("Account created successfully!");
        return { success: true, user: loggedInUser };
      }

      toast.success("Account created! Please log in with your credentials.");
      return { success: true, requiresLogin: true, user: registeredUser };

    } catch (error) {
      toast.error(error?.message || "Registration failed. Please try again.");
      return { success: false, message: error?.message || "Registration failed" };
    } finally {
      setUserAuthLoading(false);
    }
  };

  // ==========================
  // LOGOUT (Merged Snippet Here)
  // ==========================
  const logoutUser = async () => {
    try {
      setUserAuthLoading(true);
      await logoutApi();
    } catch (error) {
    } finally {
      // ==================== BUG FIX: Clear user-specific application data ====================
      const userId = user?._id || user?.id;
      if (userId) {
        clearAllUserApplicationData(userId); // Clear this user's data
      }

      // clearJobPortalSession() handles removing 'jobdekho_token', 'jobdekho_refresh_token', 
      // setting isAuthenticated(false) and setting user(null)
      clearJobPortalSession();
      setUserAuthLoading(false);
      
      toast.success("Logged out successfully");
      
      // Trigger a full page reload to clear all React state
      window.location.href = '/login';
      
      return { success: true };
    }
  };

  // ==========================
  // HRMS FUNCTIONS
  // ==========================
  const registerCompany = async (payload) => {
    try {
      setCompanyAuthLoading(true);
      const data = await registerCompanyApi(payload);
      if (data?.success === false) {
        toast.error(data.message || "Company registration failed");
        return { success: false };
      }
      if (data?.message?.toLowerCase().includes("otp") || data?.otpSent) {
        toast.success(data.message || "OTP sent!");
        return { success: true, data, otpSent: true };
      }
      toast.success("Company registered successfully");
      return { success: true, data };
    } catch (error) {
      toast.error("Company registration error");
      return { success: false };
    } finally {
      setCompanyAuthLoading(false);
    }
  };

  const verifyCompanyOtp = async (email, otp) => {
    try {
      const { response, data } = await verifyCompanyEmailApi(email, otp);
      if (response.ok && data?.success) {
        toast.success("Email verified!");
        return { success: true, data };
      }
      toast.error(data?.message || "OTP verification failed");
      return { success: false, message: data?.message };
    } catch (error) {
      toast.error("OTP verification error");
      return { success: false };
    }
  };

  const resendCompanyOtp = async (email) => {
    try {
      const { response, data } = await resendCompanyOtpApi(email);
      if (response.ok) {
        toast.success("New OTP sent!");
        return { success: true, data };
      }
      toast.error(data?.message || "Failed to resend OTP");
      return { success: false };
    } catch (error) {
      toast.error("Error resending OTP");
      return { success: false };
    }
  };

  const loginCompany = async (credentials) => {
    try {
      setCompanyAuthLoading(true);
      const { response, data } = await loginCompanyApi(credentials);

      if (response.ok && data?.data?.user) {
        const loggedInUser = data.data.user;
        const accessToken = data?.data?.accessToken || data?.accessToken;

        if (accessToken) {
          Cookies.set("jobdekho_token", accessToken, {
            expires: 7,
            secure: window.location.protocol === "https:",
            sameSite: "lax",
          });
        }

        if (loggedInUser?.role === "user") {
          toast.error("Job seekers cannot access HRMS");
          return { success: false, message: "Please use Job Portal" };
        }

        setCompanyUser(loggedInUser);
        toast.success(`Welcome ${loggedInUser?.name || "User"}!`);
        return { success: true, user: loggedInUser, role: loggedInUser?.role };
      }

      toast.error(data?.message || "HRMS Login failed");
      return { success: false, message: data?.message };
    } catch (error) {
      toast.error("HRMS Login error");
      return { success: false };
    } finally {
      setCompanyAuthLoading(false);
    }
  };

  const logoutCompany = async () => {
    try {
      setCompanyAuthLoading(true);
      await logoutCompanyApi();
      Cookies.remove("jobdekho_token");
      Cookies.remove("jobdekho_refresh_token");
      setCompanyUser(null);
      toast.success("Logged out from HRMS");
      return { success: true };
    } catch (error) {
      toast.error("HRMS Logout failed");
      return { success: false };
    } finally {
      setCompanyAuthLoading(false);
    }
  };

  // ==========================
  // GLOBAL LOADING
  // ==========================
  const isGlobalLoading = authLoading || companyLoading;

  if (isGlobalLoading && !sessionRestored.current) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        authLoading,
        userAuthLoading,
        loginUser,
        registerUser,
        logoutUser,
        checkAuthStatus,
        companyUser,
        setCompanyUser,
        companyAuthLoading,
        companyLoading,
        registerCompany,
        verifyCompanyOtp,
        resendCompanyOtp,
        loginCompany,
        logoutCompany,
        profileFetchTrigger,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const AppContext = AuthContext;
export const AppProvider = AuthProvider;