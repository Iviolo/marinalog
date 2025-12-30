export default async function handler(req, res) {
  // Supporto solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Estrai messaggio e contesto
  const { message, context } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  // Verifica che la chiave API sia configurata
  if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY non configurato');
    return res.status(500).json({ error: 'GROQ_API_KEY non configurato' });
  }

  // System prompt specializzato
  const systemPrompt = `Sei un consulente IA specializzato in regolamentazioni della Marina Militare italiana. Contesto: ${context || 'Informazioni generali su turni, permessi e regolamenti'}. Rispondi sempre in italiano con precisione e chiarezza. Se non conosci la risposta, dillo onestamente.`;

  try {
    // Log per debug
    console.log('Sending request to Groq API with message:', message);
    console.log('GROQ_API_KEY presente:', !!GROQ_API_KEY);

    // Effettua la richiesta a Groq
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    // Gestisci errori HTTP
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.error?.message || JSON.stringify(errorData);
      console.error('Groq API error:', errorData);
      return res.status(response.status).json({ error: errorMessage });
    }

    // Estrai la risposta
    const data = await response.json();
    const reply = data.choices[0].message.content;
    console.log('Groq API response successful');

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Errore nel contattare Groq:', error);
    return res.status(500).json({ error: 'Errore nel contattare il servizio IA' });
  }
}
// API Groq con GROQ_API_KEY configurato su Vercel
