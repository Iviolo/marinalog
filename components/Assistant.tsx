import React, { useState, useEffect, useRef } from 'react';
import { AppState } from '../types';
import { MessageSquare, Send, Loader2, User, Bot, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { queryRAG } from '../services/ragService';

interface AssistantProps {
  state: AppState;
  ragStatus: 'loading' | 'ready' | 'error';
}

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    sources?: string[];
}

const Assistant: React.FC<AssistantProps> = ({ state, ragStatus }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize welcome message based on RAG status
    if (messages.length === 0) {
        let welcomeMessage: ChatMessage;
        if (ragStatus === 'loading') {
            welcomeMessage = { role: 'ai', text: 'Comandi! Sto caricando i regolamenti della Marina Militare (IA Offline in preparazione). Attendere l\'indicizzazione iniziale...' };
        } else if (ragStatus === 'ready') {
            welcomeMessage = { role: 'ai', text: 'Comandi! Sono il Consigliere Navale. L\'IA Offline è attiva. Chiedimi pure informazioni sui regolamenti MM (Licenze, Disciplina, Orari, ecc.).' };
        } else {
            welcomeMessage = { role: 'ai', text: 'Attenzione: Errore nel caricamento dell\'IA Offline. Posso solo confermare i tuoi saldi attuali.' };
        }
        setMessages([welcomeMessage]);
    }
  }, [ragStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
        if (ragStatus === 'ready') {
            const { answer, sources } = await queryRAG(userMsg);
            setMessages(prev => [...prev, { role: 'ai', text: answer, sources }]);
        } else {
            // Fallback to static response if RAG is not ready
            const response = `Affermativo. I tuoi saldi attuali sono: Ordinaria ${state.balances.ordinaria} gg, Banca Ore ${state.balances.hoursBank.toFixed(1)} h, Compensi €${state.balances.moneyBank.toFixed(2)}. L'IA è in stato: ${ragStatus}.`;
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        }
    } catch (error) {
        console.error("AI Query Error:", error);
        setMessages(prev => [...prev, { role: 'ai', text: "Si è verificato un errore critico durante l'elaborazione della query AI." }]);
    } finally {
        setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (ragStatus === 'loading') {
        return (
            <p className="text-xs text-yellow-400 flex items-center gap-1 animate-pulse">
                <Loader2 size={12} className="animate-spin"/> Indicizzazione Regolamenti in corso...
            </p>
        );
    }
    if (ragStatus === 'ready') {
        return (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle size={12}/> IA Offline Attiva
            </p>
        );
    }
    return (
        <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={12}/> Errore IA
        </p>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg flex flex-col h-[600px] overflow-hidden animate-fade-in mb-20 lg:mb-0">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-gold-500/20 rounded-full text-gold-500">
            <Bot size={24} />
        </div>
        <div>
            <h3 className="font-bold text-white">Consigliere Navale</h3>
            {getStatusDisplay()}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/20">
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-100 rounded-bl-none'
                }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase font-bold">
                        {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                        {msg.role === 'user' ? 'Tu' : 'Assistente'}
                    </div>
                    <div className="whitespace-pre-line leading-relaxed text-sm">
                        {msg.text}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-600 text-[10px] text-slate-400 italic">
                            <span className="font-bold block mb-0.5">Fonti:</span>
                            {msg.sources.join(', ')}
                        </div>
                    )}
                </div>
            </div>
        ))}
        {loading && (
            <div className="flex justify-start">
                <div className="bg-slate-700 p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                    <Loader2 className="animate-spin text-gold-500" size={16} />
                    <span className="text-slate-400 text-sm">Elaborazione risposta RAG...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={ragStatus === 'ready' ? "Chiedi un regolamento..." : "Attendere caricamento IA..."}
            disabled={loading || ragStatus === 'loading'}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none disabled:opacity-50"
        />
        <button 
            type="submit"
            disabled={loading || ragStatus === 'loading'}
            className="bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 p-3 rounded-xl transition-colors font-bold"
        >
            <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Assistant;