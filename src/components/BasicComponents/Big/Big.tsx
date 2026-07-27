import { Link } from "react-router";
import ba from "../../../assets/ba.png"

// এখানে placeholder হিসেবে Unsplash এর একটা dashboard/analytics ছবি ব্যবহার করা হয়েছে।
// আপনার নিজের CRM এর স্ক্রিনশট থাকলে শুধু নিচের IMAGE_URL টা বদলে দিন, বা
// <img> ট্যাগটা সরিয়ে আপনার ছবি বসিয়ে দিন।
const IMAGE_URL = ba;

export default function Big() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F3F1E9] px-6 py-20 sm:px-10 lg:px-20">
      {/* soft, warm accent blobs so the light background doesn't feel flat */}
      <div className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 rounded-full bg-lime-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Top: headline + CTA / supporting copy */}
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-[#16241E] sm:text-6xl">
              Maximize your
              <br />
              spending power
            </h1>

            <Link to="/registration">
            <button className="mt-8 rounded-full bg-[#1F6F4A] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#195c3d]">
                Get started
            </button>
            </Link>
          </div>

          <p className="max-w-sm text-base leading-relaxed text-[#16241E]/70">
            Get higher card limits and rewards plus a business account with
            industry-leading yield and FDIC coverage through our partner
            banks.
          </p>
        </div>

        {/* Dashboard / CRM screenshot frame */}
        <div className="relative mt-16">
          {/* soft glow behind the frame so it lifts off the light background */}
          <div className="pointer-events-none absolute inset-x-10 -top-6 h-40 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative rounded-t-[28px] bg-gradient-to-b from-black/10 via-black/5 to-transparent p-[1.5px] shadow-[0_30px_70px_-25px_rgba(22,36,30,0.35)]">
            <div className="rounded-t-[27px] border border-black/5 bg-white p-2 sm:p-3">
              {/* fake browser top bar for a more "app window" feel */}
              <div className="mb-2 flex items-center gap-1.5 px-2">
                <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-black/10" />
              </div>

              <div className="relative overflow-hidden rounded-xl border border-black/5 bg-white">
                {/* ---- আপনার CRM স্ক্রিনশট এখানে বসবে ---- */}
                <img
                  src={IMAGE_URL}
                  alt="Dashboard preview placeholder — replace with your own CRM screenshot"
                  className="block h-auto w-full max-h-[560px] object-cover object-top"
                />
                {/* ---------------------------------------- */}

                {/* bottom fade so the screenshot melts into the frame/background instead of cutting off hard */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#F3F1E9] via-[#F3F1E9]/50 to-transparent" />
              </div>
            </div>
          </div>

          {/* extra bottom fade so the whole frame eases into the section end */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-20 h-24 bg-gradient-to-b from-transparent to-[#F3F1E9]" />
        </div>
      </div>
    </section>
  );
}