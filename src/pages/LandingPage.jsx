import { Link } from 'react-router-dom';
import CoWaveLogo from '../components/CoWaveLogo.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  bodyTextClass,
  pageTitleClass,
} from '../components/ui/primitives.js';

const howItWorksSteps = [
  {
    title: 'Scegli le tue stanze',
    description:
      'Seleziona gli argomenti che ti interessano durante l’onboarding: ogni stanza è un contesto chiaro, non un miscuglio di tutto.',
  },
  {
    title: 'Segui i thread',
    description:
      'Ogni discussione nasce da un post iniziale e le risposte sono organizzate in modo leggibile, senza alberi incomprensibili.',
  },
  {
    title: 'Partecipa alle conversazioni',
    description:
      'Scrivi risposte, manda “onde” ai messaggi che ti colpiscono e, quando serve, allega una foto per dare più contesto.',
  },
];

const differencePoints = [
  {
    title: 'Niente feed a caso',
    description:
      'Non ti perdi in video e post random. Entri in stanze con un tema chiaro e thread con un inizio e una fine.',
  },
  {
    title: 'Thread leggibili, non muri di testo',
    description:
      'Post iniziale in alto, risposte sotto, repliche leggermente rientrate con “Risposte a questo messaggio”. Capisci subito chi sta rispondendo a chi.',
  },
  {
    title: 'Strumenti per non farti risucchiare',
    description:
      'Dalla pagina “Strumenti avanzati” puoi gestire la tua esperienza: sessioni mindful, controlli dell’algoritmo e altre funzioni per usare il social con la testa, non in automatico.',
  },
];

const featureCards = [
  {
    title: 'Stanze a tema',
    description:
      'Spazi dedicati a un argomento specifico, dove i thread non si perdono nel rumore di tutto il resto.',
  },
  {
    title: 'Thread ad albero, ma semplici',
    description:
      'La struttura è intelligente, ma tu vedi solo “Post iniziale”, “Risposte” e “Risposte a questo messaggio”. Nessun gergo tecnico, nessun grafico di nodi.',
  },
  {
    title: 'Risposte con foto',
    description:
      'Quando serve, puoi allegare un’immagine alle tue risposte per spiegarti meglio o raccontare una situazione.',
  },
  {
    title: 'Onde al posto dei like',
    description:
      'Ti è piaciuto un messaggio? Non lo “liki”. Gli mandi un’onda. È il modo di CoWave per dire: “Questo mi è arrivato”.',
  },
];

