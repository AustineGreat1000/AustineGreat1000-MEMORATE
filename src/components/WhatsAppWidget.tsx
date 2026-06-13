import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { 
  MessageSquare, 
  X, 
  Settings, 
  Check, 
  Send, 
  TrendingUp, 
  ChevronRight, 
  MessageCircle,
  HelpCircle
} from 'lucide-react';

export const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastWaUrl, setLastWaUrl] = useState('');

  // Default number is translated from +234 (0) 800 MEMORATE (M=6, E=3, M=6, O=6, R=7, A=2, T=8, E=3)
  // But we make it dynamically editable so the operator can plug in any WhatsApp Business number
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    try {
      return localStorage.getItem('memorate_wa_number') || '23480063667283';
    } catch {
      return '23480063667283';
    }
  });

  const [form, setForm] = useState({
    name: '',
    challenge: '',
    question: '',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Stripping non-numeric characters except maybe leading characters to align with wa.me formatting
      const cleanNum = whatsappNumber.replace(/[^\d]/g, '');
      setWhatsappNumber(cleanNum);
      localStorage.setItem('memorate_wa_number', cleanNum);
    } catch (err) {
      console.error(err);
    }
    setShowSettings(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    setIsSubmitting(true);

    // Build the ultimate professional pre-filled WhatsApp message
    const waText = `Hi Memorate team, I'm ${form.name} 👋\n\n` +
      `Our main challenge: "${form.challenge || 'Not specified'}"\n\n` +
      `My question: "${form.question || 'How do we work together?'}"\n\n` +
      `Let's chat!`;
    const encodedText = encodeURIComponent(waText);
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    
    // Set URL in state for the success button link fallback
    setLastWaUrl(waUrl);

    // 1. Open WhatsApp synchronously in response to the user's submit click.
    // Doing it synchronously BEFORE any async awaits prevents browser popup blockers from stopping it.
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Popup blocker or other issue opening WhatsApp link: ', err);
    }

    // Capture fields to save in Firestore
    const currentForm = { ...form };

    // Immediately close the widget and reset form to let the user continue using the website
    setIsOpen(false);
    setIsSubmitting(false);
    setForm({ name: '', challenge: '', question: '' });

    const leadId = 'lead_wa_' + Math.random().toString(36).substring(2, 11);
    const timestamp = new Date().toISOString();
    
    // Create lead details payload complying with lead standards
    const leadPayload = {
      id: leadId,
      name: currentForm.name,
      company: "WhatsApp Quick Chat Client",
      industry: "WhatsApp Channel",
      challenge: currentForm.challenge || "Not specified",
      question: currentForm.question || "Not specified",
      source: 'WhatsApp Business Widget (Quick Connection)',
      timestamp
    };

    // Store in Firestore leads collection in real-time in background (non-blocking)
    setDoc(doc(db, 'leads', leadId), leadPayload).catch((err) => {
      console.warn('Firestore fallback: ', err);
    });

    // Capture and dispatch via full-stack server-side endpoint to push to Airtable
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadPayload)
      });
    } catch (err) {
      console.warn('Server storage sync failed for WhatsApp widget:', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans no-print">
      <AnimatePresence>
        {/* Chat window panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="w-[290px] sm:w-[310px] bg-zinc-950 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden mb-4"
          >
            {/* Header section with brand identity */}
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-b border-white/5 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#AAFF00]/15 border border-[#AAFF00]/30 flex items-center justify-center text-[#AAFF00] font-bold font-display text-xs tracking-wider">
                    M
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-black animate-pulse" />
                </div>
                <div>
                  <h4 className="text-white text-[11px] font-bold font-display tracking-wide flex items-center gap-1">
                    Memorate Help Desk
                  </h4>
                  <p className="text-[9px] text-[#AAFF00] font-mono tracking-wider font-semibold">
                    Replies instantly
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  title="Configure WhatsApp number"
                  className="p-1 text-slate-500 hover:text-white hover:bg-white/5 transition-all rounded-lg"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-500 hover:text-white hover:bg-white/5 transition-all rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inner Content Body */}
            <div className="p-3 bg-zinc-950">
              {showSettings ? (
                /* Config settings view */
                <form onSubmit={handleSaveSettings} className="space-y-3 py-1">
                  <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 space-y-1">
                    <h5 className="text-[#AAFF00] text-[9px] font-mono uppercase tracking-widest font-bold">
                      Business API Setup
                    </h5>
                    <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                      Enter the destination phone number in international format (e.g. 23480063667283) with no spaces.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-white/5 border border-white/10 focus-within:border-[#AAFF00]/40 transition-all rounded-xl space-y-0.5">
                    <label className="text-[8px] font-mono uppercase text-slate-500 tracking-widest block font-bold">
                      Destination Number
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full bg-transparent border-0 text-white font-mono text-xs focus:outline-none placeholder:text-slate-700"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. 23480063667283"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="px-3 py-1.5 rounded-full border border-white/10 text-white font-mono text-[8px] uppercase tracking-widest hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-full bg-[#AAFF00] text-black font-mono text-[8px] uppercase tracking-widest font-bold hover:shadow-[0_0_12px_rgba(170,255,0,0.3)] transition-all"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              ) : (
                /* Primary chat initiating form */
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="p-2.5 bg-white/5 border border-white/10 focus-within:border-[#AAFF00]/40 transition-all rounded-xl space-y-0.5">
                    <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-wider block font-bold leading-none">Your Name</label>
                    <input
                      required
                      type="text"
                      className="w-full bg-transparent border-0 text-white text-xs focus:outline-none placeholder:text-slate-600 font-light mt-1"
                      placeholder="e.g. Austine Great"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="p-2.5 bg-white/5 border border-white/10 focus-within:border-[#AAFF00]/40 transition-all rounded-xl space-y-0.5">
                    <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-wider block font-bold leading-none">Challenge or solution wanted</label>
                    <textarea
                      required
                      rows={2}
                      className="w-full bg-transparent border-0 text-white text-xs focus:outline-none placeholder:text-slate-650 font-light mt-1 resize-none"
                      placeholder="e.g. Build our brand strategy or run high-intent ads"
                      value={form.challenge}
                      onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                    />
                  </div>

                  <div className="p-2.5 bg-white/5 border border-white/10 focus-within:border-[#AAFF00]/40 transition-all rounded-xl space-y-0.5">
                    <label className="text-[8px] font-mono uppercase text-[#AAFF00] tracking-wider block font-bold leading-none">What questions do you have?</label>
                    <textarea
                      required
                      rows={2}
                      className="w-full bg-transparent border-0 text-white text-xs focus:outline-none placeholder:text-slate-650 font-light mt-1 resize-none"
                      placeholder="e.g. How does the 90-day blueprint session work?"
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 text-center rounded-xl bg-[#AAFF00] hover:bg-white text-black font-display font-bold text-xs uppercase tracking-wide transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <span>Say Hello on WhatsApp</span>
                    <Send className="w-3 h-3 text-current" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating interactive bubble button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-[0_4px_35px_rgba(0,0,0,0.55)] cursor-pointer overflow-hidden ${
          isOpen 
            ? 'bg-zinc-900 text-[#AAFF00] border border-[#AAFF00]/10' 
            : 'bg-[#AAFF00] text-black hover:bg-white hover:shadow-[0_0_25px_rgba(170,255,0,0.45)] animate-[pulse_3s_infinite]'
        }`}
        id="whatsapp-business-bubble"
        title="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6 md:w-7 md:h-7" />
        ) : (
          /* Official WhatsApp SVG logo */
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 md:w-8 md:h-8 fill-current transition-colors"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};
