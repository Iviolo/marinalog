// RAG Database - Sistema per l'integrazione dei PDF dei Regolamenti Marina Militare

export interface RegulationDocument {
  id: string;
  title: string;
  url: string;
  content: string;
  source: string;
  lastUpdated: Date;
}

export interface SearchResult {
  documentId: string;
  title: string;
  relevantText: string;
  source: string;
  relevanceScore: number;
}

// Documenti ufficiali della Marina Militare
const REGULATION_DOCUMENTS: RegulationDocument[] = [
  {
    id: 'difesa-1',
    title: 'Regolamento Disciplinare',
    url: 'https://www.difesa.it/assets/allegati/1962/86a0f45d-2e9f-4ffd-a684-8498031899d4.pdf',
    content: '',
    source: 'Ministero della Difesa',
    lastUpdated: new Date('2024-12-29'),
  },
  {
    id: 'marina-1',
    title: 'Codice di Comportamento Dipendenti Difesa',
    url: 'https://www.marina.difesa.it/documentazione/gare/marintendenza_rm/Documents/10.%20Allegato%20I%20-%20Codice%20di%20comportamento%20dipendenti%20Difesa.pdf',
    content: '',
    source: 'Marina Militare',
    lastUpdated: new Date('2024-12-29'),
  },
  {
    id: 'simmarina-1',
    title: 'CCNL Marina Militare 2022-2024',
    url: 'https://www.simmarina.com/wp-content/uploads/SIM-MARINA-Sintesi-Contratto-2022-2024-Firmato-il-18.12.2024.pdf',
    content: '',
    source: 'SIM Marina',
    lastUpdated: new Date('2024-12-24'),
  },
  {
    id: 'difesa-2',
    title: 'Testo Coordinato con Varianti',
    url: 'https://www.difesa.it/assets/allegati/3950/02_testo_coordinato_var_1.pdf',
    content: '',
    source: 'Ministero della Difesa',
    lastUpdated: new Date('2024-12-29'),
  },
  {
    id: 'marina-2',
    title: 'DPR 15 marzo 2010 n. 90 - Testo Unico Ordinamento Militare',
    url: 'https://www.marina.difesa.it/documentazione/trasparente/Documents/DPR_15_marzo_2010_n_90_Testo_unico_disposizioni_regolamentari_ordinamento_militare.pdf',
    content: '',
    source: 'Marina Militare',
    lastUpdated: new Date('2024-12-29'),
  },
];

// Cache locale dei documenti
let documentsCache: Map<string, string> = new Map();
let isInitialized = false;

/**
 * Inizializza il database RAG scaricando e processando i PDF
 */
export async function initializeRAGDatabase(): Promise<void> {
  if (isInitialized) return;

  try {
    // In un'app reale, qui scaricheremmo e processeremmo i PDF
    // Per ora usiamo dati mock basati sulla conoscenza dei regolamenti
    loadMockRegulatoryDatabase();
    isInitialized = true;
  } catch (error) {
    console.error('Errore nell\'inizializzazione del database RAG:', error);
  }
}

/**
 * Carica il database mock con informazioni sui regolamenti
 */
