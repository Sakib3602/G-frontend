import React from 'react';

const Footer: React.FC = () => {
  return (
    <>
      
      <div className="hidden lg:block h-dvh w-full pointer-events-none bg-transparent"></div>

      
      <footer className="relative lg:fixed lg:bottom-0 lg:left-0 w-full lg:h-dvh bg-[#7FA23B] text-white flex flex-col justify-between z-0 selection:bg-white selection:text-[#7FA23B] overflow-hidden">
        
        {/* TOP: Massive Call to Action */}
        <div className="w-full px-6 lg:px-12 pt-16 lg:pt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-white/20 pb-12 lg:pb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight mb-4">
                Let’s build something <br className="hidden lg:block" />
                <span className="text-white/80 italic">extraordinary.</span>
              </h2>
              <p className="text-lg text-white/90 max-w-md leading-relaxed">
                We engineer scalable solutions for modern businesses. Ready to upgrade your digital infrastructure?
              </p>
            </div>
            
            <div className="shrink-0">
              <a 
                href="https://wa.me/8801928477557?text=Hello%2C%20I%20would%20like%20to%20discuss%20a%20project!"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#7FA23B] bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                   Give a Text
                  <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* MIDDLE: Informative Grid */}
        <div className="poppins-regular w-full grow px-6 lg:px-12 py-10 lg:py-0 lg:flex lg:items-center">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            
            {/* Brand & Newsletter (Spans 5 cols) */}
            <div className="lg:col-span-5 flex flex-col lg:pr-12">
              <span className="text-3xl font-extrabold tracking-tight mb-6">
                Genesys.
              </span>
              <p className="text-white/80 text-sm leading-relaxed mb-8 max-w-sm">
                A premier IT firm specializing in robust web architecture, advanced data solutions, and high-converting info-marketing funnels.
              </p>
              
              <form className="relative flex flex-col gap-2 w-full max-w-md mb-2">
                <label htmlFor="newsletter" className="text-xs font-bold uppercase tracking-wider text-white/90">
                  Join our Insider List
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    id="newsletter"
                    placeholder="Enter email address" 
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm rounded-xl pl-4 pr-28 py-3 focus:outline-none focus:border-white focus:bg-white/20 transition-all placeholder-white/50"
                    required
                  />
                  <button 
                    type="submit" 
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-white text-[#7FA23B] font-bold text-sm rounded-lg hover:bg-white/90 transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>

            {/* Solutions Links (Spans 2 cols) */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/60">Solutions</h4>
              <ul className="flex flex-col gap-4">
                <li><a href="#managed-it" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Managed IT</a></li>
                <li><a href="#cloud" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Cloud Architecture</a></li>
                <li><a href="#security" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Cybersecurity</a></li>
                <li><a href="#marketing" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Marketing Funnels</a></li>
              </ul>
            </div>

            {/* Company Links (Spans 2 cols) */}
            <div className="lg:col-span-2">
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/60">Company</h4>
              <ul className="flex flex-col gap-4">
                <li><a href="#about" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">About Us</a></li>
                <li><a href="#cases" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Case Studies</a></li>
                <li><a href="#careers" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Careers</a></li>
                <li><a href="#support" className="text-white/90 hover:text-white hover:translate-x-1 transition-all text-sm font-medium inline-block">Contact Support</a></li>
              </ul>
            </div>

            {/* Direct Contact (Spans 3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/60">Direct Contact</h4>
              <div className="flex flex-col gap-5">
                <a href="mailto:@gmail.com" className="group flex items-center gap-4 text-white/90 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-[#7FA23B] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Email Us</p>
                    <p className="font-medium text-sm truncate">gmail.com</p>
                  </div>
                </a>
                
                <a href="tel:+880" className="group flex items-center gap-4 text-white/90 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-[#7FA23B] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Call Us</p>
                    <p className="font-medium text-sm">+880</p>
                  </div>
                  
                </a>
                <a href="#" className="group flex items-start gap-4 text-white/90 hover:text-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white group-hover:text-[#7FA23B] transition-colors mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/60 uppercase tracking-wider mb-0.5">Location</span>
                    <span className="font-medium text-sm leading-relaxed">
                      Dhaka, Bangladesh <br/>
                      <span className="text-white/70 font-normal">Adress full</span>
                    </span>
                  </div>
                </a>

              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM: Legal & Copyright */}
        <div className="w-full px-4 lg:px-12 bg-black/10">
          <div className="max-w-7xl mx-auto py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/70">
            <p>© {new Date().getFullYear()} Genesys. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

      </footer>
    </>
  );
};

export default Footer;