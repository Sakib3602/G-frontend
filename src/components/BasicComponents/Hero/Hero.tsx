import React, { useEffect, useState } from "react";

interface HeroProps {
  headlinePrefix?: string;
  headlineHighlight?: string;
  subheadline?: string;
  ctaText?: string;
  image1?: string;
  image2?: string;
  image3?: string;
}

const Hero: React.FC<HeroProps> = ({
  headlinePrefix = "Smarter IT for a ",
  headlineHighlight = "scalable future.",
  subheadline = "Upgrade your infrastructure with cutting-edge, secure, and reliable IT solutions designed to keep your business moving forward.",
  ctaText = "Consult an Expert",
  image1 = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800",
  image2 = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
  image3 = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600",
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <section className="poppins-regular relative bg-white overflow-hidden pt-10 pb-16 lg:pt-10 lg:pb-32 font-sans">
        {/* Decorative Background Element (Subtle tech grid) */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* ========================================
          LEFT SIDE: TEXT CONTENT
          ======================================== */}
          <div className="flex-1 flex flex-col justify-center items-start w-full">
            {/* Eyebrow Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white border border-[#80A33C]/20 shadow-sm text-[#80A33C] text-sm font-bold tracking-wide transition-all duration-500 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#80A33C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#80A33C]"></span>
              </span>
              Next-Gen IT Solutions
            </div>

            {/* Headline with Gradient Highlight */}
            <h1 className={`text-4xl sm:text-5xl lg:text-[4rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {headlinePrefix}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80A33C] to-[#5b7529]">
                {headlineHighlight}
              </span>
            </h1>

            <p className={`text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-lg transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              {subheadline}
            </p>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <a
                href="#contact"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-[#80A33C] text-white font-semibold rounded-xl shadow-lg shadow-[#80A33C]/25 transition-all duration-300 hover:bg-[#6b8932] hover:-translate-y-1 hover:shadow-[#80A33C]/40"
              >
                {ctaText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
              <a
                href="#services"
                className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300 hover:text-[#80A33C] hover:border-[#80A33C]/30 hover:bg-[#80A33C]/5"
              >
                Explore Services
              </a>
            </div>
          </div>

          {/* ========================================
          RIGHT SIDE: PREMIUM IMAGE GRID
          ======================================== */}
          <div className="flex-1 w-full relative mt-8 lg:mt-0">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[400px] bg-[#80A33C]/15 blur-[80px] rounded-full pointer-events-none"></div>

            {/* The Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 relative z-10 items-center">
              {/* Image 1: Tall, left column */}
              <div className={`mt-8 lg:mt-20 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <img
                  src={image1}
                  alt="IT Team Collaboration"
                  className="w-full h-[220px] sm:h-[300px] lg:h-[420px] object-cover rounded-2xl lg:rounded-3xl shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5 transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>

              {/* Images 2 & 3: Stacked, right column */}
              <div className={`flex flex-col gap-3 sm:gap-4 lg:gap-6 transition-all duration-700 delay-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <img
                  src={image2}
                  alt="Server Infrastructure"
                  className="w-full h-[140px] sm:h-[180px] lg:h-[240px] object-cover rounded-2xl lg:rounded-3xl shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5 transition-transform duration-500 hover:scale-[1.03]"
                />
                <img
                  src={image3}
                  alt="Modern Workspace"
                  className="w-full h-[140px] sm:h-[180px] lg:h-[240px] object-cover rounded-2xl lg:rounded-3xl shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5 transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
