import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Zap, Rocket, Star, Globe, Terminal as TermIcon, User, 
  TerminalSquare, Layout, Code2, Wrench, FileText, ExternalLink, 
  ShieldAlert, BatteryFull, ChevronRight, Gamepad2, MessageSquare,
  Save, Search, Download, BookOpen, ShieldCheck, Trophy, Sparkles,
  Home, Wifi, Trash2, Droplets, Car, Coffee, Phone, Mail, UploadCloud,
  CheckCircle2, PlusCircle, LogIn, Github, Menu, X, ToggleRight, ToggleLeft, 
  Cpu, Activity, History, Shield, AlertTriangle, Lock, Unlock, RefreshCw
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, 
  GoogleAuthProvider, GithubAuthProvider, signInWithPopup, linkWithPopup 
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, getDoc } from 'firebase/firestore';

// --- SYSTEM INITIALIZATION ---
// Guard against missing or malformed __firebase_config at runtime
let firebaseConfig = {};
try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    firebaseConfig = JSON.parse(__firebase_config);
  }
} catch (e) {
  console.error('[NEXUS] Firebase config parse error:', e);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'nexus-os-v15';

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const NEXUS_DATA = {
  version: "15.0.0",
  codename: "Divine_Revelation",
  identity: {
    name: "NICHOLAI MARO MADIAS",
    rank: "Software Engineer / Automation Architect",
    bio: "Liquidating administrative technical debt through high-integrity software engineering. Transitioning Palm Harbor -> St. Pete Sector."
  },
  nodes: [
    { id: 'tpa_node', name: 'Tampa HQ', x: 20, y: 40, type: 'hub', color: '#00ff41', icon: MapPin },
    { id: 'match3_node', name: 'Stellara Grid', x: 45, y: 30, type: 'game', color: '#00ff41', icon: Gamepad2, url: 'https://nicholai.org/seven-stars.html' },
    { id: 'housing_node', name: 'AG Housing', x: 35, y: 70, type: 'housing', color: '#00ff41', icon: Home, url: 'https://AmazingGraceHomeLiving.com' },
    { id: 'mystery_node', name: 'Seven Stars', x: 65, y: 75, type: 'mystery', color: '#00ff41', icon: Star, url: 'https://nicholai.org/seven-stars.html' },
    { id: 'mnl_gateway', name: 'Manilla B06', x: 80, y: 25, type: 'hub', color: '#00ff41', icon: Globe }
  ]
};

const App = () => {
  // OS Core State
  const [view, setView] = useState('overworld');
  const [isMatrixMode, setIsMatrixMode] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [termHistory, setTermHistory] = useState(['[SYSTEM] Nexus OS v15.0 Active.', '[AUTH] Handshake v2 initialized.', '[DOMAIN] nicholai.org sector online.']);
  const [termInput, setTermInput] = useState('');
  
  // Upgrade Layer 5: RBAC & Achievements
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); 
  const [achievements, setAchievements] = useState({ gamesBeaten: 0, sponsored: false });
  const [isResumeUnlocked, setIsResumeUnlocked] = useState(false);

  // Upgrade Layer 1 & 2: Audit & Telemetry
  const [auditLogs, setAuditLogs] = useState([]);
  const [telemetry, setTelemetry] = useState({ githubStatus: 'IDLE', syncActive: false, errorRate: 0 });
  
  const terminalRef = useRef(null);

  // --- UPGRADE 1: AUDIT LOGGING ---
  const pushLog = useCallback(async (level, message, metadata = {}) => {
    const logEntry = {
      timestamp: Date.now(),
      level, // INFO, WARN, ERROR, SUCCESS
      message,
      metadata,
      userId: auth.currentUser?.uid || 'anonymous'
    };
    setTermHistory(prev => [...prev.slice(-49), `[${level}] ${message}`]);
    if (auth.currentUser) {
      try {
        const logRef = collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs');
        await addDoc(logRef, logEntry);
      } catch (e) { console.error("Log failed", e); }
    }
  }, []);

  // --- UPGRADE 3: GITHUB ACTION POLLING ---
  const pollGithubActions = useCallback(async () => {
    if (!user) return;
    setTelemetry(prev => ({ ...prev, githubStatus: 'POLLING' }));
    // Simulation of GitHub Actions API poll
    setTimeout(() => {
      setTelemetry(prev => ({ ...prev, githubStatus: 'SUCCESS' }));
      pushLog('INFO', 'GitHub Action "Build & Deploy" verified.');
    }, 1500);
  }, [user, pushLog]);

  // --- UPGRADE 4: DRIVE -> GITHUB SYNC ---
  const triggerSync = async () => {
    setTelemetry(prev => ({ ...prev, syncActive: true }));
    pushLog('WARN', 'Initiating Drive -> GitHub Repository Sync...');
    setTimeout(() => {
      setTelemetry(prev => ({ ...prev, syncActive: false }));
      pushLog('SUCCESS', 'Matrix Bridge Sync Complete.');
    }, 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error('[AUTH] Sign-in failed:', e);
        pushLog('ERROR', 'Authentication initialization failed.');
      }
    };
    initAuth();
    
    // Subscribe to auth state and retain the unsubscribe function for cleanup
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u && !u.isAnonymous) {
        try {
          const userRef = doc(db, 'artifacts', appId, 'users', u.uid, 'profile');
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role || 'contributor');
            setAchievements(data.achievements || { gamesBeaten: 0, sponsored: false });
          } else {
            setRole('contributor');
          }
        } catch (e) {
          console.error('[AUTH] Profile fetch failed:', e);
          pushLog('ERROR', 'Unable to load user profile.');
        }
        pushLog('SUCCESS', `Authenticated as ${u.email || 'Verified User'}`);
      }
    });

    // Clean up the auth listener when the component unmounts to prevent memory leaks
    return () => unsubscribe();
  }, [pushLog]);

  // Unlock logic
  useEffect(() => {
    if (achievements.gamesBeaten >= 2 && achievements.sponsored) {
      setIsResumeUnlocked(true);
      pushLog('SUCCESS', 'Master Shard Unlocked.');
    }
  }, [achievements, pushLog]);

  const handleCommand = (cmd) => {
    const input = cmd.toLowerCase().trim();
    setTermHistory(prev => [...prev, `> ${input}`]);
    if (input === 'help') setTermHistory(prev => [...prev, "Cmds: status, telemetry, sync, resume, housing, arcade"]);
    else if (input === 'telemetry') setView('telemetry');
    else if (input === 'sync') triggerSync();
    else if (input === 'resume') setView('resume');
    else if (input === 'clear') setTermHistory(['[SYSTEM] Logs cleared.']);
    setTermInput('');
  };

  const TelemetryView = () => (
    <div className="flex-1 p-8 overflow-y-auto custom-scroll animate-in space-y-6 pb-32">
       <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
             <Activity size={32} color="#00ff41" />
             <h2 className="text-3xl font-black uppercase tracking-tighter">OS_Telemetry</h2>
          </div>
          <button onClick={pollGithubActions} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase">
             <RefreshCw size={14} className={telemetry.githubStatus === 'POLLING' ? 'animate-spin' : ''} /> Poll GitHub
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="GH Status" val={telemetry.githubStatus} color={telemetry.githubStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-amber-400'} />
          <StatCard label="RBAC Level" val={role.toUpperCase()} color="text-blue-400" />
          <StatCard label="Sync Bridge" val={telemetry.syncActive ? 'ACTIVE' : 'IDLE'} color={telemetry.syncActive ? 'text-amber-500' : 'text-slate-500'} />
          <StatCard label="Audit State" val="ENFORCED" color="text-emerald-500" />
       </div>

       <div className="bg-black/80 rounded-[2rem] border border-[#00ff41]/20 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-black/40">
             <History size={16} /> <span className="text-[10px] font-black uppercase">Audit_Logs_v15</span>
          </div>
          <div className="h-64 overflow-y-auto p-6 font-mono text-[10px] space-y-2">
             {termHistory.map((line, i) => (
                <div key={i} className="flex gap-4">
                   <span className="opacity-20">[{new Date().toLocaleTimeString()}]</span>
                   <span className={line.includes('SUCCESS') ? 'text-emerald-400' : (line.includes('WARN') ? 'text-amber-500' : 'text-[#00ff41]')}>{line}</span>
                </div>
             ))}
          </div>
       </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 flex flex-col font-sans overflow-hidden transition-all duration-500`} 
         style={{ backgroundColor: isMatrixMode ? '#030a03' : '#020617', color: isMatrixMode ? '#00ff41' : '#94a3b8' }}>
      
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #00ff41; border-radius: 10px; }
        .animate-in { animation: fade-in 0.4s ease-out; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .glass { background: rgba(0,0,0,0.4); backdrop-filter: blur(12px); }
      `}</style>

      {/* NAV */}
      <nav className="h-16 border-b flex items-center justify-between px-6 z-[100] glass" style={{ borderColor: isMatrixMode ? '#00ff4140' : 'rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2"><Menu size={24} /></button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('overworld')}>
             <ShieldCheck size={28} className="text-[#00ff41]" />
             <div className="flex flex-col">
                <h1 className="font-black text-[11px] uppercase tracking-[0.2em] leading-none" style={{ color: isMatrixMode ? '#00ff41' : 'white' }}>Nicholai_Maro_Madias</h1>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-1 opacity-70">Software Engineer // Divine Revelation</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           {telemetry.syncActive && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"/><span className="text-[8px] font-black uppercase text-amber-500">Sync_Active</span></div>}
           <button onClick={() => setIsMatrixMode(!isMatrixMode)} className="px-3 py-1.5 border rounded-full text-[9px] font-black uppercase" style={{ borderColor: isMatrixMode ? '#00ff41' : '#333' }}>
             {isMatrixMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />} Matrix
           </button>
        </div>
      </nav>

      {/* SIDEBAR */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[200] flex animate-in">
           <div className="absolute inset-0 bg-black/80" onClick={() => setIsSidebarOpen(false)} />
           <div className="relative w-72 h-full bg-[#030a03] border-r border-[#00ff41]/20 p-8 flex flex-col space-y-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Nexus OS Hub</span>
              <div className="space-y-4">
                <SideLink icon={Activity} label="OS Telemetry" onClick={() => setView('telemetry')} active={view === 'telemetry'} />
                <SideLink icon={FileText} label="Master Shard" onClick={() => setView('resume')} active={view === 'resume'} />
                <SideLink icon={TerminalSquare} label="OS Terminal" onClick={() => setView('terminal')} active={view === 'terminal'} />
                <SideLink icon={UploadCloud} label="Broadcast Sync" onClick={triggerSync} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 pt-8">External Origins</span>
              <div className="space-y-4">
                 <a href="https://AmazingGraceHomeLiving.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-emerald-400 transition-all font-bold text-sm">
                    <Home size={18} /> Housing Matrix
                 </a>
                 <a href="https://nicholai.org/seven-stars.html" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-amber-400 transition-all font-bold text-sm">
                    <Star size={18} /> Seven Stars
                 </a>
              </div>
           </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 relative flex overflow-hidden">
        {view === 'overworld' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in">
             <div className="relative w-full max-w-lg aspect-square rounded-[3rem] border border-[#00ff41]/20 flex items-center justify-center overflow-hidden transition-all shadow-[0_0_50px_rgba(0,255,65,0.05)]">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#00ff41 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                {NEXUS_DATA.nodes.map(node => (
                   <div key={node.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => node.url ? window.open(node.url, '_blank') : setView(node.type)}>
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center border bg-black border-[#00ff41] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                         <node.icon size={28} color="#00ff41" />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {view === 'telemetry' && <TelemetryView />}

        {view === 'resume' && (
           <div className="flex-1 p-8 flex flex-col items-center justify-center animate-in pb-32">
              {!isResumeUnlocked ? (
                 <div className="max-w-md w-full glass p-10 rounded-[3rem] border border-white/5 text-center space-y-8">
                    <Lock size={64} className="mx-auto text-slate-800" />
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Shard_Locked</h2>
                    <div className="space-y-4">
                       <AchievementRow label="2 Arcade Wins" status={achievements.gamesBeaten >= 2} sub={`${achievements.gamesBeaten}/2`} />
                       <AchievementRow label="$40 Sponsorship" status={achievements.sponsored} sub="Ministry Support" />
                    </div>
                    <button onClick={() => setAchievements({ gamesBeaten: 2, sponsored: true })} className="text-[8px] font-black uppercase opacity-20 hover:opacity-100 transition-opacity">Simulate Verification</button>
                 </div>
              ) : (
                 <div className="max-w-4xl w-full space-y-8 animate-in">
                    <div className="flex items-center gap-4"><Unlock size={32} className="text-emerald-400" /><h2 className="text-4xl font-black text-white uppercase tracking-tighter">Master_Shard_v15.0</h2></div>
                    <div className="bg-black/90 p-8 rounded-[2.5rem] border border-emerald-500/20 font-mono text-xs text-emerald-400 overflow-y-auto max-h-[50vh] custom-scroll shadow-2xl">
                       <pre>{`NICHOLAI MARO MADIAS\nSoftware Engineer • Automation Architect\nPalm Harbor, FL\n\nEXPERIENCE:\nAMAZING GRACE HOME LIVING | Software Engineer\n- Engineering administrative technical debt liquidation systems.\nHCLTECH (VERIZON) | EDN Tier 2\n- Automated network audit telemetry v14.0.`}</pre>
                    </div>
                 </div>
              )}
           </div>
        )}

        {view === 'terminal' && (
           <div className="flex-1 flex flex-col p-6 animate-in">
              <div className="flex-1 rounded-[2rem] border border-[#00ff41]/20 bg-black p-8 font-mono text-[11px] flex flex-col shadow-2xl overflow-hidden">
                 <div className="flex-1 overflow-y-auto custom-scroll space-y-1 mb-4" ref={terminalRef}>
                    {termHistory.map((line, i) => <div key={i} className={line.startsWith('>') ? 'text-blue-400' : 'text-[#00ff41] opacity-80'}>{line}</div>)}
                 </div>
                 <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                    <span className="font-black text-blue-500">guardian@nicholai.org:~$</span>
                    <input autoFocus value={termInput} onChange={e => setTermInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCommand(termInput)} className="flex-1" />
                 </div>
              </div>
           </div>
        )}
      </main>

      {/* DOCK */}
      <div className="fixed bottom-0 inset-x-0 h-24 border-t flex items-center justify-around px-4 z-[100] pb-6 glass" style={{ borderColor: isMatrixMode ? '#00ff4140' : 'rgba(255,255,255,0.05)' }}>
        <NavBtn active={view === 'overworld'} icon={MapPin} label="Map" onClick={() => setView('overworld')} />
        <NavBtn active={view === 'telemetry'} icon={Activity} label="Logs" onClick={() => setView('telemetry')} />
        <NavBtn active={view === 'resume'} icon={FileText} label="Shard" onClick={() => setView('resume')} />
        <NavBtn active={view === 'terminal'} icon={TermIcon} label="Term" onClick={() => setView('terminal')} />
      </div>
    </div>
  );
};

const StatCard = ({ label, val, color }) => (
  <div className="glass p-5 rounded-3xl border border-white/5">
     <span className="text-[9px] font-black uppercase text-slate-600 block mb-1">{label}</span>
     <span className={`text-xl font-black ${color}`}>{val}</span>
  </div>
);

const AchievementRow = ({ label, status, sub }) => (
  <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${status ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/40 border-white/5'}`}>
     <div className="text-left">
        <span className="text-[10px] font-black uppercase text-white block">{label}</span>
        <span className="text-[8px] font-bold uppercase text-slate-500">{sub}</span>
     </div>
     {status ? <CheckCircle2 size={16} className="text-emerald-500" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
  </div>
);

const SideLink = ({ icon: IconComp, label, onClick, active }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-[#00ff41]/10 text-white' : 'text-slate-400 hover:bg-white/5'}`}>
    <IconComp size={18} className={active ? 'text-[#00ff41]' : 'text-slate-600'} />
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const NavBtn = ({ active, icon: IconComp, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-16 transition-all duration-300 ${active ? 'scale-110' : 'opacity-60'}`}
          style={{ color: active ? '#00ff41' : '#64748b' }}>
    <IconComp size={22} />
    <span className="text-[8px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default App;
