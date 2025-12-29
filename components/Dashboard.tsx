import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { AppState } from '../types';
import { 
  Shield, Clock, Banknote, HeartPulse, Award, FileText, 
  Anchor, Loader2, X, ShieldCheck, Activity, Layers, Info
} from 'lucide-react';
// Rimosso: import { askMilitaryAdvisor } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
}

const AnimatedNumber: React.FC<{ value: number; decimals?: number; suffix?: string; delay?: number }> = ({ 
  value, 
  decimals = 0, 
  suffix = "", 
  delay = 0 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(easeProgress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
        setIsDone(true);
      }
    };
    const timeout = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <span className={`font-tactical transition-all duration-700 ${isDone ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-slate-600'}`} style={{ fontWeight: isDone ? 900 : 500 }}>
      {displayValue.toLocaleString('it-IT', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {isDone && suffix && (
        <span className="text-[10px] font-black opacity-50 ml-1 uppercase">{suffix}</span>
      )}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
  colorClass: string;
  borderColor: string;
  staggerClass: string;
  decimals?: number;
  hexColor: string; // Aggiunto per il gradiente
}> = ({ title, value, suffix, icon, colorClass, borderColor, staggerClass, decimals = 0, hexColor }) => {
  
  // Calcola la percentuale per la barra di progresso (simulata)
  const maxValue = title.includes('Ordinaria') ? 39 : 10; // Esempio di massimo
  const progressPercent = Math.min(100, (value / maxValue) * 100);

  return (
    <div className={`relative ios-card p-4 rounded-[1.5rem] shadow-xl animate-card-entry ${staggerClass} border-t-2 ${borderColor} overflow-hidden flex flex-col justify-between h-28 hover-3d`}>
      
      {/* Progress Bar Animata (Simulata) */}
      <div 
        className="absolute bottom-0 left-0 h-1 opacity-5" 
        style={{ 
          width: `${progressPercent}%`, 
          background: `linear-gradient(to right, transparent, ${hexColor})`,
          animation: 'fill-progress 1.5s ease-out forwards',
          '--progress-width': `${progressPercent}%`
        } as React.CSSProperties}
      ></div>

      <div className="absolute top-0 right-0 p-2 opacity-5">
        {React.cloneElement(icon as React.ReactElement, { size: 40 })}
      </div>
      <h3 className="text-slate-500 text-[9px] uppercase font-black tracking-widest leading-tight">{title}</h3>
      <div className={`text-xl font-black flex items-baseline gap-1 ${colorClass}`}>
        <AnimatedNumber value={value} suffix={suffix} decimals={decimals} delay={200} />
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportBriefing, setReportBriefing] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Funzione per generare un riassunto statico basato sui saldi
  const generateStaticBriefing = useMemo(() => {
    const { ordinaria, legge937, hoursBank, moneyBank, recuperiMaturati } = state.balances;
    
    let briefing = "Comandi. Analisi Tattica dei Saldi Operativi:\n\n";
    briefing += `Licenza Ordinaria: ${ordinaria} giorni disponibili. `;
    briefing += ordinaria < 10 ? "Attenzione, il saldo è basso. " : "Il saldo è adeguato. ";
    briefing += `Legge 937: ${legge937} giorni. `;
    briefing += `Recuperi Maturati (GNL/CFG): ${recuperiMaturati} giorni. `;
    briefing += `Banca Ore: ${hoursBank.toFixed(1)} ore. `;
    briefing += `Compensi CFG: €${moneyBank.toFixed(2)}. `;
    
    if (moneyBank > 100) {
        briefing += "Si consiglia di pianificare l'utilizzo dei compensi accumulati.";
    } else if (recuperiMaturati > 5) {
        briefing += "Si raccomanda di programmare il recupero dei giorni maturati per ottimizzare l'efficienza del personale.";
    } else {
        briefing += "Situazione generale stabile. Mantenere la rotta.";
    }

    return briefing;
  }, [state.balances]);

  // Definizione di tutti gli item per poterli usare sia nella griglia che nel grafico
  const allStatItems = useMemo(() => {
    const baseItems = [
      { id: 'ordinaria', label: 'Ordinaria', val: state.balances.ordinaria, unit: 'gg', color: 'text-blue-400', hex: '#3b82f6', icon: <Award /> },
      { id: 'legge937', label: 'L. 937', val: state.balances.legge937, unit: 'gg', color: 'text-yellow-400', hex: '#eab308', icon: <Shield /> },
      { id: 'recuperiMaturati', label: 'Recuperi', val: state.balances.recuperiMaturati, unit: 'gg', color: 'text-orange-400', hex: '#f97316', icon: <Anchor /> },
      { id: 'hoursBank', label: 'Banca Ore', val: state.balances.hoursBank, unit: 'h', color: 'text-emerald-400', hex: '#10b981', icon: <Clock /> },
      { id: 'moneyBank', label: 'Compensi', val: state.balances.moneyBank, unit: '€', color: 'text-gold-500', hex: '#d97706', icon: <Banknote /> },
      { id: 'malattia', label: 'Malattia', val: state.balances.malattia, unit: 'gg', color: 'text-red-400', hex: '#ef4444', icon: <HeartPulse /> },
    ];

    const customItems = state.customFields.map(field => ({
      id: field.id,
      label: field.name,
      val: state.balances[field.id] || 0,
      unit: field.unit === 'giorni' ? 'gg' : 'h',
      color: 'text-slate-300',
      hex: '#64748b',
      icon: <Layers />
    }));

    return [...baseItems, ...customItems];
  }, [state.balances, state.customFields]);

  const chartData = useMemo(() => {
    return allStatItems.map(item => ({
      name: item.label,
      shortLabel: item.label.length > 5 ? item.label.substring(0, 4) + '.' : item.label,
      val: item.val,
      unit: item.unit,
      color: item.hex
    }));
  }, [allStatItems]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simula il tempo di caricamento
    setTimeout(() => {
        setReportBriefing(generateStaticBriefing);
        setShowReport(true);
        setIsGenerating(false);
    }, 500);
  };

  const LOGO_URL = "https://i.imgur.com/pS2B02V.png";

  return (
    <div className="space-y-8">
      
      {/* HERO SECTION COMPATTA */}
      <div className="flex flex-col items-center justify-center py-4 animate-fade-in text-center">
          <div className="mega-logo-container !my-0">
              <div className="hologram-backlight !w-64 !h-64"></div>
              <img 
                src={LOGO_URL} 
                alt="MarinaLog Logo" 
                className="logo-main-visual !w-56"
              />
          </div>
          <h1 className="mt-4 text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(59,130,246,0.4)]">MarinaLog</h1>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] opacity-60 mt-1">Status Operativo Attivo</p>
      </div>

      {/* STATS GRID - TUTTE LE VOCI */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {allStatItems.map((item, index) => (
          <StatCard 
            key={item.id}
            title={item.label} 
            value={item.val} 
            suffix={item.unit} 
            icon={item.icon} 
            colorClass={item.color}
            borderColor={`border-t-[${item.hex}]`}
            staggerClass={`stagger-${(index % 4) + 1}`}
            decimals={item.id === 'hoursBank' || item.id === 'moneyBank' ? 1 : 0}
            hexColor={item.hex}
          />
        ))}
      </div>

      {/* ANALISI VETTORIALE - TUTTE LE VOCI DINAMICHE */}
      <div className="max-w-2xl mx-auto">
        <div className="ios-card p-5 rounded-[2rem] shadow-2xl space-y-5 animate-slide-up border-t-2 border-blue-500/20 hover-3d">
          <div className="flex justify-between items-center">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500"/> Indice Assetti Globale
              </h3>
          </div>
          
          <div className="w-full h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -35, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#334155" opacity={0.1} vertical={false} />
                  <XAxis 
                      dataKey="shortLabel" 
                      fontSize={8} 
                      fontWeight={900} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#64748b"
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            return (
                                <div className="bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-2xl">
                                    <p className="text-[10px] font-black text-white uppercase">{payload[0].payload.name}</p>
                                    <p className="text-xs font-bold text-blue-400">{payload[0].value} {payload[0].payload.unit}</p>
                                </div>
                            );
                        }
                        return null;
                    }}
                  />
                  <Bar dataKey="val" radius={[6, 6, 0, 0]} animationDuration={2000}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          </div>

          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-br from-gold-400 to-gold-600 text-navy-950 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-gold-500/20 active:scale-95 transition-all h-14"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <FileText size={16}/>}
            Genera Report Tattico
          </button>
        </div>
      </div>

      {/* MODAL REPORT - BOTTOM SHEET */}
      {showReport && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-navy-950/90 backdrop-blur-2xl animate-fade-in p-4">
          <div className="bg-white text-navy-950 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-slide-up pb-safe">
            <div className="p-6 bg-slate-100 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={22} className="text-navy-900" />
                    <h2 className="font-black uppercase tracking-tighter text-sm">Report Tattico</h2>
                </div>
                <button onClick={() => setShowReport(false)} className="p-3 bg-slate-200 rounded-full active:bg-slate-300 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 font-serif italic text-base leading-relaxed text-navy-900/90 border-b whitespace-pre-line">
              {reportBriefing}
            </div>
            <div className="p-6 bg-white flex justify-center">
               <button 
                onClick={() => window.print()} 
                className="w-full bg-navy-950 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] h-14 shadow-lg"
               >
                 Salva PDF Operativo
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;