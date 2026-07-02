import React from "react";
import { Link } from "react-router";

const Hero: React.FC = () => {
  return (
    <section className="relative bg-white pt-16 pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Your All-in-One CRM Solution: <br />
              <span className="text-[#80A33C]">Streamline, Connect, Grow.</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg">
              Genesys CRM empowers sales, marketing, and support teams with 
              intelligent tools to build lasting customer relationships and drive revenue.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/registration">
                <button className="px-8 py-4 bg-[#80A33C] text-white font-bold rounded-xl hover:bg-[#6b8932] transition-all shadow-lg shadow-[#80A33C]/20">
                  Contact Now
                </button>
              </Link>
              
            </div>
          </div>

          {/* Right Image/Dashboard Preview */}
          <div className="flex-1 w-full">
            <div className="relative rounded-2xl border border-gray-200 shadow-2xl p-2 bg-gray-50">
              {/* Replace this src with your actual CRM dashboard screenshot */}
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                alt="CRM Dashboard Preview" 
                className="rounded-xl w-full h-auto object-cover"
              />
              
              {/* Optional Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                <p className="text-sm font-bold text-gray-900">Revenue Growth</p>
                <p className="text-[#80A33C] font-extrabold text-xl">+24.5%</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;