import React, { useEffect, useRef, useState } from "react";
import {
  Users,
  GitBranch,
  MessagesSquare,
  BarChart3,
  Sparkles,
  Receipt,
  type LucideIcon,
} from "lucide-react";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
}

const services: Service[] = [
  {
    title: "Lead & contact management",
    description:
      "Capture every lead automatically and keep one clean record for each contact — no more scattered spreadsheets.",
    icon: Users,
  },
  {
    title: "Sales pipeline automation",
    description:
      "Move deals through stages automatically and get notified the moment one stalls, so nothing slips through.",
    icon: GitBranch,
  },
  {
    title: "Real-time team collaboration",
    description:
      "Comment, share files, and assign tasks — your whole team stays in sync inside one workspace.",
    icon: MessagesSquare,
  },
  {
    title: "Smart analytics & reporting",
    description:
      "Live dashboards turn raw activity into decisions your team can act on the same day.",
    icon: BarChart3,
  },
  {
    title: "AI-powered automation",
    description:
      "Let AI score leads, draft follow-ups, and flag the deals that need your attention first.",
    icon: Sparkles,
  },
  {
    title: "Secure payments & invoicing",
    description:
      "Send invoices, accept payments, and reconcile revenue without ever leaving the CRM.",
    icon: Receipt,
  },
];

