import React, { useState } from 'react';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIStudioIframe: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il Consulente IA specializzato in Turni, Permessi e Regolamenti Marina Militare. Come posso aiutarti?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('turno') || lowerInput.includes('guardia') || lowerInput.includes('notte')) {
      return 'Per i turni di guardia nella Marina Militare: il massimo di notti consecutive è generalmente 4, seguite da un periodo di riposo. Le pause durante il turno devono essere di almeno 8 ore continuative. Hai altre domande specifiche sui turni?';
    }

    if (lowerInput.includes('permesso') || lowerInput.includes('licenza') || lowerInput.includes('ferie')) {
      return 'I permessi e le licenze sono regolati dal CCNL e dai regolamenti MM. In genere hai diritto a:\n- 4 giorni di licenza straordinaria\n- Ferie annuali secondo il contratto\n- Permessi per motivi personali con preavviso. Vuoi saperne di più?';
    }

    if (lowerInput.includes('malattia') || lowerInput.includes('malato') || lowerInput.includes('certificato')) {
      return 'In caso di malattia: devi comunicare al tuo comandante entro l\'inizio del turno. È necessario un certificato medico dopo 3 giorni consecutivi. La malattia è coperta dalle assicurazioni della MM.';
    }

    if (lowerInput.includes('straordinario') || lowerInput.includes('extra') || lowerInput.includes('ore')) {
      return 'Gli straordinari nella MM sono compensati secondo il CCNL. Generalmente: ore diurne = 1:1, ore notturne = 1:1.25, festivi = 1:1.5. La richiesta deve essere autorizzata dal comandante.';
    }

    return 'Grazie per la domanda! Posso aiutarti con informazioni su:\n- Turni e Guardia\n- Permessi e Licenze\n- Malattia e Assenze\n- Straordinari\n- Norme e Regolamenti MM\nCosa vorresti sapere?';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <div className="p-3 md:p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
            <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white">⚖️ Consulente Norme MM</h1>
            <p className="text-sm md:text-base text-blue-200">IA Specializzata su Turni, Permessi e Regolamenti Marina Militare</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl border border-blue-500/50 shadow-2xl overflow-hidden min-h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-700/50 text-blue-100 rounded-bl-none border border-blue-400/30'
              }`}>
                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs mt-2 block opacity-70">
                  {message.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700/50 text-blue-100 rounded-2xl rounded-bl-none border border-blue-400/30 px-4 py-3 flex gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sto rispondendo...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-blue-500/30 p-4 md:p-6 bg-slate-900/50">
          <form onSubmit={handleSendMessage} className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Fai una domanda al Consulente IA..."
              className="flex-1 px-4 py-3 rounded-full bg-slate-800 text-white border border-blue-400/30 focus:border-blue-400 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <div className="bg-blue-950/50 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-blue-500/30">
          <p className="text-xs md:text-sm text-blue-300 text-center">
            💡 <strong>Nota:</strong> Questo consulente IA è disponibile direttamente nell\'app senza necessità di aprire finestre esterne.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIStudioIframe;
