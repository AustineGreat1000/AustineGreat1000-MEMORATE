import React, { useState, useEffect } from 'react';
import { 
  db, 
  auth, 
  googleSignIn, 
  logoutUser, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  collection, 
  onSnapshot, 
  orderBy, 
  query, 
  doc, 
  deleteDoc, 
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  fetchRecentEmails, 
  sendEmail, 
  GmailMessage 
} from '../gmail';
import {
  CalendarEvent,
  CreateEventInput,
  fetchUpcomingEvents,
  createCalendarEvent,
  deleteCalendarEvent
} from '../calendar';
import { 
  ShieldCheck, 
  Mail, 
  Send, 
  Users, 
  LogOut, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  ArrowRight,
  User,
  Zap,
  Check,
  Briefcase,
  ChevronRight,
  Lock,
  Loader2,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Plus,
  CalendarCheck2,
  Database,
  Sparkles
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source?: string;
  timestamp?: string;
  lastFollowedUp?: string;
  followUpSubject?: string;
}

export const CommandPortalPage = ({ setCurrentPage }: { setCurrentPage: (p: any) => void }) => {
  const [user, setUser] = useState(() => auth.currentUser);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Troubleshooting states
  const [copiedText, setCopiedText] = useState<'dev' | 'pre' | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // Firestore leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Gmail emails state
  const [gmailInbox, setGmailInbox] = useState<GmailMessage[]>([]);
  const [loadingGmail, setLoadingGmail] = useState(false);

  // Selector / Composer states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [composerTo, setComposerTo] = useState('');
  const [composerSubject, setComposerSubject] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Main UI Tab control
  const [mainTab, setMainTab] = useState<'communications' | 'calendar'>('communications');

  // Google Calendar integration states
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'list' | 'create'>('list');

  // Calendar Create Event Form fields
  const [calendarSummary, setCalendarSummary] = useState('');
  const [calendarDescription, setCalendarDescription] = useState('');
  const [calendarLocation, setCalendarLocation] = useState('Google Meet // Alignment Room');
  const [calendarStartTime, setCalendarStartTime] = useState('');
  const [calendarEndTime, setCalendarEndTime] = useState('');
  const [calendarAttendeeEmail, setCalendarAttendeeEmail] = useState('');
  const [calendarCreateLoading, setCalendarCreateLoading] = useState(false);
  const [calendarCreateSuccess, setCalendarCreateSuccess] = useState(false);

  // Active email templates
  const emailTemplates = {
    narrative: {
      subject: "Memorate Strategy Alignment: Resolving your narrative deficit",
      body: (name: string, company: string) => `Dear ${name},\n\nI was reviewing your submission regarding ${company || 'your agency'}. At Memorate, we believe every brand's primary failure mode is a narrative deficit: speaking with conflicting voices across sales, PR, and product.\n\nLet's schedule a 30-minute narrative synchronization call this week to integrate your 90-Day positioning blueprint.\n\nWarm regards,\n\nMemorate Brand Intelligence Engine`
    },
    salience: {
      subject: "Durable Brand Salience & Outlasting Direct Competitors",
      body: (name: string, company: string) => `Dear ${name},\n\nThank you for downloading the 90-Day Strategy Charter Workbook for ${company || 'your team'}.\n\nEstablishing physical and mental availability is how legend-grade mindshare is earned. How are you measuring your current friction scores? I'd love to share our latest diagnostics tools with you.\n\nBest,\n\nMemorate Agency Team`
    },
    custom: {
      subject: "Memorate Chapter I: Corporate Positioning Synchronizer",
      body: (name: string, company: string) => `Dear ${name},\n\nYour lead submission from ${company || 'your organization'} has been synced into our central intelligence database.\n\nLet's coordinate an introductory brand doctrine assessment. Let me know if tomorrow at 2 PM works for you.\n\nSincerely,\n\nMemorate Strategic Operations`
    }
  };

  // Sync auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch / subscribe to Firestore Leads if user is logged in
  useEffect(() => {
    if (!user) {
      setLeads([]);
      return;
    }

    setLoadingLeads(true);
    const q = query(collection(db, 'leads'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsedLeads: Lead[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        parsedLeads.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          source: data.source || '',
          timestamp: data.timestamp || '',
          lastFollowedUp: data.lastFollowedUp || '',
          followUpSubject: data.followUpSubject || ''
        });
      });
      setLeads(parsedLeads);
      setLoadingLeads(false);
    }, (err) => {
      console.error("Firestore onSnapshot failed:", err);
      // Suppress or catch gracefully
      setLoadingLeads(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Airtable Diagnostics states & triggering handler
  const [airtableTestLoading, setAirtableTestLoading] = useState(false);
  const [airtableTestResult, setAirtableTestResult] = useState<{
    success: boolean;
    savedLocally: boolean;
    savedToAirtable: boolean;
    airtableStatus: string;
    airtableError?: string;
    data?: any;
  } | null>(null);

  const runAirtableDiagnosticTest = async () => {
    setAirtableTestLoading(true);
    setAirtableTestResult(null);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "Diagnostics Automated Test",
          email: "diag.agent@memorate.ai",
          phone: "+44 7700 900077",
          company: "Memorate Intelligence Lab",
          source: "Command Portal Realtime Sandbox Dispatcher",
          challenge: "Dynamic telemetry validation",
          question: "Can we write records smoothly from our sandboxed container environment?",
          role: "Principal Brand Intelligence Specialist",
          sector: "Airtable Sync Verification",
          notes: "End-to-end telemetry check.",
          findSource: "Developer Sandbox"
        })
      });
      const result = await response.json();
      setAirtableTestResult(result);
    } catch (err: any) {
      setAirtableTestResult({
        success: false,
        savedLocally: false,
        savedToAirtable: false,
        airtableStatus: 'failed',
        airtableError: err?.message || 'Failed connecting to sandbox API'
      });
    } finally {
      setAirtableTestLoading(false);
    }
  };

  // Fetch recent Emails from Gmail if oauth token is loaded
  const handleLoadGmail = async (accessToken: string) => {
    if (!accessToken) return;
    setLoadingGmail(true);
    setError(null);
    try {
      const messages = await fetchRecentEmails(accessToken);
      setGmailInbox(messages);
    } catch (err: any) {
      console.warn("Could not retrieve Gmail logs:", err);
      setError("OAuth Access Token expired or Gmail API is disabled. Please re-authenticate to refresh permissions.");
    } finally {
      setLoadingGmail(false);
    }
  };

  // Load Calendar events from Primary Google Calendar
  const handleLoadCalendar = async (accessToken: string) => {
    if (!accessToken) return;
    setLoadingCalendar(true);
    setError(null);
    try {
      const events = await fetchUpcomingEvents(accessToken);
      setCalendarEvents(events);
    } catch (err: any) {
      console.warn("Could not retrieve Google Calendar bookings:", err);
      setError("OAuth access scope error or Calendar service failure. Please verify the Calendar API is enabled or re-authenticate.");
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleLoadGmail(token);
      handleLoadCalendar(token);
    } else {
      setGmailInbox([]);
      setCalendarEvents([]);
    }
  }, [token]);

  // Handle Google OAuth Action
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err: any) {
      console.error("Google authenticate failure:", err);
      setError(err instanceof Error ? err.message : "Google authentication was cancelled or failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
    } catch (err: any) {
      setError(err.message || 'Error signing out.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill composer and calendar fields when clicking a lead row
  const handleSelectLeadForEmail = (lead: Lead) => {
    setSelectedLead(lead);
    setComposerTo(lead.email);
    setComposerSubject(emailTemplates.narrative.subject);
    setComposerBody(emailTemplates.narrative.body(lead.name, lead.company || ''));
    setSendSuccess(false);

    // Pre-populate Google Calendar states automatically
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM Tomorrow
    
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + 30); // 2:30 PM Tomorrow

    // Format local datetime-local ISO style ("YYYY-MM-DDTHH:MM")
    const offsetMs = tomorrow.getTimezoneOffset() * 60 * 1000;
    const localStartStr = new Date(tomorrow.getTime() - offsetMs).toISOString().slice(0, 16);
    const localEndStr = new Date(tomorrowEnd.getTime() - offsetMs).toISOString().slice(0, 16);

    setCalendarSummary(`Memorate Strategic Alignment // ${lead.name} (${lead.company || 'Agency'})`);
    setCalendarDescription(`Alignment dialogue to assess narrative deficit, establish brand salience, and integrate a custom 90-day positioning blueprint.\n\nLead Details:\n- Name: ${lead.name}\n- Agency: ${lead.company || 'N/A'}\n- Email: ${lead.email}`);
    setCalendarLocation(`Google Meet // Alignment Room`);
    setCalendarStartTime(localStartStr);
    setCalendarEndTime(localEndStr);
    setCalendarAttendeeEmail(lead.email);
    setCalendarCreateSuccess(false);
  };

  // Event Scheduler Submit Handler
  const handleCreateCalendarEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("OAuth token not active. Client re-authentication is required.");
      return;
    }
    if (!calendarSummary || !calendarStartTime || !calendarEndTime) {
      setError("Title, Start Time, and End Time are mandatory.");
      return;
    }

    setCalendarCreateLoading(true);
    setError(null);

    try {
      const pStart = new Date(calendarStartTime).toISOString();
      const pEnd = new Date(calendarEndTime).toISOString();

      await createCalendarEvent(token, {
        summary: calendarSummary,
        description: calendarDescription,
        location: calendarLocation,
        startTime: pStart,
        endTime: pEnd,
        attendees: calendarAttendeeEmail ? [calendarAttendeeEmail] : []
      });

      setCalendarCreateSuccess(true);
      await handleLoadCalendar(token);
      
      setTimeout(() => {
        setCalendarMode('list');
        setCalendarSummary('');
        setCalendarDescription('');
        setCalendarLocation('Google Meet // Alignment Room');
        setCalendarAttendeeEmail('');
        setCalendarCreateSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error("Google Calendar event creation failed:", err);
      setError(`Failed to book calendar session: ${err.message || err}`);
    } finally {
      setCalendarCreateLoading(false);
    }
  };

  // Confirmed delete Google Calendar event
  const handleDeleteEventClick = async (eventId: string, eventSumm: string) => {
    const isConfirmed = window.confirm(
      `Identity Authorization Required: Are you absolutely certain you want to cancel and delete "${eventSumm || 'this session'}" from Google Calendar? This will send notification cancellations to any invited attendees.`
    );
    if (!isConfirmed) return;

    setLoadingCalendar(true);
    setError(null);
    try {
      await deleteCalendarEvent(token!, eventId);
      await handleLoadCalendar(token!);
    } catch (err: any) {
      console.error("Calendar deletion failed:", err);
      setError(`Failed to cancel event: ${err.message || err}`);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Change templates in the composer
  const handleApplyTemplate = (type: 'narrative' | 'salience' | 'custom') => {
    if (!selectedLead) return;
    const template = emailTemplates[type];
    setComposerSubject(template.subject);
    setComposerBody(template.body(selectedLead.name, selectedLead.company || ''));
  };

  // Submit Gmail action payload
  const handleTransmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("OAuth token not active. Please authenticate click is required.");
      return;
    }
    if (!composerTo || !composerSubject || !composerBody) {
      setError("Recipient parameters, subject and content body can not be blank.");
      return;
    }

    setSendLoading(true);
    setError(null);
    try {
      // Send message via Gmail API
      await sendEmail(token, composerTo, composerSubject, `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #111;">${composerBody.replace(/\n/g, '<br/>')}</div>`);
      
      setSendSuccess(true);

      // On successful dispatch, log metadata onto Firestore document
      if (selectedLead?.id) {
        const leadRef = doc(db, 'leads', selectedLead.id);
        const updatePayload = {
          lastFollowedUp: new Date().toISOString(),
          followUpSubject: composerSubject,
          source: `${selectedLead.source || ''} (Followed-up via Gmail)`
        };
        try {
          await updateDoc(leadRef, updatePayload);
        } catch (dbErr) {
          // If update rules fail, log the error but don't crash email dispatch success
          console.warn("Failed syncing followed-up status on Firebase database:", dbErr);
        }
      }

      // Re-fetch Gmail logs to show newly transmitted message
      setTimeout(() => {
        handleLoadGmail(token);
      }, 1000);

    } catch (err: any) {
      console.error("Gmail transmission failed:", err);
      setError(`Failed to transmit email: ${err.message || err}`);
    } finally {
      setSendLoading(false);
    }
  };

  // Firestore delete lead execution
  const handleDeleteLeadRow = async (leadId: string, leadName: string) => {
    const isConfirmed = window.confirm(`Identity Authorization Mandatory: Are you absolutely certain you want to delete lead metrics of "${leadName}"? This action permanently purges the entry from Firestore.`);
    if (!isConfirmed) return;

    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (err) {
      console.error("Firestore delete lead Row failed:", err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `leads/${leadId}`);
      } catch (decoratedError: any) {
        setError(`Insufficient Database Privileges: ${decoratedError.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] pt-32 pb-24 text-white">
      <div className="container mx-auto px-6">
        
        {/* Page Header */}
        <div className="mb-12 border-b border-white/5 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-acid-green animate-pulse"></span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-acid-green font-bold">Secure Command Engine</span>
            </div>
            <h1 className="text-4xl font-sans font-medium tracking-tight text-white mb-2">
              Brand Control & Gmail Console
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wide max-w-2xl">
              Centralized interface matching leads database stored on real Firebase Firestore with real-time Gmail Workspace communications.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentPage('home')}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              ← Back to Web
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-950/40 border border-red-500/20 text-red-200 rounded-lg text-xs font-mono flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block mb-1">Operational Exception Logging</strong>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white uppercase text-[8px] font-bold">Dismiss</button>
          </div>
        )}

        {/* Network Error Automated Diagnosis Block */}
        {error && (error.includes('auth/network-request-failed') || error.includes('network-request-failed')) && (
          <div className="mb-8 p-6 bg-zinc-950 border border-[#AAFF00]/15 rounded-2xl text-xs font-mono relative overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 via-acid-green to-yellow-500"></div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1 rounded bg-[#AAFF00]/10 text-acid-green font-bold text-[10px]">DIAGNOSTIC AUTOMATION TARGET RECOGNIZED</span>
            </div>
            <h3 className="text-sm font-sans font-medium text-white mb-2">Google Authentication Connection Interruption Identified</h3>
            <p className="text-slate-400 leading-relaxed mb-4 font-sans text-xs">
              The <code className="text-[#AAFF00] font-mono px-1 bg-white/5 rounded">auth/network-request-failed</code> exception occurs in sandbox/cloud runtime environments due to missing OAuth authorized domains or aggressive privacy filters. Follow these three precision directives to resolve it:
            </p>

            <div className="space-y-4 font-sans text-xs">
              {/* Step 1 */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-acid-green">
                  <span>Directive Alpha</span>
                  <span className="text-slate-600">//</span>
                  <span>Allowlist Authorized Domains</span>
                </div>
                <p className="text-xs text-slate-400">
                  Firebase Authentication restricts user login popups strictly to authorized domain origins. You must add this application's active hostname to your project's settings.
                </p>
                
                <div className="pt-2 flex flex-wrap gap-3 items-center">
                  <span className="text-slate-500 text-[11px] font-mono">Domains to Copy:</span>
                  <button
                    onClick={() => {
                      const host = typeof window !== 'undefined' ? window.location.hostname : 'ais-dev-cpahvwntsnxlz72am6igzp-490201166841.europe-west2.run.app';
                      navigator.clipboard.writeText(host);
                      setCopiedText('dev');
                      setTimeout(() => setCopiedText(null), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-mono rounded border border-white/10 hover:border-acid-green/45 transition-all text-slate-300 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>{typeof window !== 'undefined' ? window.location.hostname : 'ais-dev-...'}</span>
                    {copiedText === 'dev' && <span className="text-[#AAFF00] font-bold ml-1">Copied!</span>}
                  </button>

                  <button
                    onClick={() => {
                      const host = typeof window !== 'undefined' ? window.location.hostname : 'ais-dev-cpahvwntsnxlz72am6igzp-490201166841.europe-west2.run.app';
                      const pre = host.includes('ais-dev-') ? host.replace('ais-dev-', 'ais-pre-') : host;
                      navigator.clipboard.writeText(pre);
                      setCopiedText('pre');
                      setTimeout(() => setCopiedText(null), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-mono rounded border border-white/10 hover:border-acid-green/45 transition-all text-slate-300 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>{typeof window !== 'undefined' ? window.location.hostname.replace('ais-dev-', 'ais-pre-') : 'ais-pre-...'}</span>
                    {copiedText === 'pre' && <span className="text-[#AAFF00] font-bold ml-1">Copied!</span>}
                  </button>
                </div>

                <div className="pt-2">
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0597250120/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#AAFF00] text-black hover:bg-lime-400 font-bold uppercase text-[9px] font-mono tracking-widest rounded transition-all cursor-pointer"
                  >
                    Open Firebase Auth Settings <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-[10px] font-mono text-slate-500 mt-2">Scroll to 'Authorized domains' section, click 'Add domain', paste each copied domain, and save.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-acid-green">
                  <span>Directive Beta</span>
                  <span className="text-slate-600">//</span>
                  <span>Disable Privacy Shields & Ad-Blockers</span>
                </div>
                <p className="text-xs text-slate-400">
                  Privacy extensions (such as Brave Shields, uBlock Origin, or Ghostery) aggressively intercept Google identity SDK endpoints like <code className="text-slate-300 font-mono px-1 bg-white/5 rounded">identitytoolkit.googleapis.com</code> before popups launch. Deactivate shields on this page to let the call load.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-acid-green">
                  <span>Directive Gamma</span>
                  <span className="text-slate-600">//</span>
                  <span>Check Third-Party Cookies & Browsers</span>
                </div>
                <p className="text-xs text-slate-400">
                  Third-party cookie restrictions enforced by Safari or Chrome's Incognito Mode can prevent sub-iframe OAuth communication. We recommend testing inside a standard Chrome tab if popups continue to fail.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Guard Screen */}
        {!user || !token ? (
          <div className="max-w-2xl mx-auto py-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-acid-green/5 via-transparent to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <div className="mx-auto w-12 h-12 bg-acid-green/10 border border-acid-green/20 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-5 h-5 text-acid-green" />
              </div>
              
              <h2 className="text-xl font-sans font-medium mb-3 text-white">Administation Gateway Synchronizer</h2>
              
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 font-mono leading-relaxed">
                Log in using Google OAuth to securely list real-time client lead payloads fetched from Firestore and enable direct Gmail delivery.
              </p>

              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-acid-green animate-spin" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#AAFF00]">Initializing credentials</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* COMPLIANT GOOGLE SIGN IN BUTTON */}
                  <button 
                    onClick={handleLogin}
                    className="flex items-center gap-3 px-6 py-3.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-slate-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98] transition-all cursor-pointer border-0 duration-300"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span className="font-mono uppercase tracking-widest text-[10px]">Authenticate with Google Workspace</span>
                  </button>
                  <p className="mt-4 text-[9px] font-mono text-slate-600">Secure connection via Firebase Core Authentication layer</p>

                  {/* Toggle Troubleshooting Link */}
                  <div className="mt-8 pt-6 border-t border-white/5 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                      className="text-[10px] font-mono uppercase tracking-widest text-[#AAFF00]/80 hover:text-[#AAFF00] underline transition-all bg-transparent border-0 cursor-pointer"
                    >
                      {showTroubleshooting ? "Hide Diagnostic & Setup Protocol" : "Diagnostic & Setup Protocol"}
                    </button>
                  </div>
                </div>
              )}

              {/* Troubleshooting Guidelines Block */}
              {showTroubleshooting && (
                <div className="mt-8 pt-6 border-t border-white/5 text-left space-y-4 animate-fade-in text-xs font-mono">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded bg-[#AAFF00]/10 text-acid-green font-bold text-[9px] uppercase tracking-wider">Manual Setup Parameters</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    If connection is refused or a popup failure is detected, verify your domain settings in the Firebase Authentication console:
                  </p>
                  
                  {/* Step 1 */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-[#AAFF00]">
                      <span>1. Authorized Domains</span>
                      <a
                        href="https://console.firebase.google.com/project/gen-lang-client-0597250120/authentication/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] underline text-slate-400 hover:text-white inline-flex items-center gap-1 font-sans"
                      >
                        Open Firebase Console <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans">
                      Add both active development and preview hostnames inside Firebase Console &rarr; Auth Settings &rarr; Authorized domains:
                    </p>
                    
                    <div className="flex flex-col gap-2 pt-1 font-mono text-[10px]">
                      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded text-slate-300">
                        <span className="truncate max-w-[280px]">{typeof window !== 'undefined' ? window.location.hostname : 'loading...'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const host = typeof window !== 'undefined' ? window.location.hostname : 'ais-dev-cpahvwntsnxlz72am6igzp-490201166841.europe-west2.run.app';
                            navigator.clipboard.writeText(host);
                            setCopiedText('dev');
                            setTimeout(() => setCopiedText(null), 2000);
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[9px] border border-white/10 rounded cursor-pointer text-[#AAFF00]"
                        >
                          {copiedText === 'dev' ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-2.5 py-1.5 rounded text-slate-300">
                        <span className="truncate max-w-[280px]">{(typeof window !== 'undefined' ? window.location.hostname : 'loading...').replace('ais-dev-', 'ais-pre-')}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const host = typeof window !== 'undefined' ? window.location.hostname : 'ais-dev-cpahvwntsnxlz72am6igzp-490201166841.europe-west2.run.app';
                            const pre = host.includes('ais-dev-') ? host.replace('ais-dev-', 'ais-pre-') : host;
                            navigator.clipboard.writeText(pre);
                            setCopiedText('pre');
                            setTimeout(() => setCopiedText(null), 2000);
                          }}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[9px] border border-white/10 rounded cursor-pointer text-[#AAFF00]"
                        >
                          {copiedText === 'pre' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1 text-[11px] text-slate-400 font-sans">
                    <div className="font-mono text-[9px] font-bold text-acid-green uppercase">2. Ad-blockers / Brave Shield</div>
                    <p>
                      Ad-blockers often intercept connection attempts to Google services (<code className="text-slate-300 font-mono px-1">identitytoolkit.googleapis.com</code>). Disable Brave Shields or blockers for this page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Top Logged In Card */}
            <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={`Memorate Authenticated Admin Operator Session Image - ${user.displayName || 'Authorized User'}`} className="w-10 h-10 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 bg-acid-green/10 rounded-full flex items-center justify-center text-acid-green font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono bg-acid-green/10 text-acid-green px-2 py-0.5 rounded-full font-bold">Active Operator</span>
                    <span className="text-[9px] font-mono text-slate-600">ID: {user.uid.substring(0, 8)}...</span>
                  </div>
                  <h4 className="text-sm font-sans font-medium text-white">{user.displayName || 'Administrator'}</h4>
                  <p className="text-xs font-mono text-slate-500 leading-none mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleLoadGmail(token)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingGmail ? 'animate-spin text-acid-green' : ''}`} /> Sync Gmail
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500/10 hover:border-red-500/30 bg-red-950/10 text-red-400 hover:text-red-300 hover:bg-red-950/30 text-[10px] font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  <LogOut className="w-3 h-3" /> Terminate Session
                </button>
              </div>
            </div>

            {/* Command Navigation Tabs */}
            <div className="flex border-b border-white/5 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setMainTab('communications')}
                className={`pb-4 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  mainTab === 'communications' 
                    ? 'border-acid-green text-acid-green font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Communications Control Center</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMainTab('calendar');
                  if (token) handleLoadCalendar(token);
                }}
                className={`pb-4 px-6 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  mainTab === 'calendar' 
                    ? 'border-acid-green text-acid-green font-bold' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Google Calendar Sync Room</span>
              </button>
            </div>

            {mainTab === 'communications' ? (
              /* Dashboard Bento Grid */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                
                {/* LEFT: Leads DB List (8 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  
                  <div className="p-6 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-acid-green" />
                      <div>
                        <h3 className="text-sm font-sans font-medium text-white">Firestore Client Leads</h3>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Synchronized with interactive forms</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-white/5 text-slate-400 px-3 py-1 rounded-full uppercase">
                      Total: {leads.length} Records
                    </span>
                  </div>

                  <div className="p-0 overflow-x-auto">
                    {loadingLeads ? (
                      <div className="py-16 text-center text-slate-600 font-mono text-xs flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-acid-green animate-spin" />
                        Fetching leads real-time streaming snapshot...
                      </div>
                    ) : leads.length === 0 ? (
                      <div className="py-16 text-center text-slate-600 font-mono text-xs">
                        No client payloads loaded in "/leads" Firestore database collection currently.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-white/[0.02] text-[9px] font-mono uppercase tracking-widest text-slate-500 border-b border-white/5">
                          <tr>
                            <th className="py-3 px-5">Lead / Company</th>
                            <th className="py-3 px-5">Campaign / Source</th>
                            <th className="py-3 px-5 text-right font-mono">Date</th>
                            <th className="py-3 px-5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {leads.map((lead) => (
                            <tr key={lead.id} className={`hover:bg-white/[0.01] transition-colors ${selectedLead?.id === lead.id ? 'bg-acid-green/[0.03]' : ''}`}>
                              <td className="py-4 px-5">
                                <div className="font-sans font-medium text-white mb-0.5">{lead.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono leading-none lowercase select-all">{lead.email}</div>
                                {lead.company && (
                                  <div className="flex items-center gap-1.5 mt-2 bg-white/5 text-slate-400 text-[10px] px-2 py-0.5 rounded-full w-fit font-sans leading-none">
                                    <Briefcase className="w-2.5 h-2.5 text-slate-500" />
                                    <span>{lead.company}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-4 px-5 max-w-[200px]">
                                <span className="text-[10px] font-mono text-slate-400 block line-clamp-2">
                                  {lead.source || 'General Contact Form'}
                                </span>
                                {lead.lastFollowedUp && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-mono text-acid-green mt-1 bg-acid-green/5 border border-acid-green/15 rounded px-1.5 py-0.5 leading-none">
                                    <Check className="w-2.5 h-2.5 text-acid-green" /> Followed-up
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-5 text-right text-[10px] font-mono text-slate-500 whitespace-nowrap">
                                {lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex justify-center items-center gap-2">
                                  <button 
                                    onClick={() => handleSelectLeadForEmail(lead)}
                                    title="Compose follow up mail"
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                                      selectedLead?.id === lead.id 
                                        ? 'bg-acid-green text-black border-acid-green' 
                                        : 'bg-acid-green/5 border-acid-green/10 text-acid-green hover:bg-acid-green hover:text-black hover:border-acid-green'
                                    }`}
                                  >
                                    <Mail className="w-3 h-3" /> Draft
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleDeleteLeadRow(lead.id, lead.name)}
                                    title="Delete record"
                                    className="p-1.5 hover:text-red-400 text-slate-600 bg-transparent border-0 cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* GMAIL RECENT LOGS SECTION */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-6 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-acid-green" />
                      <div>
                        <h3 className="text-sm font-sans font-medium text-white">Google Workspace Gmail Inbox</h3>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Live REST communications query</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleLoadGmail(token)}
                      className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-0 max-h-[440px] overflow-y-auto">
                    {loadingGmail ? (
                      <div className="py-16 text-center text-slate-600 font-mono text-xs flex flex-col items-center gap-3">
                        <Loader2 className="w-6 h-6 text-acid-green animate-spin" />
                        Accessing Gmail inbox threads...
                      </div>
                    ) : gmailInbox.length === 0 ? (
                      <div className="py-16 text-center text-slate-600 font-mono text-xs">
                        No recent threads retrieved or Gmail inbox is empty.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.03]">
                        {gmailInbox.map((mail) => (
                          <div key={mail.id} className="p-4 hover:bg-white/[0.01] transition-colors flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5 text-slate-400 font-sans text-xs">
                               ✉
                            </div>
                            <div className="flex-1 space-y-1 overflow-hidden">
                              <div className="flex justify-between items-center gap-2">
                                <span className="font-sans font-medium text-xs text-white truncate max-w-[150px] sm:max-w-xs">{mail.from}</span>
                                <span className="text-[8px] font-mono text-slate-500 shrink-0 uppercase">{mail.date.split(',')[0] || mail.date}</span>
                              </div>
                              <h4 className="text-slate-300 font-sans font-medium text-xs leading-snug truncate">{mail.subject}</h4>
                              <p className="text-[10px] text-slate-500 leading-normal line-clamp-2 pr-4 font-mono">{mail.snippet}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Gmail Composer Panel (5 cols) */}
              <div className="lg:col-span-5">
                <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-xl sticky top-28">
                  <div className="flex items-center gap-2.5 mb-6 border-b border-white/5 pb-4">
                    <Send className="w-4 h-4 text-acid-green" />
                    <div>
                      <h3 className="text-sm font-sans font-medium text-white">Gmail Campaign Dispatch</h3>
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Write & Transmit email follow-ups</p>
                    </div>
                  </div>

                  {sendSuccess ? (
                    <div className="py-8 px-4 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-acid-green/10 border border-acid-green/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-acid-green animate-bounce" />
                      </div>
                      <h4 className="text-sm font-sans font-medium text-white">Communication Delivered</h4>
                      <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                        The narrative follow-up email has been successfully transmitted via your real Gmail account. The database has updated lead historical state.
                      </p>
                      <button 
                        onClick={() => setSendSuccess(false)}
                        className="px-4 py-2 bg-acid-green text-black font-semibold uppercase text-[9px] font-mono tracking-widest rounded-full hover:shadow-[0_0_15px_rgba(170,255,0,0.3)] cursor-pointer hover:scale-102 transition-all border-0"
                      >
                        Compose Another
                      </button>
                    </div>
                  ) : !selectedLead ? (
                    <div className="py-16 text-center text-slate-600 font-mono text-xs border border-dashed border-white/10 rounded-xl">
                      Select a lead from the table to initiate campaign drafting.
                    </div>
                  ) : (
                    <form onSubmit={handleTransmitEmail} className="space-y-4">
                      
                      {/* Presets Grid */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Script Blueprint Template</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate('narrative')}
                            className="px-2 py-1.5 bg-white/5 border border-white/10 hover:border-acid-green/30 hover:bg-white/10 text-[9px] font-mono uppercase tracking-wider text-slate-300 rounded transition-all text-center whitespace-nowrap overflow-hidden text-ellipsis leading-none cursor-pointer"
                          >
                            Narrative
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate('salience')}
                            className="px-2 py-1.5 bg-white/5 border border-white/10 hover:border-acid-green/30 hover:bg-white/10 text-[9px] font-mono uppercase tracking-wider text-slate-300 rounded transition-all text-center whitespace-nowrap overflow-hidden text-ellipsis leading-none cursor-pointer"
                          >
                            Salience
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyTemplate('custom')}
                            className="px-2 py-1.5 bg-white/5 border border-white/10 hover:border-acid-green/30 hover:bg-white/10 text-[9px] font-mono uppercase tracking-wider text-slate-300 rounded transition-all text-center whitespace-nowrap overflow-hidden text-ellipsis leading-none cursor-pointer"
                          >
                            Assessment
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Recipient Address</label>
                        <input 
                          type="email" 
                          required
                          value={composerTo}
                          onChange={(e) => setComposerTo(e.target.value)}
                          placeholder="recipient@example.com"
                          className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-mono text-slate-300"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Message Subject</label>
                        <input 
                          type="text" 
                          required
                          value={composerSubject}
                          onChange={(e) => setComposerSubject(e.target.value)}
                          placeholder="Email subject line"
                          className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-sans text-white font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">MIME Narrative Content Body</label>
                        <textarea
                          rows={11}
                          required
                          value={composerBody}
                          onChange={(e) => setComposerBody(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-mono text-slate-300 leading-relaxed resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={sendLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-acid-green to-[#96e000] text-black font-bold uppercase text-[9px] font-mono tracking-widest rounded hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] transition-all cursor-pointer font-sans disabled:opacity-50 hover:scale-101 outline-none"
                      >
                        {sendLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                            <span>Dispatching Mail...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Transmit Via Gmail</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Airtable Diagnostics Card */}
                <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-xl mt-6 space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-acid-green" />
                      <div>
                        <h3 className="text-sm font-sans font-medium text-white">Airtable Integration Sandbox</h3>
                        <p className="text-[9px] font-mono text-slate-500 uppercase">Interactive data sync portal</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Test your Airtable connection on demand. Clicking the button below generates a diagnostic packet and submits it through your active full-stack endpoint routes to your target table.
                  </p>

                  <button
                    type="button"
                    disabled={airtableTestLoading}
                    onClick={runAirtableDiagnosticTest}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-[#AAFF00] border border-[#AAFF00]/25 hover:border-[#AAFF00]/40 font-bold uppercase text-[9px] font-mono tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {airtableTestLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Sandbox Packet...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Transmit Diagnostic Record</span>
                      </>
                    )}
                  </button>

                  {airtableTestResult && (
                    <div className="p-4 bg-zinc-900 border border-white/5 rounded-xl space-y-3.5 animate-fade-in text-[11px] font-mono">
                      
                      {/* Connection and Sync Status Row */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-500 text-[9px] uppercase tracking-wide">Sync Status</span>
                        {airtableTestResult.savedToAirtable ? (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-acid-green bg-acid-green/10 border border-acid-green/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            ● Successfully Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-red-400 bg-red-400/10 border border-red-400/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            ● Sync Failed
                          </span>
                        )}
                      </div>

                      {/* Backend Result Fields */}
                      <div className="space-y-1.5 text-xs text-left">
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[10px]">Persisted Locally:</span>
                          <span className={airtableTestResult.savedLocally ? "text-acid-green font-bold" : "text-slate-500 font-bold"}>
                            {airtableTestResult.savedLocally ? "Yes" : "No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-[10px]">Airtable Status:</span>
                          <span className="text-slate-300 font-bold capitalize">{airtableTestResult.airtableStatus}</span>
                        </div>
                      </div>

                      {/* Error State Details */}
                      {airtableTestResult.airtableError && (
                        <div className="bg-red-950/20 border border-red-500/20 text-red-300 p-2.5 rounded-md leading-relaxed text-[10px] text-left">
                          <strong className="block mb-1 text-red-400 uppercase tracking-wide text-[9px]">Airtable Error Report:</strong>
                          {airtableTestResult.airtableError}
                        </div>
                      )}

                      {/* Success / Instructions Checklist */}
                      {airtableTestResult.savedToAirtable ? (
                        <div className="text-slate-400 leading-normal font-sans text-[10px] space-y-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 text-left">
                          <p className="text-white text-[10px] font-bold mb-1.5 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-acid-green" /> 
                            Verify In Your Airtable Base:
                          </p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Open Table: <code className="text-[#AAFF00] font-mono text-[9px]">Leads</code> (or configured table name).</li>
                            <li>Check Fields: Look for <code className="text-slate-300 text-[9px]">Diagnostics Automated Test</code>.</li>
                            <li>Standard Columns verified: <strong className="text-slate-300">Name, Email, Phone, Company, Source, Timestamp</strong>.</li>
                            <li>Extended data payload successfully mapped!</li>
                          </ul>
                        </div>
                      ) : (
                        <div className="text-slate-400 leading-normal font-sans text-[10px] space-y-1.5 bg-white/[0.01] p-2.5 rounded-lg border border-white/5 text-left">
                          <p className="text-white text-[10px] font-bold flex items-center gap-1.5 text-amber-400">
                            ⚠ Setup Action Required:
                          </p>
                          <p className="leading-snug">
                            To enable real-time Airtable sync, configure the following secrets inside your <strong className="text-slate-300">AI Studio Settings</strong>:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[9px] font-mono">
                            <li>AIRTABLE_PAT: "pat_..." (with records:write scope)</li>
                            <li>AIRTABLE_BASE_ID: "app..."</li>
                            <li>AIRTABLE_TABLE: "Leads"</li>
                          </ul>
                        </div>
                      )}

                    </div>
                  )}
                </div>

              </div>

            </div>
            ) : (
              /* Calendar Bento Grid */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                
                {/* LEFT: Google Calendar Bookings List (7 cols) */}
                <div className="lg:col-span-7 space-y-8">
                  <div className="bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                    
                    <div className="p-6 border-b border-white/5 bg-[#0a0a0c] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CalendarCheck2 className="w-4 h-4 text-acid-green" />
                        <div>
                          <h3 className="text-sm font-sans font-medium text-white">Upcoming Client Alignment Sessions</h3>
                          <p className="text-[9px] font-mono text-slate-500 uppercase">Synchronized with Primary Google Calendar</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadCalendar(token!)}
                          disabled={loadingCalendar}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[10px] font-mono uppercase tracking-widest text-[#AAFF00] rounded transition-all cursor-pointer border-0"
                        >
                          <RefreshCw className={`w-3 h-3 ${loadingCalendar ? 'animate-spin' : ''}`} />
                          <span>Refresh List</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {loadingCalendar ? (
                        <div className="py-16 text-center text-slate-600 font-mono text-xs flex flex-col items-center gap-3">
                          <Loader2 className="w-6 h-6 text-acid-green animate-spin" />
                          <span>Fetching Google Calendar active scheduled bookings...</span>
                        </div>
                      ) : calendarEvents.length === 0 ? (
                        <div className="py-16 text-center text-slate-600 font-mono text-xs border border-dashed border-white/5 rounded-xl flex flex-col items-center gap-4">
                          <Calendar className="w-8 h-8 text-slate-700" />
                          <div>No upcoming strategy alignment sessions scheduled on your Google Calendar.</div>
                          <button
                            type="button"
                            onClick={() => setCalendarMode('create')}
                            className="px-4 py-2 bg-[#AAFF00]/10 border border-[#AAFF00]/25 text-acid-green hover:bg-[#AAFF00]/20 font-bold uppercase text-[9px] font-mono tracking-widest rounded transition-all cursor-pointer border-0"
                          >
                            Schedule Alignment Call
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {calendarEvents.map((evt) => {
                            const startTimeStr = evt.start?.dateTime || evt.start?.date || '';
                            const endTimeStr = evt.end?.dateTime || evt.end?.date || '';
                            const startDate = startTimeStr ? new Date(startTimeStr) : null;
                            const endDate = endTimeStr ? new Date(endTimeStr) : null;
                            
                            return (
                              <div key={evt.id} className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-xl hover:border-white/10 transition-all flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div className="space-y-2 flex-grow min-w-0">
                                  <div>
                                    <h4 className="text-xs font-semibold text-white leading-tight break-words">{evt.summary || '(Untitled Event)'}</h4>
                                    {evt.description && (
                                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 max-w-xl break-words whitespace-pre-line font-sans leading-relaxed">{evt.description}</p>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500">
                                    {startDate && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-acid-green" />
                                        <span>
                                          {startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                                          {evt.start?.dateTime ? `@ ${startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : '(All Day)'}
                                        </span>
                                      </div>
                                    )}

                                    {evt.location && (
                                      <div className="flex items-center gap-1 truncate max-w-[180px]">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate">{evt.location}</span>
                                      </div>
                                    )}
                                  </div>

                                  {evt.attendees && evt.attendees.length > 0 && (
                                    <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2 items-center">
                                      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider block">Attendees:</span>
                                      {evt.attendees.map((attendee, index) => (
                                        <span 
                                          key={index} 
                                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${
                                            attendee.responseStatus === 'accepted' 
                                              ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' 
                                              : attendee.responseStatus === 'declined' 
                                              ? 'bg-red-950/20 text-red-400 border border-red-500/10' 
                                              : 'bg-white/5 text-slate-400 border border-white/10'
                                          }`}
                                          title={`Response Status: ${attendee.responseStatus || 'No Response'}`}
                                        >
                                          {attendee.email}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex sm:flex-col justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                                  {evt.htmlLink && (
                                    <a
                                      href={evt.htmlLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-center gap-1 py-1.5 px-3 bg-white/5 hover:bg-white/10 text-center text-slate-300 font-mono text-[9px] uppercase tracking-wider rounded border border-white/10 hover:border-acid-green/40 transition-all cursor-pointer flex-grow sm:flex-grow-0 no-underline"
                                    >
                                      <span>Workspace</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEventClick(evt.id, evt.summary)}
                                    className="flex items-center justify-center gap-1 py-1.5 px-3 border border-red-500/10 hover:border-red-500/30 bg-red-950/10 text-red-400 hover:text-red-300 hover:bg-red-950/30 font-mono text-[9px] uppercase tracking-wider rounded transition-all cursor-pointer flex-grow sm:flex-grow-0"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                    <span>Cancel Meeting</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Calendar Action Form (5 cols) */}
                <div className="lg:col-span-5">
                  <div className="bg-zinc-950 border border-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                    <div>
                      <h3 className="text-sm font-sans font-medium text-white">Strategic Live Scheduler</h3>
                      {selectedLead ? (
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-mono text-[#AAFF00]">
                          <Zap className="w-3 h-3 text-[#AAFF00]" />
                          <span>Linked payload target: {selectedLead.name}</span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500 font-mono mt-1 font-sans">Configure alignment session and dispatch direct calendar bookings.</p>
                      )}
                    </div>

                    {calendarCreateSuccess ? (
                      <div className="py-12 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 bg-acid-green/10 border border-acid-green/20 rounded-full flex items-center justify-center">
                          <CalendarCheck2 className="w-6 h-6 text-acid-green animate-bounce" />
                        </div>
                        <h4 className="text-sm font-sans font-medium text-white">Alignment Event Provisioned</h4>
                        <p className="text-[11px] text-slate-500 font-mono leading-relaxed px-4">
                          Strategic session was provisioned inside Google Calendar core layer. Invitation payloads dispersed successfully.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateCalendarEventSubmit} className="space-y-4">
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Session Summary / Title</label>
                          <input 
                            type="text" 
                            required
                            value={calendarSummary}
                            onChange={(e) => setCalendarSummary(e.target.value)}
                            placeholder="e.g. Memorate Strategy Alignment // Agency Sync"
                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-sans text-white font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Invitee Attendee Email</label>
                          <input 
                            type="email" 
                            value={calendarAttendeeEmail}
                            onChange={(e) => setCalendarAttendeeEmail(e.target.value)}
                            placeholder="client-recipient@example.com (optional)"
                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-mono text-slate-300"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Event Location</label>
                          <input 
                            type="text" 
                            value={calendarLocation}
                            onChange={(e) => setCalendarLocation(e.target.value)}
                            placeholder="Google Meet or meeting details"
                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-sans text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Starts At</label>
                            <input 
                              type="datetime-local" 
                              required
                              value={calendarStartTime}
                              onChange={(e) => setCalendarStartTime(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-mono text-slate-300"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Ends At</label>
                            <input 
                              type="datetime-local" 
                              required
                              value={calendarEndTime}
                              onChange={(e) => setCalendarEndTime(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-mono text-slate-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-slate-500 uppercase block leading-none">Briefing Details / Description</label>
                          <textarea
                            rows={5}
                            value={calendarDescription}
                            onChange={(e) => setCalendarDescription(e.target.value)}
                            placeholder="Structure assessments and diagnostic deliverables..."
                            className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded text-xs focus:outline-none focus:border-acid-green/40 transition-all font-mono text-slate-300 leading-relaxed resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={calendarCreateLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-acid-green to-[#96e000] text-black font-bold uppercase text-[9px] font-mono tracking-widest rounded hover:shadow-[0_0_20px_rgba(170,255,0,0.3)] transition-all cursor-pointer font-sans disabled:opacity-50 hover:scale-101 border-0"
                        >
                          {calendarCreateLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                              <span>Provisioning Event...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Schedule Event on Google</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
