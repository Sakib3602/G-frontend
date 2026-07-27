import React from "react";
import { Link, useNavigate } from "react-router"; // react-router-dom ব্যবহার করা ভালো
import { Home, ArrowLeft, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../Navbar/Navbar";


const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      
      {/* Background Gradient & Layout */}
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-200 px-6 overflow-hidden">
        
        {/* Main Card with Framer Motion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-2xl rounded-3xl bg-white/80 p-10 text-center shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-white/50 backdrop-blur-xl"
        >
          {/* Floating Icon Animation */}
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-indigo-50 shadow-inner"
          >
            <SearchX className="h-14 w-14 text-indigo-500" />
          </motion.div>

          {/* 404 Text Gradient */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-8 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-3xl font-bold text-slate-800"
          >
            Oops! Page Not Found
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-slate-500 leading-relaxed max-w-md mx-auto"
          >
            Sorry, the page you're looking for doesn't exist, has been moved,
            or the URL may be incorrect.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
          >
            {/* Home Button with Hover Effect */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/"
                className="inline-flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-200 transition-colors duration-300 hover:bg-indigo-700 sm:w-auto"
              >
                <Home size={20} />
                Go Home
              </Link>
            </motion.div>

            {/* Back Button with Hover Effect */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-700 transition-colors duration-300 hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              <ArrowLeft size={20} />
              Go Back
            </motion.button>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 border-t border-slate-100 pt-6 text-sm font-medium text-slate-400"
          >
            Error Code: <span className="text-indigo-400">404</span> • Resource Not Found
          </motion.div>
          
        </motion.div>
      </div>

  
    </>
  );
};

export default NotFound;