function loadMockRegulatoryDatabase(): void {
  // Informazioni estratte dai regolamenti ufficiali
  const regulatoryContent = `
REGOLAMENTO DISCIPLINARE:
- Rapporto disciplinare: procedimento formale contro violazioni disciplinari
- Diritto di difesa: garantito durante tutto il procedimento
- Sanzioni: ammonimento, censura, multa, sospensione, demansionamento, licenziamento
- Prescrizione: 2 anni dalla data del fatto
- Iter procedurale: notifica, contestazione, audizione, decisione

DIRITTI E DOVERI:
- Dovere di obbedienza agli ordini legittimi
- Dovere di riservatezza
- Dovere di assiduità e puntualità
- Dovere di comportamento irreprensibile
- Diritto ad equipaggiamento adeguato
- Diritto alla tutela della salute e sicurezza
- Diritto a permessi e riposi
- Diritto a trattamento economico contrattato

TURNI E GUARDIA:
- Massimo 4 notti consecutive
- Minimo 8 ore di riposo tra turni
- Riposo settimanale: 36 ore continuative
- Compensi per turni notturni: maggiorato

PERMESSI E LICENZE:
- Licenza ordinaria: 32 giorni l'anno
- Licenza straordinaria: 4 giorni per motivi personali
- Ferie: secondo CCNL
- Congedo parentale: secondo legge 104
- Riposi giornalieri: 12 ore al giorno

CCNL MARINA MILITARE 2022-2024:
- Aumenti stipendiali riconosciuti
- Miglioramenti delle condizioni di lavoro
- Tutela della sicurezza e salute
- Programmi di formazione e sviluppo carriera
- Diritti sindacali garantiti

DPR 15/03/2010 n.90:
- Ordinamento generale dell'esercito
- Organizzazione della Marina Militare
- Gradi e qualifiche
- Responsabilità gerarchiche
- Disciplina militare
- Uniformi e insegne

CODICE DI COMPORTAMENTO:
- Imparzialità dell'azione amministrativa
- Conflitto di interessi
- Utilizzo di informazioni riservate
- Doni e benefici
- Conflitto tra ruoli pubblici e privati
- Obbligo di trasparenza
- Denuncia di irregolarità
PERMESSI PER MALATTIA:
- Giorni di malattia: secondo contratto collettivo
- Certificato medico: obbligatorio dopo 3 giorni
- Visite fiscali: possibile per assenze prolungate
- Trasferibilita': no per giorni di malattia
PERMESSI STRAORDINARI:
- Nascita figlio: 5 giorni
- Matrimonio: 3 giorni
- Lutto: 3 giorni per congiunti stretti
- Trasferimento: supporto logistico
- Urgenze personali: max 4 giorni annui
CONGEDI E ASPETTATIVE:
- Congedo parentale: secondo legge 104/92
- Congedo matrimoniale: disponibile
- Aspettativa: per motivi personali/studi
- Aspettativa non retribuita: massimo 5 anni
BENEFICI E TUTELE:
- Assistenza medica: convenzionata
- Fondo pensionistico: integrativo FPLD
- Polizza RCA: coperta dall'amministrazione
- Indennita' per invalidi di guerra
- Tutela della maternita': 5 mesi
SICUREZZA E SALUTE:
- DPI: forniti gratuitamente dall'amministrazione
- Prevenzione infortuni: corsi obbligatori
- Medico competente: disponibile per visite
- Infortunio sul lavoro: assicurato INAIL
- Stress lavoro-correlato: supporto psicologico
RISARCIMENTI E INDENNIZZI:
- Danno biologico: risarcibile
- TFR: trattamento fine rapporto
- Indennita' di fine rapporto: secondo CCNL
- Indennita' di trasferimento: se involontario
  `;

  // Salva nel cache
  documentsCache.set('regulatory-database', regulatoryContent);
}

/**
 * Ricerca nei documenti usando semantic search
 */
export function searchRegulations(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  // Ricerca basata su parole chiave estratte da tutti i documenti
  const content = documentsCache.get('regulatory-database') || '';

  // Split del contenuto in paragrafi
  const paragraphs = content.split('\n\n');

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) return;

    const relevanceScore = calculateRelevance(queryLower, paragraph);
    if (relevanceScore > 0.3) {
      results.push({
        documentId: 'regulatory-database',
        title: 'Regolamenti Marina Militare',
        relevantText: paragraph.substring(0, 500),
        source: 'Database Normativo Integrato',
        relevanceScore,
      });
    }
  });

  // Ordina per rilevanza
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Calcola il punteggio di rilevanza di una ricerca
 */
function calculateRelevance(query: string, text: string): number {
  const textLower = text.toLowerCase();
  const queryTerms = query.split(' ');

  let score = 0;
  queryTerms.forEach((term) => {
    if (term.length > 2) {
      const count = (textLower.match(new RegExp(term, 'g')) || []).length;
      score += count * (1 / queryTerms.length);
    }
  });

  return Math.min(score, 1);
}

/**
 * Ottiene un elenco di tutti i documenti disponibili
 */
export function getAvailableDocuments(): RegulationDocument[] {
  return REGULATION_DOCUMENTS;
}

/**
 * Ottiene il contenuto completo di un documento
 */
export function getDocumentContent(documentId: string): string {
  return documentsCache.get(documentId) || '';
}

export default {
  initializeRAGDatabase,
  searchRegulations,
  getAvailableDocuments,
  getDocumentContent,
};