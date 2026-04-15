import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, Zap, Rocket, Star, Globe, Terminal as TermIcon, User, 
  TerminalSquare, Layout, Code2, Wrench, FileText, ExternalLink, 
  ShieldAlert, BatteryFull, ChevronRight, Gamepad2, MessageSquare,
  Save, Search, Download, BookOpen, ShieldCheck, Trophy, Sparkles,
  Home, Wifi, Trash2, Droplets, Car, Coffee, Phone, Mail, UploadCloud,
  CheckCircle2, PlusCircle, LogIn, Github, Menu, X, ToggleRight, ToggleLeft, 
  Cpu, Activity, History, Shield, AlertTriangle, Lock, Unlock, RefreshCw,
  ShoppingCart, Users
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

const STORE_ITEMS = [
  { id: 'star_cascade', name: 'Star Cascade', desc: 'Triggers bonus star combos in next session', cost: 50, icon: Star, color: '#fbbf24', effect: '+25% star score' },
  { id: 'matrix_shield', name: 'Matrix Shield', desc: 'Absorbs one mistake in next round', cost: 75, icon: Shield, color: '#60a5fa', effect: '1× mistake immunity' },
  { id: 'hyper_drive', name: 'Hyper Drive', desc: '2× score multiplier for next game', cost: 100, icon: Rocket, color: '#f472b6', effect: '2× score multiplier' },
  { id: 'time_warp', name: 'Time Warp', desc: 'Adds 30 bonus seconds to timed rounds', cost: 60, icon: Zap, color: '#34d399', effect: '+30s bonus time' },
  { id: 'battery_boost', name: 'Battery Boost', desc: 'Full power restore for next session', cost: 40, icon: BatteryFull, color: '#a78bfa', effect: 'Full HP restore' },
  { id: 'sparkle_lens', name: 'Sparkle Lens', desc: 'Reveals hidden star positions on board', cost: 120, icon: Sparkles, color: '#00ff41', effect: 'Reveal hidden stars' },
];

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

  // Upgrade Layer 6: Store, Power-Ups & Multiplayer
  const [credits, setCredits] = useState(100);
  const [powerUps, setPowerUps] = useState({});
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
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

  // --- UPGRADE 6A: STORE PURCHASE ---
  const handleBuyItem = useCallback(async (item) => {
    if (credits < item.cost) {
      pushLog('ERROR', `Insufficient credits. Need ${item.cost} CR.`);
      return;
    }
    const newCredits = credits - item.cost;
    const newPowerUps = { ...powerUps, [item.id]: (powerUps[item.id] || 0) + 1 };
    setCredits(newCredits);
    setPowerUps(newPowerUps);
    pushLog('SUCCESS', `Acquired: ${item.name}. Balance: ${newCredits} CR`);
    if (user && !user.isAnonymous) {
      try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile');
        await setDoc(userRef, { credits: newCredits, powerUps: newPowerUps }, { merge: true });
      } catch (e) { console.error('Store sync failed', e); }
    }
  }, [credits, powerUps, user, pushLog]);

  // --- UPGRADE 6B: POWER-UP ACTIVATION ---
  const handleActivatePowerUp = useCallback((itemId) => {
    if (!powerUps[itemId] || powerUps[itemId] < 1) return;
    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    setActivePowerUps(prev => [...prev.filter(id => id !== itemId), itemId]);
    setPowerUps(prev => {
      const updated = { ...prev, [itemId]: prev[itemId] - 1 };
      if (updated[itemId] === 0) delete updated[itemId];
      return updated;
    });
    pushLog('SUCCESS', `Power-Up Active: ${item.name} — ${item.effect}`);
  }, [powerUps, pushLog]);

  // --- UPGRADE 6C: SSO LOGIN ---
  const handleSSO = useCallback(async (providerType) => {
    try {
      const provider = providerType === 'google' ? googleProvider : githubProvider;
      if (user && user.isAnonymous) {
        await linkWithPopup(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
      setIsLoginOpen(false);
      pushLog('SUCCESS', `SSO verified via ${providerType.toUpperCase()}.`);
    } catch (e) {
      pushLog('ERROR', `SSO failed: ${e.code || e.message}`);
    }
  }, [user, pushLog]);

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
            setCredits(data.credits ?? 100);
            setPowerUps(data.powerUps || {});
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

  // --- LEADERBOARD SUBSCRIPTION ---
  useEffect(() => {
    const lbRef = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
    const q = query(lbRef, orderBy('score', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => {
      setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (e) => console.error('Leaderboard error', e));
    return () => unsub();
  }, []);

  const handleCommand = (cmd) => {
    const input = cmd.toLowerCase().trim();
    setTermHistory(prev => [...prev, `> ${input}`]);
    if (input === 'help') {
      setTermHistory(prev => [...prev, "Cmds: status, telemetry, sync, resume, store, multiplayer, login, credits, arcade, clear"]);
    } else if (input === 'telemetry') setView('telemetry');
    else if (input === 'sync') triggerSync();
    else if (input === 'resume') setView('resume');
    else if (input === 'store') setView('store');
    else if (input === 'multiplayer' || input === 'mp') setView('multiplayer');
    else if (input === 'login') setIsLoginOpen(true);
    else if (input === 'credits') setTermHistory(prev => [...prev, `[INFO] Current balance: ${credits} CR`]);
    else if (input === 'arcade' || input === 'game') window.open('https://nicholai.org/seven-stars.html', '_blank');
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

  const StoreView = () => (
    <div className="flex-1 p-8 overflow-y-auto custom-scroll animate-in space-y-6 pb-32">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <ShoppingCart size={32} color="#00ff41" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Power_Store</h2>
        </div>
        <div className="flex items-center gap-3 glass px-5 py-3 rounded-2xl border border-white/5">
          <Star size={14} className="text-amber-400" />
          <span className="text-xl font-black text-amber-400">{credits}</span>
          <span className="text-[9px] font-black uppercase text-slate-500">Credits</span>
        </div>
      </div>

      {activePowerUps.length > 0 && (
        <div className="bg-[#00ff41]/5 border border-[#00ff41]/20 rounded-2xl p-4 flex flex-wrap gap-3">
          <span className="text-[9px] font-black uppercase text-[#00ff41] w-full mb-1">Active Power-Ups</span>
          {activePowerUps.map(id => {
            const item = STORE_ITEMS.find(i => i.id === id);
            if (!item) return null;
            return (
              <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase animate-pulse" style={{ background: `${item.color}15`, border: `1px solid ${item.color}40`, color: item.color }}>
                <item.icon size={10} /> {item.name}
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STORE_ITEMS.map(item => {
          const owned = powerUps[item.id] || 0;
          const canAfford = credits >= item.cost;
          const isActive = activePowerUps.includes(item.id);
          return (
            <div key={item.id} className="glass rounded-3xl border border-white/5 p-6 space-y-4 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}>
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                {owned > 0 && (
                  <div className="px-2 py-1 rounded-lg text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    ×{owned} owned
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-white text-sm">{item.name}</h3>
                <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">{item.desc}</p>
                <div className="mt-2 px-2 py-1 inline-block rounded text-[8px] font-black uppercase" style={{ background: `${item.color}15`, color: item.color }}>
                  {item.effect}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleBuyItem(item)}
                  disabled={!canAfford}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all"
                  style={canAfford ? { background: `${item.color}20`, border: `1px solid ${item.color}40`, color: item.color } : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#475569' }}
                >
                  <Star size={10} /> {item.cost} CR
                </button>
                {owned > 0 && !isActive && (
                  <button
                    onClick={() => handleActivatePowerUp(item.id)}
                    className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    Equip
                  </button>
                )}
                {isActive && (
                  <div className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/20 bg-emerald-500/10">
                    Active
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(!user || user.isAnonymous) && (
        <div className="glass rounded-3xl border border-amber-500/20 p-6 text-center space-y-3">
          <AlertTriangle size={24} className="mx-auto text-amber-500" />
          <p className="text-[10px] font-black uppercase text-amber-400">Sign in to persist your inventory across sessions</p>
          <button onClick={() => setIsLoginOpen(true)} className="px-6 py-2.5 rounded-xl text-[9px] font-black uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all">
            Connect Account
          </button>
        </div>
      )}
    </div>
  );

  const submitScore = async () => {
    if (!user || user.isAnonymous) { setIsLoginOpen(true); return; }
    try {
      const lbRef = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
      await addDoc(lbRef, {
        name: user.displayName || user.email || 'Anonymous',
        score: achievements.gamesBeaten * 1000,
        powerUpsUsed: activePowerUps.length,
        timestamp: serverTimestamp(),
        uid: user.uid
      });
      pushLog('SUCCESS', 'Score submitted to leaderboard.');
    } catch (e) { pushLog('ERROR', 'Failed to submit score.'); }
  };

  const MultiplayerView = () => (
    <div className="flex-1 p-8 overflow-y-auto custom-scroll animate-in space-y-6 pb-32">
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <Users size={32} color="#00ff41" />
          <h2 className="text-3xl font-black uppercase tracking-tighter">Multiplayer_Grid</h2>
        </div>
        {(!user || user.isAnonymous) ? (
          <button onClick={() => setIsLoginOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
            <LogIn size={12} /> Sign In
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 size={12} /> {user.displayName || user.email || 'Verified'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Your XP" val={`${achievements.gamesBeaten * 1000}`} color="text-[#00ff41]" />
        <StatCard label="Power-Ups" val={Object.values(powerUps).reduce((a, b) => a + b, 0)} color="text-amber-400" />
        <StatCard label="Active Buffs" val={activePowerUps.length} color="text-purple-400" />
      </div>

      <div className="bg-black/80 rounded-[2rem] border border-[#00ff41]/20 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-black/40">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-[10px] font-black uppercase">Global_Leaderboard</span>
          <span className="ml-auto text-[9px] text-slate-600 uppercase font-bold">Live</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="divide-y divide-white/5">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <Trophy size={32} className="mx-auto text-slate-700" />
              <p className="text-[10px] font-black uppercase text-slate-600">No scores yet — be the first!</p>
              <button onClick={submitScore} className="mt-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase bg-[#00ff41]/10 border border-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/20 transition-all">
                Submit My Score
              </button>
            </div>
          ) : (
            leaderboard.map((entry, i) => (
              <div key={entry.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all">
                <span className={`text-[10px] font-black w-6 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-400' : 'text-slate-600'}`}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <User size={14} className="text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-white truncate">{entry.name || 'Anonymous'}</p>
                  <p className="text-[8px] font-bold uppercase text-slate-600">{entry.powerUpsUsed || 0} power-ups used</p>
                </div>
                <span className="font-black text-sm" style={{ color: i === 0 ? '#fbbf24' : '#00ff41' }}>{entry.score?.toLocaleString() || 0}</span>
              </div>
            ))
          )}
        </div>
        {leaderboard.length > 0 && (
          <div className="p-4 border-t border-white/5">
            <button onClick={submitScore} className="w-full py-3 rounded-2xl text-[9px] font-black uppercase bg-[#00ff41]/10 border border-[#00ff41]/20 text-[#00ff41] hover:bg-[#00ff41]/20 transition-all">
              <Trophy size={12} className="inline mr-2" /> Submit My Score
            </button>
          </div>
        )}
      </div>

      {(!user || user.isAnonymous) && (
        <div className="glass rounded-3xl border border-blue-500/20 p-8 text-center space-y-4">
          <Users size={40} className="mx-auto text-blue-400" />
          <h3 className="text-lg font-black uppercase tracking-tight text-white">Join the Multiplayer Grid</h3>
          <p className="text-[9px] font-bold uppercase text-slate-500">Sign in to submit scores, appear on the leaderboard, and challenge other players</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => handleSSO('google')} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[9px] font-black uppercase bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <User size={12} /> Google
            </button>
            <button onClick={() => handleSSO('github')} className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[9px] font-black uppercase bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              <Github size={12} /> GitHub
            </button>
          </div>
        </div>
      )}
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

      {/* SSO LOGIN MODAL */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center animate-in">
          <div className="absolute inset-0 bg-black/90" onClick={() => setIsLoginOpen(false)} />
          <div className="relative w-80 glass rounded-[2.5rem] border border-white/10 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black uppercase tracking-tighter text-white">Connect_Identity</h3>
                <p className="text-[9px] font-bold uppercase text-slate-500 mt-1">SSO Authentication</p>
              </div>
              <button onClick={() => setIsLoginOpen(false)} className="p-2 rounded-xl hover:bg-white/5 transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleSSO('google')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm text-white"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <User size={16} className="text-red-400" />
                </div>
                Sign in with Google
              </button>
              <button
                onClick={() => handleSSO('github')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm text-white"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Github size={16} className="text-purple-400" />
                </div>
                Sign in with GitHub
              </button>
            </div>
            <p className="text-[8px] font-bold uppercase text-slate-600 text-center">Secure handshake via Firebase Auth v15</p>
          </div>
        </div>
      )}

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
        <div className="flex items-center gap-3">
           {telemetry.syncActive && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"/><span className="text-[8px] font-black uppercase text-amber-500">Sync_Active</span></div>}
           <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5">
             <Star size={10} className="text-amber-400" />
             <span className="text-[9px] font-black text-amber-400">{credits} CR</span>
           </div>
           {(!user || user.isAnonymous) ? (
             <button onClick={() => setIsLoginOpen(true)} className="px-3 py-1.5 border rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 hover:bg-white/5 transition-all" style={{ borderColor: '#334' }}>
               <LogIn size={12} /> Login
             </button>
           ) : (
             <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
               <User size={14} className="text-emerald-400" />
             </div>
           )}
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
                <SideLink icon={Activity} label="OS Telemetry" onClick={() => { setView('telemetry'); setIsSidebarOpen(false); }} active={view === 'telemetry'} />
                <SideLink icon={ShoppingCart} label="Power Store" onClick={() => { setView('store'); setIsSidebarOpen(false); }} active={view === 'store'} />
                <SideLink icon={Users} label="Multiplayer" onClick={() => { setView('multiplayer'); setIsSidebarOpen(false); }} active={view === 'multiplayer'} />
                <SideLink icon={FileText} label="Master Shard" onClick={() => { setView('resume'); setIsSidebarOpen(false); }} active={view === 'resume'} />
                <SideLink icon={TerminalSquare} label="OS Terminal" onClick={() => { setView('terminal'); setIsSidebarOpen(false); }} active={view === 'terminal'} />
                <SideLink icon={UploadCloud} label="Broadcast Sync" onClick={() => { triggerSync(); setIsSidebarOpen(false); }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 pt-4">External Origins</span>
              <div className="space-y-4">
                 <a href="https://AmazingGraceHomeLiving.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-emerald-400 transition-all font-bold text-sm">
                    <Home size={18} /> Housing Matrix
                 </a>
                 <a href="https://nicholai.org/seven-stars.html" target="_blank" rel="noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-amber-400 transition-all font-bold text-sm">
                    <Star size={18} /> Seven Stars
                 </a>
              </div>
              {(!user || user.isAnonymous) && (
                <button onClick={() => { setIsLoginOpen(true); setIsSidebarOpen(false); }} className="mt-auto flex items-center gap-3 p-4 rounded-2xl text-slate-400 hover:bg-white/5 transition-all font-bold text-sm">
                  <LogIn size={18} /> Sign In
                </button>
              )}
           </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 relative flex overflow-hidden">
        {view === 'overworld' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 animate-in gap-4">
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
             {activePowerUps.length > 0 && (
               <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                 {activePowerUps.map(id => {
                   const item = STORE_ITEMS.find(i => i.id === id);
                   if (!item) return null;
                   return (
                     <div key={id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase animate-pulse" style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color }}>
                       <item.icon size={9} /> {item.name}
                     </div>
                   );
                 })}
               </div>
             )}
          </div>
        )}

        {view === 'telemetry' && <TelemetryView />}
        {view === 'store' && <StoreView />}
        {view === 'multiplayer' && <MultiplayerView />}

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
        <NavBtn active={view === 'store'} icon={ShoppingCart} label="Store" onClick={() => setView('store')} />
        <NavBtn active={view === 'multiplayer'} icon={Users} label="Arena" onClick={() => setView('multiplayer')} />
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
