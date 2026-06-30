import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  Home,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { AppContext } from "../../Context/AppContext";
import logo from "../../../assets/img/pngLogo.png";
import Button from "../../../Reuse/Button";


function Register() {
  const {
    registerUser,
    userAuthLoading,
  } = useContext(AppContext);

  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
    });

  const [errors, setErrors] =
    useState({});

  // ==========================
  // VALIDATION
  // ==========================
  function validate() {
    let newErrors = {};

    if (
      formData.name.trim().length < 3
    ) {
      newErrors.name =
        "Name must be at least 3 characters";
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Please enter a valid email";
    }

    const phoneRegex =
      /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;

    if (
      !phoneRegex.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Phone must be like +1 555 0123";
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

    if (
      formData.password.length < 8
    ) {
      newErrors.password =
        "Password must be at least 8 characters";
    } else if (
      formData.password.length > 12
    ) {
      newErrors.password =
        "Password cannot exceed 12 characters";
    } else if (
      !passwordRegex.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Must contain uppercase, lowercase, number & special character";
    }

    setErrors(newErrors);

    if (
      Object.keys(newErrors)
        .length > 0
    ) {
      toast.error(
        "Please fix validation errors"
      );
    }

    return (
      Object.keys(newErrors)
        .length === 0
    );
  }

  // ==========================
  // HANDLE CHANGE
  // ==========================
  function handleChange(e) {
    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }

  // ==========================
  // REGISTER
  // ==========================
  async function handleSubmit(e) {
    e.preventDefault();

    const isValid =
      validate();

    if (!isValid) return;

    const payload = {
      name: formData.name,
      email: formData.email,
      password:
        formData.password,
      phone: formData.phone,
      role: "user",
    };

    try {
      const response =
        await registerUser(
          payload
        );

      if (response?.success) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
        });

        // Navigate directly to home/dashboard
        navigate("/jobs", { replace: true });
      }
    } catch (error) {
      toast.error(
        "Something went wrong"
      );
    }
  }

  return (
    <div className="min-h-screen relative flex bg-gradient-to-br from-orange-50 via-white to-orange-100">

      {/* HOME BUTTON */}
      <div className="absolute top-5 left-5 z-50">
        <button
          onClick={() =>
            navigate("/jobs")
          }
          className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-md border border-orange-100 hover:shadow-lg hover:bg-orange-50 transition-all font-medium text-gray-700 cursor-pointer"
        >
          <Home size={18} />
          Home
        </button>
      </div>

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-b from-[#f5c2a2] to-orange-400 text-white flex-col justify-center px-16 overflow-hidden">

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Start Your Career
            <br />
            With JobDekho
          </h1>

          <p className="text-lg text-orange-100 max-w-md leading-8">
            Create your account,
            discover exciting job
            opportunities, and
            connect with top
            recruiters to shape
            your future.
          </p>

          {/* STATS */}
          <div className="mt-10 flex gap-4">
            <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl">
              <h3 className="font-bold text-2xl">
                10K+
              </h3>

              <p className="text-orange-100">
                Active Jobs
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-md p-5 rounded-2xl">
              <h3 className="font-bold text-2xl">
                5K+
              </h3>

              <p className="text-orange-100">
                Companies
              </p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full" />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white shadow-2xl rounded-3xl p-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
            <Button text="Home" to="/jobs" variant="outline" />
          </div>

          {/* FORM */}
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-5"
          >

            {/* NAME */}
            <InputField
              label="Full Name"
              icon={
                <User
                  size={18}
                />
              }
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              placeholder="Enter full name"
              error={
                errors.name
              }
            />

            {/* EMAIL */}
            <InputField
              label="Email"
              icon={
                <Mail
                  size={18}
                />
              }
              type="email"
              name="email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              placeholder="Enter email"
              error={
                errors.email
              }
            />

            {/* PHONE */}
            <InputField
              label="Phone"
              icon={
                <Phone
                  size={18}
                />
              }
              type="tel"
              name="phone"
              value={
                formData.phone
              }
              onChange={
                handleChange
              }
              placeholder="+1 555 0123"
              error={
                errors.phone
              }
            />

            {/* PASSWORD */}
            <div>
              <label className="font-medium text-sm text-gray-700 mb-2 block">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter password"
                  className={`w-full pl-12 pr-14 py-4 rounded-2xl border bg-gray-50 focus:outline-none focus:border-[#EA590D] focus:bg-white transition-all ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff
                      size={20}
                    />
                  ) : (
                    <Eye
                      size={20}
                    />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {
                    errors.password
                  }
                </p>
              )}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={
                userAuthLoading
              }
              className="w-full bg-[#EA590D] hover:bg-orange-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {userAuthLoading
                ? "Creating Account..."
                : "Register"}
            </button>
          </form>

          {/* LOGIN */}
          <p className="text-center text-gray-500 mt-6">
            Already have an
            account?{" "}
            <Link
              to="/login"
              className="text-[#EA590D] font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// INPUT FIELD
function InputField({
  label,
  icon,
  error,
  ...props
}) {
  return (
    <div>
      <label className="font-medium text-sm text-gray-700 mb-2 block">
        {label}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>

        <input
          {...props}
          className={`w-full pl-12 pr-4 py-4 rounded-2xl border bg-gray-50 focus:outline-none focus:border-[#EA590D] focus:bg-white transition-all ${
            error
              ? "border-red-500"
              : "border-gray-200"
          }`}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

export default Register;