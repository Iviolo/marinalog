# Regole di Sviluppo per l'Assistente AI (Dyad)

Questo documento definisce lo stack tecnologico e le linee guida per la modifica e l'espansione dell'applicazione MarinaLog.

## Stack Tecnologico

1.  **Framework:** React (TypeScript) per la costruzione dell'interfaccia utente.
2.  **Linguaggio:** TypeScript è obbligatorio per tutti i file sorgente (`.tsx`, `.ts`).
3.  **Stile:** Tailwind CSS è utilizzato per tutto il design e il layout. Il design deve essere sempre responsive (Mobile-First).
4.  **Componenti UI:** Utilizzare componenti custom con styling Tailwind. I componenti pre-costruiti da shadcn/ui sono disponibili e preferiti per elementi complessi (es. Dialog, Dropdown, Form).
5.  **Navigazione:** La navigazione tra le sezioni (Dashboard, Storico, etc.) è gestita internamente tramite lo stato di React (`useState` in `App.tsx`) e non tramite librerie di routing esterne (es. React Router DOM).
6.  **Stato Applicativo:** Gestione dello stato tramite React Hooks (`useState`, `useEffect`, `useMemo`).
7.  **Iconografia:** Tutte le icone devono provenire dalla libreria `lucide-react`.
8.  **Data Visualization:** La libreria `recharts` è lo standard per la creazione di grafici e diagrammi.
9.  **Integrazione AI:** L'assistente virtuale utilizza il pacchetto `@google/genai` per le interazioni con il modello Gemini.
10. **Struttura File:** I componenti devono essere piccoli e focalizzati, salvati in `src/components/`.

## Regole di Utilizzo delle Librerie

| Funzionalità | Libreria/Tecnologia da Usare | Note |
| :--- | :--- | :--- |
| **Stile e Layout** | Tailwind CSS | Obbligatorio per tutti gli aspetti visivi. |
| **Icone** | `lucide-react` | Non usare SVG inline o altre librerie di icone. |
| **Grafici** | `recharts` | Utilizzare per tutte le rappresentazioni grafiche dei dati. |
| **Componenti Complessi** | shadcn/ui (disponibile) | Utilizzare per elementi UI standardizzati e accessibili. |
| **Interazione AI** | `@google/genai` | Utilizzare `services/geminiService.ts` per l'interfaccia. |
| **Gestione Dati** | React Hooks | Non introdurre librerie di stato globali (es. Redux, Zustand). |