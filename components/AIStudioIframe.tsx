import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Target, Zap } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Helper component for individual chat bubbles
const ChatBubble: React.FC<{ message: Message; isUser: boolean }> = ({ message, isUser }) => {
  const bubbleClasses = isUser
    ? 'bg-blue-900/70 text-white border-l-4 border-gold-500 shadow-lg shadow-blue-900/30 animate-slide-in-right'
    : 'bg-slate-800/70 text-slate-200 border-t-2 border-gold-500 shadow-lg shadow-slate-800/30 animate-slide-in-left';
  
  const alignment = isUser ? 'justify-end' : 'justify-start';
  
  // Simple slide-in animation classes (using existing fade-in for simplicity, but adding transform)
  const animationClass = isUser 
    ? 'animate-fade-in transition-transform duration-500 translate-x-0' 
    : 'animate-fade-in transition-transform duration-500 translate-x-0';

  // Note: Tailwind doesn't have built-in slide-in-left/right, so we rely on opacity/scale for a smooth entry.

  return (
    <div className={`flex ${alignment} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl text-sm font-sans transition-all ${bubbleClasses} ${animationClass}`}
      >
        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-[10px] mt-1 text-right font-mono ${isUser ? 'text-gold-400/80' : 'text-slate-500'}`}>
          {message.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </p>
      </div>
    </div>
  );
};


const AIConsultantChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Comando Tattico. Sono il Consulente IA specializzato in turni, Permessi e Regolamenti Marina Militare. In attesa di istruzioni.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      // Context is currently empty in the API call, but the system prompt in api/groq.ts handles the role.
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
        }),
      });

      if (!response.ok) {
        return 'ERRORE CRITICO: Impossibile stabilire la connessione con il modello IA (Groq API). Verificare la chiave API.';
      }

      const data = await response.json();
      return data.reply || 'ERRORE: Risposta non valida dal sistema IA.';
    } catch (error) {
      console.error("AI Service Error:", error);
      return 'ERRORE DI RETE: Fallimento nella comunicazione con il servizio IA.';
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const aiResponseContent = await generateAIResponse(inputValue);
    
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: aiResponseContent, timestamp: new Date() },
    ]);
    setIsLoading(false);
  };

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border-2 border-gold-500 shadow-[0_0_30px_rgba(59,130,246,0.1)] bg-navy-950/80 backdrop-blur-xl pb-24 lg:pb-6">
      
      {/* Header Tattico */}
      <div className="p-5 border-b-2 border-gold-500/50 bg-navy-900/70 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Target className={`h-8 w-8 text-gold-500 absolute opacity-20 animate-radar-sweep`} style={{ animationDuration: '5s' }} />
            <MessageSquare className="h-5 w-5 text-gold-500 relative z-10" />
          </div>
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-sm">AI CONSULTANT - SISTEMA TATTICO</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Powered by Groq API - <span className="text-red-400">CONFIDENTIAL LEVEL ALPHA</span></p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-xs font-bold uppercase">SISTEMA ATTIVO</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg} isUser={msg.role === 'user'} />
        ))}
        
        {/* Loading Indicator (Scansione) */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="relative bg-slate-800/70 text-slate-200 border-t-2 border-gold-500/50 shadow-lg px-4 py-3 rounded-xl max-w-xs lg:max-w-md overflow-hidden">
              <p className="text-sm text-slate-400">Analisi in corso...</p>
              {/* Scan Line Animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 bottom-0 w-1/4 bg-gold-500/30 opacity-50 animate-scan-line"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Tattica */}
      <div className="border-t-2 border-gold-500/50 bg-navy-900/70 p-4 lg:p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gold-500 opacity-70" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Inserisci comando o domanda tattica..."
              disabled={isLoading}
              // FIX: Testo digitato BLU CHIARO (text-blue-300)
              className="w-full rounded-xl border-2 border-slate-700 bg-navy-950/50 py-4 pl-12 pr-4 text-sm font-bold text-blue-300 placeholder:text-slate-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 focus:outline-none disabled:bg-slate-800 transition-all"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || inputValue.trim() === ''}
            className={`rounded-xl px-6 py-4 text-white font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 text-xs h-auto
              ${isLoading || inputValue.trim() === ''
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gold-500 hover:bg-gold-600 shadow-lg shadow-gold-500/30 active:scale-95 animate-pulse-gold'
              }`}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 -rotate-45" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIConsultantChat;