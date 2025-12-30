import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send, Loader2, Target, Zap, File, Upload, XCircle, CheckCircle, BookOpen, AlertTriangle, Trash2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

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

const MAX_PDF_SIZE = 500 * 1024 * 1024; // 500MB

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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState('');
  const [pdfFileName, setPdfFileName] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [pagesToExtract, setPagesToExtract] = useState(50); // Default
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const removePdf = () => {
    setPdfFile(null);
    setPdfContent('');
    setPdfFileName('');
    setTotalPages(0);
    setPagesToExtract(50);
    setExtractionProgress(0);
    setIsExtracting(false);
    setStatusMessage('');
  };

  const handlePdfUpload = async (file: File) => {
    console.log('[UPLOAD-DEBUG] 📁 File ricevuto:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2)
    });

    if (file.type !== 'application/pdf') {
      console.error('[UPLOAD-DEBUG] ❌ File non è PDF:', file.type);
      setStatusMessage('❌ Seleziona un file PDF valido.');
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      console.error('[UPLOAD-DEBUG] ❌ File troppo grande');
      setStatusMessage(`❌ File troppo grande (max ${MAX_PDF_SIZE / 1024 / 1024}MB)`);
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
    setPdfContent('');
    setTotalPages(0);
    setExtractionProgress(0);
    setStatusMessage('⏳ Caricamento PDF...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('[UPLOAD-DEBUG] ✅ arrayBuffer pronto:', arrayBuffer.byteLength);
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('[UPLOAD-DEBUG] ✅ PDF caricato - pages:', pdf.numPages);

      setTotalPages(pdf.numPages);
      setPagesToExtract(Math.min(50, pdf.numPages));
      setStatusMessage(`✅ PDF CARICATO: ${file.name}`);
    } catch (error) {
      console.error('[UPLOAD-DEBUG] ❌ ERRORE CARICAMENTO:', error);
      setStatusMessage('❌ Errore lettura PDF - Riprova');
      setPdfFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-navy-800/70');
    e.currentTarget.classList.add('bg-navy-900/50');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePdfUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-navy-800/70');
    e.currentTarget.classList.remove('bg-navy-900/50');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.currentTarget.classList.remove('bg-navy-800/70');
    e.currentTarget.classList.add('bg-navy-900/50');
  };

  const setPresetPages = (num: number) => {
    const validNum = Math.min(num, totalPages);
    setPagesToExtract(validNum);
  };

  const handleExtractPages = async () => {
    if (!pdfFile || totalPages === 0) {
      alert("Carica un PDF prima di estrarre le pagine.");
      return;
    }
    if (pagesToExtract < 1 || pagesToExtract > totalPages) {
      alert(`Seleziona un numero di pagine valido (1 a ${totalPages}).`);
      return;
    }

    setIsExtracting(true);
    setPdfContent('');
    setStatusMessage('📄 Estrazione pagine in corso...');
    setExtractionProgress(0);

    try {
      console.log('[PDF-DEBUG] ✅ Inizio estrazione pages');
      
      const arrayBuffer = await pdfFile.arrayBuffer();
      console.log('[PDF-DEBUG] ✅ arrayBuffer creato:', arrayBuffer.byteLength, 'bytes');
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('[PDF-DEBUG] ✅ PDF caricato correttamente:', {
        numPages: pdf.numPages,
        fingerprints: pdf.fingerprints
      });
      
      let extractedText = '';
      const pagesToProcess = pagesToExtract;
      console.log('[PDF-DEBUG] 📄 Iniziando estrazione da pagina 1 a', pagesToProcess);
      
      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        console.log(`[PDF-DEBUG] 📖 Pagina ${i}: caricata`);
        
        const textContent = await page.getTextContent();
        const items = textContent.items || []; // Aggiunto fallback per sicurezza
        console.log(`[PDF-DEBUG] 📖 Pagina ${i}: testo estratto, items count:`, items.length);
        
        const pageText = items.map((item: any) => item.str).join(' ');
        console.log(`[PDF-DEBUG] 📖 Pagina ${i}: lunghezza testo:`, pageText.length, 'caratteri');
        
        extractedText += pageText + '\n\n---\n\n';
        
        const progress = Math.round((i / pagesToProcess) * 100);
        setExtractionProgress(progress);
        console.log(`[PDF-DEBUG] 📊 Progresso:`, progress + '%');
      }
      
      console.log('[PDF-DEBUG] ✅ Testo totale estratto:', extractedText.length, 'caratteri');
      console.log('[PDF-DEBUG] 🔍 Primi 200 caratteri:', extractedText.substring(0, 200));
      
      setPdfContent(extractedText);
      setIsExtracting(false);
      setStatusMessage(`✅ PRONTO! Estratte ${pagesToProcess} pagine da ${totalPages}.`);
      
      scrollToBottom();
      console.log('[PDF-DEBUG] ✅ Estrazione COMPLETATA');
      
    } catch (error) {
      console.error("[PDF-DEBUG] ❌ ERRORE DURANTE ESTRAZIONE:", error);
      console.error("[PDF-DEBUG] ❌ Stack trace:", error instanceof Error ? error.stack : 'N/A');
      setIsExtracting(false);
      setStatusMessage('❌ Errore durante l\'estrazione del testo.');
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    console.log('[AI-DEBUG] 📨 Inizio generateAIResponse');
    console.log('[AI-DEBUG] 📌 userInput:', userInput);
    console.log('[AI-DEBUG] 📌 pdfContent exists:', !!pdfContent);
    console.log('[AI-DEBUG] 📌 pdfContent length:', pdfContent.length);

    try {
      const requestBody = {
        message: userInput,
        context: pdfContent,
        pagesExtracted: pdfContent ? pagesToExtract : 0,
      };
      
      console.log('[AI-DEBUG] 📤 Invio request a /api/groq:', {
        messageLength: userInput.length,
        contextLength: pdfContent.length,
        pagesExtracted: pdfContent ? pagesToExtract : 0
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

  // --- UI Components ---

  const UploadZone = () => (
    <label 
      htmlFor="pdf-upload-input"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="p-8 text-center border-2 border-dashed border-gold-500/50 bg-navy-900/50 rounded-xl cursor-pointer transition-all hover:border-solid hover:shadow-lg hover:shadow-gold-500/10"
    >
      <Upload size={32} className="mx-auto text-gold-500 mb-2" />
      <p className="text-sm font-bold text-white">TRASCINA PDF QUI o CLICCA</p>
      <p className="text-xs text-slate-500 mt-1">⚠️ Max 500MB - Solo PDF</p>
      
      <input 
        type="file" 
        id="pdf-upload-input" 
        accept="application/pdf" 
        onChange={(e) => e.target.files && handlePdfUpload(e.target.files[0])}
        style={{ display: 'none' }}
      />
    </label>
  );

  const PageSelection = () => {
    const isReady = pdfContent && !isExtracting;
    const progressWidth = `${extractionProgress}%`;

    return (
      <div className="p-5 bg-navy-900/70 rounded-xl border border-slate-700 space-y-4">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
                {isReady ? <CheckCircle size={18} className="text-emerald-500"/> : <BookOpen size={18} className="text-gold-500"/>}
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {isReady ? 'Contesto Caricato' : 'Selezione Pagine'}
                </span>
            </div>
            <button onClick={removePdf} className="text-slate-500 hover:text-red-500 transition-colors p-1">
                <Trash2 size={18} />
            </button>
        </div>

        {/* PDF Info */}
        <div className="text-xs text-slate-400 font-mono">
            <p className="text-white font-bold mb-1">{pdfFileName}</p>
            <p>Totale pagine: <span className="text-gold-500 font-bold">{totalPages}</span></p>
            {isReady && <p>Pagine estratte: <span className="text-emerald-500 font-bold">{pagesToExtract}</span></p>}
        </div>

        {/* Extraction Controls (Visible only if not ready) */}
        {!isReady && (
            <>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase block">Pagine da consultare (1 - {totalPages}):</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            min="1" 
                            max={totalPages}
                            value={pagesToExtract}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= 1 && val <= totalPages) {
                                    setPagesToExtract(val);
                                } else if (val > totalPages) {
                                    setPagesToExtract(totalPages);
                                } else if (val < 1) {
                                    setPagesToExtract(1);
                                }
                            }}
                            disabled={isExtracting}
                            className="w-24 bg-navy-950/50 border border-gold-500 rounded-lg p-2 text-white text-center font-bold focus:ring-2 focus:ring-gold-500 outline-none"
                        />
                        <span className="text-slate-500 text-sm">/ {totalPages} pagine</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button type="button" onClick={() => setPresetPages(50)} disabled={isExtracting} className="py-2 rounded-lg text-xs font-bold uppercase border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-colors">Prime 50</button>
                    <button type="button" onClick={() => setPresetPages(100)} disabled={isExtracting} className="py-2 rounded-lg text-xs font-bold uppercase border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-colors">Prime 100</button>
                    <button type="button" onClick={() => setPresetPages(150)} disabled={isExtracting} className="py-2 rounded-lg text-xs font-bold uppercase border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-colors">Prime 150</button>
                    <button type="button" onClick={() => setPresetPages(totalPages)} disabled={isExtracting} className="py-2 rounded-lg text-xs font-bold uppercase border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-950 transition-colors">Tutte</button>
                </div>

                <button 
                    onClick={handleExtractPages}
                    disabled={isExtracting || totalPages === 0}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-500"
                >
                    {isExtracting ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
                    {isExtracting ? 'Estrazione in corso...' : 'Estrai pagine selezionate'}
                </button>
            </>
        )}

        {/* Progress Bar */}
        {isExtracting && (
            <div className="mt-4 space-y-1">
                <p className="text-xs text-slate-400 font-bold flex justify-between">
                    <span>Estrazione:</span>
                    <span className="text-gold-500">{extractionProgress}% ({Math.round(pagesToExtract * extractionProgress / 100)}/{pagesToExtract} pagine)</span>
                </p>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-gold-500 to-yellow-400 transition-all duration-500" 
                        style={{ width: progressWidth }}
                    ></div>
                </div>
            </div>
        )}

        {/* Final Status Message */}
        {statusMessage && !isExtracting && (
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
  const showUpload = !pdfFile;
  const showPageSelection = pdfFile && totalPages > 0 && !pdfContent;
  const showChat = pdfContent && !isExtracting;

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
        {showUpload && <UploadZone />}
        {showPageSelection && <PageSelection />}
        {showChat && (
            <div className="p-3 bg-emerald-900/30 text-emerald-400 border border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16}/>
                Contesto normativo caricato. Invia la tua domanda.
            </div>
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
              placeholder={pdfContent ? "Domanda basata sul regolamento caricato..." : "Inserisci comando o domanda tattica..."}
              disabled={isLoading || isExtracting}
              className="w-full rounded-xl border-2 border-slate-700 bg-navy-950/50 py-4 pl-12 pr-4 text-sm font-bold text-blue-300 placeholder:text-slate-600 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/50 focus:outline-none disabled:bg-slate-800 transition-all"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || isExtracting || inputValue.trim() === ''}
            className={`rounded-xl px-6 py-4 text-white font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 text-xs h-auto
              ${isLoading || isExtracting || inputValue.trim() === ''
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