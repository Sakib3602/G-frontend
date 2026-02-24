import React from 'react';

// Define the structure for our marketing services
interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Services: React.FC = () => {
  // Service Data Array for easy editing
  const services: ServiceItem[] = [
    {
      id: 'educational-funnels',
      title: 'Educational Funnel Design',
      description: 'We build high-converting sales funnels optimized specifically for digital products, memberships, and online course platforms.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
    },
    {
      id: 'audience-growth',
      title: 'Audience Acquisition',
      description: 'Targeted, data-driven ad campaigns designed to bring the right learners and high-intent buyers directly to your knowledge platform.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'content-monetization',
      title: 'Content Monetization',
      description: 'Turn your raw expertise into scalable, automated revenue streams with strategic pricing, upselling, and retention loops.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }
  ];

  return (
    <section className=" poppins-regular relative bg-white py-20 lg:py-32 font-sans overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 lg:mb-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#80A33C]/10 text-[#80A33C] text-sm font-bold tracking-wide">
              Info Marketing Solutions
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Amplify your reach. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#80A33C] to-[#5b7529]">Scale your knowledge.</span>
            </h2>
          </div>
          
          <div className="max-w-md">
            <p className="text-lg text-gray-600 leading-relaxed">
              We provide the strategic marketing infrastructure required to package, promote, and profit from your digital expertise.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="group relative flex flex-col p-8 lg:p-10 bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-gray-200/40 hover:border-[#80A33C]/30 overflow-hidden"
            >
              {/* Decorative background glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#80A33C]/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"></div>

              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-[#80A33C]/10 flex items-center justify-center text-[#80A33C] mb-8 transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#80A33C] group-hover:text-white">
                {service.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8 flex-1">
                {service.description}
              </p>

              {/* Learn More Link */}
              <div className="mt-auto">
                <a 
                  href={`#${service.id}`} 
                  className="inline-flex items-center text-sm font-bold text-[#80A33C] group-hover:text-[#6b8932] transition-colors"
                >
                  Explore Solution
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;