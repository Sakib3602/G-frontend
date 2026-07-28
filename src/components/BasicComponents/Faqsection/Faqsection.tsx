import  { useState } from "react";
import { ChevronDown } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};


const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How to using Saafiy for Business?",
    answer:
      "On the other hand, the strengthening and development structure largely shapes the creation of financial and administrative processes — the beginning of the daily work on the formation of the position provides specialists.",
  },
  {
    question: "How secure is SaaS?",
    answer:
      "Your data is encrypted in transit and at rest, with role-based access controls so only the right people see the right information.",
  },
  {
    question: "What are the advantages of using SaaS?",
    answer:
      "No installation or maintenance overhead, automatic updates, and access from any device — you always work with the latest version.",
  },
  {
    question: "What does onboarding look like?",
    answer:
      "Most teams are up and running within a day. We guide you through account setup, data import, and inviting your team.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There's no lock-in contract — you can cancel or change your plan whenever you like from your account settings.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="relative w-full overflow-hidden bg-white px-6 py-20 sm:px-10 lg:px-20">
      {/* subtle grid pattern so the background reads as designed, not just blank white */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(30,27,75,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,27,75,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        <h2 className="text-center text-4xl font-extrabold leading-tight tracking-tight text-[#1E1B4B] sm:text-5xl">
          Frequently asked
          <br />
          Questions
        </h2>

        <div className="mt-14 flex flex-col gap-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = index === openIndex;
            return (
              <div
                key={item.question}
                className={`rounded-3xl transition-colors duration-300 ease-out ${
                  isOpen
                    ? "bg-[#6366F1] shadow-lg shadow-indigo-200"
                    : "border border-black/10 bg-white"
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-7 py-6 text-left"
                >
                  <span
                    className={`text-base font-bold transition-colors duration-300 sm:text-lg ${
                      isOpen ? "text-white" : "text-[#1E1B4B]"
                    }`}
                  >
                    {item.question}
                  </span>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-300 ease-out ${
                      isOpen ? "rotate-180 text-white" : "text-[#1E1B4B]/60"
                    }`}
                  />
                </button>

                {/* grid-rows trick: animates 0fr -> 1fr so height transitions smoothly
                    without needing to measure content height in JS */}
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-7 pb-7 text-sm leading-relaxed text-white/85 sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}