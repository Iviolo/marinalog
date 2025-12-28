import React, { useState, useEffect, useRef } from 'react';
import { LogType, AppState, LogEntry } from '../types';
import { Calendar as CalendarIcon, Save, AlertCircle, Plus, Minus, Edit, Briefcase, ExternalLink, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';

interface ActionPanelProps {
  state: AppState;
  onAddEntry: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  onShowInfo: () => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ state, onAddEntry, onShowInfo }) => {
  const [type, setType] = useState<LogType>('ordinaria');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [notes, setNotes] = useState<string>('');
  const [customFieldId, setCustomFieldId] = useState<string>('');
  const [isPaid, setIsPaid] = useState<boolean>(false);
  
  // Rettifica states
  const [rettificaTarget, setRettificaTarget] = useState<string>('ordinaria');
  const [rettificaOp, setRettificaOp] = useState<'add'|'subtract'>('add');
  const [rettificaQty, setRettificaQty] = useState<number>(1);

  const [calculatedInfo, setCalculatedInfo] = useState<{hours: number, money: number, isWeekend: boolean} | null>(null);
  
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close datepicker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    let hours = 0;
    let money = 0;

    if (type === 'guardia') {
        if (isWeekend) {
            hours = 24;
            money = 90; 
        } else {
            hours = 8;
            money = 30;
        }
    } else if (type === 'recupero') {
        if (dayOfWeek === 5) hours = -4;
        else if (dayOfWeek >= 1 && dayOfWeek <= 4) hours = -8;
        else hours = 0;
    } else if (type === 'permesso' || type === 'straordinario') {
        const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
        const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        hours = Math.max(0, (end - start) / 60);
    }

    setCalculatedInfo({ hours, money, isWeekend });
  }, [type, date, startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let quantity = 0;
    let moneyAccrued = 0;
    let targetBalance: string | undefined;

    if (type === 'ordinaria' || type === 'legge937' || type === 'malattia') {
        quantity = 1;
    } else if (type === 'guardia') {
        quantity = calculatedInfo?.hours || 0;
        moneyAccrued = calculatedInfo?.money || 0;
    } else if (type === 'recupero') {
        quantity = Math.abs(calculatedInfo?.hours || 0);
    } else if (type === 'permesso' || type === 'straordinario') {
        quantity = calculatedInfo?.hours || 0;
    } else if (type === 'custom') {
        quantity = 1;
    } else if (type === 'rettifica') {
        quantity = rettificaOp === 'add' ? Math.abs(rettificaQty) : -Math.abs(rettificaQty);
        targetBalance = rettificaTarget;
    }

    onAddEntry({
        date,
        type,
        quantity,
        moneyAccrued,
        notes,
        targetBalance,
        isPaid: type === 'straordinario' ? isPaid : undefined,
        startTime: (type === 'permesso' || type === 'straordinario') ? startTime : undefined,
        endTime: (type === 'permesso' || type === 'straordinario') ? endTime : undefined,
        customFieldId: type === 'custom' ? customFieldId : undefined
    });

    setNotes('');
    setRettificaQty(1);
  };

  // Mini Calendar Logic
  const [navDate, setNavDate] = useState(new Date(date));
  const renderCalendar = () => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = navDate.toLocaleString('it-IT', { month: 'long' });

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl w-64 animate-fade-in">
        <div className="flex justify-between items-center mb-3">
          <button type="button" onClick={() => setNavDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ChevronLeft size={16}/></button>
          <span className="text-xs font-bold text-white capitalize">{monthName} {year}</span>
          <button type="button" onClick={() => setNavDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ChevronRight size={16}/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['L','M','M','G','V','S','D'].map(d => <span key={d} className="text-[10px] text-slate-500 font-bold">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = date === dStr;
            const isWeekend = (idx % 7) === 5 || (idx % 7) === 6;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setDate(dStr);
                  setShowDatePicker(false);
                }}
                className={`text-[11px] h-7 w-7 rounded-lg flex items-center justify-center transition-all
                  ${isSelected ? 'bg-gold-500 text-navy-900 font-bold' : 
                    isWeekend ? 'text-gold-500 hover:bg-gold-500/10' : 'text-slate-300 hover:bg-slate-800'}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const options: { id: LogType; label: string; color: string; isCustom?: boolean; customId?: string }[] = [
    { id: 'ordinaria', label: 'Licenza Ordinaria', color: 'bg-blue-600' },
    { id: 'legge937', label: 'Legge 937', color: 'bg-yellow-600' },
    { id: 'malattia', label: 'Malattia', color: 'bg-red-600' },
    { id: 'guardia', label: 'Guardia (CFG)', color: 'bg-purple-600' },
    { id: 'straordinario', label: 'Straordinario', color: 'bg-indigo-600' },
    { id: 'recupero', label: 'Recupero', color: 'bg-emerald-600' },
    { id: 'permesso', label: 'Permesso Orario', color: 'bg-orange-600' },
    ...state.customFields.map(f => ({ id: 'custom' as LogType, customId: f.id, label: f.name, color: 'bg-slate-600', isCustom: true })),
    { id: 'rettifica', label: 'Rettifica Saldi', color: 'bg-pink-600' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg animate-slide-up pb-24 lg:pb-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Save className="text-gold-500" />
            Registra Attività
        </h2>
        <button 
          type="button"
          onClick={onShowInfo}
          className="text-[10px] text-slate-400 hover:text-gold-500 flex items-center gap-1 transition-colors uppercase font-bold tracking-tighter"
        >
          <BookOpen size={12} /> Vademecum CFG
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
           {options.map((opt) => (
               <button
                key={opt.isCustom ? `custom-${opt.customId}` : opt.id}
                type="button"
                onClick={() => {
                    setType(opt.id);
                    if (opt.isCustom && opt.customId) setCustomFieldId(opt.customId);
                }}
                className={`p-2.5 rounded-xl text-[11px] font-bold uppercase transition-all duration-200 border border-transparent 
                  ${(type === opt.id && (!opt.isCustom || customFieldId === opt.customId))
                    ? `${opt.color} text-white border-white/20 shadow-lg scale-[1.02]` 
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
               >
                 {opt.label}
               </button>
           ))}
        </div>

        {/* Date Selector (Visual Calendar Toggle) */}
        <div className="space-y-2 relative" ref={datePickerRef}>
          <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Seleziona Data Evento</label>
          <button 
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white flex items-center justify-between hover:border-gold-500/50 transition-all group"
          >
             <div className="flex items-center gap-3">
                <CalendarIcon className="text-gold-500 group-hover:scale-110 transition-transform" size={20}/>
                <span className="font-bold">{new Date(date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
             </div>
             <ChevronRight size={18} className={`text-slate-500 transition-transform ${showDatePicker ? 'rotate-90' : ''}`}/>
          </button>
          
          {showDatePicker && (
            <div className="absolute top-full left-0 z-50 mt-2">
              {renderCalendar()}
            </div>
          )}
        </div>

        {/* RETTIFICA PANEL */}
        {type === 'rettifica' && (
            <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600 space-y-4">
                <div className="flex items-center gap-2 text-pink-400 mb-2">
                    <Edit size={18} />
                    <span className="font-bold text-xs uppercase">Modifica Manuale Saldi</span>
                </div>
                {/* ... existing rettifica controls ... */}
                <select 
                    value={rettificaTarget}
                    onChange={(e) => setRettificaTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none"
                >
                    <option value="ordinaria">Licenza Ordinaria</option>
                    <option value="legge937">Legge 937</option>
                    <option value="malattia">Malattia</option>
                    <option value="hoursBank">Banca Ore</option>
                    <option value="moneyBank">Compensi</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRettificaOp('add')} className={`py-2 rounded-lg text-xs font-bold ${rettificaOp === 'add' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}>+ Aggiungi</button>
                    <button type="button" onClick={() => setRettificaOp('subtract')} className={`py-2 rounded-lg text-xs font-bold ${rettificaOp === 'subtract' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-500'}`}>- Rimuovi</button>
                </div>
                <input type="number" step="0.5" value={rettificaQty} onChange={e => setRettificaQty(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-600 rounded-xl py-2 px-3 text-white text-center font-bold"/>
            </div>
        )}

        {/* STRAORDINARIO / PERMESSO PANEL */}
        {(type === 'permesso' || type === 'straordinario') && (
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] font-bold uppercase">Inizio</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white font-bold"/>
              </div>
              <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] font-bold uppercase">Fine</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 px-4 text-white font-bold"/>
              </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-1">
            <label className="text-slate-400 text-[10px] font-bold uppercase">Note Servizio</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Esempio: Posto di Manovra, Guardia in Porto..."
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-gold-500 outline-none min-h-[60px] text-sm"
            />
        </div>

        {/* Preview Card */}
        {type !== 'rettifica' && (
            <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-600/50 flex items-start gap-3">
                <AlertCircle className="text-gold-500 mt-1 flex-shrink-0" size={16} />
                <div className="text-[11px] text-slate-300">
                    <p className="font-bold text-white mb-0.5">Calcolo Vademecum CFG:</p>
                    <div className="flex flex-wrap gap-2">
                        {type === 'guardia' && <span>Matura: <strong className="text-gold-500">{calculatedInfo?.money}€</strong></span>}
                        {type === 'guardia' && calculatedInfo?.isWeekend && <span>Recupero: <strong className="text-emerald-400">+1 GNL</strong></span>}
                        {(type === 'permesso' || type === 'straordinario') && <span>Quantità: <strong>{calculatedInfo?.hours.toFixed(1)} ore</strong></span>}
                    </div>
                </div>
            </div>
        )}

        <button 
          type="submit"
          className="w-full font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-navy-900 uppercase tracking-widest text-sm"
        >
          {type === 'rettifica' ? 'Conferma Rettifica' : 'Registra nel Giornale'}
        </button>

      </form>
    </div>
  );
};

export default ActionPanel;