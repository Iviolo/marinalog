
import React, { useState } from 'react';
import { AppState, CustomField } from '../types';
import { Plus, RefreshCw, Trash, Settings as SettingsIcon, User, Camera, ShieldCheck, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  onReset: () => void;
  onAddCustomField: (field: CustomField) => void;
  onDeleteCustomField: (id: string) => void;
  onUpdateUser: (userData: { name: string; rank: string; avatarUrl?: string }) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onReset, onAddCustomField, onDeleteCustomField, onUpdateUser }) => {
  // User Profile State
  const [userName, setUserName] = useState(state.user.name);
  const [userRank, setUserRank] = useState(state.user.rank);
  const [userAvatar, setUserAvatar] = useState(state.user.avatarUrl || '');

  // UI States
  const [showResetModal, setShowResetModal] = useState(false);

  // Custom Field State
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldUnit, setNewFieldUnit] = useState<'giorni'|'ore'>('giorni');
  const [newFieldEffect, setNewFieldEffect] = useState<'add'|'subtract'|'none'>('subtract');
  const [newFieldInitial, setNewFieldInitial] = useState(0);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: userName,
      rank: userRank,
      avatarUrl: userAvatar
    });
    alert("Profilo aggiornato con successo!");
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `custom_${Date.now()}`;
    onAddCustomField({
        id,
        name: newFieldName,
        unit: newFieldUnit,
        balanceEffect: newFieldEffect,
        initialBalance: newFieldInitial,
        color: '#94a3b8'
    });
    setNewFieldName('');
    setNewFieldInitial(0);
  };

  const executeReset = () => {
    onReset();
    setShowResetModal(false);
    alert("Dati operativi azzerati correttamente.");
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-10 animate-fade-in relative">
      
      {/* Modal di Reset (Emergenza) */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] bg-navy-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border-2 border-red-500 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-card-entry">
                <div className="bg-red-500 p-6 flex items-center gap-4 text-white">
                    <ShieldAlert size={40} className="animate-pulse" />
                    <div>
                        <h2 className="font-black uppercase tracking-tighter text-xl leading-none">Protocollo di Emergenza</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Cancellazione Dati Sensibili</p>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-300">Stai per eseguire il reset totale dei seguenti dati:</p>
                        <ul className="text-xs space-y-2 text-slate-400 font-mono">
                            <li className="flex items-center gap-2"><X size={12} className="text-red-500"/> Storico Movimenti</li>
                            <li className="flex items-center gap-2"><X size={12} className="text-red-500"/> Giornale Lavori</li>
                            <li className="flex items-center gap-2"><X size={12} className="text-red-500"/> Saldi Guardie, Ore e Compensi</li>
                            <li className="flex items-center gap-2"><X size={12} className="text-red-500"/> Ripristino Licenze Iniziali</li>
                        </ul>
                        <p className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-[10px] text-red-400 font-black uppercase text-center mt-4">
                            Il tuo profilo (Nome, Grado, Foto) NON verrà rimosso.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button 
                            onClick={executeReset}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            CONFERMA RESET DATI
                        </button>
                        <button 
                            onClick={() => setShowResetModal(false)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 py-3 rounded-2xl font-bold text-xs transition-all uppercase"
                        >
                            Annulla Operazione
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Profilo Utente */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <User className="text-gold-500" size={24} />
            Configurazione Profilo Privato
        </h3>
        
        <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-900/40 rounded-2xl border border-slate-700/50 group">
                <div className="relative w-24 h-24 mb-4">
                  <img 
                    src={userAvatar || "https://picsum.photos/200"} 
                    alt="Preview" 
                    className="w-full h-full rounded-full object-cover border-4 border-gold-500 shadow-xl group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Anteprima Foto</p>
            </div>
            
            <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block tracking-wider">Nome e Cognome</label>
                    <input 
                        type="text" required 
                        value={userName} 
                        onChange={e => setUserName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block tracking-wider">Grado</label>
                    <input 
                        type="text" required 
                        value={userRank} 
                        onChange={e => setUserRank(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none font-bold"
                    />
                  </div>
                </div>
                <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block tracking-wider">URL Foto Profilo</label>
                    <input 
                        type="url" 
                        value={userAvatar} 
                        onChange={e => setUserAvatar(e.target.value)}
                        placeholder="Incolla link immagine qui..."
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none text-xs"
                    />
                </div>
                <button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/10 uppercase text-xs tracking-widest">
                    <ShieldCheck size={16} /> Salva Dati Profilo
                </button>
            </div>
        </form>
      </div>

      {/* Campi Personalizzati */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Plus className="text-emerald-500" size={24} />
            Campi Personalizzati
        </h3>
        <form onSubmit={handleAddField} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Nome Campo</label>
                    <input 
                        type="text" required 
                        value={newFieldName} 
                        onChange={e => setNewFieldName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        placeholder="Es. Licenza Studio"
                    />
                </div>
                 <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Plafond Iniziale</label>
                    <input 
                        type="number" required 
                        value={newFieldInitial} 
                        onChange={e => setNewFieldInitial(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Unità di Misura</label>
                    <select 
                        value={newFieldUnit} 
                        onChange={(e: any) => setNewFieldUnit(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="giorni">Giorni</option>
                        <option value="ore">Ore</option>
                    </select>
                </div>
                 <div>
                    <label className="text-slate-400 text-[10px] font-black uppercase mb-1 block">Effetto su Saldo</label>
                    <select 
                        value={newFieldEffect} 
                        onChange={(e: any) => setNewFieldEffect(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                        <option value="subtract">Sottrai (Consumo)</option>
                        <option value="add">Aggiungi (Accumulo)</option>
                        <option value="none">Nessuno (Solo tracciamento)</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors uppercase text-xs tracking-widest">
                <Plus size={16} /> Aggiungi Campo Assetto
            </button>
        </form>

        <div className="mt-6 space-y-2">
            {state.customFields.map(field => (
                <div key={field.id} className="flex items-center justify-between bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 hover:border-slate-500 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                        <span className="font-bold text-white text-sm uppercase">{field.name}</span>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded">({field.unit})</span>
                    </div>
                    <button 
                        onClick={() => onDeleteCustomField(field.id)}
                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                    >
                        <Trash size={18} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* Gestione Dati / Reset (POTENZIATO) */}
      <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-8 animate-pulse-alert">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-6">
                <div className="p-4 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30">
                    <AlertTriangle size={32} />
                </div>
                <div>
                    <h4 className="text-red-500 font-black uppercase text-xl tracking-tighter">Pericolo: Reset Dati Operativi</h4>
                    <p className="text-slate-400 text-sm font-bold mt-1">Questa operazione distruggerà tutto lo storico guardie, i compensi e le ore accumulate.</p>
                    <p className="text-[10px] text-red-400/80 font-black uppercase tracking-widest mt-2 border-t border-red-500/20 pt-2">Verrà mantenuto solo il tuo profilo utente e le impostazioni dei campi.</p>
                </div>
            </div>
            <button 
                onClick={() => setShowResetModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-red-500/40 active:scale-95 whitespace-nowrap"
            >
                INIZIA RESET TOTALE
            </button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
