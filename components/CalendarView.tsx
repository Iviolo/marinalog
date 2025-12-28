
import React, { useState } from 'react';
import { AppState, LogEntry, LogType } from '../types';
import { ChevronLeft, ChevronRight, Info, Plus } from 'lucide-react';

interface CalendarViewProps {
  state: AppState;
  onAddEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ state, onAddEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('it-IT', { month: 'long' });

  const days = [];
  const startOffset = (firstDayOfMonth(year, month) + 6) % 7; // Adjust to start Monday
  
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth(year, month); i++) days.push(i);

  const getEntryForDay = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return state.history.find(h => h.date === dStr);
  };

  const getTypeStyles = (type: LogType) => {
    switch (type) {
      case 'guardia': return { bg: 'bg-purple-500/30', border: 'border-purple-500', text: 'text-purple-300', label: 'GUA' };
      case 'ordinaria': return { bg: 'bg-blue-500/30', border: 'border-blue-500', text: 'text-blue-300', label: 'ORD' };
      case 'legge937': return { bg: 'bg-yellow-500/30', border: 'border-yellow-500', text: 'text-yellow-300', label: '937' };
      case 'malattia': return { bg: 'bg-red-500/30', border: 'border-red-500', text: 'text-red-300', label: 'MAL' };
      case 'recupero': return { bg: 'bg-emerald-500/30', border: 'border-emerald-500', text: 'text-emerald-300', label: 'REC' };
      case 'permesso': return { bg: 'bg-orange-500/30', border: 'border-orange-500', text: 'text-orange-300', label: 'PER' };
      case 'straordinario': return { bg: 'bg-indigo-500/30', border: 'border-indigo-500', text: 'text-indigo-300', label: 'STR' };
      case 'rettifica': return { bg: 'bg-pink-500/30', border: 'border-pink-500', text: 'text-pink-300', label: 'RET' };
      default: return { bg: 'bg-slate-500/30', border: 'border-slate-500', text: 'text-slate-300', label: 'ALT' };
    }
  };

  const handleDayClick = (day: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, month, day).getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const existing = getEntryForDay(day);
    if (existing) {
        alert(`Attività già registrata: ${existing.type.toUpperCase()}\nNote: ${existing.notes || 'Nessuna'}`);
        return;
    }

    if (window.confirm(`Registrare una GUARDIA per il giorno ${day} ${monthName}?${isWeekend ? '\nAUTOMAZIONE CFG: +90€ e +1gg recupero (Vademecum CFG).' : ''}`)) {
        onAddEntry({
            date: dStr,
            type: 'guardia',
            quantity: isWeekend ? 24 : 8,
            moneyAccrued: isWeekend ? 90 : 30,
            notes: isWeekend ? 'Servizio Continuativo Festivo (Vademecum CFG)' : 'Servizio Guardia Feriale',
        });
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl animate-fade-in pb-24 lg:pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-3">
            <span className="text-gold-500 font-black">{monthName}</span> {year}
        </h2>
        <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors cursor-pointer"><ChevronLeft size={20}/></button>
            <button onClick={nextMonth} className="p-2 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors cursor-pointer"><ChevronRight size={20}/></button>
        </div>
      </div>

      {/* Header giorni settimana */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2">
        {['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'].map((d, i) => (
            <div key={i} className={`text-center text-[10px] font-bold py-2 ${i >= 5 ? 'text-gold-500' : 'text-slate-500'}`}>
                {d}
            </div>
        ))}
      </div>

      {/* Griglia Calendario */}
      <div className="grid grid-cols-7 gap-1 lg:gap-2">
        {days.map((day, i) => {
            if (day === null) return <div key={i} className="aspect-square opacity-0"></div>;
            
            const entry = getEntryForDay(day);
            const isWeekend = (i % 7) === 5 || (i % 7) === 6;
            const styles = entry ? getTypeStyles(entry.type) : null;

            return (
                <button
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square relative rounded-xl lg:rounded-2xl flex flex-col items-center justify-center transition-all group overflow-hidden border cursor-pointer
                        ${entry 
                            ? `${styles?.bg} ${styles?.border} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                            : (isWeekend ? 'bg-slate-700/50 border-gold-500/20 hover:border-gold-500/50' : 'bg-slate-900/30 border-slate-700 hover:border-slate-500')
                        }`}
                >
                    <span className={`text-xs lg:text-sm font-bold ${entry ? 'text-white' : (isWeekend ? 'text-gold-500' : 'text-slate-400')}`}>
                        {day}
                    </span>
                    
                    {entry && (
                        <span className={`text-[8px] lg:text-[10px] font-black uppercase mt-0.5 ${styles?.text}`}>
                            {styles?.label}
                        </span>
                    )}

                    {!entry && (
                        <Plus size={10} className="text-slate-500 opacity-0 group-hover:opacity-100 absolute bottom-1 lg:bottom-2" />
                    )}
                </button>
            );
        })}
      </div>

      {/* Legenda Colori */}
      <div className="mt-8 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
            { label: 'Guardia', color: 'bg-purple-500' },
            { label: 'Licenza', color: 'bg-blue-500' },
            { label: '937', color: 'bg-yellow-500' },
            { label: 'Malattia', color: 'bg-red-500' },
            { label: 'Recupero', color: 'bg-emerald-500' },
            { label: 'Permesso', color: 'bg-orange-500' },
            { label: 'Straord.', color: 'bg-indigo-500' }
        ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 p-1.5 bg-slate-900/40 rounded-lg border border-slate-700/50">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{item.label}</span>
            </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-700 hover:border-gold-500/30 transition-colors">
          <div className="flex items-start gap-3">
              <Info size={18} className="text-gold-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-400 leading-tight">
                  <p className="font-bold text-slate-200 mb-1">Visualizzazione Turni</p>
                  Ogni quadratino mostra il numero del giorno e il tipo di servizio abbreviato. 
                  Clicca su un giorno vuoto per registrare una Guardia (CFG). 
                  Usa "Registra Servizio" per inserire Licenze o altri tipi di assenza.
              </div>
          </div>
      </div>
    </div>
  );
};

export default CalendarView;
