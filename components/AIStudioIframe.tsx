import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

const AIStudioIframe: React.FC = () => {
  const consultantURL = 'https://aistudio.google.com/apps/drive/1obdDE7OBZ5P06jjABAY5JFvVGfI58ceO?source=&showAssistant=true&showPreview=true';

  const handleOpenConsultant = () => {
    window.open(consultantURL, '_blank', 'width=1200,height=800');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* Header sezione */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white mb-2">⚖️ Consulente Norme MM</h1>
            <p className="text-blue-200">IA Specializzata su Turni, Permessi e Regolamenti Marina Militare</p>
          </div>
        </div>
      </div>

      {/* Card Principale */}
      <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/50 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">🚀 Apri il Consulente IA</h2>
        <p className="text-blue-100 mb-6">
          Il Consulente IA risponderà alle tue domande su:
        </p>
        <ul className="text-blue-100 mb-8 space-y-2 ml-4">
          <li>✓ Turni di guardia (max notti consecutive, pause, ecc.)</li>
          <li>✓ Permessi e licenze</li>
          <li>✓ Norme e regolamenti Marina Militare</li>
          <li>✓ Recuperi ore, straordinari, festivi</li>
          <li>✓ Diritti e doveri del personale MM</li>
        </ul>

        <button
          onClick={handleOpenConsultant}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-3 text-lg"
        >
          <MessageSquare className="w-6 h-6" />
          Apri Consulente IA
          <ExternalLink className="w-6 h-6" />
        </button>
      </div>

      {/* Info Footer */}
      <div className="max-w-2xl mx-auto bg-blue-950/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
        <p className="text-sm text-blue-300 text-center">
          💡 <strong>Tip:</strong> Il Consulente IA aprirà in una nuova finestra. Puoi usarlo simultaneamente con MarinaLog.
        </p>
      </div>
    </div>
  );
};

export default AIStudioIframe;
