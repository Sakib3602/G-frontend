import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router";
import { Star, ArrowRight, PlayCircle, TrendingUp } from "lucide-react";

import heroImg from "../../../assets/hero.webp";

// Trust bar — real product review sources
const TrustBar: React.FC = () => (
  <div className="flex items-center gap-6 mt-4 opacity-80">
   
  </div>
);

const Hero: React.FC = () => {
  return (
    <section className="relative bg-[#FBFAF7] pt-20 pb-28 overflow-hidden">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Genesys | Business Management</title>
        {/* Space Grotesk for display, Source Serif 4 for body — a deliberate
            sans/serif pairing so the page reads as confident + trustworthy,
            not another Inter-on-Inter SaaS template */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Source+Serif+4:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <style>{`
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'Source Serif 4', serif; }
      `}</style>

      {/* Subtle background grid — quiet, not decorative noise */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 items-center">

          {/* Left: copy */}
          <div className="space-y-8">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00A97E]/10 text-[#00764F] font-display font-semibold text-sm tracking-wide">
              All-in-one business platform
            </span>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-950 tracking-tight leading-[1.05]">
              Run your entire business
              <br />
              from one{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#00A97E] to-[#00614A]">
                  command center
                </span>
                <span className="absolute -bottom-1.5 left-0 w-full h-3 bg-[#00A97E]/20 rounded-full -z-0" />
              </span>
            </h1>

            <p className="font-body text-xl text-gray-600 max-w-lg leading-relaxed">
              Genesys brings your CRM, time tracking, and project management
              into a single workspace — so your team stops switching tools
              and starts finishing work.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/signup">
                <button className="group inline-flex items-center gap-2 px-8 py-4 bg-[#00A97E] text-white font-display font-semibold rounded-full hover:bg-[#00916B] transition-all shadow-lg shadow-[#00A97E]/25 text-base">
                  Contact Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
              <Link to="/demo">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-gray-900 font-display font-semibold rounded-full border border-gray-300 hover:border-gray-900 transition-all text-base">
                  <PlayCircle className="h-4 w-4" />
                  Watch demo
                </button>
              </Link>
            </div>

            <div className="pt-6 border-t border-gray-200/70 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <span className="font-body text-sm text-gray-600 italic">
                  4.9 out of 5, from 1,000+ verified reviews
                </span>
              </div>
              <TrustBar />
            </div>
          </div>

          {/* Right: single cohesive product panel (signature element) */}
          <div className="relative">
            <div className="relative rounded-[28px] p-3 bg-white shadow-[0_40px_80px_-20px_rgba(0,90,65,0.18)] border border-gray-100">
              <img
                src={heroImg}
                alt="Genesys dashboard showing CRM, time tracking, and project overview"
                className="w-full h-auto object-cover rounded-[20px]"
              />

              {/* Metric card 1 — top left, anchored to the image, not floating loose */}
              <div className="absolute top-8 left-8 px-5 py-4 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 z-20">
                <div className="h-11 w-11 rounded-full bg-[#00A97E]/10 flex items-center justify-center">
                  <span className="font-display font-bold text-[#00A97E] text-xs">NEW</span>
                </div>
                <div>
                  <p className="font-body text-xs text-gray-500">New clients this week</p>
                  <p className="font-display font-bold text-xl text-gray-950">321</p>
                </div>
              </div>

              {/* Metric card 2 — revenue trend */}
              <div className="absolute bottom-8 right-8 px-5 py-4 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 w-44">
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs text-gray-500">Revenue, MTD</p>
                  <span className="inline-flex items-center gap-0.5 text-[#00A97E] font-display font-semibold text-xs">
                    <TrendingUp className="h-3 w-3" />
                    59%
                  </span>
                </div>
                <p className="font-display font-bold text-2xl text-gray-950 mt-1">$48,210</p>
                <div className="h-8 mt-3 flex items-end gap-1">
                  {[35, 55, 45, 70, 60, 85, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-[#00A97E] rounded-t-sm"
                      style={{ height: `${h}%`, opacity: 0.5 + (i / 14) }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;