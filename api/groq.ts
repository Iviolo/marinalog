export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, context } = req.body;
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY non configurato' });
  }

  const systemPrompt = 'Sei un consulente IA specializzato in regolamentazioni della Marina Militare italiana. Contesto: ${context || "Informazioni generali su turni, permessi e regolamenti"}. Rispondi sempre in italiano con precisione e chiarezza. Se non conosci la risposta, dillo onestamente.';

  try {
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

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error.message });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Errore Groq:', error);
    return res.status(500).json({ error: 'Errore nel contattare il servizio' });
  }
// API Groq con GROQ_API_KEY configurato su Vercel
}
