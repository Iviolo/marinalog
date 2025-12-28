import React from 'react';
import { BookOpen, ShieldCheck, Clock, Anchor, DollarSign, AlertTriangle } from 'lucide-react';

const InfoCFG: React.FC = () => {
  const rules = [
    {
      title: "Guardia Feriale (Lun-Ven)",
      icon: <Clock size={20} className="text-emerald-400" />,
      details: [
        "Durata standard: 8 ore (o secondo ordine di servizio).",
        "Accumulo Banca Ore: +8 ore (se non recuperate immediatamente).",
        "Compenso CFG: +30€ (se previsto e non recuperato in GNL)."
      ]
    },
    {
      title: "Guardia Festiva/Weekend (Sab-Dom)",
      icon: <Anchor size={20} className="text-gold-400" />,
      details: [
        "Durata standard: 24 ore (Servizio Continuativo Festivo).",
        "Accumulo Recupero: +1 Giorno di Recupero (GNL/CFG).",
        "Compenso CFG: +90€ (se previsto)."
      ]
    },
    {
      title: "Recupero Giorni/Ore",
      icon: <ShieldCheck size={20} className="text-blue-400" />,
      details: [
        "Il recupero di un giorno di GNL/CFG consuma 1 giorno dal saldo 'Recuperi Maturati'.",
        "Il recupero orario consuma ore dalla 'Banca Ore'.",
        "Il recupero deve essere autorizzato e registrato."
      ]
    },
    {
      title: "Straordinario",
      icon: <DollarSign size={20} className="text-indigo-400" />,
      details: [
        "Può essere registrato come 'Pagamento' (Compensi) o 'Banca Ore'.",
        "È necessario specificare l'orario di inizio e fine per il calcolo delle ore."
      ]
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-2xl animate-fade-in pb-24 lg:pb-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
          <BookOpen size={24} className="text-white" />
        </div>
        <div>
           <h2 className="text-2xl font-bold font-display text-white">Vademecum CFG</h2>
           <p className="text-slate-400 text-sm">Regole chiave per Guardie, Licenze e Compensi</p>
        </div>
      </div>

      <div className="space-y-6">
        {rules.map((rule, index) => (
          <div key={index} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              {rule.icon}
              <h3 className="font-bold text-lg text-white">{rule.title}</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
              {rule.details.map((detail, i) => (
                <li key={i} className="leading-relaxed">{detail}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-red-500/10 rounded-2xl border border-red-500/30">
          <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-400 leading-tight">
                  <p className="font-bold text-red-300 mb-1">Disclaimer</p>
                  Queste informazioni sono un riassunto operativo. Per la validità legale e i dettagli completi, fare sempre riferimento al documento ufficiale del Vademecum CFG.
              </div>
          </div>
      </div>
    </div>
  );
};

export default InfoCFG;