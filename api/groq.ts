export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context, pagesExtracted } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY non configurato');
    return res.status(500).json({ error: 'GROQ_API_KEY non configurato' });
  }

  let systemPrompt = `Sei un consulente IA specializzato in Marina Militare. Rispondi sempre in italiano con precisione e chiarezza. Basa le tue risposte sul contesto fornito. Se non conosci la risposta, dillo onestamente.`;
  
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // --- Gestione e Troncamento del Contesto PDF (RAG) ---
  const MAX_CONTEXT_LENGTH = 6000; // Limite di caratteri per il contesto
  let contextToPass = '';
  
  if (context && context.length > 0) {
    contextToPass = context.substring(0, MAX_CONTEXT_LENGTH);
    
    if (context.length > MAX_CONTEXT_LENGTH) {
        contextToPass += `\n\n[... Contesto troncato a ${MAX_CONTEXT_LENGTH} caratteri per limiti di token. Pagine analizzate: ${pagesExtracted}]`;
    } else {
        contextToPass += `\n\n[Contesto completo da ${pagesExtracted} pagine.]`;
    }

    messages.push({
        role: 'user',
        content: `CONTESTO NORMATIVO ESTRATTO DAL PDF:\n\n${contextToPass}`,
    });
    
    console.log(`[GROQ-DEBUG] ✅ Contesto PDF aggiunto. Lunghezza: ${contextToPass.length} caratteri.`);
  } else {
    console.log('[GROQ-DEBUG] ⚠️ Nessun contesto PDF fornito.');
  }
  
  // Messaggio finale dell'utente
  messages.push({
    role: 'user',
    content: message,
  });

  try {
    console.log('[GROQ-DEBUG] 📨 Invio richiesta a Groq API...');
    console.log(`[GROQ-DEBUG] 📌 Modello: llama-3.1-8b-instant`);
    console.log(`[GROQ-DEBUG] 📌 Numero Messaggi: ${messages.length}`);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
      console.error('[GROQ-DEBUG] ❌ Groq API error:', errorData);
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    console.log('[GROQ-DEBUG] ✅ Groq API response successful. Reply length:', reply.length);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('[GROQ-DEBUG] ❌ Errore nel contattare Groq:', error);
    return res.status(500).json({ error: 'Errore nel contattare il servizio IA' });
  }
}