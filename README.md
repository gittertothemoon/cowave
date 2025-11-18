# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploy su Vercel

CoWave è una SPA React + Vite: Vercel può costruirla con `npm run build`, producendo l'output statico nella cartella `dist`. Il file `vercel.json` imposta una rewrite globale verso `/`, così ogni rotta viene servita da `index.html` e gestita da React Router.

Flusso consigliato:
1. Effettua il push del codice su GitHub.
2. Importa il repository su [vercel.com](https://vercel.com) e scegli il comando di build `npm run build`.
3. Imposta `dist` come cartella di output (valore predefinito per Vite).
4. Distribuisci: le rewrite lato Vercel garantiranno che i deep link continuino a funzionare.
