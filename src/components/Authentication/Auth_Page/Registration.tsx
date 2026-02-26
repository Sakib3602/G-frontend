import React, { useContext, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../AuthProvider/AuthProvider";
import { sendEmailVerification, type UserCredential } from "firebase/auth";
import Swal from "sweetalert2";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const Registration: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { person, createUser, logOut } = useContext(AuthContext)!;
  console.log(person, "from registation page");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" });

  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    await createUser(data.email, data.password)
      .then(async (result: UserCredential) => {
        const user = result.user;
        console.log(user, "current user");
        await sendEmailVerification(user)
        .then(async () => {
          await logOut();
          Swal.fire({
  icon: "success",
  title: "Registration Successful!",
  
  // Using 'html' instead of 'text' lets us format the message beautifully
  html: `
    <p style="font-size: 16px; margin-bottom: 8px;">
      Check your email to verify your account before logging in.
    </p>
    <p style="font-size: 14px; color: #666; margin-bottom: 16px;">
      <i>(Check your spam folder if you don't see it in your inbox)</i>
    </p>
    <strong style="font-size: 16px; color: #6B8932;">
      Thank you for joining us!
    </strong>
  `,

  confirmButtonText: "Go to login page",
  confirmButtonColor: "#6B8932",

  showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
    `,
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutDown
      animate__faster
    `,
  },
}).then((result) => {
  if (result.isConfirmed) {
    navigate("/login");
  }
});
          
      })
      })
      .catch((error: unknown) => console.log(error));
  };

  return (
    <div className="poppins-regular min-h-screen flex items-center justify-center bg-[#f4f6f8] font-sans p-4 sm:p-8">
      {/* Main Container */}
      <div className="max-w-5xl w-full bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col lg:flex-row border border-gray-100">
        {/* ========================================
            LEFT SIDE: Premium Brand Visual 
            (Hidden on Mobile/Tablet, Shows on Desktop)
            ======================================== */}
        <div className="hidden lg:flex lg:w-5/12 bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
          {/* Abstract Glow Effects */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#80A33C]/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#80A33C]/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

          {/* Logo Area */}
          <div className="relative z-10">
            <a
              href="/"
              className="text-3xl font-extrabold text-white tracking-tight hover:opacity-90 transition-opacity"
            >
              Genesys<span className="text-[#80A33C]">.</span>
            </a>
          </div>

          {/* Value Proposition */}
          <div className="relative z-10 mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#80A33C] animate-pulse"></span>
              Secure Infrastructure
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Scale your business securely.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Join thousands of forward-thinking companies relying on our
              next-gen digital solutions and secure IT architecture.
            </p>
          </div>
        </div>

        {/* ========================================
            RIGHT SIDE: Registration Form 
            ======================================== */}
        <div className="w-full lg:w-7/12 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative z-10">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile/Tablet Logo (Only visible when left side is hidden) */}
            <div className="lg:hidden text-center mb-8">
              <a
                href="/"
                className="text-3xl font-extrabold text-gray-900 tracking-tight"
              >
                Genesys<span className="text-[#80A33C]">.</span>
              </a>
            </div>

            {/* Form Header */}
            <div className="mb-8 sm:mb-10 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Create an account
              </h1>
              <p className="text-gray-500 text-sm">
                Enter your details to securely access your portal.
              </p>
            </div>

            {/* The Form */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div>
                <label
                  className="block text-sm font-bold text-gray-700 mb-1.5"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    {...register("name", {
                      required: "Full name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters.",
                      },
                    })}
                    type="text"
                    id="name"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:bg-white transition-all placeholder-gray-400 font-medium text-gray-900 ${errors.name ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#80A33C]/10 focus:border-[#80A33C]"}`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Work Email */}
              <div>
                <label
                  className="block text-sm font-bold text-gray-700 mb-1.5"
                  htmlFor="email"
                >
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    {...register("email", {
                      required: "Email address is required.",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address.",
                      },
                    })}
                    type="email"
                    id="email"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:bg-white transition-all placeholder-gray-400 font-medium text-gray-900 ${errors.email ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#80A33C]/10 focus:border-[#80A33C]"}`}
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Passwords (Responsive Grid: Stack on mobile, side-by-side on sm+) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Password Field */}
                <div>
                  <label
                    className="block text-sm font-bold text-gray-700 mb-1.5"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      {...register("password", {
                        required: "Password is required.",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters.",
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:bg-white transition-all placeholder-gray-400 font-medium text-gray-900 ${errors.password ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#80A33C]/10 focus:border-[#80A33C]"}`}
                      placeholder="••••••••"
                    />
                    {/* Toggle Eye Icon */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center text-gray-400 hover:text-[#80A33C] transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label
                    className="block text-sm font-bold text-gray-700 mb-1.5"
                    htmlFor="confirm-password"
                  >
                    Confirm Pass
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <input
                      {...register("confirmPassword", {
                        required: "Please confirm your password.",
                        validate: (val) =>
                          val === getValues("password") ||
                          "Passwords do not match.",
                      })}
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      className={`w-full pl-11 pr-12 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:bg-white transition-all placeholder-gray-400 font-medium text-gray-900 ${errors.confirmPassword ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#80A33C]/10 focus:border-[#80A33C]"}`}
                      placeholder="••••••••"
                    />
                    {/* Toggle Eye Icon */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 pl-2 flex items-center text-gray-400 hover:text-[#80A33C] transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="mt-6">
                <div className="flex items-start group">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      {...register("terms", {
                        required: "You must accept the terms to continue.",
                      })}
                      id="terms"
                      type="checkbox"
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-2 focus:ring-[#80A33C]/30 accent-[#80A33C] cursor-pointer transition-colors"
                    />
                  </div>
                  <label
                    htmlFor="terms"
                    className="ml-3 text-sm text-gray-600 cursor-pointer group-hover:text-gray-900 transition-colors"
                  >
                    I accept the{" "}
                    <a
                      href="#"
                      className="font-bold text-[#80A33C] hover:text-[#6b8932] transition-colors"
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="font-bold text-[#80A33C] hover:text-[#6b8932] transition-colors"
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {errors.terms && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-8 bg-[#80A33C] text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-[#80A33C]/25 hover:bg-[#6b8932] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#80A33C]/40 transition-all duration-300 flex justify-center items-center gap-2"
              >
                Create Account
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <a
                href="#"
                className="font-bold text-[#80A33C] hover:text-[#6b8932] transition-colors"
              >
                <Link to={"/login"}>Sign in here</Link>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;
