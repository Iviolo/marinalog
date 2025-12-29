import React, { useState, useEffect } from 'react';
import { AppState, INITIAL_STATE, LogEntry } from './types';
import Dashboard from './components/Dashboard';
import ActionPanel from './components/ActionPanel';
import History from './components/History';
import Settings from './components/Settings';
import Assistant from './components/Assistant';
import WorkLog from './components/WorkLog';
import CalendarView from './components/CalendarView';
import InfoCFG from './components/InfoCFG';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, Settings as SettingsIcon, MessageSquare, Wrench, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { encryptState, decryptState } from './utils/storage';
import { initializeRAG, isRAGReady } from './services/ragService'; // Import RAG service

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'action' | 'history' | 'settings' | 'assistant' | 'worklog' | 'infocfg'>('dashboard');
  const [ragStatus, setRagStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  // 1. Load/Save State
  useEffect(() => {
    const saved = localStorage.getItem('marinaLogState');
    if (saved) {
      try {
        const decrypted = decryptState(saved);
        if (decrypted) {
            setState(prev => ({
                ...INITIAL_STATE,
                ...decrypted,
                balances: { ...INITIAL_STATE.balances, ...decrypted.balances },
                workLogs: Array.isArray(decrypted.workLogs) ? decrypted.workLogs : [],
                user: decrypted.user || INITIAL_STATE.user
            }));
        } else {
            console.warn("Failed to decrypt state. Using initial state.");
        }
      } catch (e) {
        console.error("Failed to load or parse state", e);
      }
    }
  }, []);

  useEffect(() => {
    const encrypted = encryptState(state);
    localStorage.setItem('marinaLogState', encrypted);
  }, [state]);

  // 2. Initialize RAG Service
  useEffect(() => {
    const init = async () => {
        try {
            await initializeRAG();
            setRagStatus('ready');
        } catch (e) {
            console.error("RAG Initialization failed:", e);
            setRagStatus('error');
        }
    };
    init();
  }, []);


  const handleUpdateUser = (userData: { name: string; rank: string; avatarUrl?: string }) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
  };

  const handleResetData = () => {
    setState(prev => ({
      ...INITIAL_STATE,
      user: prev.user, 
      customFields: prev.customFields 
    }));
    setActiveTab('dashboard');
  };

  const handleAddEntry = (newEntryData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const entry: LogEntry = {
      ...newEntryData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setState(prev => {
      const newBalances = { ...prev.balances };
      switch (entry.type) {
        case 'ordinaria': newBalances.ordinaria -= entry.quantity; break;
        case 'legge937': newBalances.legge937 -= entry.quantity; break;
        case 'malattia': newBalances.malattia -= entry.quantity; break;
        case 'guardia':
          newBalances.moneyBank += entry.moneyAccrued;
          const dateObj = new Date(entry.date);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          if (isWeekend) {
              newBalances.recuperiMaturati += 1;
          } else {
              newBalances.hoursBank += entry.quantity; 
          }
          break;
        case 'straordinario': if (!entry.isPaid) newBalances.hoursBank += entry.quantity; break;
        case 'recupero':
          if (entry.quantity === 1) newBalances.recuperiMaturati -= 1;
          else newBalances.hoursBank -= entry.quantity;
          break;
        case 'permesso': newBalances.hoursBank -= entry.quantity; break;
        case 'rettifica':
           if (entry.targetBalance) {
               newBalances[entry.targetBalance] = (newBalances[entry.targetBalance] || 0) + entry.quantity;
           }
           break;
        case 'custom':
          if (entry.customFieldId) {
             const field = prev.customFields.find(f => f.id === entry.customFieldId);
             if (field) {
                 if (field.balanceEffect === 'subtract') newBalances[field.id] = (newBalances[field.id] || 0) - entry.quantity;
                 else if (field.balanceEffect === 'add') newBalances[field.id] = (newBalances[field.id] || 0) + entry.quantity;
             }
          }
          break;
      }

      return {
        ...prev,
        balances: newBalances,
        history: [entry, ...prev.history],
      };
    });

    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 font-sans flex flex-col lg:flex-row overflow-hidden relative selection:bg-blue-500/30">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-navy-950/80 backdrop-blur-3xl border-r border-white/5 h-screen p-6 fixed z-20">
        <div className="flex flex-col items-center justify-center mb-10 pt-4 pb-8">
            {/* Logo rimosso come richiesto - solo spazio pulito */}
        </div>
        <nav className="space-y-1.5 flex-1">
            <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<CalendarIcon size={20} />} label="Turni" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
            <SidebarItem icon={<PlusCircle size={20} />} label="Nuovo Servizio" active={activeTab === 'action'} onClick={() => setActiveTab('action')} />
            <SidebarItem icon={<Wrench size={20} />} label="Giornale Lavori" active={activeTab === 'worklog'} onClick={() => setActiveTab('worklog')} />
            <SidebarItem icon={<HistoryIcon size={20} />} label="Storico" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            <SidebarItem icon={<BookOpen size={20} />} label="Info CFG" active={activeTab === 'infocfg'} onClick={() => setActiveTab('infocfg')} />
            <SidebarItem icon={<MessageSquare size={20} />} label="Assistente AI" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
            <SidebarItem icon={<SettingsIcon size={20} />} label="Impostazioni" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
      </aside>

      {/* IPHONE HEADER - PULITO E SENZA LOGO/TITOLO */}
      <header className="lg:hidden bg-navy-950/40 backdrop-blur-2xl border-b border-white/5 p-4 sticky top-0 z-30 flex justify-end items-center h-20 pt-safe shadow-xl">
         <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-xs font-black text-white uppercase leading-none tracking-tighter">{state.user.rank}</p>
                <p className="text-lg text-blue-400 font-bold uppercase tracking-widest">{state.user.name}</p>
            </div>
            <img 
              src={state.user.avatarUrl} 
              className="w-14 h-14 rounded-xl border-2 border-blue-500/50 object-cover shadow-2xl active:scale-95 transition-transform" 
              onClick={() => setActiveTab('settings')} 
              alt="Profilo"
            />
         </div>
      </header>

      {/* MAIN CONTENT - OTTIMIZZATO IPHONE */}
      <main className="flex-1 lg:ml-72 p-6 lg:p-10 overflow-y-auto h-screen relative z-10 print:p-0">
        <div className="max-w-4xl mx-auto pb-44">
            {activeTab === 'dashboard' && <Dashboard state={state} />}
            {activeTab === 'calendar' && <CalendarView state={state} onAddEntry={handleAddEntry} />}
            {activeTab === 'action' && <ActionPanel state={state} onAddEntry={handleAddEntry} onShowInfo={() => setActiveTab('infocfg')} />}
            {activeTab === 'worklog' && <WorkLog state={state} onAddLog={() => {}} onUpdateLog={() => {}} onDeleteLog={() => {}} />}
            {activeTab === 'history' && <History state={state} onDelete={(id) => setState(p => ({...p, history: p.history.filter(e => e.id !== id)}))} />}
            {activeTab === 'infocfg' && <InfoCFG />}
            {activeTab === 'settings' && (
              <Settings 
                state={state} 
                onReset={handleResetData} 
                onAddCustomField={(f) => setState(p => ({...p, customFields: [...p.customFields, f]}))} 
                onDeleteCustomField={(id) => setState(p => ({...p, customFields: p.customFields.filter(f => f.id !== id)}))}
                onUpdateUser={handleUpdateUser}
              />
            )}
            {activeTab === 'assistant' && <Assistant state={state} ragStatus={ragStatus} />}
        </div>
      </main>

      {/* IPHONE NATIVE TAB BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 ios-tab-bar flex justify-around items-end z-40 pb-safe shadow-[0_-15px_50px_rgba(0,0,0,0.8)] px-4">
          <MobileNavItem icon={<LayoutDashboard size={28} />} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <MobileNavItem icon={<CalendarIcon size={28} />} label="Turni" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
          
          <div className="relative -top-6 flex items-center justify-center">
            <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <button 
                onClick={() => setActiveTab('action')} 
                className="relative bg-gradient-to-tr from-blue-400 to-blue-700 p-5 rounded-[2rem] text-white shadow-[0_15px_35px_rgba(37,99,235,0.6)] active:scale-90 transition-all border border-blue-300/40 h-20 w-20 flex items-center justify-center"
            >
               <PlusCircle size={40} strokeWidth={2.5} />
            </button>
          </div>
          
          <MobileNavItem icon={<MessageSquare size={28} />} label="AI" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} />
          <MobileNavItem icon={<SettingsIcon size={28} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-blue-600 text-white font-black shadow-2xl border border-blue-400/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
        <div className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>{icon}</div>
        <span className="text-sm uppercase font-bold tracking-widest">{label}</span>
    </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center w-full pt-4 pb-2 transition-all duration-300 ${active ? 'text-blue-400' : 'text-slate-500'}`}
    >
        <div className={`transition-all duration-300 ${active ? 'scale-125 -translate-y-2' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] mt-1 font-black uppercase tracking-widest transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
);

export default App;