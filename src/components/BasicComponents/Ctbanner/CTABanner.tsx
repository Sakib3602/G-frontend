import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router";

const CTABanner: React.FC = () => {
  return (
    <section className="relative bg-white py-16 px-4">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <style>{`.font-pillar { font-family: 'Baloo 2', sans-serif; }`}</style>

      <div
        className="relative max-w-7xl mx-auto rounded-[40px] overflow-hidden px-6 py-20 md:py-24"
        style={{ backgroundColor: "#5B63F0" }}
      >
        {/* Faint giant sunburst watermark behind the headline */}
        <svg
          className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/3 pointer-events-none"
          width="520"
          height="260"
          viewBox="0 0 520 260"
        >
          {Array.from({ length: 13 }).map((_, i) => {
            const angle = -90 + (i - 6) * 8;
            const rad = (angle * Math.PI) / 180;
            const x2 = 260 + 240 * Math.sin(rad);
            const y2 = 260 - 240 * Math.cos(rad);
            return (
              <line
                key={i}
                x1="260"
                y1="260"
                x2={x2}
                y2={y2}
                stroke="#FFFFFF"
                strokeOpacity="0.12"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Top-center small sunburst */}
        <svg
          className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none"
          width="70"
          height="36"
          viewBox="0 0 70 36"
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = -90 + (i - 3) * 18;
            const rad = (angle * Math.PI) / 180;
            const x2 = 35 + 30 * Math.sin(rad);
            const y2 = 36 - 30 * Math.cos(rad);
            return (
              <line
                key={i}
                x1="35"
                y1="36"
                x2={x2}
                y2={y2}
                stroke="#1B1B2E"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Top-left zigzag ribbon */}
        <svg
          className="absolute -top-2 left-4 md:left-10 pointer-events-none"
          width="110"
          height="110"
          viewBox="0 0 110 110"
        >
          <polygon points="10,45 55,20 65,35 20,60" fill="#F7A9A0" stroke="#1B1B2E" strokeWidth="3" />
          <polygon points="20,60 65,35 75,50 30,75" fill="#F28B7F" stroke="#1B1B2E" strokeWidth="3" />
        </svg>

        {/* Top-right folded flag shape */}
        <div className="absolute -top-1 right-8 md:right-16 pointer-events-none">
          <div style={{ width: 0, height: 0, borderLeft: "24px solid transparent", borderRight: "24px solid transparent", borderBottom: "24px solid #8FE3B0" }} />
          <div style={{ width: 48, height: 70, backgroundColor: "#3436E8", borderRadius: "0 0 6px 6px" }} />
        </div>

        {/* Right-side wavy lines */}
        <svg
          className="absolute top-1/3 right-10 md:right-24 pointer-events-none hidden sm:block"
          width="70"
          height="40"
          viewBox="0 0 70 40"
        >
          {[8, 20, 32].map((y) => (
            <path
              key={y}
              d={`M0 ${y} Q 8 ${y - 8}, 17 ${y} T 35 ${y} T 53 ${y} T 70 ${y}`}
              fill="none"
              stroke="#1B1B2E"
              strokeWidth="2.5"
            />
          ))}
        </svg>

        {/* Left star / sparkle outline */}
        <svg
          className="absolute top-1/2 left-8 md:left-20 pointer-events-none hidden sm:block"
          width="44"
          height="44"
          viewBox="0 0 44 44"
        >
          <path
            d="M22 4 C22 14 24 20 34 22 C24 24 22 30 22 40 C22 30 20 24 10 22 C20 20 22 14 22 4 Z"
            fill="none"
            stroke="#1B1B2E"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Bottom-left concentric rings */}
        <svg
          className="absolute bottom-0 left-0 pointer-events-none"
          width="90"
          height="90"
          viewBox="0 0 90 90"
        >
          {[18, 30, 42, 54].map((r) => (
            <circle
              key={r}
              cx="0"
              cy="90"
              r={r}
              fill="none"
              stroke="#B6F03C"
              strokeWidth="4"
            />
          ))}
        </svg>

        {/* Bottom-right dotted grid */}
        <div
          className="absolute bottom-10 right-10 md:right-24 grid pointer-events-none"
          style={{ gridTemplateColumns: "repeat(6, 6px)", gap: "6px" }}
        >
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="block rounded-full"
              style={{ width: 4, height: 4, backgroundColor: "rgba(255,255,255,0.35)" }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="font-pillar font-extrabold text-4xl md:text-5xl text-white leading-tight">
            Make better
            <br />
            business decisions
          </h2>

          <p className="mt-6 text-white/85 text-base leading-relaxed max-w-lg mx-auto">
            Explore our customer stories and see how teams grow with Genesys, or
            get in touch to schedule an intro call.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/demo">
              <button className="px-7 py-3.5 rounded-full bg-[#22B573] text-white font-semibold hover:bg-[#1C9C63] transition-colors">
                Contact Now
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-7 py-3.5 rounded-full bg-transparent text-white font-semibold border border-white/70 hover:bg-white/10 transition-colors">
                Get started free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;