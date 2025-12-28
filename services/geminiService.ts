
import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

export const askMilitaryAdvisor = async (
  query: string,
  state: AppState
): Promise<string> => {
  // Fix: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Sei un assistente virtuale esperto di logistica e regolamenti della Marina Militare Italiana.
    Hai accesso ai dati attuali dell'utente e alle seguenti direttive ufficiali:
    - VADEMECUM CFG (Allegato B): Conferma che per guardie continuative di 24h nei giorni di SABATO, DOMENICA o FESTIVI spettano 3 CFG (90€) e il recupero della giornata GNL.
    - Direttiva Straordinario M.M. (2006): Gestione dei turni e recuperi per personale a terra.

    Dati Utente:
    - Saldo Ordinaria: ${state.balances.ordinaria} gg
    - Banca Ore: ${state.balances.hoursBank} h
    - Compensi CFG: €${state.balances.moneyBank}
    
    Regole CFG:
    - Lun-Ven: 1 CFG (€30).
    - Sab-Dom: 3 CFG (€90).
    
    Rispondi in modo formale ("Comandi", "Signorsì", "Affermativo"). Sii conciso. 
    Se l'utente chiede chiarimenti sulla logica Sabato/Domenica, cita il Vademecum CFG.
  `;

  try {
    // Fix: Using correct model 'gemini-3-flash-preview' for text tasks and providing instructions in config.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    // Fix: Extracting text using the .text property as per guidelines.
    return response.text || "Non ho ricevuto una risposta valida.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Si è verificato un errore di comunicazione con il comando centrale (API Error).";
  }
};
