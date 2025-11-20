import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';

const heroStats = [
  { label: 'Stanze attive', value: '27', detail: 'curate da host umani' },
  { label: 'Thread profondi', value: '190+', detail: 'rami aggiornati' },
  { label: 'Tempo medio', value: '34 min', detail: 'sessioni mindful' },
];

const howItWorks = [
  {
    title: 'Stanze tematiche',
    icon: '✹',
    bullets: [
      'Ogni stanza è un mondo con regole ed energia proprie.',
      'Puoi crearne di nuove o unirti a quelle esistenti.',
    ],
  },
  {
    title: 'Thread ad albero',
    icon: '🌿',
    bullets: [
      'Le risposte si ramificano, non scorrono in fila.',
      'Collassa o espandi solo i rami che ti interessano.',
    ],
  },
  {
    title: 'Personas',
    icon: '👥',
    bullets: [
      'Identità diverse per ruoli e toni differenti.',
      'Ogni persona ha reputazione e rituali dedicati.',
    ],
  },
  {
    title: 'Algoritmo sotto controllo',
    icon: '⚙️',
    bullets: [
      'Regoli comfort, novità e intensità del feed.',
      'Sessioni sane, niente binge infinito.',
    ],
  },
];

const audience = [
  {
    title: 'Creator & educator',
    desc: 'Costruisci rituali, highlight audio/video e stanze private per il tuo pubblico.',
  },
  {
    title: 'Dev & builder',
    desc: 'Sperimenta tool, AI e automazioni con co-founder e host tecnici.',
  },
  {
    title: 'Community mindful',
    desc: 'Dai spazio a discussioni profonde senza perdere la cura per il tempo.',
  },
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
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Beta privata
              <span className="text-slate-500 text-[10px] tracking-[0.3em]">
                Accesso su invito
              </span>
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
              Il social a stanze dove le conversazioni sono onde curate, non rumore.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
              Stanze tematiche intenzionali, personas multiple e un algoritmo che
              controlli tu. Imposti ritmo, profondità e tipo di stimoli in base al
              momento della giornata.
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
                Hai già un account? Accedi
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3"
                >
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full">
            <div className="absolute -inset-12 bg-gradient-to-tr from-accent/25 via-purple-500/20 to-fuchsia-500/25 blur-3xl opacity-60 animate-pulse-soft" />
            <div className="relative rounded-3xl border border-white/10 bg-slate-950/70 p-5 space-y-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
                Anteprima interfaccia
              </p>
              <div className="grid gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Stanze curate</p>
                    <span className="text-[11px] text-accent">Live</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center justify-between bg-slate-950/30 rounded-xl px-3 py-2">
                      <span>Dev Lab</span>
                      <span className="text-[11px] text-emerald-300">Costruttivo</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/30 rounded-xl px-3 py-2">
                      <span>Deep Talk</span>
                      <span className="text-[11px] text-accentBlue">Mindset</span>
                    </li>
                    <li className="flex items-center justify-between bg-slate-950/30 rounded-xl px-3 py-2">
                      <span>Creators 18+ Lab</span>
                      <span className="text-[11px] text-fuchsia-300">
                        Monetizzazione
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-3">
                  <p className="text-sm font-semibold text-white">Thread ad albero</p>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="rounded-2xl border border-white/10 px-3 py-2">
                      Radice • Workflow senza feed
                    </div>
                    <div className="ml-4 border-l border-white/10 pl-4 space-y-2">
                      <div className="rounded-2xl border border-white/10 px-3 py-2">
                        Ramo A • Automazioni
                      </div>
                      <div className="rounded-2xl border border-white/10 px-3 py-2">
                        Ramo B • Benessere creator
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-3 text-sm text-slate-300">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                    Preset algoritmo
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] uppercase tracking-[0.2em] text-slate-500">
                      Comfort
                    </span>
                    <div className="flex-1 h-1 rounded-full bg-slate-800">
                      <div className="h-1 rounded-full bg-gradient-to-r from-accent to-accentBlue w-2/3" />
                    </div>
                    <span className="text-[12px] uppercase tracking-[0.2em] text-slate-500">
                      Sfida
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ogni sessione termina con un recap trasparente dell’impatto che hai
                    generato.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Come funziona
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Strumenti pensati per conversazioni intenzionali
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Non è un altro feed infinito: scegli tu stanze, persona e preset. Il
              resto è dichiarato e sotto controllo.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {howItWorks.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{card.icon}</span>
                  <p className="text-lg font-semibold text-white">{card.title}</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-300">
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

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Per chi è pensato
            </p>
            <h2 className="text-3xl font-semibold text-white">
              Se cerchi qualità e controllo, sei nel posto giusto
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {audience.map((persona) => (
              <div
                key={persona.title}
                className="rounded-3xl border border-white/10 bg-slate-950/50 p-5 space-y-3"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-accent">
                  {persona.title}
                </p>
                <p className="text-sm text-slate-300">{persona.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 text-center space-y-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
              Pronto a iniziare?
            </p>
            <h3 className="text-3xl font-semibold text-white">
              Crea il tuo account e prova CoWave
            </h3>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Ti guidiamo in tre passi: stanze, persona, algoritmo. Niente spam,
              niente feed tossico, solo sessioni intenzionali.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-3xl text-sm font-semibold bg-gradient-to-r from-accent to-accentBlue text-slate-950 shadow-glow"
              >
                Crea account
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center px-6 py-3 rounded-3xl text-sm font-medium border border-white/15 hover:border-accent/60 bg-slate-950/40"
              >
                Accedi
              </Link>
            </div>
            <p className="text-[11px] text-slate-500">
              Niente notifiche tossiche. Solo conversazioni intenzionali.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
