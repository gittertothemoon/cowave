import { Link } from 'react-router-dom';
import CoWaveLogo from '../components/CoWaveLogo.jsx';
import {
  cardBaseClass,
  eyebrowClass,
  bodyTextClass,
  pageTitleClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from '../components/ui/primitives.js';

const heroBullets = [
  {
    title: 'Stanze su misura',
    description: 'Scegli gli argomenti che ti interessano e lascia fuori il resto.',
  },
  {
    title: 'Thread chiari',
    description: 'Post iniziale in alto, risposte ordinate, repliche facili da seguire.',
  },
  {
    title: 'Uso consapevole',
    description: 'Timer e strumenti mindful ti aiutano a decidere il tuo tempo online.',
  },
];

const perTeList = [
  'Ti piace parlare per stanze e seguire solo i temi che senti tuoi.',
  'Vuoi thread con un post iniziale chiaro e risposte in ordine.',
  'Cerchi uno spazio tranquillo che ti faccia usare bene il tempo.',
];

const roomPills = [
  { name: 'Pausa mindful', badge: '3 thread chiari' },
  { name: 'Caffè creativo', badge: '2 nuove risposte' },
  { name: 'Outdoor & foto', badge: '1 post iniziale' },
];

const threadReplies = [
  { author: 'Marta · Host', text: 'Timer da 20 minuti, poi chiudo e mando un’onda a chi mi ha risposto.' },
  { author: 'Giada', text: 'Passeggiata corta, poi diario. Rispondo nel thread e chiudo.' },
  { author: 'Teo', text: 'Stretching e appunti rapidi. Torno quando ho finito, senza perdermi.' },
];

function AppPreview() {
  return (
    <div className="relative w-full max-w-[640px] mx-auto">
      <div
        className="absolute -inset-6 sm:-inset-10 bg-gradient-to-tr from-accent/25 via-fuchsia-500/20 to-sky-500/25 blur-[26px] opacity-60"
        aria-hidden="true"
      />
      <div
        className={`${cardBaseClass} relative overflow-hidden p-5 sm:p-6 lg:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] transition-transform duration-200 hover:-translate-y-1`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-slate-950 to-fuchsia-500/10 opacity-80"
        />
        <div className="relative space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={`${eyebrowClass} text-[10px] sm:text-[11px] text-slate-200/90`}>
                Dentro CoWave
              </p>
              <p className="text-sm text-slate-200/80">Le stanze che segui, thread chiari, risposte in ordine.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Le tue stanze preferite</p>
                <span className="rounded-lg border border-slate-800 bg-slate-950/70 px-2.5 py-1 text-[11px] text-slate-200">
                  Solo stanze che segui
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {roomPills.map((room) => (
                  <span
                    key={room.name}
                    className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-[12px] font-semibold text-accent"
                  >
                    <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                    {room.name}
                    <span className="text-[11px] text-slate-100/80">{room.badge}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${eyebrowClass} text-[10px] sm:text-[11px]`}>Post iniziale</p>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    “Come stacchi dopo il lavoro?”
                  </p>
                </div>
                <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-100">
                  Thread leggibile
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                Mi ritaglio 20 minuti senza schermo per staccare. Idee semplici?
              </p>
              <div className="space-y-2">
                {threadReplies.map((reply) => (
                  <div
                    key={reply.author}
                    className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2"
                  >
                    <span className="text-accent" aria-hidden="true">
                      ↳
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">{reply.author}</p>
                      <p className="text-sm text-slate-300 leading-snug">{reply.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3.5 py-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-sky-100">
                  <span className="h-2 w-2 rounded-full bg-sky-300" aria-hidden="true" />
                  Sessione mindful · Timer 20 min
                </div>
                <span className="text-[11px] font-semibold text-slate-900 rounded-lg bg-sky-300 px-2 py-1">
                  Uso consapevole
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 blur-2xl pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(1200px circle at 14% 20%, rgba(56,189,248,0.24), transparent 45%), radial-gradient(1100px circle at 82% 10%, rgba(167,139,250,0.2), transparent 50%), radial-gradient(950px circle at 48% 78%, rgba(14,165,233,0.14), transparent 55%), conic-gradient(from 130deg at 50% 50%, rgba(56,189,248,0.08), rgba(167,139,250,0.06), rgba(14,165,233,0.08), rgba(56,189,248,0.08)), repeating-linear-gradient(90deg, rgba(148,163,184,0.08), rgba(148,163,184,0.08) 1px, transparent 1px, transparent 120px)',
          backgroundSize: '140% 140%, 130% 130%, 130% 130%, 120% 120%, 100% 100%',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10">
        <header className="max-w-6xl mx-auto px-3 sm:px-6 py-5 flex items-center justify-between gap-3 sm:gap-4">
          <Link to="/" className="flex items-center gap-3 text-slate-200" aria-label="CoWave">
            <CoWaveLogo size={84} variant="full" className="origin-left scale-90 sm:scale-100" />
          </Link>
          <div className="flex items-center gap-2 text-[13px] sm:text-sm flex-nowrap">
            <Link to="/auth/login" className={`${buttonSecondaryClass} px-3 py-2 text-xs sm:text-sm sm:px-4`}>
              Accedi
            </Link>
            <Link to="/auth/register" className={`${buttonPrimaryClass} px-3 py-2 text-xs sm:text-sm sm:px-4`}>
              Entra in beta privata
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 lg:pb-14">
          <section className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 pt-2">
            <div className="w-full max-w-xl space-y-5 sm:space-y-6">
              <div className="space-y-5 sm:space-y-6 lg:-translate-y-6">
                <p className={`${eyebrowClass} inline-flex items-center gap-2`}>
                  Beta privata · Accesso su invito
                </p>
                <h1 className={`${pageTitleClass} text-3xl sm:text-4xl lg:text-5xl leading-tight`}>
                  Il social a stanze per parlare con chi ti interessa davvero.
                </h1>
                <p className={`${bodyTextClass} text-base sm:text-lg text-slate-200`}>
                  CoWave è un social a stanze: scegli gli argomenti che ami, apri thread chiari e rispondi a chi conta per te. Ti basta l’email: nessuna carta, nessuna app da installare.
                </p>
                <div className="space-y-3">
                  <ul className="space-y-2">
                    {heroBullets.map((item) => (
                      <li key={item.title} className="flex items-start gap-3">
                        <span className="mt-1 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className={`${bodyTextClass} text-sm`}>{item.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to="/auth/register" className={`${buttonPrimaryClass} w-full sm:w-auto text-base`}>
                  Entra in beta privata
                </Link>
              </div>
              <div className={`${cardBaseClass} p-4 sm:p-5 space-y-2 lg:-translate-y-6`}>
                <p className={`${eyebrowClass} text-[10px] sm:text-[11px]`}>È per te se…</p>
                <ul className="space-y-1.5">
                  {perTeList.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500 mt-2" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="w-full lg:w-[48%] lg:-translate-y-6">
              <AppPreview />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