const ServicesScroll: React.FC = () => {
  const [active, setActive] = useState<number>(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            setActive(Number(target.dataset.index));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    const currentRefs = refs.current;
    currentRefs.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const jumpTo = (i: number): void => {
    refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const railFill = (active / (services.length - 1)) * 100;

  return (
    <section className="gs-section">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,440..600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        .gs-section {
          position: relative;
          background: #F5F6F1;
          background-image: radial-gradient(circle, rgba(11,61,46,0.07) 1px, transparent 1px);
          background-size: 22px 22px;
          padding: 7rem 0;
          font-family: 'Inter', sans-serif;
        }
        .gs-display { font-family: 'Fraunces', serif; letter-spacing: -0.01em; }
        .gs-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; }
        .gs-ink { color: #0F241B; }
        .gs-muted { color: #5C6A61; }
        .gs-accent { color: #00875F; }

        @keyframes gsFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .gs-fade { animation: gsFadeUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }

        .gs-rail-track {
          position: absolute;
          left: 21px;
          top: 4px;
          bottom: 4px;
          width: 2px;
          background: rgba(15,36,27,0.1);
          border-radius: 2px;
        }
        .gs-rail-fill {
          position: absolute;
          left: 21px;
          top: 4px;
          width: 2px;
          background: linear-gradient(180deg, #00875F, #00C88C);
          border-radius: 2px;
          transition: height 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .gs-node {
          position: absolute;
          left: 15px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #F5F6F1;
          border: 2px solid rgba(15,36,27,0.18);
          transition: all 0.5s cubic-bezier(0.22,1,0.36,1);
          cursor: pointer;
          padding: 0;
        }
        .gs-node:hover {
          border-color: #00875F;
          transform: translateY(-7px) scale(1.15);
        }
        .gs-node:focus-visible {
          outline: 2px solid #00875F;
          outline-offset: 3px;
        }
        .gs-node-active {
          border-color: #00875F;
          background: #00875F;
          box-shadow: 0 0 0 4px rgba(0,135,95,0.15);
        }

        .gs-mobile-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
        }
        .gs-mobile-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(15,36,27,0.15);
          border: none; padding: 0; cursor: pointer;
          transition: all 0.35s ease;
        }
        .gs-mobile-dot-active { width: 22px; border-radius: 4px; background: #00875F; }

        @media (prefers-reduced-motion: reduce) {
          .gs-fade, .gs-card, .gs-icon-ring, .gs-rail-fill, .gs-node { animation: none !important; transition: none !important; }
        }

        .gs-icon-ring {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: #EEF3EC; color: #6B7A70;
          transition: all 0.45s cubic-bezier(0.22,1,0.36,1);
        }
        .gs-icon-ring-active {
          background: #0F241B; color: #6EE6BB;
        }

        .gs-card {
          border: 1px solid rgba(15,36,27,0.1);
          background: #FDFDFB;
          border-radius: 22px;
          padding: 2rem;
          transition: all 0.5s cubic-bezier(0.22,1,0.36,1);
        }
        .gs-card-active {
          border-color: rgba(0,135,95,0.35);
          background: #FFFFFF;
          box-shadow: 0 24px 48px -24px rgba(15,36,27,0.18);
          transform: scale(1.01);
        }
        .gs-card-inactive {
          opacity: 0.5;
          transform: scale(0.97);
        }
        .gs-card-inactive:hover {
          opacity: 0.8;
        }
        @media (max-width: 1023px) {
          .gs-card-inactive { opacity: 1; transform: none; }
        }
      `}</style>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 1.5rem" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto 4rem", textAlign: "center" }}>
          <span className="gs-mono gs-accent" style={{ fontSize: "13px", fontWeight: 500, textTransform: "uppercase" }}>
            What Genesys does for you
          </span>
          <h2 className="gs-display gs-ink" style={{ fontSize: "clamp(2.25rem, 4vw, 3rem)", fontWeight: 600, marginTop: "0.75rem", lineHeight: 1.1 }}>
            Everything your team needs, in one CRM
          </h2>
        </div>

        <div className="lg:grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4rem" }}>
          <div className="hidden lg:block" style={{ position: "relative" }}>
            <div style={{ position: "sticky", top: "7rem", paddingLeft: "3rem" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, minHeight: "260px" }}>
                <div className="gs-rail-track" />
                <div className="gs-rail-fill" style={{ height: `${railFill}%` }} />
                {services.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => jumpTo(i)}
                    aria-label={`Jump to ${s.title}`}
                    aria-current={i === active}
                    className={`gs-node ${i === active ? "gs-node-active" : ""}`}
                    style={{ top: `${(i / (services.length - 1)) * 100}%`, transform: "translateY(-7px)" }}
                  />
                ))}
              </div>

              <span className="gs-mono gs-muted" style={{ fontSize: "12px", fontWeight: 500 }}>
                STAGE {String(active + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
              </span>

              <div key={active} className="gs-fade" style={{ marginTop: "0.75rem" }}>
                <h3 className="gs-display gs-ink" style={{ fontSize: "2rem", fontWeight: 600, lineHeight: 1.2 }}>
                  {services[active].title}
                </h3>
                <p className="gs-muted" style={{ marginTop: "1rem", fontSize: "1.0625rem", lineHeight: 1.65, maxWidth: "380px" }}>
                  {services[active].description}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div
              className="gs-mobile-dots lg:hidden"
              style={{ position: "sticky", top: "1rem", zIndex: 10, background: "#F5F6F1", padding: "0.75rem 0" }}
            >
              {services.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`Jump to ${s.title}`}
                  aria-current={i === active}
                  className={`gs-mobile-dot ${i === active ? "gs-mobile-dot-active" : ""}`}
                />
              ))}
            </div>
            {services.map((service, i) => {
              const Icon = service.icon;
              const isActive = active === i;
              return (
                <div
                  key={service.title}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  data-index={i}
                  className="lg:min-h-[42vh] flex items-center"
                  style={{ minHeight: "auto" }}
                >
                  <div className={`gs-card ${isActive ? "gs-card-active" : "gs-card-inactive"}`} style={{ width: "100%" }}>
                    <div className={`gs-icon-ring ${isActive ? "gs-icon-ring-active" : ""}`}>
                      <Icon size={22} strokeWidth={1.75} />
                    </div>

                    <h3 className="gs-display gs-ink lg:hidden" style={{ fontSize: "1.375rem", fontWeight: 600, marginTop: "1.5rem" }}>
                      {service.title}
                    </h3>
                    <p className="gs-muted lg:hidden" style={{ marginTop: "0.5rem", fontSize: "1rem", lineHeight: 1.6 }}>
                      {service.description}
                    </p>

                    <h4 className="hidden lg:block gs-ink" style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem" }}>
                      {service.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesScroll;