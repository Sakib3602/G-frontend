import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router";
import {
  TrendingUp,
  Users,
  LayoutDashboard,
  Receipt,
  Sparkles,
  ArrowRight,
  ChevronsUp,
} from "lucide-react";

interface Pillar {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
  iconBg: string;
  iconColor: string;
  badge?: string;
}

const pillars: Pillar[] = [
  {
    title: "Project Management",
    description: "Assign owners and track every task on one shared timeline.",
    href: "/features/project-management",
    icon: <TrendingUp className="h-7 w-7" />,
    bg: "#FFF4D6",
    iconBg: "#FFFFFF",
    iconColor: "#2E9E5B",
  },
  {
    title: "Realtime Collaboration",
    description: "Comment and share files without ever switching tabs.",
    href: "/features/collaboration",
    icon: <Users className="h-7 w-7" />,
    bg: "#FBE3DA",
    iconBg: "#FFFFFF",
    iconColor: "#C9861F",
  },
  {
    title: "Client Management",
    description: "Every contact and deal stage stored in one clean record.",
    href: "/features/client-management",
    icon: <LayoutDashboard className="h-7 w-7" />,
    bg: "#EFE3FB",
    iconBg: "#FFFFFF",
    iconColor: "#5B3FA8",
  },
  {
    title: "Payment System",
    description: "Send invoices and get paid, with revenue reconciled automatically.",
    href: "/features/payments",
    icon: <Receipt className="h-7 w-7" />,
    bg: "#E1EAFB",
    iconBg: "#FFFFFF",
    iconColor: "#2C5FC7",
  },
  {
    title: "AI Automation",
    description: "AI scores leads and flags the deals that need your attention.",
    href: "/features/ai-automation",
    icon: <Sparkles className="h-7 w-7" />,
    bg: "#DDF3E4",
    iconBg: "#FFFFFF",
    iconColor: "#1E8E5A",
    badge: "New",
  },
];

const Pillars: React.FC = () => {
  return (
    <section className="relative bg-white pt-10 pb-24 overflow-hidden">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <style>{`.font-pillar { font-family: 'Baloo 2', sans-serif; }`}</style>

      {/* Decorative corner shapes, quiet and out of the content's way */}
      <div
        className="absolute -top-6 -left-10 w-64 h-40 -rotate-12 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #8B7FE0 0%, #C9C2F5 100%)",
          opacity: 0.5,
          borderRadius: 24,
        }}
      />
      <div
        className="absolute -top-10 right-0 w-72 h-32 rotate-6 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #6FE0A8 0%, #B7F2CF 100%)",
          opacity: 0.6,
          borderRadius: 24,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="font-pillar font-extrabold text-4xl md:text-5xl text-center text-[#241768] leading-tight max-w-3xl mx-auto">
          Our pillars for lasting
          <br />
          customer relationships
        </h2>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="relative rounded-3xl p-8 flex flex-col min-h-[240px]"
              style={{ backgroundColor: pillar.bg }}
            >
              {pillar.badge && (
                <span className="absolute top-6 right-6 px-2.5 py-1 rounded-full bg-white/80 text-[#1E8E5A] font-pillar font-bold text-xs whitespace-nowrap">
                  {pillar.badge}
                </span>
              )}

              <div
                className="h-14 w-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm shrink-0"
                style={{ backgroundColor: pillar.iconBg, color: pillar.iconColor }}
              >
                {pillar.icon}
              </div>

              <h3 className="font-pillar font-bold text-xl text-[#241768] leading-snug">
                {pillar.title}
              </h3>

              <p className="text-[15px] text-gray-600 leading-relaxed mt-3 flex-1">
                {pillar.description}
              </p>

              <Link
                to={pillar.href}
                className="group inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-gray-700 hover:text-[#241768] transition-colors"
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-[#1E8E5A] text-white flex items-center justify-center shadow-lg shadow-[#1E8E5A]/30 hover:bg-[#187149] transition-colors z-30"
      >
        <ChevronsUp className="h-5 w-5" />
      </button>
    </section>
  );
};

export default Pillars;