import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import memorateLogo from './memorate_logo.png';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Firebase core integration and custom admin modules
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { CommandPortalPage } from './components/CommandPortalPage';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { BrandToRevenueTriangle } from './components/BrandToRevenueTriangle';
import { MasterclassSection } from './components/MasterclassSection';
import { 
  ShieldCheck, 
  Cpu, 
  Brain, 
  Heart, 
  ArrowRight, 
  Download, 
  CheckCircle2, 
  Calendar,
  Clock,
  Mail,
  Linkedin,
  Instagram,
  Twitter,
  BookOpen,
  Zap,
  Target,
  Users,
  Compass,
  FileText,
  Send,
  Check,
  Minus,
  ChevronDown,
  Plus,
  Menu,
  X
} from 'lucide-react';

// --- Types ---
type Page = 'home' | 'about' | 'offers' | 'insight' | 'contact' | 'portal';

interface ValueProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}

// --- Components ---

const Logo = ({ className = "h-10", light = true }: { className?: string; light?: boolean }) => {
  // Translate height classes to perfect scaling measurements
  let tSize = "text-[22px]";
  let subSize = "text-[7.5px]";
  let oSize = "w-[23px] h-[23px]";
  let lineMargin = "my-0.5";

  if (className.includes("h-[30px]") || className.includes("md:h-[30px]")) {
    tSize = "max-md:text-[14px] md:text-[22px]";
    subSize = "max-md:text-[5px] md:text-[7.5px]";
    oSize = "max-md:w-[15px] max-md:h-[15px] md:w-[23px] md:h-[23px]";
    lineMargin = "my-0.5";
  } else if (className.includes("h-[33px]") || className.includes("h-8")) {
    tSize = "text-[18px]";
    subSize = "text-[6px]";
    oSize = "w-[19px] h-[19px]";
    lineMargin = "my-0.5";
  } else if (className.includes("h-12")) {
    tSize = "text-[26px]";
    subSize = "text-[8.5px]";
    oSize = "w-[26px] h-[26px]";
    lineMargin = "my-1";
  } else if (className.includes("h-16")) {
    tSize = "text-[34px]";
    subSize = "text-[11px]";
    oSize = "w-[33px] h-[33px]";
    lineMargin = "my-1.5";
  }

  const textColor = "text-white";
  const lineColor = "bg-white/20";
  const taglineColor = "text-[#AAFF00]";

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className} memorate-logo`}>
      {/* Word MEMORATE */}
      <div className={`flex items-center leading-none ${textColor}`}>
        {/* Flourished Main 'M' in Cinzel Decorative */}
        <span className={`${tSize} font-cinzel-deco font-bold tracking-tight -mr-[0.02em]`}>M</span>
        <span className={`${tSize} font-cinzel font-bold tracking-wide`}>E</span>
        <span className={`${tSize} font-cinzel font-bold tracking-wide ml-[0.02em]`}>M</span>
        
        {/* Stylized Sliced 'O' Graphic mimicking the brand logo */}
        <span className={`inline-flex items-center justify-center mx-[0.06em] relative ${oSize} flex-shrink-0`}>
          <svg viewBox="0 0 100 100" className="w-full h-full block">
            {/* Left side, dark green/olive, offset slightly left and down */}
            <g transform="translate(-3, 3)">
              <path d="M 50 15 A 35 35 0 0 0 50 85" fill="none" stroke="#628A1C" strokeWidth="2.5" opacity="0.3" />
              <path d="M 50 22 A 28 28 0 0 0 50 78" fill="none" stroke="#4B6F1C" strokeWidth="2.5" opacity="0.5" />
              <path d="M 50 25 A 25 25 0 0 0 50 75 Z" fill="#3D5A16" />
            </g>
            
            {/* Right side, bright neon acid-green, offset right and up */}
            <g transform="translate(3, -3)">
              <path d="M 50 25 A 25 25 0 0 1 50 75 Z" fill="#AAFF00" />
              <path d="M 50 22 A 28 28 0 0 1 50 78" fill="none" stroke="#AAFF00" strokeWidth="3" opacity="0.8" />
              <path d="M 50 15 A 35 35 0 0 1 50 85" fill="none" stroke="#AAFF00" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            </g>
          </svg>
        </span>
        
        <span className={`${tSize} font-cinzel font-bold tracking-wide`}>R</span>
        <span className={`${tSize} font-cinzel font-bold tracking-wide`}>A</span>
        <span className={`${tSize} font-cinzel font-bold tracking-wide`}>T</span>
        <span className={`${tSize} font-cinzel font-bold tracking-wide ml-[0.02em]`}>E</span>
      </div>
      
      {/* Decorative Line under MEMORATE */}
      <div className={`w-full h-[1px] ${lineColor} ${lineMargin} max-w-[98%]`} />
      
      {/* Tagline "For Brand Performance" */}
      <div className={`${subSize} font-sans uppercase tracking-[0.32em] font-medium text-center ${taglineColor}`}>
        For Brand Performance
      </div>
    </div>
  );
};

const LeadForm = ({ 
  title, 
  subtitle, 
  buttonText = "Verify Growth Alignment",
  compact = false,
  bait = false,
  defaultChallenge = ''
}: { 
  title: string; 
  subtitle: string; 
  buttonText?: string;
  compact?: boolean;
  bait?: boolean;
  defaultChallenge?: string;
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', challenge: defaultChallenge });

  useEffect(() => {
    if (defaultChallenge) {
      setFormData(prev => ({ ...prev, challenge: defaultChallenge }));
    }
  }, [defaultChallenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      return;
    }
    setLoading(true);
    
    const leadId = "lead_" + Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    const leadPayload = {
      id: leadId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || "",
      source: bait 
        ? "Schematic Request" 
        : "Consultation Form",
      challenge: formData.challenge || "General",
      timestamp
    };

    // Store in Firebase Firestore database in real-time (non-blocking to prevent offline hangs)
    setDoc(doc(db, 'leads', leadId), leadPayload).catch((firestoreErr) => {
      console.error('Firestore lead insertion failed:', firestoreErr);
      try {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `leads/${leadId}`);
      } catch (decoratedErr) {
        // Log details and keep flow going
      }
    });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      });
    } catch (err) {
      console.error('Lead submission to server failed:', err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 px-8 bg-zinc-950/50 border border-acid-green/20 rounded-3xl"
      >
        <div className="w-16 h-16 bg-acid-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-acid-green w-8 h-8" />
        </div>
        <h3 className="text-2xl font-display font-medium mb-4 italic">Transmission Received.</h3>
        <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs mx-auto">
          {bait 
            ? "Your Brand Audit Schematic is being prepared. Check your primary inbox in the next 120 seconds." 
            : "A lead strategist will be in contact within 48 hours to discuss your brand architecture."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className={`${compact ? '' : 'p-12 md:p-20 bg-zinc-950/40 border border-white/5 rounded-[2rem] overflow-hidden relative'}`}>
      {!compact && (
        <>
          <div className="absolute top-0 right-0 w-64 h-64 bg-acid-green/5 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 blur-[100px] pointer-events-none" />
        </>
      )}
      
      <div className="relative z-10">
        <div className="mb-10">
          <h3 className={`${compact ? 'text-2xl' : 'text-3xl md:text-5xl'} font-display font-bold mb-4 tracking-tight`}>{title}</h3>
          <p className={`${compact ? 'text-sm' : 'text-lg'} text-slate-400 font-light leading-relaxed`}>{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`${compact ? 'grid grid-cols-1 gap-3.5' : 'grid md:grid-cols-3 gap-4'}`}>
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-4">Full Name</label>
              <input 
                required 
                type="text" 
                placeholder="Austine Great" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-4">Work Email</label>
              <input 
                required 
                type="email" 
                placeholder="hello@company.ng" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-4">Phone Number</label>
              <input 
                required 
                type="tel" 
                placeholder="e.g. +234..." 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          
          <div className={`${compact ? 'grid grid-cols-1 gap-3.5' : 'grid md:grid-cols-2 gap-4'}`}>
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-4">Organisation Name</label>
              <input 
                required
                type="text" 
                placeholder="Memorate Agency Ltd" 
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all text-white placeholder:text-slate-600"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-4">Primary Challenge</label>
              <div className="relative">
                <select 
                  required 
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-full text-sm focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all text-white appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-zinc-950 text-slate-400">Select Primary Challenge</option>
                  <option value="salience" className="bg-zinc-950 text-white">Brand Alignment & Strategic Positioning</option>
                  <option value="acquisition" className="bg-zinc-950 text-white">Low Conversion & Lead Flow Disconnect</option>
                  <option value="operations" className="bg-zinc-950 text-white">CRM Setup & Marketing Automation Leak</option>
                  <option value="capability" className="bg-zinc-950 text-white">Team Strategic Autonomy & Execution Gaps</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-acid-green text-black font-display font-bold text-xs uppercase tracking-widest rounded-full hover:shadow-[0_0_30px_rgba(170,255,0,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-wait mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Synchronizing...
              </span>
            ) : (
              <>
                {buttonText} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        
        <p className="mt-6 text-[8px] font-mono text-slate-700 uppercase tracking-widest text-center">
          Zero Spam Policy // Narrative Integrity Assured
        </p>
      </div>
    </div>
  );
};

const ExitIntentPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(() => {
    try {
      return sessionStorage.getItem('memorate_exit_popup_shown') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (hasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        try {
          sessionStorage.setItem('memorate_exit_popup_shown', 'true');
        } catch (err) {
          // Silently fallback if sessionStorage is restricted/disabled
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-12 lg:p-24 backdrop-blur-3xl bg-black/80">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="absolute top-6 right-6 z-20">
              <button 
                onClick={() => setIsVisible(false)}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                id="exit-popup-close-btn"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col md:flex-row h-full">
              <div className="md:w-5/12 bg-zinc-900 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 overflow-hidden relative">
                <div className="relative z-10">
                   <div className="text-[9px] font-mono text-acid-green uppercase tracking-[0.4em] mb-4 md:mb-8">Exclusive Artifact</div>
                   <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4 md:mb-6 leading-tight">The Brand Audit Schematic</h3>
                   <p className="text-xs text-slate-400 font-light leading-relaxed">
                     A 40-page anatomical breakdown of brands that stay aligned. Download the framework we use to build legendary positioning.
                   </p>
                </div>
                <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
                   <div className="flex -space-x-2">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-7 h-7 rounded-full border-2 border-zinc-900 bg-zinc-800 overflow-hidden">
                         <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Memorate Business and Brand Leader Community Member Profile" referrerPolicy="no-referrer" />
                       </div>
                     ))}
                   </div>
                   <p className="text-[8px] font-mono text-slate-500 mt-2 uppercase tracking-widest">+1,240 founders joined this week</p>
                </div>
              </div>
              <div className="md:w-7/12 p-8 md:p-10">
                <LeadForm 
                  compact 
                  bait
                  title="Claim your schematic" 
                  subtitle="We'll send the PDF directly to your business inbox." 
                  buttonText="Request Download Link"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const MemorySketches = {
  NeuralNetwork: ({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.svg 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="10" stroke="var(--color-acid-green)" strokeWidth="1" className="animate-pulse" />
      <circle cx="150" cy="60" r="5" fill="white" fillOpacity="0.2" />
      <circle cx="50" cy="140" r="5" fill="white" fillOpacity="0.2" />
      <circle cx="160" cy="150" r="5" fill="var(--color-acid-green)" />
      <circle cx="40" cy="50" r="5" fill="var(--color-acid-green)" />
      
      <motion.path 
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 2, delay: delay + 0.5 }}
        d="M100 100 L150 60 M100 100 L50 140 M150 60 L160 150 M50 140 L40 50 M160 150 L100 100 M40 50 L100 100" 
        stroke="var(--color-acid-green)" 
        strokeWidth="0.5" 
        strokeDasharray="4 4"
      />
      <text x="115" y="115" fill="white" fontSize="8" className="font-mono opacity-20 uppercase tracking-widest">Connect</text>
    </motion.svg>
  ),
  MemoryArchive: ({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.svg 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="60" y="80" width="80" height="60" stroke="white" strokeWidth="1.5" opacity="0.3" />
      <path d="M60 80 L100 40 L140 80" stroke="var(--color-acid-green)" strokeWidth="2" strokeLinecap="round" />
      <motion.circle 
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", delay: delay + 0.8 }}
        cx="100" cy="100" r="8" fill="var(--color-acid-green)" 
      />
      <text x="70" y="160" fill="white" fontSize="8" className="font-mono opacity-20 uppercase tracking-widest">Store // Truth</text>
    </motion.svg>
  ),
  AtomicRecall: ({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.svg 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="100" cy="100" rx="80" ry="30" stroke="white" strokeWidth="0.5" opacity="0.1" transform="rotate(45 100 100)" />
      <ellipse cx="100" cy="100" rx="80" ry="30" stroke="white" strokeWidth="0.5" opacity="0.1" transform="rotate(-45 100 100)" />
      <motion.path 
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: delay + 0.3 }}
        d="M100 20 V180 M20 100 H180" 
        stroke="var(--color-acid-green)" 
        strokeWidth="0.5" 
        strokeDasharray="2 2"
      />
      <path d="M85 85 L115 115 M115 85 L85 115" stroke="white" strokeWidth="2" />
      <text x="110" y="40" fill="var(--color-acid-green)" fontSize="8" className="font-mono opacity-60 uppercase tracking-[.4em]">Recall</text>
    </motion.svg>
  ),
  DNA3D: ({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.svg 
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 100 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="dna-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <motion.path 
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 4, delay, ease: "easeInOut" }}
        d="M50 0 Q 100 100, 50 200 Q 0 300, 50 400 Q 100 500, 50 600 Q 0 700, 50 800"
        stroke="var(--color-acid-green)"
        strokeWidth="2"
        strokeOpacity="0.4"
        style={{ filter: 'url(#dna-glow)' }}
      />
      <motion.path 
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 4, delay: delay + 0.3, ease: "easeInOut" }}
        d="M50 0 Q 0 100, 50 200 Q 100 300, 50 400 Q 0 500, 50 600 Q 100 700, 50 800"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.15"
      />
      {Array.from({ length: 25 }).map((_, i) => {
        const y = i * 32 + 10;
        const progress = (i * 0.8);
        const offset = Math.sin(progress) * 20;
        return (
          <g key={i}>
            <motion.line 
              initial={{ opacity: 0, x1: 50, x2: 50 }}
              whileInView={{ opacity: 1, x1: 50 + offset, x2: 50 - offset }}
              transition={{ delay: delay + 1.5 + (i * 0.08) }}
              y1={y} 
              y2={y} 
              stroke="var(--color-acid-green)" 
              strokeWidth="0.5" 
              strokeOpacity="0.2"
            />
            <motion.circle 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: delay + 1.8 + (i * 0.08) }}
              cx={50 + offset} cy={y} r="1.5" fill="var(--color-acid-green)" fillOpacity="0.5" 
            />
            <motion.circle 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: delay + 1.8 + (i * 0.08) }}
              cx={50 - offset} cy={y} r="1" fill="white" fillOpacity="0.3" 
            />
          </g>
        );
      })}
    </motion.svg>
  ),
  Hemispheres: ({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.svg 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, delay }}
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path 
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 2, delay: delay + 0.3 }}
        d="M100 40 C60 40 40 70 40 100 C40 130 60 160 100 160 L100 40" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.1"
      />
      <motion.path 
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 2, delay: delay + 0.5 }}
        d="M100 40 C140 40 160 70 160 100 C160 130 140 160 100 160" 
        stroke="var(--color-acid-green)" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path d="M100 60 H110 M100 90 H115 M100 120 H110" stroke="var(--color-acid-green)" strokeWidth="0.5" />
      <path d="M100 75 H90 M100 105 H85 M100 135 H90" stroke="white" strokeWidth="0.5" opacity="0.2" />
      <text x="100" y="180" textAnchor="middle" fill="white" fontSize="6" className="font-mono opacity-40 uppercase tracking-widest">Logic + Magic</text>
    </motion.svg>
  )
};

const CreativeDoodle = ({ type = "arrow", className, delay = 0, color = "currentColor" }: { type?: 'arrow' | 'squiggle' | 'underline' | 'circle' | 'mark'; className?: string; delay?: number; color?: string }) => {
  const variants = {
    arrow: "M10 190C50 150 150 150 190 10M190 10L170 20M190 10L180 30",
    squiggle: "M10 100C30 80 50 120 70 100C90 80 110 120 130 100C150 80 170 120 190 100",
    underline: "M10 20Q100 10 190 20M15 30Q100 25 185 35",
    circle: "M100 100m-90 0a90 90 0 1 0 180 0a90 90 0 1 0 -180 0",
    mark: "M10 10L30 30M30 10L10 30"
  };

  return (
    <motion.svg 
      initial={{ opacity: 0, pathLength: 0 }}
      whileInView={{ opacity: 1, pathLength: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: "easeInOut" }}
      className={`absolute pointer-events-none ${className}`}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d={variants[type]} 
        stroke={color} 
        strokeWidth={type === 'underline' ? '4' : '2'} 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="doodle-draw"
      />
      {type === 'arrow' && <circle cx="10" cy="190" r="4" fill={color} />}
    </motion.svg>
  );
};

const GlobalCreativeBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-black">
      {/* Dynamic Gradients that breathe */}
      <motion.div 
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          x: ['-5%', '5%', '-5%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-[120vw] h-[120vw] bg-accent/15 blur-[120px] rounded-full"
      />
      <motion.div 
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
          x: ['5%', '-5%', '5%'],
          y: ['5%', '-2%', '5%'],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[130vw] h-[130vw] bg-violet-brand/10 blur-[150px] rounded-full"
      />
      
      {/* Subtle Data-Grid Structure */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '120px 120px'
      }} />

      {/* Floating Micro-Particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div 
          key={i}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
          }}
          className="absolute w-px h-20 bg-acid-green/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
        />
      ))}

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none grain-texture mix-blend-overlay" />
    </div>
  );
};

const CaseStudyCard = ({ title, results, label, category, image }: { title: string; results: string; label: string; category: string; image: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group relative h-[500px] bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden"
  >
    <div className="absolute inset-0 grayscale opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-1000">
      <img src={image} alt={`Memorate Success Story Case Study: ${title}`} className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
    
    <div className="absolute inset-0 p-12 flex flex-col justify-end">
      <div className="text-[10px] font-mono text-acid-green uppercase tracking-[0.3em] mb-4">[{category}]</div>
      <h3 className="text-3xl font-display font-medium mb-8 leading-tight">{title}</h3>
      <div className="pt-8 border-t border-white/10 flex justify-between items-end">
        <div>
          <div className="text-3xl font-display font-black text-white mb-1">{results}</div>
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">{label}</div>
        </div>
        <button className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </motion.div>
);

const SectionHeading = ({ 
  eyebrow, 
  title, 
  subtitle, 
  light = false, 
  titleSize = "text-[39px] md:text-[87px]",
  isMainHeading = false,
  center = false
}: { 
  eyebrow: string; 
  title: React.ReactNode; 
  subtitle?: string; 
  light?: boolean; 
  titleSize?: string;
  isMainHeading?: boolean;
  center?: boolean;
}) => {
  const HeadingTag = isMainHeading ? motion.h1 : motion.h2;
  return (
    <div className={`mb-24 ${center ? 'text-center flex flex-col items-center' : ''}`}>
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        className={`flex items-center gap-3 mb-8 ${center ? 'justify-center mx-auto' : ''}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${light ? 'bg-white/40' : 'bg-accent'}`} />
        <span className={`text-[12px] font-mono tracking-[0.3em] uppercase ${light ? 'text-white/40' : 'text-slate-500'}`}>
          {eyebrow}
        </span>
      </motion.div>
      <HeadingTag 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className={`${titleSize} font-display font-medium mb-8 leading-[0.9] tracking-tighter text-white relative`}
      >
        <CreativeDoodle type="underline" className="bottom-0 left-0 w-full h-12 opacity-10" delay={0.5} />
        {title}
      </HeadingTag>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className={`text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed font-light ${center ? 'mx-auto text-center' : ''}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

const ValueCard = ({ title, desc, icon, color }: { title: string; desc: string; icon: React.ReactNode; color: string; key?: React.Key }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group relative p-12 glass-card hover:bg-white/[0.03] transition-all duration-700 h-full overflow-hidden"
  >
    <div className={`absolute -top-24 -right-24 w-48 h-48 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity rounded-full bg-accent`} />
    <div className="relative z-10">
      <div className="mb-12 text-white/40 group-hover:text-accent transition-colors duration-500 relative">
        <CreativeDoodle type="circle" className="-top-4 -left-4 w-16 h-16 opacity-0 group-hover:opacity-40 transition-opacity" color="var(--color-acid-green)" />
        {React.cloneElement(icon as React.ReactElement, { strokeWidth: 1.5, size: 32 })}
      </div>
      <h3 className="text-[10px] font-mono tracking-[0.2em] text-slate-500 mb-6 uppercase group-hover:text-white transition-colors">{title}</h3>
      <p className="text-xl font-display text-slate-300 leading-snug font-light group-hover:text-white transition-colors">{desc}</p>
    </div>
    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
       <ArrowRight className="w-5 h-5 text-accent -rotate-45" />
    </div>
  </motion.div>
);

const TestimonialsSection = () => {
  const testimonials = [
    {
      stars: 5,
      quote: "Working with Austine from Memorate transformed our brand narrative. Their cultural audit revealed insights we had completely overlooked, allowing us to connect with our audience on a much deeper level.",
      name: "Sarah Jenkins",
      role: "CMO at Velox Labs",
      avatar: "https://i.pravatar.cc/150?u=sarah"
    },
    {
      stars: 5,
      quote: "The depth of Memorate's strategy is unmatched. They didn't just give us a logo; they gave us a framework for our entire brand's evolution in an ever-shifting market.",
      name: "David Chen",
      role: "Founder of Arca",
      avatar: "https://i.pravatar.cc/150?u=david"
    },
    {
      stars: 5,
      quote: "Memorate's approach to narrative strategy is surgical. They cut through the noise of a crowded tech sector and helped us find a voice that finally feels authentic to our mission.",
      name: "Elena Rodriguez",
      role: "Product Lead at Synthetix",
      avatar: "https://i.pravatar.cc/150?u=elena"
    }
  ];

  return (
    <section className="py-24 bg-white/[0.02] border border-white/5 rounded-[3rem] my-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-acid-green/5 blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-brand/5 blur-[120px] -ml-48 -mb-48" />
      
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-6xl font-display font-medium text-white text-center mb-16 tracking-tight">
          Testimonials
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-10 flex flex-col justify-between hover:border-acid-green/30 transition-colors group"
            >
              <div>
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: t.stars }).map((_, starIdx) => (
                    <svg key={starIdx} className="w-4 h-4 text-acid-green stroke-current fill-acid-green" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/80 text-lg font-light leading-relaxed mb-10 italic">
                  "{t.quote}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-white/5 pt-8">
                <img src={t.avatar} alt={`Memorate Client Testimonial Portrait: ${t.name} - ${t.role}`} className="w-14 h-14 rounded-full object-cover border-2 border-white/10 group-hover:border-acid-green/40 transition-colors" />
                <div>
                  <div className="font-display font-bold text-white text-lg leading-tight">{t.name}</div>
                  <div className="text-sm text-slate-400">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center gap-3">
           <div className="w-2.5 h-2.5 rounded-full bg-acid-green" />
           <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
           <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
      </div>
    </section>
  );
};

