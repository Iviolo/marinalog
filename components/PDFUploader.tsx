import React, { useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

// Configurazione pdfjs
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFUploaderProps {
  onPdfLoad: (data: {
    content: string;
    fileName: string;
    numPages: number;
  }) => void;
  onError: (error: string) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onPdfLoad, onError }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [extractedPages, setExtractedPages] = React.useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validazione file
    if (file.type !== 'application/pdf') {
      onError('❌ Seleziona un file PDF valido');
      return;
    }

    const MAX_SIZE = 500 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      onError(`❌ File troppo grande (max 500MB)`);
      return;
    }

    setIsLoading(true);
    onError(''); // Clear previous errors
    console.log('[PDF-UPLOADER] 📁 File ricevuto:', { name: file.name, size: file.size });

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('[PDF-UPLOADER] ✅ ArrayBuffer pronto:', arrayBuffer.byteLength);

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('[PDF-UPLOADER] ✅ PDF caricato - pages:', pdf.numPages);

      let extractedText = '';
      const pagesToProcess = Math.min(pdf.numPages, 100); // Limite 100 pagine

      for (let i = 1; i <= pagesToProcess; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        extractedText += `[PAGINA ${i}]\n${pageText}\n\n---\n\n`;
        setExtractedPages(i);
        // Aggiungo un piccolo ritardo per permettere all'UI di aggiornare il progresso
        await new Promise(resolve => setTimeout(resolve, 10)); 
      }

      console.log('[PDF-UPLOADER] ✅ Estrazione completata - totale:', extractedText.length, 'caratteri');

      onPdfLoad({
        content: extractedText,
        fileName: file.name,
        numPages: pdf.numPages
      });

    } catch (error) {
      console.error('[PDF-UPLOADER] ❌ Errore:', error);
      onError('❌ Errore nella lettura del PDF - Verifica che sia un PDF valido');
    } finally {
      setIsLoading(false);
      setExtractedPages(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    disabled: isLoading as boolean, // Correzione: forzo il tipo a boolean
    maxSize: 500 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 text-center border-2 rounded-xl cursor-pointer transition-all duration-300 
        ${isDragActive 
          ? 'border-gold-500 bg-navy-800/70 shadow-lg shadow-gold-500/10' 
          : 'border-dashed border-gold-500/50 bg-navy-900/50 hover:border-solid hover:shadow-lg hover:shadow-gold-500/10'
        }
        ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <Loader2 size={32} className="text-gold-500 animate-spin mb-2" />
          <p className="text-gold-500 font-bold text-sm">
            📖 Estrazione pagina {extractedPages}...
          </p>
          <p className="text-slate-500 text-xs mt-1">
            Attendere il completamento (Max 100 pagine)
          </p>
        </div>
      ) : (
        <>
          <Upload size={32} className="mx-auto text-gold-500 mb-2" />
          <p className="text-sm font-bold text-white">
            {isDragActive ? '📥 Rilascia il PDF qui' : '📤 TRASCINA PDF QUI o CLICCA'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            ⚠️ Max 500MB - Solo PDF
          </p>
        </>
      )}
    </div>
  );
};

export default PDFUploader;