import * as pdfjs from 'pdfjs-dist';

// Imposta il worker URL per pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentChunk {
    text: string;
    source: string;
    page: number;
}

/**
 * Carica un PDF da URL e ne estrae il testo, dividendolo in chunk.
 * @param url L'URL del PDF.
 * @param sourceName Il nome del documento (per tracciamento).
 * @returns Array di chunk di testo con sorgente e pagina.
 */
export async function loadAndChunkPdf(url: string, sourceName: string): Promise<DocumentChunk[]> {
    console.log(`[PDF Loader] Caricamento PDF: ${sourceName}`);
    const loadingTask = pdfjs.getDocument(url);
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    const chunks: DocumentChunk[] = [];

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        
        // Chunking semplice: dividi il testo in frasi o blocchi di dimensione fissa
        const sentences = pageText.match(/[^.!?]+[.!?]+/g) || [pageText];
        
        let currentChunk = "";
        const MAX_CHUNK_LENGTH = 500; // Caratteri

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > MAX_CHUNK_LENGTH && currentChunk.length > 0) {
                chunks.push({ text: currentChunk.trim(), source: sourceName, page: i });
                currentChunk = sentence;
            } else {
                currentChunk += " " + sentence;
            }
        }
        if (currentChunk.trim().length > 0) {
            chunks.push({ text: currentChunk.trim(), source: sourceName, page: i });
        }
    }
    console.log(`[PDF Loader] Estratti ${chunks.length} chunk da ${sourceName}.`);
    return chunks;
}