const Navbar = ({ currentPage, setCurrentPage }: { currentPage: Page; setCurrentPage: (p: Page) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 25);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const storyChapters: { num: string; title: string; value: Page; sectionId?: string }[] = [
    { num: 'FRONTISPIECE', title: 'Home', value: 'home' },
    { num: 'ACT I', title: 'About Us', value: 'about' },
    { num: 'ACT II', title: 'Offers', value: 'offers' },
    { num: 'ACT III', title: 'Insight', value: 'insight' },
    { num: 'ACT IV', title: 'Contact', value: 'contact' },
  ];

  // Map each page to progress width
  const getProgressWidth = (p: Page) => {
    switch (p) {
      case 'home': return '20%';
      case 'about': return '40%';
      case 'offers': return '60%';
      case 'insight': return '80%';
      case 'contact': return '100%';
      case 'portal': return '100%';
      default: return '0%';
    }
  };

  const getChapterName = (p: Page) => {
    switch (p) {
      case 'home': return 'Frontispiece / Executive Model';
      case 'about': return 'Chapter I: Core Brand Doctrine';
      case 'offers': return 'Chapter II: The Growth Systems';
      case 'insight': return 'Chapter III: Strategic Chronicles';
      case 'contact': return 'Chapter IV: Live Synchronization';
      case 'portal': return 'Executive Command Console';
      default: return '';
    }
  };

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 no-print ${
      isScrolled ? 'py-3 border-b border-white/[0.08] bg-black/60 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_30px_rgba(0,0,0,0.4)]' : 'bg-transparent py-7'
    }`}>
      {/* Narrative Progress Line at the very top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5">
        <motion.div 
          className="h-full bg-accent shadow-[0_0_8px_#AAFF00]"
          initial={{ width: '0%' }}
          animate={{ width: getProgressWidth(currentPage) }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="group flex items-center gap-3 bg-transparent border-0 p-0 cursor-pointer"
          >
            <Logo className="max-md:h-[22px] md:h-[30px]" />
            <div className="hidden xl:flex flex-col text-left pl-3 border-l border-white/10 select-none">
              <span className="text-[7px] font-mono tracking-widest text-[#AAFF00] uppercase leading-none mb-1">BRAND ARCHITECTURE JOURNAL</span>
              <span className="text-[10px] font-serif italic text-white/50">{getChapterName(currentPage)}</span>
            </div>
          </button>
          
          {/* Main Book Reader Chapters link array */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3 bg-white/[0.02] border border-white/5 px-2 py-1.5 rounded-full">
            {storyChapters.map((item) => {
              const isActive = currentPage === item.value;
              return (
                <button
                  key={item.title}
                  onClick={() => setCurrentPage(item.value)}
                  className={`relative px-4 py-2.5 font-sans rounded-full transition-all group flex flex-col items-center justify-center bg-transparent border-0 cursor-pointer`}
                >
                  <span className={`text-[10px] font-mono uppercase tracking-[0.08em] block leading-none transition-all ${
                    isActive ? 'text-white font-medium scale-102' : 'text-slate-400 group-hover:text-white'
                  }`}>
                    {item.title}
                  </span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeChapterGlow" 
                      className="absolute inset-0 bg-white/[0.04] border border-white/10 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentPage('contact')}
              className="flex items-center gap-2 max-md:px-4 max-md:py-[7.5px] md:px-5 md:py-2.5 bg-gradient-to-r from-acid-green to-[#96e000] text-black font-display font-medium text-[9px] font-mono uppercase tracking-widest rounded-full hover:shadow-[0_0_25px_rgba(170,255,0,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all bg-transparent border-0 cursor-pointer"
            >
              Request Audit
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 text-white hover:text-acid-green transition-colors focus:outline-none bg-transparent border-0 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 animate-in fade-in duration-300" /> : <Menu className="w-5 h-5 animate-in fade-in duration-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile and Tablet Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-[#050505] border-t border-white/5 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-3">
              {storyChapters.map((item) => {
                const isActive = currentPage === item.value;
                return (
                  <button
                    key={item.title}
                    onClick={() => {
                      setCurrentPage(item.value);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`text-left py-3 px-4 rounded-xl transition-all border-0 flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-white/[0.04] text-[#AAFF00] font-medium' 
                        : 'bg-transparent text-slate-300 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-slate-500 tracking-wider w-16">{item.num}</span>
                      <span className="text-sm font-sans tracking-wide uppercase">{item.title}</span>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-0 opacity-100 text-[#AAFF00]' : '-translate-x-2 opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const TurnThePageWidget = ({ 
  currentPage, 
  setCurrentPage,
  light = false
}: { 
  currentPage: Page; 
  setCurrentPage: (p: Page) => void;
  light?: boolean;
}) => {
  const chapters: Record<Page, { num: string; title: string; next: Page; nextTitle: string; synopsis: string }> = {
    home: {
      num: "Frontispiece",
      title: "Title & Executive Paradigm",
      next: "about",
      nextTitle: "Act I // The Brand Doctrine",
      synopsis: "Step into the core worldview. Discover the uncomfortable truths of categorization, commercial alignment, and positioning architecture."
    },
    about: {
      num: "Act I",
      title: "The Brand Doctrine // Truth Excavated",
      next: "offers",
      nextTitle: "Act II // The Systems & Practices",
      synopsis: "Move from philosophy to action. Explore our signature commercial acceleration engine and specialized units."
    },
    offers: {
      num: "Act II",
      title: "The Strategic & Operational Systems",
      next: "insight",
      nextTitle: "Act III // The Chronicles & Proof",
      synopsis: "Observe the doctrine in the wild. Examine case studies, real results, and category mindshare victories."
    },
    insight: {
      num: "Act III",
      title: "The Strategic Chronicles // Verified Evidence",
      next: "contact",
      nextTitle: "Act IV // Direct Transmission",
      synopsis: "The analysis is done. Secure your own diagnostic session and establish a clean, direct growth connection."
    },
    contact: {
      num: "Act IV",
      title: "The Transmission // Live Synchronization",
      next: "home",
      nextTitle: "Frontispiece // Begin the Journey Anew",
      synopsis: "You have parsed the complete monograph. Return to the title page or begin a new strategic chapter."
    },
    portal: {
      num: "Command Rail",
      title: "Executive Intelligence & CRM Communications",
      next: "home",
      nextTitle: "Frontispiece // Return to Showcase",
      synopsis: "The command session is complete. Return to Mount Memorate's digital monograph."
    }
  };

  const current = chapters[currentPage];
  if (!current) return null;

  return (
    <div className={`py-24 border-t relative overflow-hidden no-print ${light ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-zinc-950/20'}`}>
      {!light && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#AAFF00]/5 blur-[120px] pointer-events-none" />}
      <div className="container mx-auto px-6 max-w-4xl text-center relative z-10 space-y-6">
        <span className="text-[10px] font-mono tracking-[0.4em] text-[#AAFF00] uppercase block">
          End of {current.num}
        </span>
        <h3 className={`text-3xl md:text-5xl font-serif italic tracking-tight leading-tight ${light ? 'text-slate-900' : 'text-white'}`}>
          “{current.title}”
        </h3>
        <p className={`font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed ${light ? 'text-slate-600' : 'text-slate-400'}`}>
          {current.synopsis}
        </p>
        
        <div className="pt-8 flex flex-col items-center justify-center space-y-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setCurrentPage(current.next);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-10 py-5 font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 transition-colors cursor-pointer border-0 ${light ? 'bg-slate-950 text-white hover:bg-black' : 'bg-white text-black hover:bg-[#AAFF00]'}`}
          >
            Turn the Page <ArrowRight className={`w-4 h-4 ${light ? 'text-white' : 'text-black'}`} />
          </motion.button>
          
          <span className={`text-[9px] font-mono uppercase tracking-widest block ${light ? 'text-slate-400' : 'text-slate-500'}`}>
            Next: {current.nextTitle}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Page Content Components ---

const BrandDiagnosticWidget = ({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    budget: '',
    blocker: '',
    competitors: ''
  });
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  const steps = [
    {
      id: 1,
      title: "What is your current monthly marketing & ad budget?",
      eyebrow: "Step 01: Resource Allocation",
      icon: <Zap className="w-5 h-5 text-acid-green" />,
      field: "budget" as const,
      options: [
        { label: "Under ₦500,000 / month", value: "under_500k", desc: "Early-stage or organic-first approach" },
        { label: "₦500,000 – ₦2,000,000 / month", value: "500k_2m", desc: "Moderate active campaigns or outsourced agency" },
        { label: "₦2,000,000 – ₦5,000,000 / month", value: "2m_5m", desc: "Multiple active channels, scaling sales teams" },
        { label: "Above ₦5,000,000 / month", value: "above_5m", desc: "Significant domestic or regional market capture" }
      ]
    },
    {
      id: 2,
      title: "What is your primary commercial or brand growth blocker?",
      eyebrow: "Step 02: Core Friction",
      icon: <Target className="w-5 h-5 text-acid-green" />,
      field: "blocker" as const,
      options: [
        { label: "Leaky Funnel", value: "leaky_funnel", desc: "We pay for reach but fail to convert into active inquiries" },
        { label: "Price Commoditization", value: "commoditization", desc: "Competitors copy our features, forcing price discounts" },
        { label: "Severe Invisibility", value: "invisibility", desc: "Excellent product or service, but the market lacks awareness" },
        { label: "Internal Story Crisis", value: "story_crisis", desc: "Our team and external agencies explain the brand differently" }
      ]
    },
    {
      id: 3,
      title: "How do your primary competitors speak in the market?",
      eyebrow: "Step 03: Market Contrast",
      icon: <Users className="w-5 h-5 text-acid-green" />,
      field: "competitors" as const,
      options: [
        { label: "They have massive ad budgets and dominate visibility", value: "high_visibility", desc: "Pure volume-based presence" },
        { label: "They position solely on low-cost & price undercutting", value: "low_price", desc: "Underpricing value to capture share" },
        { label: "They use cliché, boilerplate messaging templates", value: "boilerplate_cliche", desc: "Tons of generic branding, little true depth" },
        { label: "They have simple, punchy narratives that land instantly", value: "strong_story", desc: "Established category authority" }
      ]
    }
  ];

  const handleSelect = (field: 'budget' | 'blocker' | 'competitors', value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    if (step < 3) {
      setTimeout(() => {
        setStep(prev => prev + 1);
      }, 300);
    } else {
      setStep(4);
    }
  };

  const getFrictionScore = () => {
    let score = 50;
    if (answers.budget === 'under_500k') score += 15;
    if (answers.budget === 'above_5m' && answers.blocker === 'leaky_funnel') score += 25;
    if (answers.blocker === 'leaky_funnel') score += 10;
    if (answers.blocker === 'commoditization') score += 15;
    if (answers.blocker === 'story_crisis') score += 20;
    if (answers.competitors === 'strong_story') score += 10;
    return Math.min(score, 98);
  };

  const getFrictionDiagnosis = () => {
    if (answers.blocker === 'leaky_funnel') {
      return {
        type: "The Reach-Conversion Deficit",
        score: getFrictionScore(),
        status: "CRITICAL REVENUE BLOCK",
        text: "You are over-indexing on raw distribution but under-indexing on strategic distinctiveness. Your marketing budget is leaking because there is no emotional value hook inside the consumer's decision matrix. Stop buying ad platforms to patch a leaking story.",
        path: "A complete Memorate Narrative Audit to find and plug your brand conversion leak."
      };
    }
    if (answers.blocker === 'commoditization') {
      return {
        type: "The Price-Negotiation Trap",
        score: getFrictionScore(),
        status: "MARGIN DECAY ENGINES",
        text: "Without strategic narrative authority, the market forces you to compete only on item lists or pricing discounts. You need to transition from a functional feature pitch into a category-defining claim that protects premium margins.",
        path: "A premium repositioning framework engineered for sustained authority."
      };
    }
    if (answers.blocker === 'invisibility') {
      return {
        type: "The Hidden Excellence Paradox",
        score: getFrictionScore(),
        status: "GROWTH UNDERESTIMATION",
        text: "You have spent immense energy refining your products, but zero hours building the market's positioning of them. The market defaults to the loudest competitor, not the best. You must construct a Memorate framework that scales authority.",
        path: "Building a coherent, permanent narrative structure for the Nigerian market."
      };
    }
    return {
      type: "The Strategic Alignment Void",
      score: getFrictionScore(),
      status: "FRAGMENTED ENGAGEMENTS",
      text: "When internal leadership explains your brand story differently, your external creative agencies spin out fragmented campaigns. You are actively spending scale budget to confuse your prospects. A single unified brand schema is required.",
      path: "Developing an executive brand directory to align internal and agencies."
    };
  };

  const currentStepData = steps.find(s => s.id === step);

  const resetDiagnostic = () => {
    setStep(1);
    setAnswers({ budget: '', blocker: '', competitors: '' });
    setLeadSaved(false);
    setSubmittedEmail('');
    setSubmittedPhone('');
    setSubmittedName('');
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittedName || !submittedEmail || !submittedPhone) {
      return;
    }
    setIsSubmitting(true);
    
    const leadId = "lead_" + Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    const leadPayload = {
      id: leadId,
      name: submittedName,
      email: submittedEmail,
      phone: submittedPhone,
      company: "Friction Diagnostic Client",
      source: `Friction Diagnostic (Score: ${diagnosis.score}%)`,
      challenge: answers.blocker || "N/A",
      sector: answers.competitors || "N/A",
      notes: `Budget Segment: ${answers.budget || 'N/A'} | Friction Score: ${diagnosis.score}% | Category: ${diagnosis.type}`,
      timestamp
    };

    // Store in Firebase Firestore database in real-time (non-blocking to prevent offline hangs)
    setDoc(doc(db, 'leads', leadId), leadPayload).catch((firestoreErr) => {
      console.error('Firestore lead insertion failed:', firestoreErr);
      try {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `leads/${leadId}`);
      } catch (err) {}
    });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload)
      });
    } catch (err) {
      console.warn('Diagnostics lead sync failed:', err);
    } finally {
      setIsSubmitting(false);
      setLeadSaved(true);
    }
  };

  const diagnosis = getFrictionDiagnosis();

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-950/80 border border-white/5 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-acid-green/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-accent/5 blur-[100px] pointer-events-none" />

      {step <= 3 ? (
        <div>
          <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              {currentStepData?.eyebrow}
            </span>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-acid-green' : s < step ? 'w-3 bg-acid-green/40' : 'w-3 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex gap-4 items-start">
                <div className="p-3 bg-acid-green/10 rounded-xl mt-1">
                  {currentStepData?.icon}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight leading-tight">
                    {currentStepData?.title}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest">
                    Identify your organizational state to align standard metrics
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {currentStepData?.options.map((opt) => {
                  const isSelected = answers[currentStepData.field] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(currentStepData.field, opt.value)}
                      className={`text-left p-6 rounded-2xl border transition-all relative overflow-hidden group/opt ${
                        isSelected 
                          ? 'bg-acid-green/10 border-acid-green text-white shadow-[0_0_30px_rgba(170,255,0,0.1)]' 
                          : 'bg-zinc-900/50 border-white/5 hover:border-white/15 text-slate-300'
                      }`}
                    >
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                          <div className={`text-base font-display font-bold mb-2 transition-colors ${
                            isSelected ? 'text-acid-green' : 'text-white group-hover/opt:text-acid-green'
                          }`}>
                            {opt.label}
                          </div>
                          <p className="text-xs text-slate-400 font-light leading-relaxed">
                            {opt.desc}
                          </p>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-acid-green/5 blur-xl opacity-0 group-hover/opt:opacity-100 transition-opacity rounded-full pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
            {step > 1 ? (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="text-[10px] font-mono text-slate-500 hover:text-white uppercase tracking-wider flex items-center gap-2"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
              Recall Engine v1.0
            </span>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-10"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-start justify-between">
              <div className="flex-1 space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-mono px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest">
                    {diagnosis.status}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                    Audit complete
                  </span>
                </div>

                <h3 className="text-2xl md:text-4xl font-display font-bold text-white tracking-tight">
                  {diagnosis.type}
                </h3>

                <p className="text-base text-slate-300 font-light leading-relaxed">
                  {diagnosis.text}
                </p>

                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="text-[9px] font-mono text-acid-green uppercase tracking-widest mb-2">Recommended Solution Path</div>
                  <p className="text-xs text-white font-light">
                    {diagnosis.path}
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-[280px] bg-zinc-900 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden self-stretch">
                <div className="absolute inset-0 bg-radial-gradient from-acid-green/10 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 space-y-4 flex flex-col items-center justify-center h-full">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Friction Index</span>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36">
                      <circle 
                        className="text-slate-800"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="transparent"
                        r="58"
                        cx="72"
                        cy="72"
                      />
                      <circle 
                        className="text-acid-green transition-all duration-1000"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 58}`}
                        strokeDashoffset={`${2 * Math.PI * 58 * (1 - diagnosis.score / 100)}`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="58"
                        cx="72"
                        cy="72"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-display font-bold text-white tracking-widest">
                        {diagnosis.score}%
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">Friction</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-normal px-2">
                    High friction score makes organic message retention impossible.
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-10">
              {leadSaved ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 text-center max-w-xl mx-auto py-4"
                >
                  <div className="w-12 h-12 bg-acid-green/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="text-acid-green w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-display font-medium italic text-white">Diagnostic Transmission Perfect.</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    We have linked your <strong>{diagnosis.score}% Friction Index</strong> file to your profile. Click below to secure your complimentary Audit slot where we dissect these results live.
                  </p>
                  <button 
                    onClick={() => setCurrentPage('offers')}
                    className="w-full sm:w-auto px-10 py-4 bg-acid-green text-black font-display font-bold text-[10px] uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(170,255,0,0.3)] inline-flex justify-center items-center gap-2"
                  >
                    Select Audit Slot Now <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    <h4 className="text-lg font-display font-bold text-white tracking-tight">
                      Discuss these diagnostic results on a Memorate Audit call
                    </h4>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      Enter your details to sync your brand recall scorecard and schedule a high-fidelity 30-minute diagnostic audit directly with a strategist.
                    </p>
                  </div>

                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-3">Full Name</label>
                      <input 
                        required
                        type="text"
                        value={submittedName}
                        onChange={(e) => setSubmittedName(e.target.value)}
                        placeholder="Austine Great"
                        className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-full text-xs text-white focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-3">Email</label>
                        <input 
                          required
                          type="email"
                          value={submittedEmail}
                          onChange={(e) => setSubmittedEmail(e.target.value)}
                          placeholder="austine@domain.com"
                          className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-full text-xs text-white focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest pl-3">Phone</label>
                        <input 
                          required
                          type="tel"
                          value={submittedPhone}
                          onChange={(e) => setSubmittedPhone(e.target.value)}
                          placeholder="+234..."
                          className="w-full bg-white/5 border border-white/10 px-5 py-3 rounded-full text-xs text-white focus:outline-none focus:border-acid-green/40 focus:bg-white/[0.07] transition-all"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-3.5 bg-acid-green text-black font-display font-bold text-[10px] uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
                    >
                      {isSubmitting ? "Connecting scorecard..." : "Save Scorecard & Settle Audit"}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-slate-600 border-t border-white/5 pt-6">
              <button 
                onClick={resetDiagnostic}
                className="hover:text-white transition-colors"
              >
                ← Retake Diagnostic
              </button>
              <span>Audit Code: MEM-DIAG-{diagnosis.score}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

// --- Page Content Components ---

const HomePage = ({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeCohort, setActiveCohort] = useState<'sme' | 'school' | 'ngo'>('sme');
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev === 2 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const values: ValueProps[] = [
    { title: "TRUTH", desc: "We excavate, we don't invent. The strongest narratives are already inside your business roots.", icon: <ShieldCheck className="w-6 h-6" />, color: "bg-gold-brand" },
    { title: "RIGOUR", desc: "Brand performance is a science. Bottom-line growth is our only valid metric for evaluation and success.", icon: <Cpu className="w-6 h-6" />, color: "bg-slate-brand" },
    { title: "SYSTEMS", desc: "Architecture over accident. We build for deep commercial integration and operational alignment, ensuring your brand scales predictably.", icon: <Brain className="w-6 h-6" />, color: "bg-violet-brand" },
    { title: "EMPATHY", desc: "Understanding the wound before prescribing the cure. Business is fundamentally human.", icon: <Heart className="w-6 h-6" />, color: "bg-ember-brand" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="schematic-grid"
    >
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 md:pt-36 overflow-hidden">
        <div className="glow-violet top-1/4 left-1/4 w-[600px] h-[600px] animate-pulse-slow" />
        <div className="glow-accent bottom-1/4 right-1/4 w-[500px] h-[500px] animate-pulse-slow delay-1000" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="relative w-full max-w-5xl mx-auto min-h-[440px] md:min-h-[380px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeSlide === 0 ? (
                <motion.div
                  key="slide1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full text-center flex flex-col items-center justify-center p-2"
                >
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="h-[1px] w-6 bg-accent/20" />
                    <span className="text-[9px] font-mono tracking-[0.4em] text-slate-500 uppercase">Act I: The Commercial Mandate</span>
                    <div className="h-[1px] w-6 bg-accent/20" />
                  </div>
                  <h1 className="text-[22px] sm:text-[44px] md:text-[56px] lg:text-[62px] font-display font-bold leading-[1.1] tracking-tighter mb-12 relative block pb-4 text-balance px-4 md:px-8">
                    Your marketing is an investment. <br />
                    We make sure you can <br />
                    <span className="text-acid-green font-extrabold pb-2 inline-block">prove the return.</span>
                  </h1>
                  <p className="text-[13px] md:text-[15px] text-slate-400 max-w-4xl mx-auto mb-12 font-light leading-relaxed text-balance">
                    Stop throwing money at noisy activity that fails to produce commercial business value. Memorate builds accountable brand systems aligned strictly around qualified demand, enquiry rates, and bottom-line revenue.
                  </p>
                </motion.div>
              ) : activeSlide === 1 ? (
                <motion.div
                  key="slide2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full text-center flex flex-col items-center justify-center p-2"
                >
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="h-[1px] w-6 bg-[#AAFF00]/20" />
                    <span className="text-[9px] font-mono tracking-[0.4em] text-acid-green uppercase">Act II: The Integrated System</span>
                    <div className="h-[1px] w-6 bg-[#AAFF00]/20" />
                  </div>
                  <h2 className="text-[26px] sm:text-[48px] md:text-[56px] lg:text-[62px] font-display font-bold leading-[1.1] tracking-tighter mb-12 relative block pb-4 text-balance px-4 md:px-8">
                    Align your entire client path <br />
                    under a single, repeatable <br />
                    <span className="text-acid-green font-extrabold pb-2 inline-block">growth engine.</span>
                  </h2>
                  <p className="text-[13px] md:text-[15px] text-slate-400 max-w-4xl mx-auto mb-12 font-light leading-relaxed text-balance">
                    No scattered agencies, disconnected CRM sequences, or loose endpoints. From pristine positioning to automated nurture channels and sales pipeline operations, we deploy a unified company system.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="slide3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="w-full text-center flex flex-col items-center justify-center p-2"
                >
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="h-[1px] w-6 bg-gold-brand/20" />
                    <span className="text-[9px] font-mono tracking-[0.4em] text-gold-brand uppercase">Act III: The Unfair Moat</span>
                    <div className="h-[1px] w-6 bg-gold-brand/20" />
                  </div>
                  <h2 className="text-[26px] sm:text-[44px] md:text-[52px] lg:text-[58px] font-display font-bold leading-[1.1] tracking-tighter mb-12 relative block pb-4 text-balance px-4 md:px-8">
                    Build sustainable equity. <br />
                    And own your <span className="text-acid-green font-extrabold pb-2 inline-block">category.</span>
                  </h2>
                  <p className="text-[13px] md:text-[15px] text-slate-400 max-w-4xl mx-auto mb-12 font-light leading-relaxed text-balance">
                    When decision-makers seek solutions, your company must stand as the undisputed market authority. A unified revenue system is the ultimate competitive moat that ensures predictable and compounding business growth.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mt-6">
            <button 
              onClick={() => setCurrentPage('offers')}
              className="group px-10 py-5 bg-[#AAFF00] text-black font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(170,255,0,0.4)] cursor-pointer"
            >
              Request a Marketing Revenue Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => setCurrentPage('offers')}
              className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 font-display font-bold text-xs uppercase tracking-widest rounded-full hover:bg-white/10 transition-all text-white flex items-center gap-2 cursor-pointer"
            >
              Explore the Managed Office <span className="text-lg leading-none">→</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-16 pb-4">
            {[
              { id: 0, num: "I", label: "The Revenue Focus" },
              { id: 1, num: "II", label: "The Growth Engine" },
              { id: 2, num: "III", label: "The Brand Promise" }
            ].map((slide) => {
              const isSelected = activeSlide === slide.id;
              return (
                <button
                  key={slide.id}
                  onClick={() => setActiveSlide(slide.id)}
                  className={`px-5 py-2.5 rounded-xl border transition-all text-left flex items-center gap-3 backdrop-blur-sm cursor-pointer ${
                    isSelected 
                      ? 'bg-white/5 border-acid-green/45 shadow-[0_0_15px_rgba(170,255,0,0.05)]' 
                      : 'bg-transparent border-white/5 hover:border-white/15'
                  }`}
                  aria-label={`Go to section ${slide.label}`}
                >
                  <span className={`text-[9px] font-mono tracking-widest font-bold ${
                    isSelected ? 'text-acid-green' : 'text-slate-600'
                  }`}>
                    ACT {slide.num}
                  </span>
                  <div className="h-3 w-[1px] bg-white/10" />
                  <span className={`text-[10px] uppercase font-mono tracking-widest whitespace-nowrap ${
                    isSelected ? 'text-white font-medium' : 'text-slate-400'
                  }`}>
                    {slide.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-white/5 bg-zinc-950/40 relative overflow-hidden">
        <div className="flex gap-20 animate-marquee whitespace-nowrap">
           {Array(8).fill("Revenue · Systems · Positioning · Growth · Belief · Alignment ·").map((text, i) => (
             <span key={i} className="text-3xl font-display font-light text-acid-green opacity-40 uppercase tracking-widest">{text}</span>
           ))}
        </div>
      </section>



      <section id="diagnostic" className="py-40 border-t border-white/5 bg-zinc-950/25 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-20 text-center">
            <SectionHeading 
              eyebrow="Interactive Diagnostic" 
              title="Measure your Revenue System Health."
              titleSize="text-[35px] md:text-[83px]"
              subtitle="Take our rapid 60-second diagnostic to pinpoint where your marketing spend is leaking and how to fix it."
              center={true}
            />
          </div>
          <BrandDiagnosticWidget setCurrentPage={setCurrentPage} />
        </div>
      </section>

      <BrandToRevenueTriangle />

      <section id="services" className="py-40 bg-zinc-950/20">
        <div className="container mx-auto px-6">
          <SectionHeading 
            eyebrow="Three Ways to Work" 
            title={<>Flagship Pathways<sup className="text-[0.35em] ml-1 font-sans relative -top-[0.2em]">™</sup></>}
            subtitle="Memorate, as a brand-to-revenue growth company, presents three cohesive pathways built for predictable and sustainable outcomes."
          />
          <div className="grid lg:grid-cols-3 gap-0.5 bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
             {[
                { t: "DIAGNOSTIC PATH", h: "Marketing Revenue Audit", d: "A focused executive diagnostic for organisations asking whether their marketing and brand communication are truly supporting revenue, enquiries, conversion, enrolment, funding or stakeholder action.", p: "₦0 · Pro-Bono Executive Session", c: "Request an Audit", v: "01" },
                { t: "TRANSFORMATION PATH", h: "Memorate Boost™", d: "A premium transformation programme that helps organisations build the complete brand-to-revenue engine: positioning, alignment, capability, operations, automation and performance intelligence.", p: "Consolidated Custom Engagement", c: "Explore Memorate Boost", v: "02" },
                { t: "MANAGED OUTSOURCING", h: "Managed Brand & Marketing Office", d: "A paid retained partnership where Memorate manages the brand and marketing function your organisation needs, while your leadership stays focused on sales, partnerships and impact.", p: "Retained Partnership", c: "Request Needs Assessment", v: "03" },
             ].map((tier, i) => (
               <div key={i} className="p-16 bg-zinc-950 group border-l-4 border-transparent hover:border-acid-green transition-all rounded-3xl flex flex-col justify-between">
                  <div>
                     <div className="text-[10px] font-mono text-acid-green opacity-40 mb-12">[{tier.v}] {tier.t}</div>
                     <h3 className="text-3xl font-display font-bold mb-6">{tier.h}</h3>
                     <p className="text-slate-400 mb-12 font-light text-sm leading-relaxed">{tier.d}</p>
                  </div>
                  <div>
                     <p className="text-xs font-mono text-[#AAFF00] mb-8 uppercase tracking-widest">{tier.p}</p>
                     <button onClick={() => setCurrentPage('offers')} className="flex items-center gap-3 text-xs font-mono uppercase tracking-[.3em] group text-white">
                       {tier.c} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform text-[#AAFF00]" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      <section className="py-64 bg-obsidian relative overflow-hidden">
        <div className="fixed inset-0 opacity-10 pointer-events-none mix-blend-soft-light grain-texture" />
        <div className="container mx-auto px-6 relative z-10 text-center">
           <div className="text-accent mb-12 text-6xl opacity-40 font-serif">“</div>
           <p className="text-[23px] md:text-[41px] font-display font-light leading-relaxed max-w-5xl mx-auto mb-16 italic text-balance">
              "Your business is spending money on marketing and brand communication, and you're still not getting any real result. The issue is that your marketing and brand were never built to deliver measurable revenue-linked value."
           </p>
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-[1px] bg-accent/40" />
              <p className="text-sm font-mono uppercase tracking-widest text-slate-500">Austine Great, Head of Strategy.</p>
           </div>
        </div>
      </section>



      <section className="py-24 border-y border-white/5 bg-zinc-950/10 overflow-hidden relative">
        <div className="container mx-auto px-6 mb-16 text-center">
           <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-4">Market Presence</div>
           <h3 className="text-xl font-display text-white/40 font-light italic">Trusted by organisations across Nigeria's growth sectors</h3>
        </div>
        <div className="flex gap-16 animate-marquee whitespace-nowrap opacity-20 hover:opacity-40 transition-opacity">
           {Array(4).fill([
             "NORTHSTAR REALTY", "ZIRCON FINTECH", "ABUJA DESIGN HUB", "CORE LOGISTICS", "VERIDIAN HEALTH", "NEXUS EDUTECH", "SOLARIS ENERGY"
           ]).flat().map((name, i) => (
             <span key={i} className="text-2xl font-display font-bold tracking-tighter text-white lowercase italic">{name} ·</span>
           ))}
        </div>
      </section>

      <section id="built-for" className="py-40 bg-zinc-950/10 border-b border-white/5 relative">
        <div className="container mx-auto px-6">
          <SectionHeading 
            eyebrow="Client Pathways" 
            title="The kind of organizations we serve."
            subtitle=""
          />

          {/* Section Intro Copy Block */}
          <div className="mt-8 mb-20 grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 text-xl text-slate-300 font-light leading-relaxed">
              Every organisation wants stronger visibility, trust and growth. But most growth problems do not start with a lack of activity.
              <span className="block mt-4 text-lg text-[#AAFF00] font-medium italic border-l-2 border-acid-green pl-4">
                They start with poor design, lack of organic strategy, and poor execution.
              </span>
            </div>
            <div className="lg:col-span-7 text-sm text-slate-400 font-light leading-relaxed space-y-4">
              <p>
                Three things underscore effective marketing and brand communication: i. brand strength & reputation, ii. demand generation and capture, and iii. customer delight and loyalty. If your marketing and brand communication is not producing these outcomes, please pause and take our audit.
              </p>
              <p className="text-white font-medium">
                At Memorate, we help you identify where the gap is, what it is costing you and the right system to fix it.
              </p>
            </div>
          </div>

          {/* Interactive Cohort Selector */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                id: 'sme' as const,
                title: 'Growth-Stage SMEs',
                desc: 'For businesses that want stronger returns from their marketing, sales and growth efforts.',
                icon: <Cpu className="w-6 h-6" />,
              },
              {
                id: 'school' as const,
                title: 'Premium Private Schools',
                desc: 'For schools that need stronger parent trust, clearer differentiation and better enrolment conversion.',
                icon: <BookOpen className="w-6 h-6" />,
              },
              {
                id: 'ngo' as const,
                title: 'Impact-Driven Organisations',
                desc: 'For organisations that need their work to be clearly seen, trusted and supported.',
                icon: <Users className="w-6 h-6" />,
              }
            ].map((cohort) => {
              const isSelected = activeCohort === cohort.id;
              return (
                <button
                  key={cohort.id}
                  onClick={() => setActiveCohort(cohort.id)}
                  className={`p-8 rounded-[2rem] border text-left flex flex-col justify-between transition-all group cursor-pointer h-56 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-zinc-950 border-acid-green shadow-[0_0_40px_rgba(170,255,0,0.1)]' 
                      : 'bg-zinc-950/40 border-white/5 hover:border-white/10 hover:bg-zinc-950/60'
                  }`}
                  id={`cohort-btn-${cohort.id}`}
                >
                  {/* Glowing ambient background on active select */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-32 h-32 bg-acid-green/5 blur-[50px] pointer-events-none" />
                  )}
                  
                  <div className="flex justify-between items-start w-full">
                    <div className={`p-4 rounded-2xl ${
                      isSelected ? 'bg-acid-green/10 text-acid-green' : 'bg-white/5 text-slate-400 group-hover:text-white'
                    } transition-all`}>
                      {cohort.icon}
                    </div>
                    <span className={`text-[9px] font-mono tracking-widest ${
                      isSelected ? 'text-acid-green' : 'text-slate-600'
                    }`}>
                      {isSelected ? '[ ACTIVE PATHWAY ]' : '[ EXPLORE ]'}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h4 className={`text-xl font-display font-bold mb-2 transition-all ${
                      isSelected ? 'text-white' : 'text-slate-400 group-hover:text-white'
                    }`}>
                      {cohort.title}
                    </h4>
                    <p className="text-slate-500 text-xs font-light tracking-wide line-clamp-2">
                      {cohort.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Informational Portal with Smooth Motion Underneath */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {(() => {
                const data = {
                  sme: {
                    title: "Growth-Stage SMEs",
                    subheading: "For SMEs That Need Marketing to Work Harder for the Business",
                    introText: "You are already investing in marketing, sales, content, campaigns, partnerships or business development. But the question is no longer whether your business is visible.",
                    boldQuestion: "Is your marketing creating enough demand, trust, conversion and measurable business value?",
                    badge: "B2B, tech & high-value services",
                    marketContextTitle: "What the Market Now Demands",
                    marketContext: "Today’s customers have more options, more information and less patience. They compare quickly. They research before they speak to you. They ignore unclear offers. They trust slowly. And they choose the business that makes value easy to understand and action easy to take.\n\nThe SMEs that win are not always the ones shouting the loudest. They are the ones with clearer positioning, stronger offers, better follow-up and a marketing system that supports sales.",
                    frictionsTitle: "The Three Deep Pain Points We Solve",
                    frictions: [
                      {
                        t: "1. You are spending on marketing, but the business cannot clearly see the return.",
                        d: "Content is going out. Campaigns are running. Ads may be live. Events may be happening. But leadership still struggles to answer: Which activities are creating serious opportunities? Which campaigns are supporting revenue? What should we stop, improve or scale? Are we building demand or just staying active?\n\nWhen marketing cannot prove its value, it becomes difficult to defend, improve or scale."
                      },
                      {
                        t: "2. Leads are coming in, but too few are becoming customers.",
                        d: "The problem is not always lead generation. Sometimes, the real issue is conversion leakage. Prospects show interest, but they do not move forward. Sales conversations begin, but stall. Follow-up happens, but inconsistently. The offer is visible, but not compelling enough. Marketing and sales are active, but not aligned around one clear buyer journey.\n\nThis means the business may already have opportunities, but too many are slipping through the cracks."
                      },
                      {
                        t: "3. Growth depends too much on people, not a repeatable system.",
                        d: "Marketing works when the right person remembers what to do. Sales follow-up works when someone is available. Campaign quality changes depending on who is handling it.\n\nThat is risky. When growth depends too heavily on individual effort, the business keeps restarting instead of compounding. A staff exit, a busy month or a weak handoff can slow everything down."
                      }
                    ],
                    solutionsTitle: "How Memorate Helps",
                    solutions: [
                      { t: "Marketing Revenue Audit", d: "Diagnose what is working, what is leaking and what should be fixed first." },
                      { t: "Memorate Boost", d: "Strengthen your positioning, messaging, offers, campaign systems, team capability and growth operations." },
                      { t: "Managed Brand & Marketing Office", d: "Get ongoing strategic marketing and brand support without building a large internal department too early." }
                    ],
                    whyUs: "We do not treat SME marketing as content, design or visibility alone. We connect brand, marketing, sales and customer experience into one clearer growth system, so your business can build trust, create demand, improve conversion and make better decisions from the marketing you already invest in.",
                    cta: "Request an SME Marketing Revenue Audit",
                    challengeVal: "salience"
                  },
                  school: {
                    title: "Premium Private Schools",
                    subheading: "For Schools That Need Stronger Parent Trust and Better Enrolment Conversion",
                    introText: "Your school may already be doing good work. You may have strong teachers, good facilities, committed leadership and a real learning experience. But parents do not choose what they do not clearly understand.",
                    boldQuestion: "Are prospective parents seeing enough value, trust and confidence to choose your school?",
                    badge: "prestigious academies & colleges",
                    marketContextTitle: "What the Market Now Demands",
                    marketContext: "Parents now evaluate schools long before they make contact. They check your online presence. They compare your fees with your perceived value. They ask other parents. They look at your communication. They judge how organised, confident and trustworthy the school appears.\n\nThey are not only choosing a school. They are choosing safety, aspiration, identity, outcomes and a future for their child. The schools that grow consistently are the schools that build trust before, during and after the admissions conversation.",
                    frictionsTitle: "The Three Deep Pain Points We Solve",
                    frictions: [
                      {
                        t: "1. Parents enquire, visit or show interest, but do not enrol.",
                        d: "This is one of the most frustrating school growth problems. The school is getting attention, but attention is not becoming admission. Parents ask questions, visit the school or request fees, but many do not return.\n\nOften, the problem is not that the school is poor. The problem is that the admissions journey has not been designed to build enough confidence, urgency and trust."
                      },
                      {
                        t: "2. Your school’s real value is not clearly understood.",
                        d: "You may know what makes your school special, but parents may not be seeing it clearly enough. Strong programmes, quality teachers, good facilities, safety standards, leadership values and learning outcomes can become invisible if they are not communicated properly.\n\nWhen your difference is unclear, parents compare you mainly by fees, location or surface-level impressions."
                      },
                      {
                        t: "3. Admissions communication is inconsistent and reactive.",
                        d: "Many schools become visible during admissions season, then go quiet. Follow-up depends on who handled the enquiry. Messages vary across social media, brochures, front desk, school tours and WhatsApp conversations.\n\nThis weakens trust. Parents need a consistent journey that helps them move from curiosity to confidence to decision."
                      }
                    ],
                    solutionsTitle: "How Memorate Helps",
                    solutions: [
                      { t: "School Growth Diagnostic", d: "Review your positioning, parent perception, admissions communication and enrolment leakage." },
                      { t: "Premium School Growth Programme", d: "Strengthen your school message, differentiation, parent journey and enrolment campaigns." },
                      { t: "Managed School Brand & Admissions Desk", d: "Provide ongoing support for school communication, campaign planning and admissions growth." }
                    ],
                    whyUs: "We understand that school marketing is not just publicity. It is trust-building. We help schools communicate their value clearly, guide parents through the decision-making journey and create admissions experiences that make the school easier to understand, trust and choose.",
                    cta: "Request a School Growth Diagnostic",
                    challengeVal: "acquisition"
                  },
                  ngo: {
                    title: "Impact-Driven Organisations",
                    subheading: "For Organisations That Need Their Impact to Be Seen, Understood and Supported",
                    introText: "Your organisation may be doing meaningful work. Programmes may be running. Communities may be served. Reports may be written. Activities may be happening.",
                    boldQuestion: "Are stakeholders clearly seeing the value of your work and feeling confident enough to support it?",
                    badge: "Foundations, trusts & social action",
                    marketContextTitle: "What the Market Now Demands",
                    marketContext: "Donors, partners, communities and stakeholders now expect more than activity updates. They want clarity. They want evidence. They want credibility. They want to understand the outcome, the people affected, the scale of the problem and why your organisation deserves continued support.\n\nImpact that is not clearly communicated can be underestimated, underfunded or forgotten. The organisations that attract stronger support are the ones that make their work easy to understand, trust and believe in.",
                    frictionsTitle: "The Three Deep Pain Points We Solve",
                    frictions: [
                      {
                        t: "1. Your impact is greater than your visibility.",
                        d: "You are doing important work, but too few people understand the depth, value and relevance of that work. This creates a painful gap: the organisation is creating real change, but the visibility does not match the value being delivered.\n\nWhen this happens, the work may be respected internally but overlooked externally."
                      },
                      {
                        t: "2. Stakeholders struggle to connect emotionally and strategically with your story.",
                        d: "Reports may contain data. Proposals may describe activities. Campaigns may show events. But stakeholders still need a stronger story that connects the work to outcomes, people, evidence and future support.\n\nWithout a clear impact narrative, donors and partners may understand that work is happening, but not feel enough urgency or confidence to act."
                      },
                      {
                        t: "3. Communication is fragmented across channels and materials.",
                        d: "The website says one thing. Reports say another. Campaigns sound different. Presentations are not aligned. Programme updates feel disconnected.\n\nThis makes it harder to build a consistent reputation, earn trust and communicate the organisation’s value with confidence."
                      }
                    ],
                    solutionsTitle: "How Memorate Helps",
                    solutions: [
                      { t: "Impact Communication Diagnostic", d: "Identify message gaps, visibility weaknesses and stakeholder engagement challenges." },
                      { t: "Impact Visibility & Growth Programme", d: "Strengthen positioning, impact storytelling, campaign direction and communication systems." },
                      { t: "Managed Communication Support", d: "Provide ongoing strategic communication, stakeholder messaging and campaign support." }
                    ],
                    whyUs: "We do not manufacture impact stories. We help you communicate real impact more clearly. Our approach helps stakeholders understand what has been done, why it matters and why your organisation is worth trusting, supporting or partnering with.",
                    cta: "Request an Impact Communication Diagnostic",
                    challengeVal: "capability"
                  }
                }[activeCohort];

                return (
                  <motion.div
                    key={activeCohort}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="p-8 md:p-16 border border-white/5 bg-zinc-950 rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="grid lg:grid-cols-12 gap-12 items-start">
                      {/* Left Column: Summary and Market Demand */}
                      <div className="lg:col-span-5 space-y-8">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-mono uppercase bg-acid-green/10 text-acid-green px-3 py-1.5 rounded-full font-bold tracking-widest">
                              {data.badge}
                            </span>
                          </div>
                          <h3 className="text-3xl font-display font-medium text-white leading-tight">
                            {data.title}
                          </h3>
                          <p className="text-acid-green text-sm font-medium tracking-wide">
                            {data.subheading}
                          </p>
                          <p className="text-slate-300 text-sm font-light leading-relaxed">
                            {data.introText}
                          </p>
                          <div className="p-5 bg-white/[0.02] border-l-2 border-acid-green rounded-r-xl">
                            <p className="text-white text-xs md:text-sm font-medium leading-relaxed font-sans italic">
                              "{data.boldQuestion}"
                            </p>
                          </div>
                        </div>

                        {/* What the Market Now Demands */}
                        <div className="pt-6 border-t border-white/5 space-y-4">
                          <h4 className="text-xs font-mono uppercase tracking-widest text-[#AAFF00] font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-acid-green" />
                            {data.marketContextTitle}
                          </h4>
                          <div className="text-slate-400 text-xs font-light leading-relaxed space-y-3 whitespace-pre-line">
                            {data.marketContext}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Pain Points & Memorate Solutions */}
                      <div className="lg:col-span-7 space-y-8">
                        {/* The Three Deep Pain Points We Solve */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-mono uppercase tracking-widest text-rose-500 font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {data.frictionsTitle}
                          </h4>
                          
                          <div className="space-y-4">
                            {data.frictions.map((f, idx) => (
                              <div key={idx} className="p-6 bg-white/[0.01] border border-rose-950/15 rounded-2xl hover:border-rose-950/25 transition-colors space-y-2">
                                <h5 className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wide">
                                  {f.t}
                                </h5>
                                <p className="text-slate-400 text-xs font-light leading-relaxed whitespace-pre-line">
                                  {f.d}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* How Memorate Helps (The Solutions / Offers) */}
                        <div className="space-y-4 pt-6 border-t border-white/5">
                          <h4 className="text-xs font-mono uppercase tracking-widest text-acid-green font-semibold flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-acid-green" />
                            {data.solutionsTitle}
                          </h4>
                          
                          <div className="grid sm:grid-cols-3 gap-4">
                            {data.solutions.map((s, idx) => (
                              <div key={idx} className="p-5 bg-zinc-950/80 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-acid-green/20 transition-all">
                                <div className="space-y-2">
                                  <span className="text-[9px] font-mono text-acid-green/65 block">RECOMMENDED PATHWAY L{idx + 1}</span>
                                  <h5 className="text-xs font-display font-bold text-white uppercase tracking-wider">{s.t}</h5>
                                  <p className="text-slate-500 text-[11px] font-light leading-relaxed mt-1">{s.d}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Why Us Frame */}
                    <div className="mt-12 p-8 md:p-10 bg-white/[0.01] border border-white/5 rounded-[2rem] space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-[40px] pointer-events-none" />
                      <div className="flex items-center gap-2">
                        <span className="text-acid-green font-mono text-[9px] uppercase tracking-widest block font-bold">[ THE PARTNERSHIP CASE ]</span>
                      </div>
                      <h4 className="text-sm font-display font-semibold text-white uppercase tracking-wider">Why Memorate is the right partner</h4>
                      <p className="text-slate-300 text-xs md:text-sm font-light leading-relaxed font-sans max-w-5xl whitespace-pre-line">
                        {data.whyUs}
                      </p>
                    </div>

                    {/* Integrated CTA Button */}
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                      <p className="text-xs text-slate-500 font-light max-w-xl text-center md:text-left">
                        We build these solutions bespoke. Let us audit your positioning and give you an actionable narrative blueprint.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedChallenge(data.challengeVal);
                          setTimeout(() => {
                            const elem = document.getElementById('contact-lead-form');
                            if (elem) {
                              elem.scrollIntoView({ behavior: 'smooth' });
                              elem.classList.add('shadow-[0_0_50px_rgba(170,255,0,0.15)]');
                              setTimeout(() => elem.classList.remove('shadow-[0_0_50px_rgba(170,255,0,0.15)]'), 2500);
                            }
                          }, 100);
                        }}
                        className="w-full md:w-auto px-8 py-5 bg-acid-green text-black font-display font-semibold text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:scale-105 hover:shadow-[0_0_30px_rgba(170,255,0,0.4)] transition-all cursor-pointer"
                      >
                        {data.cta} <ArrowRight className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Elegant Closing Block: Not Sure Which Path? */}
          <div className="mt-24 border border-white/5 bg-zinc-950/40 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-acid-green/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/[0.01] blur-[80px] pointer-events-none" />
            
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[9px] font-mono text-acid-green uppercase bg-acid-green/10 px-3 py-1.5 rounded-full font-bold tracking-widest inline-block">
                  [ DIAGNOSIS ]
                </span>
                <h3 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
                  Not sure which path is right for your organisation?
                </h3>
                <div className="text-slate-450 font-light text-xs md:text-sm leading-relaxed space-y-4">
                  <p>
                    Most growth problems look different on the surface, but they often come from the same root issues: unclear positioning, weak communication, poor conversion, inconsistent execution or value that is not being properly captured.
                  </p>
                  <p>
                    You do not need to guess where the problem is. Start with diagnosis.
                  </p>
                  <p className="text-white font-medium">
                    We will help you identify what is working, what is leaking and what your organisation needs next — whether that is a marketing audit, school growth diagnostic, impact communication review, full transformation programme or managed brand and marketing support.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-4 w-full">
                <button
                  onClick={() => {
                    setSelectedChallenge('general');
                    setTimeout(() => {
                      const elem = document.getElementById('contact-lead-form');
                      if (elem) {
                        elem.scrollIntoView({ behavior: 'smooth' });
                        elem.classList.add('shadow-[0_0_50px_rgba(170,255,0,0.15)]');
                        setTimeout(() => elem.classList.remove('shadow-[0_0_50px_rgba(170,255,0,0.15)]'), 2500);
                      }
                    }, 100);
                  }}
                  className="w-full px-8 py-5 bg-acid-green text-black font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(170,255,0,0.3)] transition-all cursor-pointer"
                >
                  Request a Diagnostic <ArrowRight className="w-4 h-4 text-black" />
                </button>
                <button
                  onClick={() => {
                    setSelectedChallenge('general');
                    setTimeout(() => {
                      const elem = document.getElementById('contact-lead-form');
                      if (elem) {
                        elem.scrollIntoView({ behavior: 'smooth' });
                        elem.classList.add('shadow-[0_0_50px_rgba(170,255,0,0.15)]');
                        setTimeout(() => elem.classList.remove('shadow-[0_0_50px_rgba(170,255,0,0.15)]'), 2500);
                      }
                    }, 100);
                  }}
                  className="w-full px-8 py-5 border border-white/20 text-white font-display font-bold text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer"
                >
                  Speak With Memorate <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pb-4 text-[10px] font-mono text-slate-700 uppercase tracking-[.4em] text-center pt-12">
             Not For: Founders who want posts without strategy · Businesses not yet ready to commit to brand truth
          </div>
        </div>
      </section>

      <section id="proof" className="py-40 bg-zinc-950/20 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionHeading 
            eyebrow="Proof of Concept" 
            title="Narratives that converted into market share."
            subtitle="The ultimate test of brand value is not awareness; it is commercial preference. Here is the feedback from the people who built brands for the next decade with us."
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               {
                 name: "Tunde Adeniyi",
                 role: "CEO, Northstar Realty",
                 text: "We were spending ₦4m a month on social media ads and getting ignored. Memorate didn't change our budget; they changed our story. Our cost per lead dropped by 22% in the first 90 days because people actually remembered who we were when the ads stopped showing.",
                 tag: "Real Estate"
               },
               {
                 name: "Sarah Ibrahim",
                 role: "Director of Comms, Abuja Innovation Lab",
                 text: "Most agencies in Nigeria are obsessed with aesthetics. Memorate is obsessed with logic. They built a narrative structure for our donor relations that made our impact undeniable. The storytelling was so precise it felt like they'd been in our organisation for years.",
                 tag: "NGO / Tech"
               },
               {
                 name: "Chidi Okafor",
                 role: "Founder, Zircon Fintech",
                 text: "The transition from a 'startup' brand to a 'trusted financial institution' brand is difficult. The Memorat Audit showed us exactly where our messaging was leaking trust. We've seen a 15% increase in user retention since we deployed the new brand architecture.",
                 tag: "FinTech"
               }
             ].map((t, i) => (
               <div key={i} className="p-12 glass-card hover:bg-white/5 transition-all group relative">
                  <div className="text-accent mb-8 text-4xl opacity-20 font-serif">“</div>
                  <p className="text-slate-300 font-light leading-relaxed mb-10 group-hover:text-white transition-colors">
                    {t.text}
                  </p>
                  <div className="flex justify-between items-end border-t border-white/5 pt-10">
                     <div className="space-y-1">
                        <div className="font-display font-bold text-white uppercase text-xs tracking-wider">{t.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{t.role}</div>
                     </div>
                     <div className="text-[9px] font-mono p-1 px-2 border border-accent/20 text-accent rounded uppercase tracking-tighter">
                        {t.tag}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      <section className="py-60 border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-[39px] md:text-[87px] font-display font-medium mb-12 tracking-tighter leading-[0.9]">
            Your brand is either being <span className="text-gradient">built or being forgotten.</span> <br /> There is no neutral.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-20 font-light leading-relaxed">
            Every month without a coherent brand strategy is a month your competitors define your narrative for you.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-40">
              <button 
                onClick={() => setCurrentPage('offers')}
                className="group px-12 py-6 bg-acid-green text-black font-display font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all hover:scale-105 rounded-full"
              >
                Start with a Memorat Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="group px-12 py-6 border border-white/20 text-white font-display font-bold text-xs uppercase tracking-widest flex items-center gap-4 transition-all hover:bg-white hover:text-black rounded-full"
              >
                Or talk to us first <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
              </button>
          </div>

          <div id="contact-lead-form" className="text-left mb-16 transition-all duration-500 rounded-[2rem]">
            <LeadForm 
              defaultChallenge={selectedChallenge}
              title="Don't leave your brand to chance."
              subtitle="Start a conversation with a senior brand strategist about your specific commercial challenges."
            />
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const Breadcrumbs = ({ current, dark = false }: { current: string; dark?: boolean }) => (
  <div className={`container mx-auto px-6 mb-12 flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest ${dark ? 'text-slate-555' : 'text-slate-400'}`}>
    <span className="hover:text-accent cursor-pointer transition-colors">Home</span>
    <ArrowRight className="w-3 h-3" />
    <span className={dark ? "text-slate-900 font-semibold" : "text-white"}>{current}</span>
  </div>
);

const AboutPage = ({ 
  setCurrentPage, 
  onDownloadCharter 
}: { 
  setCurrentPage: (p: Page) => void; 
  onDownloadCharter?: () => void;
}) => {
  const [activeAboutSection, setActiveAboutSection] = useState<'challenge' | 'nomenclature' | 'principles' | 'process'>('challenge');
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'kpi' | 'narrative' | 'actions' | 'checklist'>('kpi');
  const [growthPriority, setGrowthPriority] = useState('Expand Category Positioning & Market Share');
  const [targetKPI, setTargetKPI] = useState('');
  const [careWeekness, setCareWeekness] = useState('Competitors with weaker delivery out-marketing us');
  const [checkedActions, setCheckedActions] = useState<Record<string, boolean>>({
    a1: true,
    a2: false,
    a3: false,
    a4: false,
  });

  const completedCount = Object.values(checkedActions).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  const diagnosticScenarios = [
    {
      id: 1,
      leakName: "The Impression Sieve",
      symptom: "You are paying for high marketing impressions and visibility activity, but receiving zero organic brand recall, qualified leads, or conversion.",
      recommendation: "Stop random visibility actions immediately. Your brand representation lacks a clear revenue anchor. You require our pro-bono Marketing Revenue Audit to diagnose where conversions are leaking.",
      cta: "Request Revenue Audit"
    },
    {
      id: 2,
      leakName: "Disparate Team Pitching",
      symptom: "Your internal sales leads, direct marketing managers, and management write and speak with wildly different promises and loose narratives.",
      recommendation: "You have structural pipeline drift. Acquisition costs will continue to rise. We help you anchor a cohesive story system and install capability playbooks via Memorate Boost™.",
      cta: "Review Memorate Boost"
    },
    {
      id: 3,
      leakName: "Stretched Internal Team",
      symptom: "Your campaign launches are inconsistent, strategy gets lost in execution, and you suffer from constant team capability or vendor turnover.",
      recommendation: "Your brand needs an engine that survives changes in staff or vendors. Access fully managed brand and marketing expertise through our Managed Brand & Marketing Office.",
      cta: "Explore the Managed Office"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-32 schematic-grid relative"
    >
      <div className="absolute top-0 right-10 w-96 h-96 opacity-10 animate-spin-slow">
         <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-acid-green">
            <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="30" />
            <path d="M50 10V30M50 70V90M10 50H30M70 50H90" />
         </svg>
      </div>
      
      <Breadcrumbs current="About" />
      
      <MemorySketches.DNA3D className="-left-20 top-0 w-32 h-[1200px] rotate-12 opacity-60" delay={0.5} />
      <MemorySketches.DNA3D className="-right-20 top-40 w-32 h-[1000px] -rotate-12 opacity-30" delay={1.2} />
      
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeading 
          eyebrow="About Memorate" 
          title="We were built around one uncomfortable truth."
          subtitle="Most businesses do not fail from a lack of marketing activity. They fall short because their brand structure lacks the rigorous commercial alignment required to translate attention into measurable revenue. Memorate was built to fix that."
          isMainHeading={true}
        />

        {/* --- DYNAMIC INTERACTIVE PLATFORM Blueprints to reduce heavy prose density --- */}
        <div className="mb-40 bg-zinc-900/20 border border-white/5 rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-96 h-96 bg-acid-green/5 blur-[120px] pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row gap-12 items-stretch">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/3 flex flex-col justify-between py-2 border-r border-white/5 pr-4 md:pr-8">
              <div className="space-y-4">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em] font-semibold mb-6">
                  Select Blueprint Pillar
                </div>
                {[
                  { id: 'challenge', num: '01', title: 'The Core Challenge', label: 'Market Friction Details' },
                  { id: 'nomenclature', num: '02', title: 'The Nomenclature', label: 'Naming & Origin Truth' },
                  { id: 'principles', num: '03', title: 'Core Doctrine & Team', label: 'Commercial Foundation' },
                  { id: 'process', num: '04', title: 'The Memorate Method', label: '4-Phase Technical Schematic' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveAboutSection(sec.id as any)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 border cursor-pointer bg-transparent flex items-start gap-4 ${
                      activeAboutSection === sec.id 
                        ? 'border-acid-green bg-acid-green/10 shadow-[0_0_15px_rgba(170,255,0,0.05)]' 
                        : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span className={`text-xs font-mono font-bold ${activeAboutSection === sec.id ? 'text-acid-green' : 'text-slate-500'}`}>
                      {sec.num}
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm font-display font-bold text-white">
                        {sec.title}
                      </div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                        {sec.label}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom Quote / Prompt info */}
              <div className="p-4 bg-zinc-950/50 border border-white/5 rounded-xl mt-8">
                <span className="text-[9px] font-mono text-slate-450 uppercase tracking-widest block mb-2">OPERATIONAL METADATA</span>
                <p className="text-[11px] font-light text-slate-400 leading-relaxed">
                  Toggle our core pillars to explore the structural solutions for Nigerian SME brand-to-revenue mechanics.
                </p>
              </div>
            </div>

            {/* Main Interactive Board Display */}
            <div className="lg:w-2/3 flex flex-col justify-between p-2">
              <AnimatePresence mode="wait">
                {activeAboutSection === 'challenge' && (
                  <motion.div
                    key="challenge"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-100 rounded-full text-[9px] font-mono uppercase tracking-wider">
                        01 // PRIMARY BOTTLENECK
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
                        Your team may be working, but is the work building growth?
                      </h3>
                      <p className="text-slate-405 text-sm font-light leading-relaxed max-w-xl">
                        Many organizations are producing content and investing in visibility. But leadership still cannot clearly connect activity to demand, conversion, or revenue action.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 pt-4">
                      {[
                        { 
                          num: "01", 
                          title: "Activity Without Revenue Clarity", 
                          desc: "Marketing produces work, but leadership cannot trace what generates qualified demand versus commercial noise." 
                        },
                        { 
                          num: "02", 
                          title: "Story / Sales Misalignment", 
                          desc: "The brand communications push one narrative and sales are left to close gaps manually. Conversion drops." 
                        },
                        { 
                          num: "03", 
                          title: "No Repeatable Systems", 
                          desc: "Operation depends on individual manual efforts. When talent or vendors leave, strategy leaves with them." 
                        }
                      ].map((card, i) => (
                        <div key={i} className="p-5 bg-zinc-950/60 border border-white/5 rounded-2xl relative group hover:border-white/10 transition-all">
                          <span className="text-xl font-mono font-extrabold text-slate-800 block mb-2">{card.num}</span>
                          <h4 className="text-xs font-display font-bold text-white mb-2">{card.title}</h4>
                          <p className="text-[11px] text-slate-400 font-light leading-relaxed">{card.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeAboutSection === 'nomenclature' && (
                  <motion.div
                    key="nomenclature"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <div className="inline-block px-3 py-1 bg-acid-green/15 border border-acid-green/20 text-acid-green rounded-full text-[9px] font-mono uppercase tracking-wider">
                        02 // HISTORICAL TERM
                      </div>
                      <h3 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
                        What is a Memorat?
                      </h3>
                      <p className="text-slate-450 italic font-mono text-[10px]">
                        [ memorare • Latin origin meaning "to bring to remembrance" ]
                      </p>
                    </div>

                    <div className="p-6 md:p-8 bg-zinc-950/60 border border-white/5 rounded-2xl hover:border-white/10 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-acid-green/5 blur-2xl rounded-full" />
                      <p className="text-base font-light text-slate-300 leading-relaxed mb-6">
                        A <strong>Memorat</strong> represents a brand truth so deeply embedded in the operational structures of a company that it permanently captures a market segment. Not cosmetic visibility. Pure commercial alignment.
                      </p>
                      <p className="text-sm font-light text-slate-450 leading-relaxed">
                        We named this company <strong>Memorate</strong> to build sustainable brand-to-revenue models that secure category leadership. We do not simply scale distributions; we construct authentic systems that drive compounded demand.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeAboutSection === 'principles' && (
                  <motion.div
                    key="principles"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="grid sm:grid-cols-2 gap-6"
                  >
                    <div className="p-6 bg-zinc-950/60 border border-white/5 rounded-2xl space-y-3 hover:border-white/10 transition-all">
                      <div className="text-[9px] font-mono text-acid-green uppercase tracking-wider font-bold">CORE LAW</div>
                      <h4 className="text-lg font-display font-bold text-white">Commercial performance is not luck. It is architecture.</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Brand strength is not a random byproduct of budget volume; it is a calculated structure. Posting more or spending more won't align your pipeline unless you own a deliberate, distinct category promise.
                      </p>
                    </div>

                    <div className="p-6 bg-zinc-950/60 border border-white/5 rounded-2xl space-y-3 hover:border-white/10 transition-all">
                      <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider font-bold">TEAM DNA</div>
                      <h4 className="text-lg font-display font-bold text-white">Strategists, storytellers, & marketing scientists.</h4>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">
                        Brand value is created at the intersection of psychology, narrative architecture, and clean performance execution. Our team merges these disciplines under a single commercial mandate.
                      </p>
                    </div>
                  </motion.div>
                )}

                {activeAboutSection === 'process' && (
                  <motion.div
                    key="process"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-acid-green uppercase tracking-widest">TECHNICAL DELIVERY MATRIX</span>
                      <h4 className="text-xl font-display font-medium text-white">The Memorate Method</h4>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { step: "01 // EXCAVATION", h: "Finding the Truth", d: "We dissect origins to extract the core brand DNA and market-shaping narrative." },
                        { step: "02 // ARCHITECTURE", h: "Building for Conversion", d: "Design signals and story frameworks optimized for retention and resonance." },
                        { step: "03 // DEPLOYMENT", h: "Brand Authority", d: "Ensure every kobo of active campaign spend builds compounded equity." },
                        { step: "04 // IMPACT", h: "Commercial Impact", d: "Formulate metrics and trace actual bottom-line revenue contributions." }
                      ].map((s, idx) => (
                        <div key={idx} className="p-4 bg-zinc-950/50 border border-white/5 rounded-xl space-y-2 hover:border-white/15 transition-all">
                          <div className="text-[9px] font-mono text-acid-green font-bold">{s.step}</div>
                          <h5 className="text-sm font-display font-bold text-white">{s.h}</h5>
                          <p className="text-[11px] text-slate-450 leading-snug">{s.d}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>

        <div className="mb-40">
           <BrandToRevenueTriangle />
        </div>

        {/* INTERACTIVE COMPONENT: First-time user Self Diagnostic & Conversion Driver */}
        <div className="mb-40 bg-zinc-950/40 border border-[#AAFF00]/15 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#AAFF00]/5 blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[10px] font-mono text-acid-green uppercase tracking-[0.4em] bg-acid-green/10 px-4 py-1.5 rounded-full border border-acid-green/20 inline-block mb-6">
                Interactive Audit Strategy Tool
              </span>
              <h3 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight mb-4">
                Verify Your Brand's Revenue Leakage
              </h3>
              <p className="text-slate-400 font-light text-base md:text-lg max-w-2xl mx-auto">
                First-time visitors can use this diagnostic widget to measure how much ad spend budget is currently escaping through positioning gaps.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {diagnosticScenarios.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedDiagnostic(idx)}
                  className={`p-6 text-left rounded-2xl border transition-all duration-300 bg-transparent cursor-pointer flex flex-col justify-between ${
                    selectedDiagnostic === idx 
                      ? 'border-[#AAFF00] bg-[#AAFF00]/5 shadow-[0_0_20px_rgba(170,255,0,0.1)]' 
                      : 'border-white/5 bg-zinc-950/60 hover:border-white/20'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block mb-3">0{idx + 1} // LEAK MODEL</span>
                    <h4 className="text-base md:text-lg font-display font-bold text-white mb-2">{item.leakName}</h4>
                    <p className="text-xs text-slate-450 leading-relaxed line-clamp-2 md:line-clamp-none">
                      {item.symptom}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5 w-full">
                    <span className="text-xs font-mono text-acid-green">Diagnose</span>
                    <ArrowRight className={`w-3.5 h-3.5 text-acid-green transition-transform ${selectedDiagnostic === idx ? 'translate-x-1' : ''}`} />
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedDiagnostic !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-8 bg-[#AAFF00]/5 border border-[#AAFF00]/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 text-[#AAFF00]">
                      <Brain className="w-4 h-4" />
                      <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Recommended Mitigation System</span>
                    </div>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed select-text">
                      {diagnosticScenarios[selectedDiagnostic].recommendation}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('contact')}
                    className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-acid-green to-[#96e000] text-black font-display font-medium text-[10px] font-mono uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] hover:scale-[1.03] active:scale-[0.98] transition-all bg-transparent border-0 cursor-pointer"
                  >
                    {diagnosticScenarios[selectedDiagnostic].cta} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* INTERACTIVE 90-DAY STRATEGY CHARTER SYSTEM */}
        <div className="mb-40 bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-acid-green/5 blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-[10px] font-mono text-acid-green uppercase tracking-[0.4em] bg-acid-green/10 px-4 py-1.5 rounded-full border border-acid-green/20 inline-block mb-6">
                Active Strategic Workbook
              </span>
              <h3 className="text-3xl md:text-5xl font-display font-medium text-white tracking-tight mb-4">
                The Interactive 90-Day Strategy Charter
              </h3>
              <p className="text-slate-400 font-light text-base md:text-lg max-w-2xl mx-auto">
                Formulate your custom 90-day positioning blueprint below. Gather your internal sales, brand, and communication leads to solve these commercial anchors.
              </p>
            </div>
            
            {/* Steps tabs / header */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-12 pb-4 border-b border-white/5">
              {[
                { id: 'kpi', num: '01', title: 'Business Outcome' },
                { id: 'narrative', num: '02', title: 'Category Narrative' },
                { id: 'actions', num: '03', title: 'Growth Priorities' },
                { id: 'checklist', num: '04', title: '90-Day Readiness' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer border-0 ${
                    activeTab === tab.id 
                      ? 'bg-[#AAFF00] text-black font-bold shadow-[0_4px_15px_rgba(170,255,0,0.2)]'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="opacity-60 mr-1.5">{tab.num}</span> {tab.title}
                </button>
              ))}
            </div>

            {/* Tab Contents with Framer Motion for premium transitions */}
            <div className="min-h-[300px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {activeTab === 'kpi' && (
                  <motion.div
                    key="kpi"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-8 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-acid-green uppercase tracking-widest">Pillar 01 // Commercial Anchor</span>
                      <h4 className="text-2xl font-display font-medium text-white">What commercial outcome must strategy solve in 90 days?</h4>
                      <p className="text-sm text-slate-450 leading-relaxed font-light">
                        Select your primary commercial priority. Every brand decision we draft must trace back here to have genuine value.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Choose Strategic Priority</label>
                        <select 
                          value={growthPriority} 
                          onChange={(e) => setGrowthPriority(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-acid-green font-sans text-sm"
                        >
                          <option value="Expand Category Positioning & Market Share">Expand Category Positioning & Market Share</option>
                          <option value="Fix Down-Funnel Conversion & Leads Gaps">Fix Down-Funnel Conversion & Leads Gaps</option>
                          <option value="Unify Disparate Internal Team Brand Pitching">Unify Disparate Internal Team Brand Pitching</option>
                          <option value="Bootstrap High-Value Story Engine & Trust Indicators">Bootstrap High-Value Story Engine & Trust Indicators</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Primary Goal Metric / Number</label>
                        <input 
                          type="text" 
                          placeholder="e.g., +45% organic recall, ₦150M in new CRM deals" 
                          value={targetKPI}
                          onChange={(e) => setTargetKPI(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-acid-green font-sans text-sm"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-start gap-4">
                      <ShieldCheck className="w-5 h-5 text-acid-green shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-white font-bold block">Memorability Alignment Guaranteed</span>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">
                          Focusing strictly on a single commercial outcome stops narrative drift and keeps your messaging razor-sharp.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'narrative' && (
                  <motion.div
                    key="narrative"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-8 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-acid-green uppercase tracking-widest">Pillar 02 // Strategic Positioning</span>
                      <h4 className="text-2xl font-display font-medium text-white">What current category friction holds you back?</h4>
                      <p className="text-sm text-slate-450 leading-relaxed font-light">
                        To establish clear market authority, we must identify which competitive friction threatens your brand's presence in your market.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        "Competitors with weaker delivery out-marketing us",
                        "High ad/PR spend with near-zero organic referrals",
                        "Internal team members pitching with disparate promises",
                        "Brand feels like a commodity instead of premium authority"
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCareWeekness(item)}
                          className={`w-full p-5 rounded-2xl border text-left bg-transparent transition-all cursor-pointer flex items-center justify-between ${
                            careWeekness === item 
                              ? 'border-[#AAFF00] bg-[#AAFF00]/5 text-white' 
                              : 'border-white/5 hover:border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="text-sm font-light">{item}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${careWeekness === item ? 'border-acid-green' : 'border-slate-600'}`}>
                            {careWeekness === item && <div className="w-2 h-2 rounded-full bg-acid-green" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'actions' && (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-8 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-acid-green uppercase tracking-widest">Pillar 03 // Live Mitigations</span>
                      <h4 className="text-2xl font-display font-medium text-white">Activate Immediate 90-Day Mitigations</h4>
                      <p className="text-sm text-slate-450 leading-relaxed font-light">
                        Select your critical alignment priorities to build into your 90-day execution roadmap.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { id: 'a1', title: 'Free Pro-Bono Category Audit', desc: 'Secure an audit slot to map positioning gaps.' },
                        { id: 'a2', title: 'Anchor Unified Brand Doctrine', desc: 'Create a singular promise blueprint to sync team execution.' },
                        { id: 'a3', title: 'Optimize Down-Funnel CRM Gaps', desc: 'Trace leads tracking and plug lost inbound communications.' },
                        { id: 'a4', title: 'Trace Strategic Positioning Model', desc: 'Detail high-value assets that change buyer comparison.' },
                      ].map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => setCheckedActions({
                            ...checkedActions,
                            [act.id]: !checkedActions[act.id]
                          })}
                          className={`p-6 rounded-2xl border text-left bg-transparent transition-all cursor-pointer space-y-2 ${
                            checkedActions[act.id] 
                              ? 'border-[#AAFF00] bg-[#AAFF00]/5 text-white' 
                              : 'border-white/5 hover:border-white/10 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-acid-green font-bold uppercase">Priority {act.id.toUpperCase()}</span>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${checkedActions[act.id] ? 'border-acid-green bg-[#AAFF00]/10 text-acid-green' : 'border-slate-700'}`}>
                              {checkedActions[act.id] && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                          <h5 className="font-display font-bold text-sm text-white">{act.title}</h5>
                          <p className="text-xs text-slate-400 font-light leading-relaxed">{act.desc}</p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'checklist' && (
                  <motion.div
                    key="checklist"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-8 text-left"
                  >
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-acid-green uppercase tracking-widest">Pillar 04 // Blueprint Calibration</span>
                      <h4 className="text-2xl font-display font-medium text-white">Strategic Readiness Output</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-light">
                        Below is your dynamic readiness configuration based on your inputs. Check the remaining blocks to complete the workbook outline.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Interactive Progress Meter */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-450 font-mono font-bold font-semibold">
                          <span>STRATEGIC BLUEPRINT READY</span>
                          <span className="text-acid-green font-bold">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-acid-green to-[#96e000]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Display summary context */}
                      <div className="grid md:grid-cols-2 gap-6 text-xs font-light text-slate-400 p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
                        <div className="space-y-1.5 pb-4 md:pb-0 md:border-r border-white/5 pr-4">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">01 TARGET OUTCOME</span>
                          <span className="text-sm font-semibold text-white block">{growthPriority}</span>
                          {targetKPI && <p className="text-xs text-acid-green font-mono">KPI expected: {targetKPI}</p>}
                        </div>
                        <div className="space-y-1.5 pl-0 md:pl-4">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">02 NARRATIVE LEAK IN FOCUS</span>
                          <span className="text-sm font-semibold text-white block">{careWeekness}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons triggers */}
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 w-full">
                <button 
                  type="button"
                  onClick={() => {
                    const nextIndex = activeTab === 'kpi' ? 'narrative' : activeTab === 'narrative' ? 'actions' : activeTab === 'actions' ? 'checklist' : 'kpi';
                    setActiveTab(nextIndex as any);
                  }}
                  className="w-full sm:w-auto px-6 py-4 bg-zinc-900 border border-white/10 hover:border-white/30 text-white font-mono text-[9.5px] uppercase tracking-wider rounded-xl transition-all cursor-pointer font-bold"
                >
                  {activeTab === 'checklist' ? 'Loop Form' : 'Next Strategic Step'}
                </button>

                {onDownloadCharter && (
                  <button
                    type="button"
                    onClick={onDownloadCharter}
                    className="w-full sm:w-auto px-8 py-4.5 bg-[#AAFF00] hover:bg-white text-black font-display font-bold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-3.5 shadow-[0_4px_25px_rgba(170,255,0,0.15)] hover:shadow-[0_8px_35px_rgba(170,255,0,0.3)] cursor-pointer border-0"
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download Physical 90-Day Charter Booklet (PDF)</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Built For Section from Home */}
        <div className="mb-40 relative">
          <SectionHeading 
            eyebrow="Built for" 
            title="Serious organisations. Serious brand thinking."
            subtitle="Dominant brands win markets, not through budget size, but by establishing unambiguous strategic positioning. We build that positioning through unified systems, not noisy volume."
          />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1 bg-white/5 border border-white/5 rounded-3xl overflow-hidden font-sans">
             {[
               { t: "SMEs in high-growth sectors", d: "Real estate · EdTech · FinTech · Health tech · Professional services · Retail & FMCG." },
               { t: "NGOs & mission-led organisations", d: "For groups doing vital work that goes unnoticed. Your mission deserves a story key to its real-world impact." },
               { t: "Growth-stage startups", d: "For backed companies with traction, scaling from early adopter appeal to mainstream market dominance." },
               { t: "Corporate marketing teams", d: "Teams needing elite narrative capacity, executive brand training, or a direct senior thinking partner." }
             ].map((group, i) => (
               <div key={i} className="p-12 bg-zinc-950 h-full">
                  <h4 className="text-xl font-display font-bold mb-6 text-white">{group.t}</h4>
                  <p className="text-slate-500 text-sm font-light leading-relaxed">{group.d}</p>
               </div>
             ))}
          </div>

          <div className="mt-4 pb-4 text-[10px] font-mono text-slate-700 uppercase tracking-[.4em] text-center pt-12">
             Not For: Founders who want posts without strategy · Businesses not yet ready to commit to brand truth
          </div>
        </div>

        {/* Founding Perspective with founder 1-on-1 Direct CTA */}

        <div className="mb-40 relative">
          <SectionHeading 
            eyebrow="Founding perspective" 
            title={<>Austine Great <br /> <span className="text-gradient font-serif italic">Founder & Head of Strategy</span></>}
          />
          <CreativeDoodle type="squiggle" className="top-0 right-0 w-[500px] h-[300px] opacity-[0.03] scale-150 rotate-180" delay={1} />
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-zinc-950/60 border border-white/5 p-12 md:p-16 rounded-3xl relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#AAFF00]/5 blur-[100px] pointer-events-none" />
               <div className="space-y-12 relative z-10">
                  <p className="text-2xl md:text-3xl text-white font-serif italic leading-relaxed text-center">
                     “I have spent over a decade watching organizations spend capital and yield minimal returns. The problem is almost never the product; it is the absolute absence of an aligned brand-to-revenue structure.”
                  </p>
                  <div className="h-[1px] w-24 bg-acid-green/40 mx-auto" />
                  <div className="grid md:grid-cols-2 gap-12 items-center text-slate-400 font-light leading-relaxed text-sm md:text-base">
                     <div>
                        Austine is a brand strategist and management consultant with a ₦2B+ commercial impact across 10+ years. He specializes in market share expansion for technology, real estate, and professional services.
                     </div>
                     <div className="flex gap-12 justify-center md:justify-end">
                        <div className="flex flex-col items-center md:items-end">
                           <span className="text-4xl md:text-5xl font-display font-medium text-white">10+</span>
                           <span className="text-[10px] font-mono uppercase tracking-widest text-[#AAFF00] mt-2">Years Exp.</span>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                           <span className="text-4xl md:text-5xl font-display font-medium text-white">₦2B+</span>
                           <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-2">Commercial Impact</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Direct High-Trust Executive CTA box targeting conversions */}
            <div className="p-8 md:p-12 bg-white/[0.02] border border-white/10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex gap-4 items-start max-w-2xl">
                <div className="w-12 h-12 rounded-xl bg-acid-green/10 flex items-center justify-center text-acid-green shrink-0 mt-1">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-display font-bold text-white mb-2">
                    Request a Direct 1-on-1 Diagnostic with Our Founder
                  </h4>
                  <p className="text-xs md:text-sm text-slate-450 leading-relaxed font-light">
                    Skip standard business development pitches. Qualified business owners or communications directors can request a focused 20-minute category diagnosis call directly with Austine.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('contact')}
                className="whitespace-nowrap px-6 py-3 bg-white hover:bg-[#AAFF00] hover:text-black text-black font-display font-medium text-[9px] font-mono uppercase tracking-widest rounded-lg transition-all scale-102 hover:scale-[1.04] active:scale-[0.98] border-0 cursor-pointer"
              >
                Schedule Direct Audit
              </button>
            </div>
          </div>
        </div>

        {/* Local Powerhouse (Abuja focus with high-impact key metrics) */}
        <div className="mb-40 grid lg:grid-cols-3 gap-12 items-center bg-zinc-950/30 p-12 md:p-16 border border-white/5 rounded-[3rem] relative overflow-hidden">
           <div className="lg:col-span-2 space-y-6">
              <div className="glow-violet top-0 right-0 w-64 h-64 opacity-10" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">NIGERIAN FEDERAL AREA FOOTPRINT</span>
              <h3 className="text-3xl md:text-5xl font-display font-medium text-white leading-[1.05] tracking-tight">
                Abuja is not where we happen to serve. <br className="hidden md:block" /> It is our operational anchor.
              </h3>
              <div className="max-w-2xl text-slate-400 font-light leading-relaxed text-base md:text-lg space-y-4">
                 <p>
                   While many agencies reside exclusively in coastal hubs, Abuja is the nexus of Nigeria's policy, structural expansion, and high-growth professional services.
                 </p>
                 <p>
                   We serve the capital's ambitious enterprise directors, impact organizations, and scaling SMEs seeking real category domination backed by raw proximity and robust growth systems.
                 </p>
              </div>
           </div>

           {/* Professional services stats panel for credibility */}
           <div className="space-y-4 border-l border-white/10 pl-0 lg:pl-12">
              <div className="py-4 border-b border-white/5 flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-mono">REGION COVERED</span>
                <span className="text-white font-display text-lg font-bold">FCT & Sub-Saharan</span>
              </div>
              <div className="py-4 border-b border-white/5 flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-mono">SECTORS SERVED</span>
                <span className="text-white font-display text-lg font-bold">Tech, Real Estate, Gov</span>
              </div>
              <div className="py-4 border-b border-white/5 flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-mono">NARRATIVE AUDITS</span>
                <span className="text-[#AAFF00] font-display text-lg font-bold">140+ Complete</span>
              </div>
              <div className="py-4 flex justify-between items-baseline">
                <span className="text-slate-500 text-xs font-mono">LOCAL RETENTION</span>
                <span className="text-white font-display text-lg font-bold">94.8% SLA Metric</span>
              </div>
           </div>
        </div>

        <TestimonialsSection />
      </div>
    </motion.div>
  );
};

const MatrixCell = ({ data }: { data: { type: string, val?: string, inc: boolean | string } }) => {
  if (data.type === 'check') {
    return (
      <div className="flex items-center justify-center h-full pt-1.5">
        <div className="w-5 h-5 rounded-full bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green animate-pulse-slow">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      </div>
    );
  }
  if (data.type === 'dash') {
    return (
      <div className="flex items-center justify-center h-full pt-1.5 text-slate-700">
        <Minus className="w-4 h-4" />
      </div>
    );
  }
  
  return (
    <div className="space-y-1 flex flex-col items-center justify-center">
      {data.inc === true && (
        <div className="w-5 h-5 rounded-full bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green mb-1.5">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}
      {data.inc === false && (
        <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-700 mb-1.5">
          <Minus className="w-3 h-3" />
        </div>
      )}
      <span className={`text-[11px] font-mono leading-relaxed max-w-[160px] inline-block ${
        data.inc === "neutral" 
          ? 'text-slate-300' 
          : data.inc === true 
            ? 'text-white' 
            : 'text-slate-500'
      }`}>
        {data.val}
      </span>
    </div>
  );
};

const VisualComparisonMatrix = ({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) => {
  const categories = [
    {
      name: "Discovery & Foundation",
      rows: [
        {
          label: "Brand Archaeology Session",
          desc: "Deep-dive extraction of origin stories, raw truths, identity DNA, and real cultural narratives.",
          audit: { type: "text", val: "1 intensive session", inc: true },
          engine: { type: "text", val: "Ongoing monthly syncs", inc: true },
          legend: { type: "text", val: "Complete exec workshops", inc: true }
        },
        {
          label: "Competitive Positioning Map",
          desc: "Mapping competitor messaging, finding white space to claim category distinctiveness.",
          audit: { type: "check", inc: true },
          engine: { type: "check", inc: true },
          legend: { type: "text", val: "Full industry map", inc: true }
        }
      ]
    },
    {
      name: "Narrative & Messaging Architecture",
      rows: [
        {
          label: "Core Message Framework",
          desc: "The core narrative structure: positioning pillars, value articulation, and commercial elevator pitch.",
          audit: { type: "text", val: "90-day blueprint matrix", inc: true },
          engine: { type: "text", val: "Evolving message cycles", inc: true },
          legend: { type: "text", val: "Master brand book system", inc: true }
        },
        {
          label: "Copywriting & Story Asset Kit",
          desc: "Ready-to-use narrative guides, boilerplate copy, social profile statements, and core statements.",
          audit: { type: "check", inc: true },
          engine: { type: "text", val: "Ongoing copy rotation", inc: true },
          legend: { type: "text", val: "Master copy assets guide", inc: true }
        }
      ]
    },
    {
      name: "Visuals & Brand Assets",
      rows: [
        {
          label: "Master Identity Refinement",
          desc: "Full typographic logo, custom styling guidelines, and refined corporate design components.",
          audit: { type: "text", val: "Creative audit only", inc: false },
          engine: { type: "text", val: "Ongoing creative assets", inc: true },
          legend: { type: "text", val: "Full visual redesign system", inc: true }
        },
        {
          label: "Brand Asset Deployment Support",
          desc: "Assisting internal design or external development teams with implementing the brand assets properly.",
          audit: { type: "text", val: "Brief guide document", inc: true },
          engine: { type: "check", inc: true },
          legend: { type: "text", val: "Direct implementation control", inc: true }
        }
      ]
    },
    {
      name: "Performance & Campaigns",
      rows: [
        {
          label: "Media Buying & Performance Retainer",
          desc: "Tactical administration of reach platforms, conversion funnels, and continuous test runs.",
          audit: { type: "dash", inc: false },
          engine: { type: "text", val: "Full performance agency", inc: true },
          legend: { type: "text", val: "12mo full campaign engine", inc: true }
        },
        {
          label: "Workflow & CRM Automation",
          desc: "Automatic database setups to organize leads, nurture prospects, and measure direct reach attribution.",
          audit: { type: "dash", inc: false },
          engine: { type: "text", val: "Core system flows", inc: true },
          legend: { type: "text", val: "Enterprise configurations", inc: true }
        }
      ]
    },
    {
      name: "Schedules & Engagement Terms",
      rows: [
        {
          label: "Turnaround / Engagement Cycle",
          desc: "Duration from first discovery workshop to final deliverable delivery.",
          audit: { type: "text", val: "4 – 6 Weeks", inc: "neutral" },
          engine: { type: "text", val: "Ongoing Retainer", inc: "neutral" },
          legend: { type: "text", val: "12-Month Partnership", inc: "neutral" }
        },
        {
          label: "Investment Range",
          desc: "Standard commercial budget tier (professional service fees).",
          audit: { type: "text", val: "₦500k – ₦1.5m", inc: "neutral" },
          engine: { type: "text", val: "₦800k – ₦2.5m / mo", inc: "neutral" },
          legend: { type: "text", val: "From ₦5.0m", inc: "neutral" }
        }
      ]
    }
  ];

  return (
    <div className="mb-48 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <span className="text-[10px] font-mono text-acid-green uppercase tracking-[0.4em]">Strategic Transparency</span>
          <h3 className="text-3xl md:text-5xl font-display font-medium mt-3 tracking-tighter">
            Compare Engagement Models
          </h3>
          <p className="text-sm text-slate-400 font-light mt-2 max-w-xl">
            A precise, side-by-side inclusion matrix. Choose the exact level of narrative intervention and campaign execution.
          </p>
        </div>
        <div className="lg:hidden text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 bg-white/5 px-4 py-2 border border-white/5 rounded-full">
          <span>Swipe horizontally to compare details</span>
          <ArrowRight className="w-3" />
        </div>
      </div>

      <div className="w-full overflow-hidden border border-white/5 rounded-3xl bg-zinc-950/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[850px]">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/90 text-slate-400 text-[10px] font-mono uppercase tracking-widest">
                <th className="py-8 px-8 font-medium w-[30%]">Inclusions / Capacity Set</th>
                <th className="py-8 px-6 font-medium text-center w-[23%] bg-white/[0.01]">
                  <div className="space-y-1">
                    <div className="text-white text-xs font-bold font-display text-balance">REVENUE AUDIT</div>
                    <div className="text-[8px] opacity-60">Entry-Level Diagnostic</div>
                  </div>
                </th>
                <th className="py-8 px-6 font-medium text-center w-[23%] bg-acid-green/[0.02] border-x border-white/5">
                  <div className="space-y-1">
                    <div className="text-acid-green text-xs font-bold font-display text-balance">MEMORATE BOOST™</div>
                    <div className="text-[8px] opacity-70">Strategic Transformation</div>
                  </div>
                </th>
                <th className="py-8 px-6 font-medium text-center w-[23%]">
                  <div className="space-y-1">
                    <div className="text-white text-xs font-bold font-display text-balance">MANAGED OFFICE</div>
                    <div className="text-[8px] opacity-60">Retained Partnership</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, catIdx) => (
                <React.Fragment key={catIdx}>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <td colSpan={4} className="py-3 px-8 text-[10px] font-mono text-acid-green uppercase tracking-[0.2em] font-bold">
                      {cat.name}
                    </td>
                  </tr>
                  {cat.rows.map((row, rowIdx) => (
                    <tr 
                      key={rowIdx} 
                      className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group"
                    >
                      <td className="py-6 px-8 space-y-1.5 align-top">
                        <div className="text-sm font-display font-medium text-white group-hover:text-acid-green transition-colors">
                          {row.label}
                        </div>
                        <p className="text-xs text-slate-500 font-light leading-relaxed pr-6">
                          {row.desc}
                        </p>
                      </td>
                      
                      <td className="py-6 px-6 text-center align-top bg-white/[0.005]">
                        <MatrixCell data={row.audit} />
                      </td>

                      <td className="py-6 px-6 text-center align-top bg-acid-green/[0.005] border-x border-white/5">
                        <MatrixCell data={row.engine} />
                      </td>

                      <td className="py-6 px-6 text-center align-top">
                        <MatrixCell data={row.legend} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:px-12">
        <div className="space-y-1.5 text-center md:text-left">
          <h4 className="text-lg font-display font-bold text-white">Unsure which intervention solves your growth blocker?</h4>
          <p className="text-xs text-slate-400 font-light leading-relaxed max-w-2xl">
            We offer interactive brand health diagnosis and custom proposal scopes tailored exactly to the friction scores indicated in your model audit.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('contact')}
          className="px-8 py-4 bg-white hover:bg-acid-green hover:text-black hover:scale-105 transition-all text-black font-display font-bold text-[9px] uppercase tracking-widest rounded-full flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_20px_rgba(255,255,255,0.05)]"
        >
          Initiate Direct Discovery <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const OffersPage = ({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) => {
  const [showSpecialized, setShowSpecialized] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  const stages = [
    {
      num: "01",
      title: "Marketing Revenue Audit",
      question: "Is our marketing actually bringing in money?",
      tag: "Pro-Bono Entry Point",
      description: "We check whether your marketing is working, where growth is leaking, and identify priority opportunities before you commit to any spend.",
      highlights: ["Marketing ROI review", "Revenue leak diagnosis", "Priority opportunities map"],
      isProBono: true
    },
    {
      num: "02",
      title: "Alignment Sprint",
      question: "Are our brand, marketing, and sales aligned?",
      tag: "Deep Alignment",
      description: "Aligns your entire leadership, marketing, and sales teams around a single compelling commercial narrative and frictionless KPI structure.",
      highlights: ["Shared goals alignment", "Lead handoff protocol", "Conversion language system", "KPI structure tuning"]
    },
    {
      num: "03",
      title: "Team Capability Uplift",
      question: "Can our team execute with peak clarity?",
      tag: "Sustainable Uplift",
      description: "Equips your in-house marketing resource or agency with the exact tools, playbook knowledge, and workflows needed for high fidelity execution.",
      highlights: ["Gap assessment blueprint", "Strategic training workshops", "Workflow improvement", "90-day capability roadmap"]
    },
    {
      num: "04",
      title: "Operations Engine",
      question: "Are our marketing procedures repeatable?",
      tag: "Operations Engine",
      description: "Establishes a repeatable marketing machinery. We build custom-tailored strategy packs, operational resources, and GTM guides.",
      highlights: ["Messaging playbook", "Campaign runbooks", "Go-To-Market templates", "Reporting & analytic tools"]
    },
    {
      num: "05",
      title: "Commercial Scale with AI",
      question: "How do we scale customer engagement?",
      tag: "AI Automation",
      description: "Leverages cutting edge AI CRM systems to make customer nurturing, follow-ups, and active outreach fully automated and unbreakable.",
      highlights: ["CRM automation systems", "AI-powered workflows", "Customer engagement tracking", "Automated email/SMS sequences"]
    },
    {
      num: "06",
      title: "Performance Optimisation",
      question: "Is our engine compounding growth?",
      tag: "Data Intelligence",
      description: "Ensures your systems continue to compound by reviewing attribution pipelines, fine-tuning campaigns, and reporting transparently.",
      highlights: ["Custom growth dashboards", "Rigorous monthly reviews", "Attribution reporting", "Continuous optimization cycle"]
    }
  ];

  const maxIndex = Math.max(0, stages.length - itemsPerSlide);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerSlide(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [itemsPerSlide, maxIndex, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIdx = prev + itemsPerSlide;
      return nextIdx > maxIndex ? 0 : nextIdx;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const prevIdx = prev - itemsPerSlide;
      return prevIdx < 0 ? maxIndex : prevIdx;
    });
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIdx = prev + itemsPerSlide;
        return nextIdx > maxIndex ? 0 : nextIdx;
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [maxIndex, itemsPerSlide, isPaused]);

  const pages: number[] = [];
  for (let i = 0; i <= maxIndex; i += itemsPerSlide) {
    pages.push(i);
  }

  const services = [
    {
      letter: "A",
      title: "Brand Strategy & Positioning",
      tagline: "Define who you are and justify a commercial premium in the modern market.",
      points: [
        "Brand development",
        "Market positioning",
        "Brand messaging systems",
        "Customer perception strategy",
        "Communication strategy",
        "Positioning frameworks"
      ]
    },
    {
      letter: "B",
      title: "Marketing Strategy",
      tagline: "Build a structured commercial approach to grow revenue with absolute intention.",
      points: [
        "Marketing planning",
        "Campaign strategy",
        "Go-to-market strategy",
        "Product launch strategy",
        "Market penetration & expansion strategy",
        "Marketing audit and diagnosis"
      ]
    },
    {
      letter: "C",
      title: "Content & Storytelling",
      tagline: "Translate passive reach into lasting commercial engagement with story frameworks.",
      points: [
        "Content strategy",
        "Brand storytelling",
        "Social media campaigns",
        "Social media management",
        "Editorial frameworks"
      ]
    },
    {
      letter: "D",
      title: "Growth & Performance Marketing",
      tagline: "Convert market recognition into active, high-volume customer conversion pipelines.",
      points: [
        "Lead generation & Conversion",
        "Paid advertising",
        "Funnel strategy and design",
        "Analytics and reporting",
        "Marketing-to-sales alignment"
      ]
    },
    {
      letter: "E",
      title: "AI Marketing Automation",
      tagline: "Build persistent, fully-automated processes to follow up and convert.",
      points: [
        "CRM automation",
        "AI-powered marketing workflows",
        "Customer engagement systems",
        "Automated marketing sequences"
      ]
    },
    {
      letter: "F",
      title: "Creative & Brand Communications",
      tagline: "Differentiate with high-fidelity, polished, and unmistakable creative assets.",
      points: [
        "Creative direction",
        "Campaign visuals",
        "Corporate presentations",
        "Digital campaigns"
      ]
    },
    {
      letter: "G",
      title: "Training & Consulting",
      tagline: "Transfer capability, autonomy, and strategic tools to your internal teams.",
      points: [
        "Marketing workshops",
        "Brand training",
        "Executive strategy sessions",
        "Team capability development",
        "Corporate consulting & Retainership",
        "Commercial performance diagnostics"
      ]
    },
    {
      letter: "H",
      title: "Signature Offer",
      tagline: "The peak 6-stage transformational engine designed to build market leaders.",
      points: [
        "The Memorate Boost™"
      ],
      isSignature: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-32 schematic-grid relative overflow-hidden"
    >
      <Breadcrumbs current="Offers & Services" />
      <MemorySketches.Hemispheres className="top-20 right-0 w-80 h-80 opacity-30" delay={0.8} />
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeading 
          eyebrow="Solutions & Services" 
          title="What growth problem are you trying to solve?"
          subtitle="Memorate helps organisations solve the structural problems behind weak marketing performance: unclear positioning, inconsistent messaging, poor sales alignment, stretched internal teams, campaign inconsistency and a lack of commercial accountability."
          isMainHeading={true}
        />
        <div className="mb-24 p-8 md:p-12 bg-zinc-950 border border-white/5 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-acid-green/5 blur-[120px] pointer-events-none" />
          <div className="mb-8">
            <span className="text-[10px] font-mono text-acid-green uppercase tracking-[0.3em] bg-acid-green/10 px-3 py-1 rounded-full border border-acid-green/20">Problem-Led Diagnostic Pathways</span>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mt-4">
              Select what is currently limiting your growth
            </h3>
          </div>
          <div className="space-y-4">
            {[
              { 
                prob: "We are spending on marketing, but cannot prove the return.",
                expl: "If leadership cannot clearly see which activities produce qualified demand, conversion or business value, start with a diagnosis.",
                sol: "Marketing Revenue Audit",
                cta: "Request an Audit"
              },
              { 
                prob: "Our brand, marketing and sales are not working as one system.",
                expl: "If your market message, campaigns and sales conversations are pulling in different directions, the growth engine needs alignment.",
                sol: "Memorate Boost™",
                cta: "Explore Memorate Boost"
              },
              { 
                prob: "Our campaigns are inconsistent and do not compound.",
                expl: "If every campaign starts from scratch and depends on individual creativity, your team needs a repeatable operations engine.",
                sol: "Marketing Operations Engine",
                cta: "See Operations Engine"
              },
              { 
                prob: "We need serious marketing support but do not want a full internal department.",
                expl: "If hiring, managing and replacing internal marketing capability has become too costly or unstable, use a managed partnership.",
                sol: "Managed Brand & Marketing Office",
                cta: "Request Needs Assessment"
              },
              { 
                prob: "We need smarter follow-up, engagement and automation.",
                expl: "If leads, customers or prospects are not being nurtured consistently, the growth system needs automation technology and workflow support.",
                sol: "Commercial Scale with AI",
                cta: "Review AI Scaling"
              }
            ].map((route, idx) => (
              <div key={idx} className="p-6 bg-zinc-900/40 border border-white/5 rounded-2xl md:flex md:items-center md:justify-between gap-6 hover:border-acid-green/30 transition-all duration-300">
                <div className="md:max-w-xl">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">LIMITING FACTOR</span>
                  <p className="text-white font-display font-medium text-base mb-2">"{route.prob}"</p>
                  <p className="text-slate-400 font-light text-xs leading-relaxed">{route.expl}</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-2 shrink-0">
                  <span className="text-[9px] font-mono text-acid-green tracking-widest px-2.5 py-1 rounded bg-acid-green/10 border border-acid-green/15 uppercase font-medium">RECOMMENDED: {route.sol}</span>
                  <button 
                    onClick={() => setCurrentPage('contact')} 
                    className="w-full md:w-auto px-4 py-2 bg-white text-black hover:bg-acid-green font-mono font-bold text-[9px] uppercase tracking-wider rounded transition-all cursor-pointer border-0 mt-1"
                  >
                    {route.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Stage Grid Head with Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] font-mono text-[#AAFF00] uppercase tracking-[0.4em]">Integrated Pipeline</span>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mt-1">The 6-Stage Boost System</h3>
            <p className="text-sm text-slate-400 font-light mt-2 max-w-2xl">
              Six cohesive, interconnected areas engineered to transform your business from a forgotten voice into an unmistakable market leader.
            </p>
          </div>
          
          {/* Arrow Controls - DESKTOP ONLY */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-white/5 bg-zinc-950/40 flex items-center justify-center text-slate-400 hover:text-[#AAFF00] hover:border-[#AAFF00] hover:bg-[#AAFF00]/5 transition-all cursor-pointer group active:scale-95"
              aria-label="Previous Section"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-full border border-white/5 bg-zinc-950/40 flex items-center justify-center text-slate-400 hover:text-[#AAFF00] hover:border-[#AAFF00] hover:bg-[#AAFF00]/5 transition-all cursor-pointer group active:scale-95"
              aria-label="Next Section"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* 6-Stage Carousel Slider - DESKTOP ONLY */}
        <div 
          className="hidden md:block relative w-full overflow-hidden mb-6 py-4 cursor-default"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="-mx-3">
            <motion.div 
              className="flex"
              initial={false}
              animate={{ x: `${-(currentIndex * (100 / itemsPerSlide))}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            >
              {stages.map((stage, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 px-3 flex flex-col justify-between"
                  style={{ width: `${100 / itemsPerSlide}%` }}
                >
                  <div 
                    className={`p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between group relative h-full bg-zinc-950/40 border-white/5 hover:border-white/10 ${
                      stage.isProBono 
                        ? "bg-zinc-950/90 border-[#AAFF00]/40 shadow-[0_4px_30px_rgba(170,255,0,0.06)] scale-[0.99]" 
                        : "bg-zinc-950/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {stage.isProBono && (
                      <div className="absolute top-4 right-4 bg-[#AAFF00] text-black font-mono text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase select-none shadow-[0_0_15px_rgba(170,255,0,0.5)]">
                        Pro-Bono Taster
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-3xl font-mono font-bold text-slate-800 tracking-tighter group-hover:text-acid-green transition-colors">{stage.num}</span>
                        <span className="text-[9px] font-mono tracking-widest text-[#AAFF00] px-2 py-1 rounded bg-white/5 uppercase border border-white/5">{stage.tag}</span>
                      </div>
                      
                      <h4 className="text-xl font-display font-bold text-white mb-2">{stage.title}</h4>
                      <p className="text-xs text-[#AAFF00]/95 font-mono italic mb-4 leading-snug">Answers: "{stage.question}"</p>
                      <p className="text-slate-400 text-sm font-light leading-relaxed mb-6">{stage.description}</p>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-2">
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Inclusions & Scope:</span>
                      <ul className="space-y-2">
                        {stage.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="text-xs text-slate-400 font-light flex gap-2 items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF00]/70 flex-shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* 6-Stage Slider Pagination Dots - DESKTOP ONLY */}
        <div className="hidden md:flex items-center justify-center gap-3 mb-24">
          {pages.map((pIdx, i) => {
            const isActive = currentIndex === pIdx;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(pIdx)}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer border-0 p-0 ${
                  isActive ? 'w-8 bg-acid-green' : 'w-2 bg-white/10 hover:bg-white/30'
                }`}
                aria-label={`Go to slide page ${i + 1}`}
              />
            );
          })}
        </div>

        {/* 6-Stage Stacked List View - MOBILE & SMALL MONITOR ONLY */}
        <div className="block md:hidden space-y-6 mb-16">
          {stages.map((stage, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-3xl border transition-all duration-350 flex flex-col justify-between relative bg-zinc-950/40 border-white/5 ${
                stage.isProBono 
                  ? "border-[#AAFF00]/40 shadow-[0_4px_30px_rgba(170,255,0,0.06)]" 
                  : ""
              }`}
            >
              {stage.isProBono && (
                <div className="absolute top-4 right-4 bg-[#AAFF00] text-black font-mono text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase select-none shadow-[0_0_15px_rgba(170,255,0,0.4)]">
                  Pro-Bono Taster
                </div>
              )}
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-3xl font-mono font-bold text-slate-705 tracking-tighter">{stage.num}</span>
                  <span className="text-[9px] font-mono tracking-widest text-[#AAFF00] px-2 py-1 rounded bg-white/5 uppercase border border-white/5">{stage.tag}</span>
                </div>
                
                <h4 className="text-xl font-display font-bold text-white mb-2">{stage.title}</h4>
                <p className="text-xs text-[#AAFF00]/95 font-mono italic mb-4 leading-snug">Answers: "{stage.question}"</p>
                <p className="text-slate-400 text-sm font-light leading-relaxed mb-6">{stage.description}</p>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-2">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">Inclusions & Scope:</span>
                <ul className="space-y-2">
                  {stage.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="text-xs text-slate-400 font-light flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#AAFF00]/70 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Clear Action Comparison Block - Path 1 & Path 2 */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 items-stretch">
          {/* Path 1: Pro-Bono */}
          <div className="p-10 bg-zinc-950/80 border border-white/5 rounded-3xl flex flex-col justify-between relative overflow-hidden group hover:border-[#AAFF00]/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] pointer-events-none" />
            <div>
              <span className="text-[10px] font-mono text-[#AAFF00] uppercase tracking-[0.34em] block mb-2">Qualifying Offer</span>
              <h3 className="text-3xl font-display font-bold text-white mb-4">Stage 01: Free Audit</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">
                Begin with the pro-bono Marketing Revenue Audit before committing to any engagement. Absolutely zero charge, full transparency.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-acid-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Zero financial risk</h4>
                    <p className="text-xs text-slate-400 font-light">Evaluate our depth, logic, and capability at no cost.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-acid-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Revenue leak mapping</h4>
                    <p className="text-xs text-slate-400 font-light">Find exactly which touchpoints are dropping leads and losing conversions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-acid-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Immediate quick-wins</h4>
                    <p className="text-xs text-slate-400 font-light">Get custom priority recommendations to execute immediately.</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#AAFF00] uppercase tracking-wider bg-[#AAFF00]/10 border border-[#AAFF00]/25 rounded px-4 py-2.5 inline-block mb-10">
                Best for: SMEs & Founders ready for proof & clarity
              </p>
            </div>
            
            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full py-5 bg-[#AAFF00] text-black font-display font-bold text-xs uppercase tracking-widest rounded-full hover:bg-white hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(170,255,0,0.15)] cursor-pointer border-0"
            >
              Book Stage 01 Audit <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Path 2: Full Program */}
          <div className="p-10 bg-zinc-950/80 border border-white/5 rounded-3xl flex flex-col justify-between relative overflow-hidden group hover:border-acid-green/30 transition-all duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-acid-green/10 blur-[50px] pointer-events-none" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.34em] block mb-2">Premium Comprehensive Engine</span>
              <h3 className="text-3xl font-display font-bold text-white mb-4">Full Memorate Boost™</h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">
                The ultimate end-to-end alignment and capability system across brand, customer acquisition, tools, operations, and AI.
              </p>
              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-acid-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Complete 6-Stage Transformation</h4>
                    <p className="text-xs text-slate-400 font-light">Fully install every process, campaign structure, and automation pack.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-acid-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">AI CRM & Workflows Integrated</h4>
                    <p className="text-xs text-slate-400 font-light">Deploy AI automations for lead nurturing, follow-ups, and engagement sequences.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-acid-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono text-white font-bold uppercase tracking-wider">Long-Term compounding growth</h4>
                    <p className="text-xs text-slate-400 font-light">Develop lasting strategic capabilities and marketing autonomy for your team.</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider bg-white/5 border border-white/10 rounded px-4 py-2.5 inline-block mb-10">
                Best for: Scaleups, market expansion & strong systems
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('contact')}
              className="w-full py-5 bg-white text-black font-display font-bold text-xs uppercase tracking-widest rounded-full hover:bg-acid-green hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer border-0"
            >
              Get Custom Proposal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subtle toggle section for Independent/Specialized Practices A–G */}
        <div className="mt-28 border-t border-white/5 pt-20 flex flex-col items-center">
          <div className="max-w-xl text-center mb-8">
            <h4 className="text-base font-display font-bold text-white mb-2">Need a modular or targeted intervention?</h4>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              For advanced clients with mature internal teams, specific specialty areas can be commissioned independently as distinct, high-performance practices.
            </p>
          </div>

          <button
            onClick={() => setShowSpecialized(!showSpecialized)}
            className="px-10 py-5 bg-zinc-950 hover:bg-zinc-90 w-auto hover:border-acid-green text-white border border-white/10 font-display font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-300 flex items-center gap-3 shadow-[0_4px_35px_rgba(0,0,0,0.6)] cursor-pointer"
          >
            <span>{showSpecialized ? "Close Specialized Practices" : "Explore Independent Units [A–G]"}</span>
            <ChevronDown className={`w-4 h-4 text-slate-450 transition-transform duration-300 ${showSpecialized ? 'rotate-180 text-acid-green' : ''}`} />
          </button>
          
          <AnimatePresence>
            {showSpecialized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full overflow-hidden mt-12 space-y-16"
              >
                {/* Highlight Board using White/Light-Gray Editorial Design */}
                <div className="p-8 md:p-12 bg-white border border-zinc-200 rounded-3xl text-zinc-950 relative overflow-hidden shadow-[0_12px_45px_rgba(0,0,0,0.3)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 text-left">
                  <div className="space-y-3 max-w-3xl">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-[0.3em] bg-zinc-100 px-3 py-1 rounded border border-zinc-250 inline-block font-semibold">Specialized Capabilities</span>
                    <h3 className="text-3xl font-display font-bold text-zinc-905 tracking-tight leading-tight">
                      Independent customized practices built around your objectives.
                    </h3>
                    <p className="text-zinc-650 font-light leading-relaxed text-sm">
                      Whether you require targeted execution, a customized training curriculum, or specialized CRM mechanics, you can commission any of our Units (A through G) as an isolated, high-performance engagement model.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto flex-shrink-0">
                    <button 
                      onClick={() => setCurrentPage('contact')} 
                      className="px-8 py-4 bg-zinc-950 hover:bg-[#AAFF00] hover:text-black hover:scale-[1.03] text-white font-display font-bold text-[9px] uppercase tracking-widest rounded-full transition-all text-center border-0 cursor-pointer"
                    >
                      Brief An Expert Unit
                    </button>
                  </div>
                </div>

                {/* Independent Services Grid (Filtering H since it represents boost already shown) */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {services.filter(s => !s.isSignature).map((service, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#0E0E10] border border-white/5 rounded-3xl p-8 transition-all duration-300 hover:border-zinc-700 hover:bg-[#131316] hover:shadow-[0_4px_25px_rgba(0,0,0,0.6)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold w-7 h-7 bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded flex items-center justify-center">
                              {service.letter}
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase"> PRACTICE</span>
                          </div>
                        </div>

                        <h4 className="text-xl font-display font-bold text-white mb-2 leading-tight tracking-tight">
                          {service.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-light mb-6 leading-relaxed">
                          {service.tagline}
                        </p>

                        <ul className="space-y-2.5 mb-8 border-t border-white/5 pt-6">
                          {service.points.map((pt, ptIdx) => (
                            <li key={ptIdx} className="text-xs text-zinc-300 font-light tracking-wide flex items-start gap-2.5">
                              <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-white" />
                              <span className="leading-snug">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => setCurrentPage('contact')}
                        className="w-full py-3.5 bg-zinc-900 hover:bg-white hover:text-black border border-white/5 hover:border-white text-zinc-300 font-mono text-[9px] uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                      >
                        Inquire Unit {service.letter} <ArrowRight className="w-3 h-3 text-[#AAFF00]" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const InsightPage = ({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) => {
  const [newsName, setNewsName] = useState('');
  const [newsEmail, setNewsEmail] = useState('');
  const [newsPhone, setNewsPhone] = useState('');
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSubmitted, setNewsSubmitted] = useState(false);

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    setNewsSubmitting(true);
    
    const leadId = "lead_" + Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    const leadPayload = {
      id: leadId,
      name: newsName || "Newsletter Subscriber",
      email: newsEmail,
      phone: newsPhone || "Not specified",
      company: "Newsletter Subscription",
      source: "Memorate Perspective Newsletter Subscription",
      timestamp
    };

    // Store in Firebase Firestore database in real-time (non-blocking to prevent offline hangs)
    setDoc(doc(db, 'leads', leadId), leadPayload).catch((firestoreErr) => {
      console.error('Firestore lead insertion failed:', firestoreErr);
    });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload),
      });
    } catch (err) {
      console.error('Lead submission failed:', err);
    } finally {
      setNewsSubmitting(false);
      setNewsSubmitted(true);
      setNewsName('');
      setNewsEmail('');
      setNewsPhone('');
    }
  };

  const categories = [
    { t: "Resources & Tools", d: "Practical frameworks, brand audit templates, and system tools designed to help you measure and build commercial equity." },
    { t: "Webinars & Events", d: "Direct access to live sessions on market positioning, narrative architecture, and commercial brand evolution in Nigeria." },
    { t: "Ebooks & Whitepapers", d: "In-depth research and strategic guides on consumer psychology and the economics of brand-to-revenue alignment in the African market." },
    { t: "Perspectives & Trends", d: "Our latest thinking on market shifts, trending brand dynamics, and the intersection of brand truth and commercial growth." }
  ];

  const articles = [
    {
      date: "Resource",
      title: "The Folklore Test: Does your brand pass? (Downloadable Diagnostic)",
      category: "Resource",
      readTime: "Interactive Tool",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"
    },
    {
      date: "Whitepaper",
      title: "Why Nigerian SMEs are spending on marketing and being forgotten anyway",
      category: "Whitepaper",
      readTime: "Deep Dive",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800"
    },
    {
      date: "Perspective",
      title: "The Science of Customer Value: Why conversion is your only valid commercial metric",
      category: "Perspective",
      readTime: "Thinking",
      image: "https://images.unsplash.com/photo-1451187530220-af02ed6d790f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const faqs = [
    {
      id: "faq-1",
      question: "Isn't brand strategy just high-level grammar? What physical deliverables do we actually receive?",
      answer: "Every engagement is built around practical, battle-tested action. We do not dump 100-page theoretical slides that collect dust. Instead, you get sharp, functional assets: a finalized Positioning Ledger, operational core messaging kits, dynamic graphic design guidelines, and fully configured backend systems (such as high-converting email sequences and sales pipeline boards) tailored specifically to your target commercial objectives."
    },
    {
      id: "faq-2",
      question: "How does the MEMORATE Boost™ system integrate with our existing sales team or marketing agency?",
      answer: "MEMORATE Boost™ is designed to act as your brand's operational north star. Rather than replacing your current media buyers or content creators, it provides them with the clear narrative and architectural frameworks they need to succeed. We install the analytical structure, messaging parameters, and automated funnels, turning raw marketing spending into high-performing, compounding brand assets."
    },
    {
      id: "faq-3",
      question: "We run a business with tight margins and need immediate sales. Can we skip positioning and just run ads?",
      answer: "Skipping positioning to run immediate campaigns is why most advertising budgets in Nigeria yield minimal long-term value. Without distinctive, memorable positioning, you are buying highly expensive, short-lived attention. Once your campaign spend runs out, your sales flatline. MEMORATE Boost™ balances immediate customer acquisition with distinct positioning-building components so that every Naira spent compounds."
    },
    {
      id: "faq-4",
      question: "Does Memorate handle our daily social media execution and post uploads?",
      answer: "We focus on system architecture, design direction, and setup. In the MEMORATE Boost™ protocol, we build your core lead-capture flows, set up automated email triggers, and package your visual patterns. For daily post execution, we train your internal team using our strict brand guidelines or connect you with pre-vetted execution partners who know how to adhere to them."
    },
    {
      id: "faq-5",
      question: "Why is your methodology centered on 'System Alignment' and how can a brand measure it?",
      answer: "In a hyper-saturated market with endless daily noise, a unified system is your only reliable premium advantage. We track system health through precise metrics: customer referral loops, direct-to-website traffic ratios, pipeline velocity, lead conversion rates, and the steady decline of your customer acquisition costs (CAC) over time."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-32 schematic-grid"
    >
      <Breadcrumbs current="Insights" />
      <MemorySketches.MemoryArchive className="top-40 -left-10 w-48 h-48 opacity-10" delay={0.8} />
      <div className="container mx-auto px-6 relative">
        <SectionHeading 
          eyebrow="The Memorate perspective" 
          title="Commercial thinking for the organizations building Africa's next century."
          titleSize="text-[31px] md:text-[79px]"
          subtitle="We write about brand strategy, the science of consumer demand, and what it actually takes to build a brand that lasts in the Nigerian and African market. Thinking that has been tested in real commercial environments."
          isMainHeading={true}
        />
        
        <CreativeDoodle type="circle" className="-top-24 right-0 w-64 h-64 opacity-5" color="var(--color-accent)" delay={0.3} />

        <div className="grid md:grid-cols-2 gap-1 mb-48 border-l border-t border-white/5 relative rounded-3xl overflow-hidden">
          {categories.map((cat, i) => (
             <div key={i} className="p-12 border-r border-b border-white/5 bg-zinc-950/20 hover:bg-zinc-900/10 transition-colors">
                <h4 className="text-xl font-display font-medium mb-6 text-white">{cat.t}</h4>
                <p className="text-slate-500 font-light leading-relaxed text-sm">{cat.d}</p>
             </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-1 mb-48 rounded-3xl overflow-hidden">
          {articles.map((article, i) => (
            <div key={i} className="p-12 border border-white/5 bg-zinc-950/20 group cursor-pointer hover:bg-zinc-900/40 transition-colors">
              <div className="flex items-center gap-4 text-[8px] font-mono text-slate-600 uppercase tracking-widest mb-10">
                <span className="text-acid-green/40">[{article.category}]</span>
                <span>{article.readTime}</span>
              </div>
              <h4 className="text-2xl font-display font-medium mb-12 group-hover:text-acid-green transition-colors leading-snug">
                {article.title}
              </h4>
              <button className="text-[10px] font-mono text-white/40 group-hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest">
                Read Article <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="mb-48">
          <MasterclassSection />
        </div>

        <div className="p-20 bg-acid-green text-black relative overflow-hidden rounded-3xl">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-display font-black opacity-5 pointer-events-none uppercase tracking-tighter">Insights</div>
           <div className="relative z-10 max-w-3xl">
              <h3 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight tracking-tighter">The Memorate Perspective: one brand insight every two weeks.</h3>
              <p className="text-xl font-medium mb-12 opacity-70">
                For founders, marketers, and NGO leaders serious about building scalable brand systems. No generic marketing tips. No promotional emails. Only thinking worth your time.
              </p>
              {newsSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-black/10 border border-black/10 rounded-2xl"
                >
                  <p className="text-lg font-bold">Successfully Synchronized!</p>
                  <p className="text-xs opacity-75 mt-1">Thank you. You are now subscribed to the Memorate Perspective newsletter sequence.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleNewsSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Your Name (Optional)" 
                      value={newsName} 
                      onChange={(e) => setNewsName(e.target.value)} 
                      className="px-6 py-4 bg-black/10 border border-black/20 focus:outline-none placeholder:text-black/40 text-black font-medium rounded-full text-sm" 
                    />
                    <input 
                      required 
                      type="email" 
                      placeholder="Work Email" 
                      value={newsEmail} 
                      onChange={(e) => setNewsEmail(e.target.value)} 
                      className="px-6 py-4 bg-black/10 border border-black/20 focus:outline-none placeholder:text-black/40 text-black font-medium rounded-full text-sm" 
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number (Optional)" 
                      value={newsPhone} 
                      onChange={(e) => setNewsPhone(e.target.value)} 
                      className="px-6 py-4 bg-black/10 border border-black/20 focus:outline-none placeholder:text-black/40 text-black font-medium rounded-full text-sm" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={newsSubmitting}
                    className="w-full md:w-auto px-12 py-5 bg-black text-white font-display font-bold uppercase tracking-widest text-[10px] hover:bg-zinc-900 transition-colors rounded-full"
                  >
                    {newsSubmitting ? "Subscribing..." : "Join Newsletter"}
                  </button>
                </form>
              )}
           </div>
        </div>

        {/* FAQs Section */}
        <div className="mt-40 mb-20 border-t border-white/5 pt-24">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-acid-green shadow-[0_0_8px_#AAFF00]" />
                <span className="text-[10px] font-mono tracking-[0.34em] text-slate-500 uppercase font-bold">Inquiries & Clarifications</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-none">
                Frequently Asked Concerns.
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-light">
                Direct, honest responses to the real structural questions asked by Nigerian SME founders, directors, and commercial brand leaders. No generic agency copy.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div 
                    key={faq.id} 
                    className={`border border-white/5 rounded-2xl overflow-hidden bg-zinc-950/20 transition-all duration-300 ${isOpen ? 'bg-zinc-900/40 border-white/10' : 'hover:border-white/10'}`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full text-left p-8 flex items-center justify-between gap-6 cursor-pointer select-none bg-transparent border-0 group"
                    >
                      <span className="text-base font-display font-semibold text-white group-hover:text-acid-green transition-colors leading-snug pr-4">
                        {faq.question}
                      </span>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-45 bg-acid-green text-black' : 'group-hover:bg-white/10'}`}>
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 pt-0 border-t border-white/[0.03] text-sm text-slate-450 font-light leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ContactPage = ({ setCurrentPage }: { setCurrentPage: (p: Page) => void }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formStage, setFormStage] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactChallenge, setContactChallenge] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactSector, setContactSector] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactSource, setContactSource] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNextStage = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStage(2);
    setTimeout(() => {
      document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    
    const leadId = "lead_" + Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    const leadPayload = {
      id: leadId,
      name: contactName || "Anonymous Sender",
      email: contactEmail || "",
      phone: contactPhone || "",
      company: contactCompany || "None Specified",
      source: "Contact Form Request",
      challenge: contactChallenge || "General",
      role: contactRole || "",
      sector: contactSector || "",
      notes: contactNotes || "",
      findSource: contactSource || "",
      timestamp
    };

    // Store in Firebase Firestore database in real-time (non-blocking to prevent offline hangs)
    setDoc(doc(db, 'leads', leadId), leadPayload).catch((firestoreErr) => {
      console.error('Firestore contact lead insertion failed:', firestoreErr);
    });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload)
      });
    } catch (err) {
      console.warn('Server storage sync failed:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFormSubmit();
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormStage(1);
    setContactName('');
    setContactCompany('');
    setContactEmail('');
    setContactPhone('');
    setContactChallenge('');
    setContactRole('');
    setContactSector('');
    setContactNotes('');
    setContactSource('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pt-40 pb-32 bg-obsidian text-white min-h-screen relative z-10 font-sans"
    >
      <Breadcrumbs current="Contact" dark={false} />
      <MemorySketches.AtomicRecall className="bottom-0 right-0 w-64 h-64 opacity-[0.05] text-[#AAFF00] pointer-events-none" delay={1} />
      
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header Block with Premium Typography */}
        <div className="mb-14 border-b border-white/10 pb-12">

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium mb-6 leading-[1.05] tracking-tight text-white">
            Let's talk about your business.
          </h1>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed font-light">
            Every Memorate engagement begins with a specific dialogue. Tell us about your organization, your challenge, and what you aim to achieve. We respond within 48 hours with a tailored perspective.
          </p>
        </div>

        {/* 1-Flow Contact Strip */}
        <div className="mb-14 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pb-3 border-b border-white/10">
            Direct Ports & Node Coordinates
          </h3>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[9px] font-mono uppercase text-slate-500">Direct Email Link</span>
              <a href="mailto:hello@memorate.org" className="text-lg font-display font-bold text-white hover:text-acid-green transition-colors">
                hello@memorate.org
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5">
              <span className="text-[9px] font-mono uppercase text-slate-500">Primary Location</span>
              <span className="text-lg font-display font-bold text-white">
                Abuja, FCT, Nigeria
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/5">
              <span className="text-[9px] font-mono uppercase text-slate-500">Primary Phone</span>
              <a 
                href="tel:+2348136162573" 
                className="text-lg font-display font-bold text-white hover:text-acid-green transition-colors"
              >
                +234 8136162573
              </a>
            </div>
          </div>
        </div>



        {/* The Clean Form Column */}
        <div id="contact-form" className="relative">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-medium">
              {submitted ? "Transmission Complete" : `Begin Strategy Conversation — Stage 0${formStage}`}
            </h3>
            {!submitted && (
              <span className="text-[9px] font-mono text-[#AAFF00] font-bold bg-[#AAFF00]/10 border border-[#AAFF00]/20 px-2 py-0.5 rounded">
                STAGE 0{formStage} OF 02
              </span>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {!submitted ? (
              formStage === 1 ? (
                <motion.form 
                  key="stage1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleNextStage}
                  className="space-y-6"
                >
                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Your name</label>
                    <input required type="text" placeholder="Austine Great" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-650 text-lg" />
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Organisation name</label>
                    <input required type="text" placeholder="Memorate Agency Ltd" value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-650 text-lg" />
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Work Email</label>
                    <input required type="email" placeholder="hello@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-650 text-lg" />
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Phone Number</label>
                    <input required type="tel" placeholder="+234..." value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-650 text-lg" />
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Primary Challenge</label>
                    <div className="relative">
                      <select required value={contactChallenge} onChange={(e) => setContactChallenge(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 pr-10 focus:outline-none appearance-none cursor-pointer text-lg">
                        <option className="bg-zinc-950 text-slate-500" value="">Select Primary Challenge</option>
                        <option className="bg-zinc-950 text-white" value="salience">Brand Alignment & Strategic Positioning</option>
                        <option className="bg-zinc-950 text-white" value="acquisition">Low Conversion & Lead Flow Disconnect</option>
                        <option className="bg-zinc-950 text-white" value="operations">CRM Setup & Marketing Automation Leak</option>
                        <option className="bg-zinc-950 text-white" value="capability">Team Strategic Autonomy & Execution Gaps</option>
                      </select>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-405">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-6 bg-acid-green hover:bg-white text-black font-display font-bold uppercase tracking-[0.2em] text-[11px] hover:shadow-[0_8px_30px_rgba(170,255,0,0.3)] transition-all flex items-center justify-center gap-4 rounded-xl cursor-pointer border-0">
                    <span className="relative z-10">Continue to Stage 2 (Optional)</span>
                    <ArrowRight className="w-4 h-4 relative z-10" />
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="stage2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="p-4 bg-zinc-900 text-slate-200 rounded-xl mb-4 text-xs font-light flex items-center justify-between border border-white/5">
                    <span>⚡ Stage 1 captured successfully. Details are ready to send.</span>
                    <button 
                      type="button" 
                      onClick={() => setFormStage(1)} 
                      className="text-[#AAFF00] hover:underline bg-transparent border-0 font-mono text-[10px] uppercase font-bold cursor-pointer"
                    >
                      Edit Stage 1
                    </button>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Your role <span className="text-slate-500 text-[8px] font-normal lowercase">(optional)</span></label>
                    <input type="text" placeholder="Founder & Head of Strategy" value={contactRole} onChange={(e) => setContactRole(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-650 text-lg" />
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">What sector are you in? <span className="text-slate-500 text-[8px] font-normal lowercase">(optional)</span></label>
                    <div className="relative">
                      <select value={contactSector} onChange={(e) => setContactSector(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 pr-10 focus:outline-none appearance-none cursor-pointer text-lg">
                        <option className="bg-zinc-950 text-slate-500" value="">Select Sector</option>
                        <option className="bg-zinc-950 text-white" value="real-estate">Real estate</option>
                        <option className="bg-zinc-950 text-white" value="edtech">EdTech</option>
                        <option className="bg-zinc-950 text-white" value="fintech">FinTech</option>
                        <option className="bg-zinc-950 text-white" value="health">Health tech</option>
                        <option className="bg-zinc-950 text-white" value="ngo">NGO</option>
                        <option className="bg-zinc-950 text-white" value="professional">Professional services</option>
                        <option className="bg-zinc-950 text-white" value="other">Other</option>
                      </select>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-405">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">Tell us about your brand challenge <span className="text-slate-500 text-[8px] font-normal lowercase">(optional)</span></label>
                    <textarea rows={4} placeholder="What prevents your brand from unlocking its full revenue potential?" value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none resize-none placeholder:text-slate-655 text-lg" />
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 focus-within:border-acid-green focus-within:ring-2 focus-within:ring-acid-green/10 transition-all rounded-2xl space-y-2">
                    <label className="text-[9px] font-mono uppercase text-slate-400 tracking-widest block font-semibold">How did you hear about Memorate? <span className="text-slate-500 text-[8px] font-normal lowercase">(optional)</span></label>
                    <div className="relative">
                      <select value={contactSource} onChange={(e) => setContactSource(e.target.value)} className="w-full bg-transparent border-0 text-white font-normal p-0 pr-10 focus:outline-none appearance-none cursor-pointer text-lg">
                        <option className="bg-zinc-950 text-slate-500" value="">Select Source</option>
                        <option className="bg-zinc-950 text-white" value="linkedin">LinkedIn</option>
                        <option className="bg-zinc-950 text-white" value="referral">Referral</option>
                        <option className="bg-zinc-950 text-white" value="google">Google</option>
                        <option className="bg-zinc-950 text-white" value="event">Event</option>
                        <option className="bg-zinc-950 text-white" value="other">Other</option>
                      </select>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-405">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleFormSubmit()}
                      className="py-5 bg-white/5 hover:bg-white/10 text-white font-display font-semibold uppercase tracking-wider text-[10px] rounded-xl transition-all cursor-pointer border border-white/10 disabled:opacity-50"
                    >
                      Skip & Submit
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="py-5 bg-acid-green hover:bg-white text-black font-display font-extrabold uppercase tracking-wider text-[10px] hover:shadow-[0_8px_30px_rgba(170,255,0,0.3)] transition-all rounded-xl cursor-pointer border-0 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Complete Submission"}
                    </button>
                  </div>
                </motion.form>
              )
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-16 bg-white/5 border border-white/10 text-center flex flex-col items-center justify-center min-h-[380px] rounded-2xl shadow-sm"
              >
                <ShieldCheck className="w-16 h-16 text-acid-green mb-6" />
                <h3 className="text-2xl font-display font-semibold mb-4 text-white">We've received your transmission.</h3>
                <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto font-light leading-relaxed">
                  We will review what you have shared and respond within 48 hours with a specific, custom perspective on your situation. An actual strategist has already been assigned focus of your query.
                </p>
                <button 
                  onClick={handleReset}
                  className="text-[11px] font-mono text-slate-400 uppercase tracking-widest hover:text-white transition-colors cursor-pointer border-0 bg-transparent font-bold underline"
                >
                  Send another transmission
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const path = window.location.pathname;
    if (path === '/about') return 'about';
    if (path === '/offers') return 'offers';
    if (path === '/insight') return 'insight';
    if (path === '/contact') return 'contact';
    if (path === '/portal') return 'portal';
    return 'home';
  });

  useEffect(() => {
    const paths: Record<Page, string> = {
      home: '/',
      about: '/about',
      offers: '/offers',
      insight: '/insight',
      contact: '/contact',
      portal: '/portal'
    };
    if (window.location.pathname !== paths[currentPage]) {
      window.history.pushState(null, '', paths[currentPage]);
    }
  }, [currentPage]);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/about') setCurrentPage('about');
      else if (path === '/offers') setCurrentPage('offers');
      else if (path === '/insight') setCurrentPage('insight');
      else if (path === '/contact') setCurrentPage('contact');
      else if (path === '/portal') setCurrentPage('portal');
      else setCurrentPage('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const titles: Record<Page, string> = {
      home: 'Brand Diagnostic Checklist — Memorate',
      about: 'About SME & School Growth Advisors — Memorate',
      offers: 'Growth Offers & Outsourced Marketing — Memorate',
      insight: 'Strategic Insights & SME Growth Playbooks — Memorate',
      contact: 'Contact Strategic Growth Advisors — Memorate',
      portal: 'Command Portal — Secure Client Workspace — Memorate'
    };
    document.title = titles[currentPage] || 'Memorate';
  }, [currentPage]);

  useEffect(() => {
    const descriptions: Record<Page, string> = {
      home: 'Memorate is a brand-to-revenue growth company helping ambitious SMEs, premium schools and impact-driven organisations build stronger brands, accountable marketing systems and measurable growth engines.',
      about: 'Learn how Memorate connects brand strategy, positioning, and marketing operations to measurable revenue growth for ambitious organizations.',
      offers: 'Explore Memorate’s core growth offers: Marketing Revenue Audit, Memorate Boost, and the Managed Brand & Marketing Office to build measurable brand value.',
      insight: 'Get strategic insights, reports, and playbooks on brand positioning, marketing operations, and lead generation from the Memorate team.',
      contact: 'Get in touch with Memorate. Request an Executive Marketing Revenue Audit or a strategic Needs Assessment for your school, SME, or impact organization.',
      portal: 'Command Portal for Memorate — Manage client campaigns, lead tracking, task synchronization, and growth engines in real-time.'
    };

    const keywords: Record<Page, string> = {
      home: 'brand-to-revenue, marketing growth, Abuja marketing, brand strategy, Nigeria agency, school enrolment strategy, NGO communication, business revenue',
      about: 'about Memorate, brand strategy Abuja, marketing operations, business growth Nigeria, brand value, brand growth engine',
      offers: 'Marketing Revenue Audit, Memorate Boost, Managed Brand Office, outsourced marketing team Nigeria, fractional CMO, marketing retainer, lead generation',
      insight: 'marketing blog, growth playbook, SME marketing playbook, school enrolment growth, NGO communications, content strategy',
      contact: 'contact Memorate, hire marketing company Abuja, request marketing audit, book strategic consultation',
      portal: 'Memorate portal, client dashboard, CRM automation, campaign reporting'
    };

    // Update or create Description Meta Tag
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', descriptions[currentPage] || '');

    // Update or create Keywords Meta Tag
    let keyMeta = document.querySelector('meta[name="keywords"]');
    if (!keyMeta) {
      keyMeta = document.createElement('meta');
      keyMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keyMeta);
    }
    keyMeta.setAttribute('content', keywords[currentPage] || '');

    // ----------------------------------------------------
    // Dynamic Open Graph & Twitter Card Tag Updates
    // ----------------------------------------------------
    const pageTitles: Record<Page, string> = {
      home: 'Brand Diagnostic Checklist — Memorate',
      about: 'About SME & School Growth Advisors — Memorate',
      offers: 'Growth Offers & Outsourced Marketing — Memorate',
      insight: 'Strategic Insights & SME Growth Playbooks — Memorate',
      contact: 'Contact Strategic Growth Advisors — Memorate',
      portal: 'Command Portal — Secure Client Workspace — Memorate'
    };

    const ogImages: Record<Page, string> = {
      home: 'https://memorate.org/og-home.png',
      about: 'https://memorate.org/og-about.png',
      offers: 'https://memorate.org/og-offers.png',
      insight: 'https://memorate.org/og-insight.png',
      contact: 'https://memorate.org/og-contact.png',
      portal: 'https://memorate.org/og-portal.png'
    };

    const ogUrls: Record<Page, string> = {
      home: 'https://memorate.org/',
      about: 'https://memorate.org/about',
      offers: 'https://memorate.org/offers',
      insight: 'https://memorate.org/insight',
      contact: 'https://memorate.org/contact',
      portal: 'https://memorate.org/portal'
    };

    const updateOrCreateMeta = (attributeName: string, attributeValue: string, contentValue: string, isProperty: boolean = false) => {
      const selector = `meta[${isProperty ? 'property' : 'name'}="${attributeValue}"]`;
      let metaEl = document.querySelector(selector);
      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute(isProperty ? 'property' : 'name', attributeValue);
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', contentValue);
    };

    // Set standard Open Graph tags
    updateOrCreateMeta('property', 'og:type', 'website', true);
    updateOrCreateMeta('property', 'og:title', pageTitles[currentPage] || 'Memorate', true);
    updateOrCreateMeta('property', 'og:description', descriptions[currentPage] || '', true);
    updateOrCreateMeta('property', 'og:image', ogImages[currentPage] || 'https://memorate.org/og-home.png', true);
    updateOrCreateMeta('property', 'og:url', ogUrls[currentPage] || 'https://memorate.org/', true);

    // Set standard Twitter Card tags
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image', false);
    updateOrCreateMeta('name', 'twitter:title', pageTitles[currentPage] || 'Memorate', false);
    updateOrCreateMeta('name', 'twitter:description', descriptions[currentPage] || '', false);
    updateOrCreateMeta('name', 'twitter:image', ogImages[currentPage] || 'https://memorate.org/og-home.png', false);

    // ----------------------------------------------------
    // Dynamic Canonical Link Management
    // ----------------------------------------------------
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', ogUrls[currentPage] || 'https://memorate.org/');
  }, [currentPage]);

  useEffect(() => {
    // Inject JSON-LD Structured Schema Data once on mount
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://memorate.org/#organization",
      "name": "Memorate",
      "alternateName": "Memorate Brand-to-Revenue Growth Company",
      "url": "https://memorate.org",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://memorate.org/#logo",
        "url": "https://memorate.org/memorate_logo.png",
        "caption": "Memorate Logo"
      },
      "description": "Memorate is a brand-to-revenue growth company helping ambitious SMEs, premium schools and impact-driven organisations build stronger brands, accountable marketing systems and measurable growth engines.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+234 (0) 800 MEMORATE",
        "contactType": "customer service",
        "email": "hello@memorate.org",
        "areaServed": "NG",
        "availableLanguage": ["English"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Abuja",
        "addressRegion": "FCT",
        "addressCountry": "NG",
        "streetAddress": "Abuja HQ"
      },
      "sameAs": [
        "https://www.linkedin.com/company/memorate",
        "https://twitter.com/memorategrowth"
      ],
      "knowsAbout": [
        "Brand Strategy",
        "Marketing Operations",
        "Marketing Revenue Audit",
        "School Enrolment Growth Strategy",
        "NGO Communications",
        "Lead Generation",
        "Revenue Systems"
      ]
    };

    let scriptTag = document.getElementById('memorate-jsonld') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'memorate-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(schemaData, null, 2);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const [showCharterModal, setShowCharterModal] = useState(false);
  const [leadForm, setLeadForm] = useState(() => {
    try {
      const saved = localStorage.getItem('memorate_lead_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          company: parsed.company || ''
        };
      }
    } catch (err) {
      console.warn('LocalStorage load failed:', err);
    }
    return { name: '', email: '', phone: '', company: '' };
  });
  const [leadSubmitted, setLeadSubmitted] = useState(() => {
    try {
      return localStorage.getItem('memorate_lead_submitted') === 'true';
    } catch {
      return false;
    }
  });

  const downloadButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleDownloadCharter = () => {
    const btn = document.activeElement as HTMLButtonElement | null;
    downloadButtonRef.current = btn;
    // Always trigger and open the form modal to collect or reconfirm lead information
    setShowCharterModal(true);
  };

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.email || !leadForm.phone || !leadForm.company) {
      return;
    }
    
    const leadId = "lead_" + Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    const leadPayload = {
      id: leadId,
      name: leadForm.name,
      email: leadForm.email,
      phone: leadForm.phone,
      company: leadForm.company || "",
      source: '90-Day Strategy Charter Workbook',
      timestamp
    };

    // Store in Firebase Firestore database in real-time (non-blocking to resist offline/retry hangs)
    setDoc(doc(db, 'leads', leadId), leadPayload).catch((firestoreErr) => {
      console.error('Firestore lead insertion failed:', firestoreErr);
      try {
        handleFirestoreError(firestoreErr, OperationType.CREATE, `leads/${leadId}`);
      } catch (decoratedErr) {
        // Log gracefully
      }
    });

    // Attempt full-stack server-side storage and Airtable dispatch
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload)
      });
    } catch (err) {
      console.warn('Server storage sync failed, using client-side fallback:', err);
    }

    try {
      localStorage.setItem('memorate_lead_submitted', 'true');
      localStorage.setItem('memorate_lead_data', JSON.stringify(leadForm));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
    setLeadSubmitted(true);
    setShowCharterModal(false);
    setTimeout(() => {
      triggerActualDownload();
    }, 150);
  };

  const triggerActualDownload = async () => {
    // Show user a subtle downloading feedback using native styling or visual indicator
    const btn = downloadButtonRef.current;
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.innerHTML = 'Generating PDF...';
      btn.disabled = true;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.zIndex = '-99999';
    container.style.pointerEvents = 'none';

    container.innerHTML = `
      <div id="pdf-page-1" style="width: 800px; height: 1130px; background-color: #ffffff; color: #000000; padding: 40px 48px; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; position: relative; font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';">
        <div style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- Header Block -->
          <div style="background-color: #0b0b0b; color: #ffffff; border-radius: 4px; padding: 22px 28px; box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; margin-bottom: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; letter-spacing: -0.04em; color: #ffffff;">MEMORATE</span>
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #AAFF00; font-weight: 600; tracking: 0.1em; text-transform: uppercase;">
                FREE SME RESOURCE | FOR MARKETING & BRAND COMMUNICATIONS TEAMS
              </span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <h1 style="font-family: 'Outfit', sans-serif; font-size: 34px; font-weight: 700; color: #ffffff; line-height: 1.15; margin: 0; letter-spacing: -0.03em;">
                The SME Marketing &<br />Brand Strategy Charter
              </h1>
              <p style="font-size: 11px; color: #94a3b8; font-weight: 400; line-height: 1.45; margin: 0; max-width: 660px;">
                A practical 90-day planning tool for teams that want clearer messaging, stronger execution and marketing that can be connected to growth.
              </p>
            </div>
          </div>
          
          <!-- How to use charter box -->
          <div style="background-color: #f7fee7; border: 1px dashed #bef227; padding: 12px 18px; border-radius: 4px; box-sizing: border-box;">
            <p style="font-size: 10px; color: #3f6212; margin: 0; line-height: 1.45;">
              <strong style="color: #1a2e05;">How to use this charter:</strong> Gather your marketing, brand communications and sales leads. Complete this page together in 30 minutes. Keep the answers simple. Use them to guide every campaign for the next 90 days.
            </p>
          </div>
          
          <!-- Form Rows Structure -->
          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 4px;">
            
            <!-- Row 01 -->
            <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; min-height: 90px; box-sizing: border-box;">
              <div style="width: 220px; background-color: #f8fafc; padding: 14px; border-right: 1px solid #e2e8f0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; gap: 4px;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">01 BUSINESS OUTCOME</span>
                <span style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #000000; line-height: 1.3;">What must marketing help the business achieve?</span>
              </div>
              <div style="flex: 1; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 10px; background-color: #ffffff;">
                <div style="font-size: 10px; font-weight: 500; color: #64748b; font-style: italic; margin-bottom: 2px;">Choose one primary commercial outcome for the next 90 days.</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: flex-end; gap: 6px; height: 16px;">
                    <span style="color: #334155; font-weight: 500;">Our 90-day growth priority is:</span> <span style="flex: 1; border-bottom: 1px dotted #cbd5e1; height: 1px; margin-bottom: 2px;"></span>
                  </div>
                  <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: flex-end; gap: 6px; height: 16px;">
                    <span style="color: #334155; font-weight: 500;">Target result / number:</span> <span style="flex: 1; border-bottom: 1px dotted #cbd5e1; height: 1px; margin-bottom: 2px;"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Row 02 -->
            <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; min-height: 90px; box-sizing: border-box;">
              <div style="width: 220px; background-color: #f8fafc; padding: 14px; border-right: 1px solid #e2e8f0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; gap: 4px;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">02 PRIORITY CUSTOMER</span>
                <span style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #000000; line-height: 1.3;">Who must choose us, and what is stopping them today?</span>
              </div>
              <div style="flex: 1; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 10px; background-color: #ffffff;">
                <div style="font-size: 10px; font-weight: 500; color: #64748b; font-style: italic; margin-bottom: 2px;">Be specific: sector, decision-maker, need, concern or trust barrier.</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: flex-end; gap: 6px; height: 16px;">
                    <span style="color: #334155; font-weight: 500;">Priority audience:</span> <span style="flex: 1; border-bottom: 1px dotted #cbd5e1; height: 1px; margin-bottom: 2px;"></span>
                  </div>
                  <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: flex-end; gap: 6px; height: 16px;">
                    <span style="color: #334155; font-weight: 500;">Their real problem or hesitation:</span> <span style="flex: 1; border-bottom: 1px dotted #cbd5e1; height: 1px; margin-bottom: 2px;"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Row 03 -->
            <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; min-height: 90px; box-sizing: border-box;">
              <div style="width: 220px; background-color: #f8fafc; padding: 14px; border-right: 1px solid #e2e8f0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; gap: 4px;">
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">03 MESSAGE & PROOF</span>
                <span style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #000000; line-height: 1.3;">What should this customer believe and trust about us?</span>
              </div>
              <div style="flex: 1; padding: 14px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: 10px; background-color: #ffffff;">
                <div style="font-size: 10px; font-weight: 500; color: #64748b; font-style: italic; margin-bottom: 2px;">Write one clear message and one reason the market should trust it.</div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: flex-end; gap: 6px; height: 16px;">
                    <span style="color: #334155; font-weight: 500;">Our core promise:</span> <span style="flex: 1; border-bottom: 1px dotted #cbd5e1; height: 1px; margin-bottom: 2px;"></span>
                  </div>
                  <div style="font-size: 10px; color: #94a3b8; display: flex; align-items: flex-end; gap: 6px; height: 16px;">
                    <span style="color: #334155; font-weight: 500;">Proof we can confidently show:</span> <span style="flex: 1; border-bottom: 1px dotted #cbd5e1; height: 1px; margin-bottom: 2px;"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Split Row for 04 and 05 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              
              <!-- Col 04 -->
              <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; min-height: 130px; box-sizing: border-box;">
                <div style="width: 100px; background-color: #f8fafc; padding: 12px; border-right: 1px solid #e2e8f0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; gap: 4px;">
                  <span style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 700; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">04 CAMPAIGN</span>
                  <span style="font-family: 'Outfit', sans-serif; font-size: 9.5px; font-weight: 700; color: #000000; line-height: 1.2;">What will we run or promote?</span>
                </div>
                <div style="flex: 1; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; background-color: #ffffff;">
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="font-size: 9.5px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                      Priority offer / campaign: <span style="border-bottom: 1px solid #cbd5e1; height: 12px; width: 100%; margin-top: 1px;"></span>
                    </div>
                    <div style="font-size: 9.5px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                      Primary CTA & channels: <span style="border-bottom: 1px solid #cbd5e1; height: 12px; width: 100%; margin-top: 1px;"></span>
                    </div>
                    <div style="font-size: 9.5px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                      Partner / distribution: <span style="border-bottom: 1px solid #cbd5e1; height: 12px; width: 100%; margin-top: 1px;"></span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Col 05 -->
              <div style="display: flex; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; min-height: 130px; box-sizing: border-box;">
                <div style="width: 100px; background-color: #f8fafc; padding: 12px; border-right: 1px solid #e2e8f0; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-start; gap: 4px;">
                  <span style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 700; color: #000000; letter-spacing: 0.05em; text-transform: uppercase;">05 REVENUE</span>
                  <span style="font-family: 'Outfit', sans-serif; font-size: 9.5px; font-weight: 700; color: #000000; line-height: 1.2;">How interest becomes income?</span>
                </div>
                <div style="flex: 1; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; background-color: #ffffff;">
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    <div style="font-size: 9.5px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                      What is a qualified lead? <span style="border-bottom: 1px solid #cbd5e1; height: 12px; width: 100%; margin-top: 1px;"></span>
                    </div>
                    <div style="font-size: 9.5px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                      Who follows up, within how long? <span style="border-bottom: 1px solid #cbd5e1; height: 12px; width: 100%; margin-top: 1px;"></span>
                    </div>
                    <div style="font-size: 9.5px; color: #475569; display: flex; flex-direction: column; gap: 1px;">
                      How will revenue be tracked? <span style="border-bottom: 1px solid #cbd5e1; height: 12px; width: 100%; margin-top: 1px;"></span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
          
          <!-- Acid Green Rule Panel -->
          <div style="background-color: #AAFF00; color: #0c0c0c; padding: 12px 18px; border-radius: 4px; box-sizing: border-box; font-family: 'Outfit', sans-serif; margin-top: 4px;">
            <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 0; line-height: 1.4; letter-spacing: -0.01em; text-align: center;">
              One rule for the next 90 days: No campaign goes live until the team can clearly answer: Who is it for? What should they do? How will success be measured?
            </p>
          </div>
          
        </div>
        
        <!-- Footer Page 1 -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; box-sizing: border-box; font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: #94a3b8;">
          <span>hello@memorate.org  |  memorate.org  |  Abuja, Nigeria</span>
          <span style="font-weight: 600;">Page 1 of 2</span>
        </div>
      </div>

      <div id="pdf-page-2" style="width: 800px; height: 1130px; background-color: #ffffff; color: #000000; padding: 40px 48px; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; position: relative; font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';">
        
        <div style="display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Header of Page 2 -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; box-sizing: border-box;">
            <span style="font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; letter-spacing: -0.04em; color: #0c0c0c;">MEMORATE</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #64748b; font-weight: 600; text-transform: uppercase;">Free SME Resource | Strategy Charter Checklist</span>
          </div>
          
          <!-- Large Titles and description of Page 2 -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <h1 style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; color: #0c0c0c; line-height: 1.2; margin: 0; letter-spacing: -0.02em;">
              The SME Marketing & Brand Checklist
            </h1>
            <p style="font-size: 11px; color: #475569; font-weight: 400; line-height: 1.45; margin: 0; max-width: 700px;">
              Tick each statement your team can confidently answer <strong style="color: #0c0c0c;">yes</strong> to today. Your score will show where structure, alignment or capability needs strengthening.
            </p>
          </div>
          
          <!-- Checklist items: 5 layout sections -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            
            <!-- Grid Row 1 (01 and 02) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <!-- 01 Revenue Accountability -->
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; box-sizing: border-box; background-color: #fafafa; display: flex; flex-direction: column; gap: 8px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #0c0c0c; margin: 0 0 2px 0; display: flex; align-items: center; gap: 6px;">
                  <span style="background-color: #0c0c0c; color: #AAFF00; font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 1.5px 4.5px; border-radius: 2px;">01</span> Revenue Accountability
                </h3>
                <ul style="display: flex; flex-direction: column; gap: 6px; list-style: none; padding: 0; margin: 0;">
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    We generate qualified leads programmatically.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    We track conversion from lead to sale or revenue.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Leadership receives commercial reports, not just reach.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    We know what to stop, optimise or invest more in.
                  </li>
                </ul>
              </div>
              
              <!-- 02 Brand, Marketing & Sales Alignment -->
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; box-sizing: border-box; background-color: #fafafa; display: flex; flex-direction: column; gap: 8px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #0c0c0c; margin: 0 0 2px 0; display: flex; align-items: center; gap: 6px;">
                  <span style="background-color: #0c0c0c; color: #AAFF00; font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 1.5px 4.5px; border-radius: 2px;">02</span> Brand, Marketing & Sales
                </h3>
                <ul style="display: flex; flex-direction: column; gap: 6px; list-style: none; padding: 0; margin: 0;">
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Our brand promise is clear and consistently communicated.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Marketing and sales use matching brand messages.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    There is a clear lead handoff and follow-up pipeline.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Sales feedback is actively used to improve messaging.
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Grid Row 2 (03 and 04) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <!-- 03 Team Capability -->
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; box-sizing: border-box; background-color: #fafafa; display: flex; flex-direction: column; gap: 8px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #0c0c0c; margin: 0 0 2px 0; display: flex; align-items: center; gap: 6px;">
                  <span style="background-color: #0c0c0c; color: #AAFF00; font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 1.5px 4.5px; border-radius: 2px;">03</span> Team Capability
                </h3>
                <ul style="display: flex; flex-direction: column; gap: 6px; list-style: none; padding: 0; margin: 0;">
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Roles and responsibilities are fully clear across the team.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    The team can plan campaigns directly against growth goals.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    The team understands reporting, analytics & conversion.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    We have identified and resolved key capability gaps.
                  </li>
                </ul>
              </div>
              
              <!-- 04 Marketing Operations Engine -->
              <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; box-sizing: border-box; background-color: #fafafa; display: flex; flex-direction: column; gap: 8px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #0c0c0c; margin: 0 0 2px 0; display: flex; align-items: center; gap: 6px;">
                  <span style="background-color: #0c0c0c; color: #AAFF00; font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 1.5px 4.5px; border-radius: 2px;">04</span> Marketing Operations Engine
                </h3>
                <ul style="display: flex; flex-direction: column; gap: 6px; list-style: none; padding: 0; margin: 0;">
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    We have a documented strategy or playbooks.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Content creation and campaigns follow repeatable templates.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Brand assets, messaging parameters & approvals are organised.
                  </li>
                  <li style="display: flex; gap: 6px; font-size: 9.5px; color: #334155; line-height: 1.35;">
                    <span style="border: 1px solid #cbd5e1; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1.5px;"></span>
                    Work continues smoothly even if key team members leave.
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- 05 Readiness to Scale (Full Width) -->
            <div style="border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; box-sizing: border-box; background-color: #f7fee7; border: 1px dashed #bef227; display: flex; flex-direction: column; gap: 6px;">
              <h3 style="font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 700; color: #1a2e05; margin: 0; display: flex; align-items: center; gap: 6px;">
                <span style="background-color: #0c0c0c; color: #AAFF00; font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; padding: 1.5px 4.5px; border-radius: 2px;">05</span> Readiness to Scale
              </h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; gap: 6px; font-size: 9.5px; color: #3f6212; line-height: 1.4;">
                    <span style="border: 1px solid #bef227; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1px;"></span>
                    We map customer journeys from awareness to conversion.
                  </div>
                  <div style="display: flex; gap: 6px; font-size: 9.5px; color: #3f6212; line-height: 1.4;">
                    <span style="border: 1px solid #bef227; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1px;"></span>
                    We use tools or CRM systems to track & nurture incoming leads.
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="display: flex; gap: 6px; font-size: 9.5px; color: #3f6212; line-height: 1.4;">
                    <span style="border: 1px solid #bef227; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1px;"></span>
                    We have identified core processes that can be automated.
                  </div>
                  <div style="display: flex; gap: 6px; font-size: 9.5px; color: #3f6212; line-height: 1.4;">
                    <span style="border: 1px solid #bef227; border-radius: 2.5px; width: 11px; height: 11px; display: inline-block; flex-shrink: 0; background-color: #ffffff; margin-top: 1px;"></span>
                    Our marketing system is built to scale beyond current resources.
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
          <!-- Score Table Grid -->
          <div style="display: flex; flex-direction: column; border: 1px solid #e1e8ed; border-radius: 4px; overflow: hidden; box-sizing: border-box;">
            <div style="display: flex; background-color: #0c0c0c; color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 8.5px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
              <div style="width: 130px; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid rgba(255,255,255,0.15);">YOUR SCORE</div>
              <div style="flex: 1; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid rgba(255,255,255,0.15);">WHAT IT MEANS</div>
              <div style="width: 250px; padding: 8px 12px; box-sizing: border-box;">YOUR PRIORITY</div>
            </div>
            <div style="display: flex; font-size: 9.5px; border-bottom: 1px solid #e1e8ed; background-color: #ffffff;">
              <div style="width: 130px; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid #e1e8ed; font-weight: 700; color: #0c0c0c;">16 - 20</div>
              <div style="flex: 1; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid #e1e8ed; color: #334155;">You have a promising structure.</div>
              <div style="width: 250px; padding: 8px 12px; box-sizing: border-box; color: #475569;">Optimise, automate and scale what works.</div>
            </div>
            <div style="display: flex; font-size: 9.5px; border-bottom: 1px solid #e1e8ed; background-color: #fcfcfc;">
              <div style="width: 130px; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid #e1e8ed; font-weight: 700; color: #0c0c0c;">10 - 15</div>
              <div style="flex: 1; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid #e1e8ed; color: #334155;">Growth exists, but results may be inconsistent.</div>
              <div style="width: 250px; padding: 8px 12px; box-sizing: border-box; color: #475569;">Strengthen strategy, playbooks and alignment.</div>
            </div>
            <div style="display: flex; font-size: 9.5px; background-color: #ffffff;">
              <div style="width: 130px; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid #e1e8ed; font-weight: 700; color: #0c0c0c;">0 - 9</div>
              <div style="flex: 1; padding: 8px 12px; box-sizing: border-box; border-right: 1px solid #e1e8ed; color: #334155;">Your marketing may be active but commercially fragile.</div>
              <div style="width: 250px; padding: 8px 12px; box-sizing: border-box; color: #475569;">Start with diagnosis and rebuild the foundation.</div>
            </div>
          </div>
          
          <!-- Black Callout Banner with green accents -->
          <div style="background-color: #AAFF00; color: #0c0c0c; border-radius: 4px; padding: 12px 18px; box-sizing: border-box; display: flex; flex-direction: column; gap: 3px;">
            <h4 style="font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 0; letter-spacing: -0.01em;">
              Need help turning this charter into a working growth system?
            </h4>
            <p style="font-size: 9.5px; margin: 0; line-height: 1.4; font-weight: 500;">
              Memorate Boost helps SMEs build clear brand strategy, stronger marketing operations, better sales alignment and scalable growth systems. Qualifying SMEs can begin with Stage 01 - a pro-bono Marketing Revenue Audit.
            </p>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 750; text-transform: uppercase; margin-top: 1.5px;">
              Request the audit: hello@memorate.org | memorate.org
            </div>
          </div>
          
        </div>
        
        <!-- Footer Page 2 -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 12px; box-sizing: border-box; font-family: 'JetBrains Mono', monospace; font-size: 8.5px; color: #94a3b8;">
          <span>hello@memorate.org  |  memorate.org  |  Abuja, Nigeria</span>
          <span style="font-weight: 600;">Page 2 of 2</span>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const page1 = document.getElementById('pdf-page-1')!;
      const page2 = document.getElementById('pdf-page-2')!;

      // Render canvases
      const canvas1 = await html2canvas(page1, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const canvas2 = await html2canvas(page2, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const img1 = canvas1.toDataURL('image/jpeg', 0.95);
      const img2 = canvas2.toDataURL('image/jpeg', 0.95);

      pdf.addImage(img1, 'JPEG', 0, 0, 210, 297);
      pdf.addPage();
      pdf.addImage(img2, 'JPEG', 0, 0, 210, 297);

      pdf.save('MEMORATE_SME_Marketing_and_Brand_Strategy_Charter.pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      document.body.removeChild(container);
      if (btn) {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} />;
      case 'about': return <AboutPage setCurrentPage={setCurrentPage} onDownloadCharter={handleDownloadCharter} />;
      case 'offers': return <OffersPage setCurrentPage={setCurrentPage} />;
      case 'insight': return <InsightPage setCurrentPage={setCurrentPage} />;
      case 'contact': return <ContactPage setCurrentPage={setCurrentPage} />;
      case 'portal': return <CommandPortalPage setCurrentPage={setCurrentPage} />;
      default: return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="relative min-h-screen selection:bg-accent selection:text-white bg-obsidian text-white font-sans overflow-x-hidden">
      <GlobalCreativeBackground />
      
      {/* Indicator removed */}
      
      <ExitIntentPopup />
      
      {/* 90-Day Strategy Charter — Lead Capture Modal */}
      <AnimatePresence>
        {showCharterModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-obsidian/90 backdrop-blur-md"
            onClick={() => setShowCharterModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl space-y-6 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-64 h-64 bg-acid-green/5 blur-3xl pointer-events-none" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-acid-green uppercase tracking-[0.3em] bg-acid-green/10 px-3 py-1 rounded-full border border-acid-green/20 inline-block font-bold">
                    PRO-BONO SME RESOURCE
                  </span>
                  <h3 className="text-2xl font-display font-semibold text-white tracking-tight mt-3">
                    Secure Your Strategy Charter
                  </h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Enter your professional contact points to instantly unlock and initiate the high-resolution 90-Day Strategy Charter booklet generation.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLeadFormSubmit} className="space-y-4 relative z-10">
                <div className="p-4 bg-white/5 border border-white/10 focus-within:border-acid-green/45 transition-all rounded-xl space-y-1">
                  <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-widest block font-bold">Your name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Austine Great" 
                    value={leadForm.name}
                    onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                    className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-600 text-sm" 
                  />
                </div>

                <div className="p-4 bg-white/5 border border-white/10 focus-within:border-acid-green/45 transition-all rounded-xl space-y-1">
                  <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-widest block font-bold">Work Email</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="e.g. director@company.com" 
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-600 text-sm" 
                  />
                </div>

                <div className="p-4 bg-white/5 border border-[#white/10] focus-within:border-acid-green/45 transition-all rounded-xl space-y-1">
                  <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-widest block font-bold">Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="e.g. +234..." 
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-600 text-sm" 
                  />
                </div>

                <div className="p-4 bg-white/5 border border-white/10 focus-within:border-acid-green/45 transition-all rounded-xl space-y-1">
                  <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-widest block font-bold">Organisation / Website</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Memorate Agency Ltd" 
                    value={leadForm.company}
                    onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                    className="w-full bg-transparent border-0 text-white font-normal p-0 focus:outline-none placeholder:text-slate-600 text-sm" 
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCharterModal(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-sans font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-2 py-4 bg-[#AAFF00] hover:bg-white text-black font-sans font-bold uppercase tracking-wider text-[10px] hover:shadow-[0_4px_20px_rgba(170,255,0,0.3)] transition-all rounded-xl cursor-pointer border-0"
                  >
                    Secure & Download
                  </button>
                </div>
              </form>

              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-acid-green" />
                <span>Your privacy is encrypted. No third-party distribution.</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="no-print">
        <AnimatePresence mode="wait">
          <div key={currentPage}>
            {renderPage()}
          </div>
        </AnimatePresence>

        {/* Global Footer */}
        <footer className="py-20 border-t border-white/5 bg-zinc-950/50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-2">
                <button onClick={() => setCurrentPage('home')} className="mb-12 block group">
                  <Logo className="h-12" />
                </button>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-6">
                  Brand-to-Revenue Growth Company
                </p>
                <p className="text-sm text-slate-400 max-w-sm mb-12 font-sans font-light leading-relaxed">
                  Memorate helps ambitious SMEs and impact-driven organisations build stronger brands, accountable marketing systems and measurable growth engines.
                </p>
                <div className="flex gap-4">
                  {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                    <a key={i} href="#" className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-acid-green transition-all text-slate-400 hover:text-white">
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-display font-bold mb-8 text-[8px] uppercase tracking-wider text-slate-700">Flagship Offerings</h5>
                <ul className="space-y-4 text-slate-400 text-sm font-light">
                  <li><button onClick={() => setCurrentPage('offers')} className="hover:text-acid-green text-left transition-colors font-sans">Marketing Revenue Audit</button></li>
                  <li><button onClick={() => setCurrentPage('offers')} className="hover:text-acid-green text-left transition-colors font-sans">Memorate Boost™</button></li>
                  <li><button onClick={() => setCurrentPage('offers')} className="hover:text-acid-green text-left transition-colors font-sans">Managed Brand & Marketing Office</button></li>
                  <li><button onClick={() => setCurrentPage('about')} className="hover:text-acid-green text-left transition-colors font-sans">The Memorate Brand Growth Engine™</button></li>
                </ul>
              </div>

              <div>
                <h5 className="font-display font-bold mb-8 text-[8px] uppercase tracking-wider text-slate-700">Contact</h5>
                <ul className="space-y-4 text-slate-400 text-sm font-light">
                  <li className="font-mono text-[8px] tracking-wider mb-2 opacity-20 uppercase">Abuja HQ</li>
                  <li>hello@memorate.org</li>
                  <li>+234 (0) 800 MEMORATE</li>
                  <li>
                    <button 
                      onClick={handleDownloadCharter} 
                      className="flex items-center gap-2.5 px-4 py-2 mt-4 rounded-full border border-acid-green/20 bg-acid-green/5 hover:bg-acid-green hover:text-black hover:border-acid-green hover:shadow-[0_0_15px_rgba(170,255,0,0.15)] text-acid-green font-bold group text-[10px] font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-current" /> 
                      <span>Strategy Charter</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6 text-[10px] font-mono text-slate-800 uppercase tracking-widest">
              <span>Memorate © 2026. Build measurable growth. Sustain value. · Abuja, Nigeria · hello@memorate.org</span>
              <div className="flex gap-8">
                <button onClick={() => setCurrentPage('offers')} className="hover:text-acid-green transition-colors">Services</button>
                <button onClick={() => setCurrentPage('insight')} className="hover:text-acid-green transition-colors">Insights</button>
                <button onClick={() => setCurrentPage('about')} className="hover:text-acid-green transition-colors">About</button>
                <button onClick={() => setCurrentPage('contact')} className="hover:text-acid-green transition-colors">Contact</button>
                <button onClick={() => setCurrentPage('portal')} className="text-[#AAFF00] font-bold hover:text-white transition-colors">Command Portal ⚡</button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <WhatsAppWidget />

      {/* --- Print Layout --- */}
      <div className="hidden print:block p-12 text-black bg-white min-h-screen">
        <div className="print-page">
          <div className="flex justify-between items-end border-b-4 border-black pb-8 mb-12">
            <Logo className="h-16" light={false} />
            <div className="text-right text-[10px] font-mono">
              <p>CONFIDENTIAL · BRAND OS V2.0</p>
              <p>ABUJA, NIGERIA</p>
              <p>MAY 2026</p>
              <p>MEMORATE.NG</p>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold border-b-2 border-black pb-2 mb-6 uppercase">01. Identity</h2>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h3 className="text-[10px] font-mono uppercase mb-2 text-slate-500 tracking-widest">Vision</h3>
                <p className="text-lg leading-relaxed font-display">To become a leading African commercial growth company recognised for helping serious organisations build memorable brands and measurable growth systems that compound across markets.</p>
              </div>
              <div>
                <h3 className="text-[10px] font-mono uppercase mb-2 text-slate-500 tracking-widest">Mission</h3>
                <p className="text-lg leading-relaxed font-display uppercase tracking-tight">Memorate builds and manages brand-to-revenue systems for ambitious organisations through strategy, market positioning, growth activation, operating playbooks, team capability and commercial intelligence.</p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold border-b-2 border-black pb-2 mb-6 uppercase">02. Value Architecture</h2>
            <div className="grid grid-cols-2 gap-8">
              {[
                { t: 'TRUTH BEFORE NOISE', d: "We do not manufacture attractive stories with no business proof. Claims are supported, findings are honest and strategy begins with reality." },
                { t: 'CLARITY BEFORE ACTIVITY', d: "More execution cannot rescue unclear direction. We define the problem, audience, offer and measure before launching work." },
                { t: 'COMMERCIAL ACCOUNTABILITY', d: "Marketing must support business or stakeholder outcomes. We connect activity to demand, conversion, revenue, enrolment, funding or trust." },
                { t: 'SYSTEMS OVER DEPENDENCY', d: "Growth must survive a person, vendor or campaign. We create playbooks, templates, workflows, dashboards and trained owners." }
              ].map((v, i) => (
                <div key={i} className="p-8 border border-slate-200 rounded-2xl">
                  <h4 className="text-xl font-display font-bold mb-3 uppercase tracking-wider">{v.t}</h4>
                  <p className="text-sm text-slate-600 font-sans leading-relaxed">{v.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-display font-bold border-b-2 border-black pb-2 mb-6 uppercase">03. Flagship Offerings</h2>
            <div className="space-y-8">
              <div className="flex gap-10">
                <span className="font-mono text-3xl font-bold">I</span>
                <div>
                  <h4 className="text-xl font-display font-bold mb-1 uppercase">Marketing Revenue Audit</h4>
                  <p className="text-slate-600 font-sans text-sm">A focused executive diagnostic to determine whether marketing and brand communication are producing measurable business value. Find what is working, what is leaking, and what must be fixed first.</p>
                </div>
              </div>
              <div className="flex gap-10">
                <span className="font-mono text-3xl font-bold">II</span>
                <div>
                  <h4 className="text-xl font-display font-bold mb-1 uppercase">Memorate Boost</h4>
                  <p className="text-slate-600 font-sans text-sm">Build or strengthen the complete brand-to-revenue growth engine: positioning, alignment, capability, playbooks, CRM, and automation logic. Premium transformation engagement.</p>
                </div>
              </div>
              <div className="flex gap-10">
                <span className="font-mono text-3xl font-bold">III</span>
                <div>
                  <h4 className="text-xl font-display font-bold mb-1 uppercase">Managed Brand & Marketing Office</h4>
                  <p className="text-slate-600 font-sans text-sm">Access serious brand and marketing capability without building the full internal overhead. Ongoing, fully managed, retained growth partnership for long-term compounding.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-l-4 border-black mb-16">
            <h4 className="text-[10px] font-mono uppercase mb-2 tracking-widest text-slate-500">Note on commercial alignment</h4>
            <p className="text-sm font-sans italic text-slate-700">Memorate was not built to be another typical marketing agency. It was built to solve the specific commercial problems beneath the activity: connecting marketing spend to leads, to conversion, to revenue, and revenue to sustainable growth.</p>
          </div>

          <div className="mt-auto pt-12 border-t-2 border-slate-100 flex justify-between items-end">
            <div>
              <p className="text-2xl font-display font-bold uppercase tracking-tighter italic">Austine Great</p>
              <p className="text-[10px] font-mono uppercase text-slate-500 tracking-[0.4em]">Founder & Lead Strategist</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1">Build measurable growth. Sustain value.</p>
              <p className="text-xs font-display font-bold uppercase">Memorate.ng</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
