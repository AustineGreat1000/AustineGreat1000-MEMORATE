import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Briefcase, Award, CheckCircle2, ArrowRight, Star } from 'lucide-react';

export const MasterclassSection: React.FC = () => {
  // Inject the Typeform embed script on component mount
  useEffect(() => {
    const existingScript = document.querySelector('script[src="//embed.typeform.com/next/embed.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = "//embed.typeform.com/next/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const targets = [
    "Commercial Operators",
    "Marketing Officers",
    "Brand Comms Specialists",
    "Content Leads",
    "Social Media Managers",
    "Sales & Marketing Teams",
    "Founders & Directors"
  ];

  const deliverables = [
    "Positioning Clarity Ledger",
    "Value Proposition Architecture",
    "Strategic Offer Messaging Kit",
    "Admissions/Sales Campaign Plan",
    "Commercial Alignment Map",
    "Brand-to-Revenue Action Plan"
  ];

  return (
    <section id="academy" className="py-24 border-y border-white/5 bg-zinc-950 relative overflow-hidden font-sans">
      {/* Sleek Decorative background lines / grids */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-soft-light" />
      
      {/* High-impact radial neon green backlight matching the user's banner assets */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-l from-acid-green/10 to-transparent blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-12 left-10 w-96 h-96 bg-violet-600/5 blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Title */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-4 bg-zinc-900 border border-white/10 px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-acid-green rounded-full animate-ping" />
            <span className="text-[10px] font-mono tracking-[0.3em] font-semibold text-white uppercase">New from Memorate Academy</span>
          </div>
          <h2 className="text-3xl md:text-6xl font-display font-bold text-white tracking-tight leading-none mb-4">
            The Brand-to-Revenue <span className="ring-glow-text text-acid-green">Operator Masterclass</span>
          </h2>
          <p className="text-slate-450 font-mono text-[9px] uppercase tracking-[0.2em]">
            Equipping marketing practitioners to drive undisputed commercial value in Nigeria & Africa.
          </p>
        </div>

        {/* Masterclass Spotlight Interactive Panel Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Course Blueprint (Left 7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-12 bg-zinc-900/40 border border-white/10 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-acid-green/5 blur-3xl pointer-events-none" />
            
            <div className="space-y-8">
              {/* Pain-point / Hook line */}
              <div>
                <p className="text-xl md:text-3xl font-display font-light italic leading-relaxed text-balance text-slate-200">
                  “Stop being seen as the person who only posts, designs, or runs campaigns.”
                </p>
              </div>

              {/* Practical overview body */}
              <div className="space-y-4">
                <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed">
                  This practical <strong>1-week intensive masterclass</strong> is engineered specifically for marketing, brand communication, and commercial professionals who want to construct stronger offers, sharpen brand positioning, align effortlessly with sales, and directly link daily execution to modern measurable business capital.
                </p>
                <p className="text-sm md:text-base text-slate-400 font-light leading-relaxed">
                  Move past fragmented workflows and high-variance tactics. Acquire the systematic tools to orchestrate precise strategies, launch high-yield campaigns, and deliver transparent growth-oriented commercial analytics.
                </p>
              </div>

              {/* Pill Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-y border-white/5 py-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-acid-green">
                    <Calendar className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Duration</span>
                  </div>
                  <span className="text-xs text-white font-medium">1-Week Intensive</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-acid-green">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Delivery</span>
                  </div>
                  <span className="text-xs text-white font-medium">Live Online Channels</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-acid-green">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Structure</span>
                  </div>
                  <span className="text-xs text-white font-medium">Hands-On Practice</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-acid-green">
                    <Award className="w-4 h-4" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Credentials</span>
                  </div>
                  <span className="text-xs text-white font-medium">Digital Certificate</span>
                </div>
              </div>

              {/* Built For Cohorts */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Built for professionals seeking more than activity:</span>
                <div className="flex flex-wrap gap-2">
                  {targets.map((target, index) => (
                    <span 
                      key={index} 
                      className="px-3.5 py-1.5 bg-white/[0.02] border border-white/5 text-[11px] font-medium text-slate-300 rounded-full transition-all hover:border-acid-green/30 hover:bg-white/[0.04]"
                    >
                      {target}
                    </span>
                  ))}
                </div>
              </div>

              {/* What You Will Build Blueprint */}
              <div className="space-y-4 pt-4">
                <span className="text-[10px] font-mono text-acid-green uppercase tracking-widest block">What you will build & launch:</span>
                <div className="grid sm:grid-cols-2 gap-3">
                  {deliverables.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-start">
                      <CheckCircle2 className="w-4 h-4 text-acid-green/70 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-300 font-light">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Slogan Outro Card */}
            <div className="mt-10 p-6 bg-[#AAFF00]/5 border border-[#AAFF00]/10 rounded-2xl">
              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                "Marketing should not disappear into activity. It must build trust, create demand, and support sustainable business growth."
              </p>
            </div>
          </div>

          {/* Column 2: Interactive Application Form Card (Right 5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 bg-zinc-900/60 border border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            {/* Ambient image background mimicking the user's uploaded masterclass visual layout */}
            <div className="absolute inset-x-0 top-0 h-44 overflow-hidden rounded-t-[1.8rem] opacity-70 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-900/100 z-10" />
              <div className="absolute inset-0 bg-acid-green/10 mix-blend-color z-10" />
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600" 
                referrerPolicy="no-referrer"
                alt="Workspace professional" 
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="relative z-10 space-y-6 pt-24">
              <div className="flex justify-between items-start">
                <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl inline-flex items-center justify-center">
                  <Star className="w-5 h-5 text-acid-green fill-acid-green" />
                </div>
                <span className="text-[9px] font-mono uppercase bg-acid-green text-black px-2.5 py-1 rounded-md font-extrabold tracking-widest">
                  APPLICATION OPEN
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-display font-bold text-white">Join the Masterclass</h3>
                <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                  Complete the quick intake application form below provided by Memorate Academy to secure your seat in the next active operational cohort.
                </p>
              </div>

              {/* Slashed pricing or direct details segment */}
              <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-2xl flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">FORMAT</span>
                <span className="text-white font-bold">LIVE ONLINE INTENSIVE</span>
              </div>

              {/* The Embed Typeform Widget Division */}
              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40 h-[380px] min-h-[380px] relative">
                {/* Embed container script is parsed on component mount */}
                <div 
                  data-tf-live="01KTHS7F4SQF3Y1EG4JKY0E6HD"
                  className="w-full h-full"
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-500 bg-zinc-950">
                    <span className="w-6 h-6 border-2 border-acid-green/30 border-t-acid-green rounded-full animate-spin mb-3" />
                    <span>Synchronizing intake database...</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action helper bottom line */}
            <div className="relative z-10 mt-6 pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] font-mono text-slate-505">
                Questions? DM OPERATOR 08136162573
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
