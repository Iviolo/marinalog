import { pipeline, env, AutoTokenizer, AutoModelForSequenceClassification } from '@xenova/transformers';
import { loadAndChunkPdf } from '../utils/pdfLoader';

// Impostazioni per Transformers.js
env.allowLocalModels = false;
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';

// Modello leggero per gli embedding (Sentence Transformer)
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
// Modello leggero per la classificazione/risposta (usiamo lo stesso per semplicità, ma idealmente sarebbe un modello QA)
const QA_MODEL = 'Xenova/distilbert-base-uncased-distilled-squad'; 

const INDEX_KEY = 'marinalog_rag_index_v1';
const PDF_SOURCES = [
    { url: 'https://www.sergenti.it/sgt/images/pdf/orario_mm.pdf', name: 'Orario MM' },
    { url: 'https://www.sergenti.it/sgt/images/pdf/SMA-Ord_011.pdf', name: 'SMA Ord. 011' },
    { url: 'https://cri.it/wp-content/uploads/2021/03/dpr-n-90-2010_Testo-unico-ordinamento-militare.pdf', name: 'DPR 90/2010' },
    { url: 'https://www.difesa.it/assets/allegati/36010/3_all_b_specchio_riep_licenze_0332943.pdf', name: 'Specchio Licenze' },
    { url: 'https://www.studiosposito.it/legale/wp-content/uploads/2021/02/Reg._Disc._MILITARE.pdf', name: 'Reg. Disciplina' },
];

interface IndexedChunk {
    text: string;
    source: string;
    page: number;
    embedding: number[];
}

let index: IndexedChunk[] = [];
let embedder: any = null;
let qaPipeline: any = null;
let isReady = false;

/**
 * Calcola la similarità coseno tra due vettori.
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Inizializza i modelli e l'indice RAG.
 */
export async function initializeRAG(): Promise<void> {
    if (isReady) return;

    console.log("[RAG Service] Inizializzazione modelli AI...");
    
    // 1. Inizializza i modelli
    try {
        embedder = await pipeline('feature-extraction', EMBEDDING_MODEL);
        qaPipeline = await pipeline('question-answering', QA_MODEL);
        console.log("[RAG Service] Modelli AI caricati con successo.");
    } catch (error) {
        console.error("[RAG Service] Errore nel caricamento dei modelli AI:", error);
        throw new Error("Impossibile caricare i modelli AI locali.");
    }

    // 2. Carica o crea l'indice
    const savedIndex = localStorage.getItem(INDEX_KEY);
    if (savedIndex) {
        try {
            index = JSON.parse(savedIndex);
            console.log(`[RAG Service] Indice caricato da localStorage (${index.length} chunk).`);
            isReady = true;
            return;
        } catch (e) {
            console.warn("[RAG Service] Errore nel parsing dell'indice salvato. Ricalcolo.");
        }
    }

    // 3. Creazione dell'indice (se non salvato o fallito)
    console.log("[RAG Service] Creazione indice RAG in corso. Potrebbe richiedere tempo...");
    const allChunks: { text: string; source: string; page: number }[] = [];
    
    for (const source of PDF_SOURCES) {
        const chunks = await loadAndChunkPdf(source.url, source.name);
        allChunks.push(...chunks);
    }

    const newIndex: IndexedChunk[] = [];
    for (const chunk of allChunks) {
        const output = await embedder(chunk.text, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        newIndex.push({ ...chunk, embedding });
    }

    index = newIndex;
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
    console.log(`[RAG Service] Indicizzazione completata. Salvati ${index.length} chunk.`);
    isReady = true;
}

/**
 * Esegue una query RAG sul corpus di documenti.
 * @param query La domanda dell'utente.
 * @returns La risposta generata e le fonti utilizzate.
 */
export async function queryRAG(query: string): Promise<{ answer: string; sources: string[] }> {
    if (!isReady || !embedder || !qaPipeline) {
        throw new Error("Il servizio RAG non è ancora pronto. Attendere l'indicizzazione.");
    }

    console.log(`[RAG Query] Elaborazione query: "${query}"`);

    // 1. Retrieval: Trova i chunk più rilevanti
    const queryEmbeddingOutput = await embedder(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(queryEmbeddingOutput.data);

    const rankedChunks = index.map(chunk => ({
        ...chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Prendi i 3 chunk più rilevanti

    const context = rankedChunks.map(c => c.text).join(" --- ");
    const sources = rankedChunks.map(c => `${c.source} (Pag. ${c.page})`);
    
    console.log("[RAG Query] Contesto recuperato:", context);

    // 2. Generation: Usa il modello QA per rispondere basandosi sul contesto
    try {
        const result = await qaPipeline({
            question: query,
            context: context,
        });

        // Il modello QA restituisce la risposta come un segmento del contesto.
        // Per un modello più generativo, si userebbe un modello Seq2Seq.
        // Qui usiamo il risultato diretto del modello QA.
        const answer = result.answer || "Non ho trovato una risposta diretta nei documenti forniti.";
        
        return { 
            answer: `[Risposta basata su Regolamenti MM] ${answer}`, 
            sources: Array.from(new Set(sources)) 
        };

    } catch (e) {
        console.error("[RAG Query] Errore durante la generazione della risposta:", e);
        return { 
            answer: "Si è verificato un errore durante l'elaborazione della risposta AI. Riprova.", 
            sources: Array.from(new Set(sources)) 
        };
    }
}

/**
 * Controlla lo stato di prontezza del servizio.
 */
export function isRAGReady(): boolean {
    return isReady;
}