const audienceList = [
  'Per chi è stufo di feed infiniti e vuole conversazioni più ordinate.',
  'Per chi preferisce discutere per stanze e thread, non per urla nel mucchio.',
  'Per chi vuole un social che non lo consuma, ma gli restituisce qualcosa.',
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
          <Link to="/" className="flex items-center gap-3 text-slate-200" aria-label="CoWave">
            <CoWaveLogo size={72} variant="full" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link to="/auth/login" className={buttonSecondaryClass}>
              Accedi
            </Link>
            <Link
              to="/auth/register"
              className={buttonPrimaryClass}
            >
              Inizia ora
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 pb-20">
          <section className="py-12 lg:py-20 grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-6">
              <p className={`${eyebrowClass} inline-flex items-center gap-2`}>
                Beta privata
                <span className="text-slate-500 text-[10px] tracking-[0.24em]">
                  Accesso su invito
                </span>
              </p>
              <h1 className={`${pageTitleClass} text-3xl sm:text-4xl lg:text-5xl leading-tight`}>
                Conversazioni chiare, una stanza alla volta.
              </h1>
              <p className={`${bodyTextClass} text-base sm:text-lg max-w-2xl`}>
                CoWave è un social a stanze: scegli gli argomenti che ti interessano,
                segui thread leggibili e rispondi senza affogare nel caos dei commenti.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  to="/auth/register"
                  className={`${buttonPrimaryClass} w-full sm:w-auto text-base`}
                >
                  Inizia ora
                </Link>
                <a
                  href="#come-funziona"
                  className={`${buttonSecondaryClass} w-full sm:w-auto`}
                >
                  Guarda come funziona
                </a>
              </div>
              <p className="text-sm text-slate-400 max-w-xl">
                Niente spam, niente feed infinito a caso. Solo stanze, thread e risposte
                chiare.
              </p>
            </div>

            <div className="relative w-full">
              <div className="absolute -inset-12 bg-gradient-to-tr from-accent/25 via-purple-500/20 to-fuchsia-500/25 blur-3xl opacity-60 animate-pulse-soft" />
              <div className={`${cardBaseClass} relative p-4 sm:p-5 space-y-4`}>
                <p className={eyebrowClass}>
                  Dentro CoWave
                </p>
                <h3 className="text-xl font-semibold text-white">
                  Stanze, thread e onde.
                </h3>
                <ul className="space-y-2 text-base text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="text-accent text-sm mt-0.5">✺</span>
                    <span>Entra solo nelle stanze che scegli tu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent text-sm mt-0.5">✺</span>
                    <span>I thread restano leggibili: post iniziale, risposte e repliche.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent text-sm mt-0.5">✺</span>
                    <span>Manda un’onda ai messaggi che ti colpiscono.</span>
                  </li>
                </ul>
                <p className="text-[13px] text-slate-400">
                  Niente feed infinito: muoviti tra stanze curate e conversazioni finite,
                  senza rumore di fondo.
                </p>
              </div>
            </div>
          </section>

          <section id="come-funziona" className="space-y-8">
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>In 3 step</p>
              <h2 className={`${pageTitleClass} text-3xl`}>
                Come funziona CoWave
              </h2>
              <p className={`${bodyTextClass} text-base max-w-3xl mx-auto`}>
                Invece di buttarti in un feed infinito, ti muovi tra stanze chiare e thread
                facili da seguire.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorksSteps.map((card, index) => (
                <article
                  key={card.title}
                  className={`${cardBaseClass} h-full p-4 sm:p-5 lg:p-6 space-y-3`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Step {index + 1}
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {card.title}
                  </p>
                  <p className="text-base text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>Perché CoWave è diverso</p>
              <h3 className={`${pageTitleClass} text-3xl`}>
                Perché non è l’ennesimo social caotico
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {differencePoints.map((point) => (
                <article key={point.title} className={`${cardBaseClass} h-full p-4 sm:p-5 lg:p-6 space-y-2`}>
                  <p className="text-lg font-semibold text-white">
                    {point.title}
                  </p>
                  <p className="text-base text-slate-300 leading-relaxed">
                    {point.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-8">
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>Cosa trovi dentro</p>
              <h3 className={`${pageTitleClass} text-3xl`}>
                Cosa trovi dentro CoWave
              </h3>
              <p className={`${bodyTextClass} text-base max-w-3xl mx-auto`}>
                Le funzioni sono semplici e mirate: stanze tematiche, thread chiari e strumenti
                pensati per parlare meglio, non per tenerti incollato.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className={`${cardBaseClass} h-full p-4 sm:p-5 lg:p-6 space-y-2`}
                >
                  <p className="text-lg font-semibold text-white">
                    {card.title}
                  </p>
                  <p className="text-base text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className={`${cardBaseClass} p-5 sm:p-6 space-y-4 max-w-5xl mx-auto`}>
            <p className={eyebrowClass}>Per chi è</p>
            <h3 className="text-2xl font-semibold text-white">
              Per chi è CoWave
            </h3>
            <ul className="space-y-2.5 text-base text-slate-300">
              {audienceList.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-3xl font-semibold text-white">
              Pronto a provare una nuova onda?
            </h3>
            <p className={`${bodyTextClass} text-base`}>
              Entra, scegli le tue stanze e completa il tuo primo thread. Il resto lo
              scopri strada facendo.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/auth/register"
                className={`${buttonPrimaryClass} text-base`}
              >
                Registrati gratis
              </Link>
              <Link
                to="/auth/login"
                className={`${buttonSecondaryClass} text-base`}
              >
                Accedi
              </Link>
            </div>
            <p className="text-sm text-slate-400">
              Puoi uscire quando vuoi, ma forse non ne avrai voglia.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
