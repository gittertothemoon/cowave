import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';

const featureCards = [
  {
    title: 'Stanze curate',
    bullets: [
      'Segui solo gli spazi che ti servono.',
      'Crea stanze nuove quando vuoi.',
    ],
  },
  {
    title: 'Thread ad albero',
    bullets: [
      'Conversazioni a rami, non un feed infinito.',
      'Apri solo i rami che ti interessano.',
    ],
  },
  {
    title: 'Controllo del feed',
    bullets: [
      'Personas e preset chiari prima di iniziare.',
      'Comfort, novità e ritmo sono dichiarati.',
    ],
  },
];

const differencePoints = [
  'Niente scroll senza senso: ogni thread ha un inizio e un finale.',
  'La tua persona attiva è sempre visibile e modificabile.',
  'Le impostazioni dell’algoritmo sono semplici e sempre revocabili.',
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.17), transparent 45%), radial-gradient(circle at 80% 0%, rgba(167,139,250,0.2), transparent 55%)',
        }}
      />
      <div className="relative z-10">
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 text-slate-200">
            <Logo size={36} />
            <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
              CoWave
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/auth/login"
              className="px-4 py-2 rounded-full border border-white/15 text-slate-200 hover:border-accent/50 transition"
            >
              Accedi
            </Link>
            <Link
              to="/auth/register"
              className="px-4 py-2 rounded-full text-slate-950 font-semibold"
              style={{
                backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
              }}
            >
              Inizia ora
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 pb-20">
          <section className="py-12 lg:py-20 grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Beta privata
                <span className="text-slate-500 text-[10px] tracking-[0.3em]">
                  Accesso su invito
                </span>
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                Conversazioni lente in stanze, senza rumore di fondo.
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
                CoWave è una SPA a stanze. Scegli gli spazi iniziali, la tua
                persona e come vuoi che arrivi il feed. Tutto il resto resta
                fuori.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-3xl text-sm font-semibold bg-gradient-to-r from-accent to-accentBlue text-slate-950 shadow-glow w-full sm:w-auto text-center"
                >
                  Inizia ora
                </Link>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-3xl text-sm font-medium border border-white/15 hover:border-accent/60 bg-slate-950/40 w-full sm:w-auto text-center"
                >
                  Accedi
                </Link>
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute -inset-12 bg-gradient-to-tr from-accent/25 via-purple-500/20 to-fuchsia-500/25 blur-3xl opacity-60 animate-pulse-soft" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-950/70 p-5 space-y-5 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                  Tre passi e sei dentro
                </p>
                <ol className="space-y-3 text-sm text-slate-200 list-decimal list-inside">
                  <li>Scegli 1–3 stanze curate.</li>
                  <li>Scegli la persona con cui vuoi apparire.</li>
                  <li>
                    Imposta il preset del feed (Comfort, Bilanciato o Crescita).
                  </li>
                </ol>
                <p className="text-[12px] text-slate-400">
                  Nessun feed infinito: trovi solo i thread generati dalle stanze
                  che segui.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Cosa trovi dentro
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Solo gli elementi essenziali
              </h2>
              <p className="text-sm text-slate-400 max-w-2xl mx-auto">
                Stanze, thread e controllo dell’algoritmo. Il resto vive negli
                strumenti avanzati, fuori dal feed principale.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-3"
                >
                  <p className="text-lg font-semibold text-white">
                    {card.title}
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-accent mt-[2px] text-xs">✺</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Come è diverso
            </p>
            <h3 className="text-2xl font-semibold text-white">
              Una UX unica, pensata per utenti normali
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {differencePoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-3xl font-semibold text-white">
              Pronto a provare CoWave?
            </h3>
            <p className="text-sm text-slate-400">
              Registrati, completa l’onboarding in tre passi e atterra direttamente
              sul feed delle tue stanze.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-3xl text-sm font-semibold bg-gradient-to-r from-accent to-accentBlue text-slate-950 shadow-glow"
              >
                Inizia ora
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-3xl text-sm font-medium border border-white/15 hover:border-accent/60 bg-slate-950/40"
              >
                Accedi
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
