import React, { useState } from 'react';
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from 'react-router';

// 1. Updated FormValues for Login only
type FormValues = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: "onTouched" });

  // 2. Submit handler
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // You can add your login logic here
    console.log("Login data:", data);
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

          {/* Value Proposition updated for Login */}
          <div className="relative z-10 mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/10 border border-white/10 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#80A33C] animate-pulse"></span>
              Secure Infrastructure
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Welcome back.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Sign in to access your secure IT dashboard, monitor your infrastructure, and scale your business securely.
            </p>
          </div>
        </div>

        {/* ========================================
            RIGHT SIDE: Login Form & Social Logins
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Sign in</h1>
              <p className="text-gray-500 text-sm">Enter your email and password to access your account.</p>
            </div>

            {/* ========================================
                1. THE FORM (Email & Password Only) 
                ======================================== */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              
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

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-gray-700" htmlFor="password">Password</label>
                  <Link to="/reset/password">
                    <p className="text-xs font-bold text-[#80A33C] hover:text-[#6b8932] transition-colors">Forgot Password?</p>
                  </Link>
                 
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    {...register("password", {
                      required: "Password is required.",
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
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-4 bg-[#80A33C] text-white font-bold text-sm sm:text-base py-4 rounded-xl shadow-lg shadow-[#80A33C]/25 hover:bg-[#6b8932] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#80A33C]/40 transition-all duration-300"
              >
                Sign In
              </button>
            </form>

            {/* ========================================
                2. OUTSIDE THE FORM: Social Logins 
                ======================================== */}
            
            {/* Divider */}
            <div className="relative flex items-center my-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Google */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-bold text-gray-700">Google</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] border border-transparent rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1877F2]/50"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-bold text-white">Facebook</span>
              </button>
            </div>

            {/* Register Link */}
            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account? <a href="/register" className="font-bold text-[#80A33C] hover:text-[#6b8932] transition-colors"><Link to={'/registration'}>Sign up here</Link></a>
            </p>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;