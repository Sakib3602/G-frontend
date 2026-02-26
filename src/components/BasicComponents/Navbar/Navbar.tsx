import React, { useContext, useState } from "react";
import { Link } from "react-router";
import { AuthContext } from "../../Authentication/AuthProvider/AuthProvider";
import Notification from "@/components/ui/toast";

interface NavbarProps {
  companyName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ companyName = "Genesys" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { person, logOut } = useContext(AuthContext)!;
  const [showNotification, setShowNotification] = useState(false);

  const handleLogOut = () => {
    logOut().then(() => {
      setShowNotification(true);
    });
  };

  // Handle opening and closing, plus locking the body scroll without useEffect
  const handleMenu = (open: boolean) => {
    setIsOpen(open);
    if (typeof window !== "undefined") {
      document.body.style.overflow = open ? "hidden" : "unset";
    }
  };

  const navLinks = [
    { name: "Services", href: "#services", number: "01" },
    { name: "About Us", href: "#about", number: "02" },
    { name: "Portfolio", href: "#portfolio", number: "03" },
    { name: "Blog", href: "#blog", number: "04" },
    { name: "Contact", href: "#contact", number: "05" },
  ];

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        {showNotification && (
          <Notification
            type="warning"
            title="Logged Out Successfully!"
            message="You have been logged out."
            showIcon={true}
            duration={3000}
            onClose={() => {
              setShowNotification(false);
            }}
          />
        )}
      </div>
      <nav className="poppins-regular sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <Link to={"/"}>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {companyName}
                  <span className="text-[#80A33C]">.</span>
                </span>
              </Link>
            </div>

            {/* Desktop Links */}
            <div className="hidden lg:flex space-x-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-900 hover:text-[#80A33C] text-[15px] font-semibold transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Desktop Button */}
            <div className="hidden lg:flex items-center">
              {person ? (
                <button
                  onClick={handleLogOut}
                  className="inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold rounded-full text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign Out
                </button>
              ) : (
                <Link to={"/registration"}>
                  <p className="inline-flex items-center justify-center px-7 py-2.5 text-sm font-semibold rounded-full text-white bg-[#80A33C] hover:bg-[#6b8932] shadow-lg shadow-[#80A33C]/20 transition-all duration-300 hover:-translate-y-0.5">
                    Sign Up
                  </p>
                </Link>
              )}
            </div>

            {/* Mobile Open Button (Hamburger) */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => handleMenu(true)}
                className="group flex flex-col justify-center items-end gap-1.5 w-10 h-10 p-2 focus:outline-none"
                aria-label="Open menu"
              >
                <span className="block w-6 h-0.5 bg-gray-900 group-hover:bg-[#80A33C] transition-colors"></span>
                <span className="block w-4 h-0.5 bg-gray-900 group-hover:bg-[#80A33C] transition-colors"></span>
                <span className="block w-6 h-0.5 bg-gray-900 group-hover:bg-[#80A33C] transition-colors"></span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================
        PREMIUM FULL-SCREEN MOBILE MENU
        ========================================
      */}
      <div
        className={`fixed inset-0 z-50 bg-[#f8f9fa] flex flex-col font-sans transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.05,1)] ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Mobile Menu Header (Logo + Close Button) */}
        <div className="flex justify-between items-center h-20 px-6 lg:px-8 border-b border-gray-200/50">
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {companyName}
            <span className="text-[#80A33C]">.</span>
          </span>

          <button
            onClick={() => handleMenu(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-900 hover:bg-[#80A33C] hover:text-white hover:border-[#80A33C] transition-all duration-300 shadow-sm"
            aria-label="Close menu"
          >
            {/* Elegant SVG Close Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Links */}
        <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-center">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => handleMenu(false)}
                className="group flex items-baseline gap-4 overflow-hidden"
              >
                {/* Small numbering for premium editorial feel */}
                <span
                  className={`text-sm font-medium text-[#80A33C] transform transition-all duration-700 ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0"
                  }`}
                  style={{ transitionDelay: `${200 + index * 100}ms` }}
                >
                  {link.number}
                </span>

                {/* Huge text links */}
                <span
                  className={`text-4xl sm:text-5xl font-extrabold text-gray-900 group-hover:text-[#80A33C] transition-all duration-700 transform ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "translate-y-full opacity-0"
                  }`}
                  style={{ transitionDelay: `${250 + index * 100}ms` }}
                >
                  {link.name}
                </span>
              </a>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Footer (CTA & Info) */}
        <div
          className={`px-6 pb-12 pt-6 transform transition-all duration-700 delay-700 ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {person ? (
            <button
              onClick={() => {
                handleMenu(false);
                handleLogOut();
              }}
              className="flex items-center justify-center w-full py-4 text-lg font-bold rounded-xl text-white bg-red-500 active:bg-red-600 shadow-xl shadow-red-500/30 transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to={"/registration"}
              onClick={() => handleMenu(false)}
              className="flex items-center justify-center w-full py-4 text-lg font-bold rounded-xl text-white bg-[#80A33C] active:bg-[#6b8932] shadow-xl shadow-[#80A33C]/30 transition-colors"
            >
              Start Your Journey
            </Link>
          )}
          <p className="mt-6 text-center text-sm font-medium text-gray-500">
            hello@{companyName.toLowerCase()}.com
          </p>
        </div>
      </div>
    </>
  );
};

export default Navbar;
