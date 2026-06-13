import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Target, Users, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface OutcomeData {
  id: 'reputation' | 'demand' | 'loyalty';
  num: string;
  title: string;
  shortTitle: string;
  tagline: string;
  outcomeHeader: string;
  introduction: string;
  unspokenQuestions: string[];
  audienceContext: {
    sme: string;
    school: string;
    ngo: string;
  };
  helpTextHeader: string;
  helpPoints: string[];
  gradient: string;
  glowColor: string;
  icon: React.ReactNode;
}

export const BrandToRevenueTriangle: React.FC = () => {
  const [activeOutcome, setActiveOutcome] = useState<'reputation' | 'demand' | 'loyalty'>('reputation');
  const [audienceTab, setAudienceTab] = useState<'sme' | 'school' | 'ngo'>('sme');

  const outcomes: Record<'reputation' | 'demand' | 'loyalty', OutcomeData> = {
    reputation: {
      id: 'reputation',
      num: '01',
      title: 'Brand Strength & Reputation',
      shortTitle: 'Reputation',
      tagline: 'Effective marketing should build trust. Before they buy, they must trust.',
      outcomeHeader: 'Outcome: People trust you before they buy from you.',
      introduction: 'This is the foundation. Before people enquire, visit, buy, enrol, donate, partner or recommend, they first form a perception of your organisation. Brand strength is not just about having a logo, colour palette or nice designs. It is the level of trust, recognition, credibility and confidence your organisation has built in the market.',
      unspokenQuestions: [
        'Does this brand look credible?',
        'Do they understand people like me?',
        'Are they different from others?',
        'Does their public image match the value they claim?'
      ],
      audienceContext: {
        sme: 'For SMEs, brand strength affects whether high-value prospects take your team seriously and choose your product over cheaper options.',
        school: 'For schools, brand strength affects whether premium parents feel confident enough to enquire or visit your campus.',
        ngo: 'For impact organisations, brand reputation affects whether donors, partners, and stakeholders believe in the credibility of your work.'
      },
      helpTextHeader: 'Memorate helps organisations strengthen this through:',
      helpPoints: [
        'Clearer positioning that claims undisputed category white space',
        'Stronger, unified brand messaging frameworks',
        'Reputation-building communication strategies',
        'Customer perception audits & realignment strategy',
        'Consistent and cohesive visual brand expression',
        'Strategic trust signals across all physical and digital channels'
      ],
      gradient: 'from-amber-400 to-amber-600',
      glowColor: 'rgba(251, 191, 36, 0.25)',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />
    },
    demand: {
      id: 'demand',
      num: '02',
      title: 'Demand Generation & Capture',
      shortTitle: 'Demand',
      tagline: 'Effective marketing should create action. Attention without action is expensive noise.',
      outcomeHeader: 'Outcome: The right people become interested and take action.',
      introduction: 'Trust alone is not enough. A strong brand must also create and capture demand. Demand generation attracts the right people, makes them intensely aware of your offer, and builds interest. Demand capture is about converting that interest cleanly when it appears.',
      unspokenQuestions: [
        'How exactly do I take the next step?',
        'Is their offer clear and compelling?',
        'What makes their solution better than the competition?',
        'Am I seeing enough clear calls-to-action?'
      ],
      audienceContext: {
        sme: 'For SMEs, demand should translate directly into qualified sales leads, higher pipeline conversion, and immediate revenue opportunities.',
        school: 'For schools, demand must become parent enquiries, physical campus visits, admissions applications, and enrolment decisions.',
        ngo: 'For impact organisations, demand must become strategic stakeholder interest, actual funding commitments, partnerships, and public support.'
      },
      helpTextHeader: 'Memorate helps organisations improve this through:',
      helpPoints: [
        'Comprehensive marketing revenue audits',
        'Absolute offer clarity & alignment',
        'Go-to-market planning & high-impact campaign strategy',
        'Lead generation systems & automated pipeline tools',
        'Sales and marketing commercial alignment',
        'Conversion-focused communication, landing pages & updated CTAs'
      ],
      gradient: 'from-[#AAFF00] to-emerald-500',
      glowColor: 'rgba(170, 255, 0, 0.25)',
      icon: <Target className="w-5 h-5 text-acid-green" />
    },
    loyalty: {
      id: 'loyalty',
      num: '03',
      title: 'Customer Experience & Loyalty',
      shortTitle: 'Loyalty',
      tagline: 'Effective marketing should satisfy and retain. Real growth compounds over time.',
      outcomeHeader: 'Outcome: People stay, return, refer and speak well of you.',
      introduction: 'The final outcome is long-term, compounding growth. Marketing should never stop after the first sale, enrolment, donation or partnership. The experience after commitment determines whether people remain loyal, refer others, advocate for your brand, and buy again.',
      unspokenQuestions: [
        'Do they treat me the same way after they have my money?',
        'Is the post-commitment support consistent?',
        'Am I delighted enough to tell my colleagues and family?',
        'Are they still delivering authentic value?'
      ],
      audienceContext: {
        sme: 'For SMEs, loyalty leads to stronger customer retention, high-value repeat business, and organic referrals that lower CAC.',
        school: 'For schools, loyalty manifests as sustained parent satisfaction, peer-to-peer word-of-mouth, and stable, long-term enrolment.',
        ngo: 'For impact organisations, loyalty creates deep stakeholder confidence, consistent donor retention, and strong community backing.'
      },
      helpTextHeader: 'Memorate helps organisations strengthen this through:',
      helpPoints: [
        'End-to-end customer journey mapping',
        'Consistent communication touchpoint design & templates',
        'Automated, thoughtful follow-up systems',
        'Customer engagement workflows & drip sequences',
        'Post-acquisition experience and brand alignment validation',
        'CRM operations & seamless database automation support'
      ],
      gradient: 'from-violet-500 to-purple-600',
      glowColor: 'rgba(139, 92, 246, 0.25)',
      icon: <Users className="w-5 h-5 text-violet-400" />
    }
  };

  const active = outcomes[activeOutcome];

  return (
    <section className="py-24 border-y border-white/5 bg-zinc-950/30 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-soft-light" />
      
      {/* Decorative Radial Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-acid-green/5 to-violet-500/5 blur-[150px] pointer-events-none z-0" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Block in Memorate Style */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 mb-4 bg-acid-green/10 border border-acid-green/15 px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-acid-green rounded-full animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.3em] font-semibold text-acid-green uppercase">PROPRIETARY FRAMEWORK</span>
          </div>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight leading-tight mb-6">
            The Brand-to-Revenue <br className="md:hidden" /> Outcome Triangle™
          </h3>
          <p className="max-w-3xl mx-auto text-slate-400 font-light text-base md:text-lg leading-relaxed text-balance">
            Effective marketing and brand communication should not be judged only by visibility, impressions, content output or campaign activity. It must produce **three connected commercial outcomes**.
          </p>
        </div>

        {/* Dynamic Interactive Layout */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Interactive SVG Triangle diagram - takes 5/12 cols */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full aspect-square max-w-[420px] mx-auto">
            
            {/* Pulsing Aura */}
            <div 
              className="absolute inset-0 rounded-full blur-[100px] transition-all duration-700 pointer-events-none" 
              style={{ backgroundColor: active.glowColor }}
            />

            {/* Main Interactive Shape */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <svg viewBox="0 0 400 360" className="w-full h-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                {/* Embedded styles for beautiful styling */}
                <defs>
                  <linearGradient id="tri-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#AAFF00" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#FBBD1C" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Connecting Triangle lines with subtle stroke */}
                <polygon 
                  points="200,60 330,280 70,280" 
                  fill="url(#tri-glow)"
                  className="stroke-white/[0.08]" 
                  strokeWidth="2"
                />

                {/* Glowing flow animation overlay on edges */}
                <polygon 
                  points="200,60 330,280 70,280" 
                  fill="none"
                  className="stroke-acid-green/10 stroke-dash-draw animate-[dash_15s_linear_infinite]" 
                  strokeWidth="2.5"
                  strokeDasharray="12px, 8px"
                />

                {/* Inner Core Logo Mark Placeholder */}
                <g transform="translate(182, 185) scale(0.65)" className="opacity-40">
                  <path d="M5 25h32M10 18h22M15 11h12 M8 32h26" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round"/>
                </g>
                <text x="200" y="240" fill="white" opacity="0.3" fontSize="10" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
                  MEMORATE SYSTEM
                </text>

                {/* Interactive Hotspots / Node Points */}
                {/* Node 1: Reputation (Top) */}
                <g 
                  className="cursor-pointer group" 
                  onClick={() => setActiveOutcome('reputation')}
                >
                  <circle cx="200" cy="60" r="28" fill="#18181b" className={`stroke-2 transition-all ${activeOutcome === 'reputation' ? 'stroke-amber-400 shadow-2xl scale-110' : 'stroke-white/10 group-hover:stroke-amber-400'}`} />
                  <circle cx="200" cy="60" r="14" fill="#fbbf24" className="animate-pulse" />
                  <circle cx="200" cy="60" r="6" fill="#18181b" />
                  <text x="200" y="25" fill={activeOutcome === 'reputation' ? '#fbbf24' : '#94a3b8'} className="text-[10px] font-mono tracking-widest font-bold fill-current text-center" textAnchor="middle">01 // REPUTATION</text>
                </g>

                {/* Node 2: Demand Capture (Bottom Left) */}
                <g 
                  className="cursor-pointer group" 
                  onClick={() => setActiveOutcome('demand')}
                >
                  <circle cx="70" cy="280" r="28" fill="#18181b" className={`stroke-2 transition-all ${activeOutcome === 'demand' ? 'stroke-acid-green scale-110' : 'stroke-white/10 group-hover:stroke-acid-green'}`} />
                  <circle cx="70" cy="280" r="14" fill="#AAFF00" className="animate-pulse" />
                  <circle cx="70" cy="280" r="6" fill="#18181b" />
                  <text x="70" y="325" fill={activeOutcome === 'demand' ? '#AAFF00' : '#94a3b8'} className="text-[10px] font-mono tracking-widest font-bold fill-current" textAnchor="middle">02 // DEMAND</text>
                </g>

                {/* Node 3: Customer Experience & Loyalty (Bottom Right) */}
                <g 
                  className="cursor-pointer group" 
                  onClick={() => setActiveOutcome('loyalty')}
                >
                  <circle cx="330" cy="280" r="28" fill="#18181b" className={`stroke-2 transition-all ${activeOutcome === 'loyalty' ? 'stroke-violet-400 scale-110' : 'stroke-white/10 group-hover:stroke-violet-400'}`} />
                  <circle cx="330" cy="280" r="14" fill="#8B5CF6" className="animate-pulse" />
                  <circle cx="330" cy="280" r="6" fill="#18181b" />
                  <text x="330" y="325" fill={activeOutcome === 'loyalty' ? '#a78bfa' : '#94a3b8'} className="text-[10px] font-mono tracking-widest font-bold fill-current" textAnchor="middle">03 // LOYALTY</text>
                </g>
              </svg>
            </div>

            {/* Quick selectors for mobile */}
            <div className="flex gap-2 w-full mt-2 justify-center lg:hidden">
              {Object.values(outcomes).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActiveOutcome(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border transition-all ${
                    activeOutcome === opt.id 
                      ? 'bg-white/10 border-white/20 text-white' 
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {opt.shortTitle}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Card - takes 7/12 cols */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="p-8 md:p-12 bg-zinc-900/60 border border-white/10 rounded-3xl relative overflow-hidden shadow-2xl"
              >
                {/* Glowing corner indicator */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-${activeOutcome === 'demand' ? '[#AAFF00]' : activeOutcome === 'reputation' ? 'amber-400' : 'violet-500'}/10 blur-2xl pointer-events-none`} />

                {/* Counter & Headings */}
                <div className="flex items-center gap-4 mb-6">
                  <span className={`text-4xl font-mono font-bold bg-gradient-to-r ${active.gradient} bg-clip-text text-transparent`}>
                    {active.num}
                  </span>
                  <div className="w-[1px] h-10 bg-white/10" />
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase block">OUTCOME SEGMENT</span>
                    <h4 className="text-xl md:text-2xl font-display font-medium text-white">{active.title}</h4>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 pb-2">
                  <p className="text-[#AAFF00] font-medium text-sm md:text-base leading-relaxed mb-4">
                    {active.tagline}
                  </p>
                  <p className="text-slate-300 font-light text-sm md:text-base leading-relaxed mb-6">
                    {active.introduction}
                  </p>
                </div>

                {/* Sub-Interactive Audiences Context Switcher */}
                <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-6 mb-6">
                  <div className="flex gap-4 justify-start border-b border-white/5 pb-4 mb-4">
                    <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider flex items-center mr-auto">Audience Relevance:</span>
                    {(['sme', 'school', 'ngo'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAudienceTab(tab)}
                        className={`text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                          audienceTab === tab 
                            ? 'text-white font-bold border-b border-acid-green pb-1.5' 
                            : 'text-slate-500 hover:text-slate-300 pb-1.5'
                        }`}
                      >
                        {tab === 'sme' ? 'SME' : tab === 'school' ? 'Schools' : 'Impact Organizations'}
                      </button>
                    ))}
                  </div>

                  <p className="text-slate-300 text-xs md:text-sm leading-relaxed min-h-[3.5rem] flex items-center font-light italic">
                    "{active.audienceContext[audienceTab]}"
                  </p>
                </div>

                {/* Unspoken User Needs Grid */}
                <div className="space-y-4 mb-6">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Unspoken customer questions addressed:</span>
                  <div className="grid md:grid-cols-2 gap-3">
                    {active.unspokenQuestions.map((q, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
                        <span className="text-[9px] font-mono text-[#AAFF00] mt-0.5 font-bold">?</span>
                        <p className="text-xs text-slate-400 font-light italic leading-tight">"{q}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Memorate Deliverables Checklist */}
                <div className="pt-6 border-t border-white/5">
                  <span className="text-[10px] font-mono tracking-widest text-[#AAFF00] uppercase block mb-4">
                    {active.helpTextHeader}
                  </span>
                  <div className="grid md:grid-cols-2 gap-3">
                    {active.helpPoints.map((pt, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-4 h-4 text-acid-green/60 mt-1 flex-shrink-0" />
                        <span className="text-xs text-slate-350 leading-relaxed font-light">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

        {/* Why the Triangle Matters & Synthesis Box */}
        <div className="mt-16 p-8 md:p-12 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-acid-green/20 to-transparent" />
          <div className="max-w-4xl mx-auto">
            <h4 className="text-lg md:text-xl font-display font-bold text-white mb-6">
              Why the Triangle Matters as a Growth System
            </h4>
            <div className="grid md:grid-cols-3 gap-8 text-sm text-slate-400 font-light leading-relaxed">
              <div className="space-y-3">
                <div className="text-xs font-mono rgb-glow-text text-amber-500 uppercase">REPUTATION LIMIT</div>
                <p>If your brand reputation and strength are weak, your demand generation works twice as hard, buying expensive attention that consumers default to ignoring.</p>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-mono rgb-glow-text text-acid-green uppercase">DEMAND FLOW</div>
                <p>If your demand generation is weak, your enterprise remains widely trusted and liked but statically flat, unable to capture high-value strategic pipeline opportunities.</p>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-mono rgb-glow-text text-violet-400 uppercase">LOYALTY COMPILES</div>
                <p>If customer experience or follow-up is weak, your business suffers from a leaky funnel, spending capital repeatedly to buy replacement traffic instead of compounding organic referrals.</p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs text-slate-500 font-mono tracking-wider max-w-xl">
                When all three vertices of the Outcome Triangle align, marketing stops being temporary noise. It becomes a permanent, self-sustaining brand-to-revenue compounding system.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const el = document.getElementById('contact-lead-form');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-[#AAFF00] text-black font-display font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all hover:scale-105 cursor-pointer"
                >
                  Request System Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
