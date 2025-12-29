import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY non configurato' },
        { status: 500 }
      );
    }

    const systemPrompt = `Sei un consulente IA specializzato in regolamentazioni della Marina Militare italiana.
Contexto: ${context || 'Informazioni generali su turni, permessi e regolamenti'}

Rispondi sempre in italiano con precisione e chiarezza. Se non conosci la risposta, dillo onestamente.`;

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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Errore Groq API' },
        { status: response.status }
      );
    }

    const content = data.choices?.[0]?.message?.content || 'Nessuna risposta';

    return NextResponse.json({
      success: true,
      message: content,
    });
  } catch (error) {
    console.error('Errore nella richiesta Groq:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

export const config = {
  runtime: 'nodejs',
};
