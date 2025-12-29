import React from 'react';
import { AppState, LogEntry } from '../types';
import { Trash2, FileText, Briefcase } from 'lucide-react';

interface HistoryProps {
  state: AppState;
  onDelete: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ state, onDelete }) => {

  const getBalanceLabel = (key: string) => {
      if (key === 'ordinaria') return 'Licenza Ordinaria';
      if (key === 'legge937') return 'Legge 937';
      if (key === 'malattia') return 'Malattia';
      if (key === 'hoursBank') return 'Banca Ore';
      if (key === 'moneyBank') return 'Compensi';
      const custom = state.customFields.find(f => f.id === key);
      return custom ? custom.name : key;
  };

  const getBalanceUnit = (key: string) => {
      if (key === 'moneyBank') return '€';
      if (key === 'hoursBank') return 'h';
      return '';
  };

  const getBadgeClasses = (type: LogEntry['type']) => {
    switch (type) {
        case 'ordinaria': return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-blue-500/30';
        case 'legge937': return 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-yellow-500/30';
        case 'malattia': return 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-red-500/30';
        case 'guardia': return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-purple-500/30';
        case 'recupero': return 'bg-gradient-to-r from-emerald-500 to-emerald-700 text-white shadow-emerald-500/30';
        case 'permesso': return 'bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-orange-500/30';
        case 'straordinario': return 'bg-gradient-to-r from-indigo-500 to-indigo-700 text-white shadow-indigo-500/30';
        case 'rettifica': return 'bg-gradient-to-r from-pink-500 to-pink-700 text-white shadow-pink-500/30';
        default: return 'bg-slate-600 text-white shadow-slate-500/30';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-lg pb-24 lg:pb-6">
      <h2 className="text-xl font-bold text-white mb-6">Storico Movimenti</h2>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {state.history.length === 0 ? (
          <div className="text-center text-slate-500 py-10">Nessun movimento registrato.</div>
        ) : (
          state.history.map((entry) => (
            <div key={entry.id} className="group bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-all flex justify-between items-center hover-3d">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-md ${getBadgeClasses(entry.type)}`}>
                    {entry.type}
                  </span>
                  <span className="text-slate-400 text-xs">{entry.date}</span>
                </div>
                <div className="text-white font-medium text-sm">
                    {entry.type === 'permesso' ? `Permesso orario (${entry.quantity.toFixed(1)}h)` : 
                     entry.type === 'straordinario' ? `Straordinario (${entry.quantity.toFixed(1)}h) - ${entry.isPaid ? 'Pagamento' : 'Banca Ore'}` :
                     entry.type === 'guardia' ? `Guardia (+${entry.quantity}h / +${entry.moneyAccrued}€)` :
                     entry.type === 'recupero' ? `Recupero (-${entry.quantity}h)` :
                     entry.type === 'rettifica' && entry.targetBalance ? 
                        `Rettifica ${getBalanceLabel(entry.targetBalance)}: ${entry.quantity > 0 ? '+' : ''}${entry.quantity}${getBalanceUnit(entry.targetBalance)}` :
                     `${entry.quantity} Giorno`}
                </div>
                {entry.notes && (
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <FileText size={12} />
                    {entry.notes}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => onDelete(entry.id)}
                className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Elimina"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;