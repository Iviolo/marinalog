import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send, Loader2, Target, Zap, File, Upload, XCircle, CheckCircle, BookOpen, AlertTriangle, Trash2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import PDFUploader from './PDFUploader'; // Importazione del nuovo componente

// Configurazione del worker per pdfjs-dist (CRITICO)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  console.log('[PDFJS-INIT] ✅ Worker configurato:', pdfjsLib.GlobalWorkerOptions.workerSrc);
  console.log('[PDFJS-INIT] 📌 pdfjs.js version:', pdfjsLib.version);
}

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
  
  // Note: Tailwind doesn't have built-in slide-in-left/right, so we rely on opacity/scale for a smooth entry.

  return (
    <div className={`flex ${alignment} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl text-sm font-sans transition-all animate-fade-in ${bubbleClasses}`}
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

  // RAG/PDF States
  const [pdfContent, setPdfContent] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [isExtracting, setIsExtracting] = useState(false); // Usato per disabilitare l'input

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const removePdf = () => {
    setPdfContent('');
    setPdfFileName('');
    setTotalPages(0);
    setStatusMessage('');
  };

  // Rimosse handlePdfUpload, handleDrop, handleDragOver, handleDragLeave, setPresetPages, handleExtractPages

  const generateAIResponse = async (userInput: string): Promise<string> => {
    console.log('[AI-DEBUG] 📨 Inizio generateAIResponse');
    console.log('[AI-DEBUG] 📌 pdfContent exists:', !!pdfContent);

    try {
      const requestBody = {
        message: userInput,
        context: pdfContent,
        pagesExtracted: totalPages, // Passiamo il totale delle pagine caricate/estratte
      };
      
      console.log('[AI-DEBUG] 📤 Invio request a /api/groq:', {
        messageLength: userInput.length,
        contextLength: pdfContent.length,
        pagesExtracted: totalPages
      });

      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('[AI-DEBUG] 📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Groq API Error:", errorData);
        return `ERRORE CRITICO: Impossibile stabilire la connessione con il modello IA (Groq API). Dettagli: ${errorData.error || 'Verificare la chiave API.'}`;
      }

      const data = await response.json();
      console.log('[AI-DEBUG] ✅ Risposta ricevuta da Groq');
      return data.reply || 'ERRORE: Risposta non valida dal sistema IA.';
    } catch (error) {
      console.error("[AI-DEBUG] ❌ ERRORE:", error);
      return 'ERRORE DI RETE: Fallimento nella comunicazione con il servizio IA.';
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading || isExtracting) return;

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

  // --- UI Components ---

  // Rimosso UploadZone

  const PdfStatusPanel = () => {
    const isReady = pdfContent.length > 0;

    return (
      <div className="p-5 bg-navy-900/70 rounded-xl border border-slate-700 space-y-4">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
                {isReady ? <CheckCircle size={18} className="text-emerald-500"/> : <BookOpen size={18} className="text-gold-500"/>}
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {isReady ? 'Contesto Caricato' : 'Carica Regolamento'}
                </span>
            </div>
            {isReady && (
                <button onClick={removePdf} className="text-slate-500 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                </button>
            )}
        </div>

        {/* PDF Info */}
        {isReady && (
            <div className="text-xs text-slate-400 font-mono">
                <p className="text-white font-bold mb-1">{pdfFileName}</p>
                <p>Pagine totali: <span className="text-gold-500 font-bold">{totalPages}</span></p>
                <p>Contesto estratto: <span className="text-emerald-500 font-bold">Prime 100 pagine</span></p>
            </div>
        )}

        {/* Final Status Message */}
        {statusMessage && (
            <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                statusMessage.startsWith('✅') ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-700' :
                statusMessage.startsWith('❌') ? 'bg-red-900/30 text-red-400 border border-red-700' :
                'bg-slate-900/30 text-slate-400 border border-slate-700'
            }`}>
                {statusMessage.startsWith('✅') ? <CheckCircle size={16}/> : statusMessage.startsWith('❌') ? <AlertTriangle size={16}/> : <Loader2 size={16} className="animate-spin"/>}
                {statusMessage}
            </div>
        )}
      </div>
    );
  };

  // Determine which section to show
  const showUpload = pdfContent.length === 0;
  const showChat = pdfContent.length > 0;

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

      {/* RAG/PDF Panel */}
      <div className="p-4 lg:p-6 border-b border-slate-700/50">
        {showUpload ? (
            <PDFUploader 
                onPdfLoad={(data) => {
                    setPdfContent(data.content);
                    setPdfFileName(data.fileName);
                    setTotalPages(data.numPages);
                    setStatusMessage(`✅ PDF CARICATO: ${data.fileName} (${data.numPages} pagine)`);
                    setIsExtracting(false);
                    console.log('[AI-STUDIO] ✅ PDF content set - length:', data.content.length);
                }}
                onError={(error) => {
                    setStatusMessage(error);
                    setIsExtracting(false);
                }}
            />
        ) : (
            <PdfStatusPanel />
        )}
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
              placeholder={pdfContent ? "Domanda basata sul regolamento caricato..." : "Carica un PDF per abilitare la RAG..."}
              disabled={isLoading || isExtracting || pdfContent.length === 0}
              className="w-full rounded-xl border-2 border-slate-700 bg-navy-950/50 py-4 pl-12 pr-4 text-sm font-bold text-blue-300 placeholder:text-slate-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 focus:outline-none disabled:bg-slate-800 transition-all"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || isExtracting || inputValue.trim() === '' || pdfContent.length === 0}
            className={`rounded-xl px-6 py-4 text-white font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 text-xs h-auto
              ${isLoading || isExtracting || inputValue.trim() === '' || pdfContent.length === 0
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