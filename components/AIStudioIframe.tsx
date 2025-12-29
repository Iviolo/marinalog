import React from 'react';
import { MessageSquare, Info } from 'lucide-react';

// PLACEHOLDER: Inserisci qui l'URL di incorporamento (Embed URL) della tua app Google AI Studio.
// L'URL dovrebbe essere simile a: https://ai.studio/apps/embed/drive/YOUR_APP_ID
const AI_STUDIO_EMBED_URL = "https://aistudio.google.com/apps/drive/1obdDE7OBZ5P06jjABAY5JFvVGfI58ceO?source=&showAssistant=true&showPreview=true";
const AIStudioIframe: React.FC = () => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg flex flex-col h-[600px] overflow-hidden animate-fade-in mb-20 lg:mb-0">
      <div className="bg-slate-900/50 p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-gold-500/20 rounded-full text-gold-500">
            <MessageSquare size={24} />
        </div>
        <div>
            <h3 className="font-bold text-white">Consulente Norme MM (AI Studio)</h3>
            <p className="text-xs text-blue-400 flex items-center gap-1">
                <Info size={12}/> Caricato tramite iframe sicuro.
            </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <iframe
          src={AI_STUDIO_EMBED_URL}
          title="Consulente Norme MM"
          className="w-full h-full border-0"
          allow="clipboard-write"
        >
          Il tuo browser non supporta gli iframe.
        </iframe>
      </div>
      
      <div className="p-3 bg-slate-900/50 border-t border-slate-700 text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
        Powered by Google AI Studio
      </div>
    </div>
  );
};

export default AIStudioIframe;
