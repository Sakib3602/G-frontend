import React from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";

// 1. Form Values for Forgot Password
type FormValues = {
  email: string;
};

const Reset: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" });

  // 2. Submit handler
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Add your API call to send the reset link here
    console.log("Password reset requested for:", data.email);
  };

  return (
    <div className="poppins-regular min-h-screen flex items-center justify-center bg-[#f4f6f8] font-sans p-4 sm:p-8">
      
      {/* Main Container */}
      <div className="max-w-5xl w-full bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col lg:flex-row border border-gray-100">

        {/* ========================================
            LEFT SIDE: Premium Brand Visual 
            ======================================== */}
        <div className="hidden lg:flex lg:w-5/12 bg-gray-900 p-12 flex-col justify-between relative overflow-hidden">
          {/* Abstract Glow Effects */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#80A33C]/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#80A33C]/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>

          {/* Logo Area */}
          <div className="relative z-10">
            <a href="/" className="text-3xl font-extrabold text-white tracking-tight hover:opacity-90 transition-opacity">
              Genesys<span className="text-[#80A33C]">.</span>
            </a>
          </div>

          {/* Value Proposition updated for Recovery */}
          <div className="relative z-10 mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#80A33C] animate-pulse"></span>
              Account Recovery
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Regain access.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              We'll help you get back into your secure IT dashboard so you can continue scaling your business without interruption.
            </p>
          </div>
        </div>

        {/* ========================================
            RIGHT SIDE: Password Reset Form
            ======================================== */}
        <div className="w-full lg:w-7/12 p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative z-10">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile/Tablet Logo */}
            <div className="lg:hidden text-center mb-8">
              <a href="/" className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Genesys<span className="text-[#80A33C]">.</span>
              </a>
            </div>

            {/* Form Header */}
            <div className="mb-8 sm:mb-10 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#80A33C]/10 mb-6">
                <svg className="w-6 h-6 text-[#80A33C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Forgot password?</h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                No worries, it happens to the best of us. Enter your work email address below and we'll send you a secure link to reset your password.
              </p>
            </div>

            {/* ========================================
                THE FORM (Email Only) 
                ======================================== */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              
              {/* Work Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="email">Work Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    {...register("email", {
                      required: "Email address is required.",
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address." },
                    })}
                    type="email"
                    id="email"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-4 focus:bg-white transition-all placeholder-gray-400 font-medium text-gray-900 ${errors.email ? "border-red-400 focus:ring-red-100 focus:border-red-400" : "border-gray-200 focus:ring-[#80A33C]/10 focus:border-[#80A33C]"}`}
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#80A33C] text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-[#80A33C]/25 hover:bg-[#6b8932] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#80A33C]/40 transition-all duration-300 flex justify-center items-center gap-2 group"
              >
                Send Reset Link
                <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <a href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#80A33C] transition-colors group">
                <svg className="w-4 h-4 transform transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to login
              </a>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Reset;