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
import HeroPreview from '../components/HeroPreview.jsx';
import useInView from '../hooks/useInView.js';

const howItWorksSteps = [
  {
    title: 'Scegli 2–3 stanze che ti assomigliano',
    description:
      'All’iscrizione ti proponiamo alcune stanze: ne scegli poche, davvero tue. Ogni stanza è un argomento preciso, non un miscuglio di tutto.',
  },
  {
    title: 'Entra nei thread e leggi dall’inizio',
    description:
      'Ogni thread ha un titolo, un post iniziale e le risposte in ordine. Puoi arrivare dopo e capire comunque subito cosa sta succedendo.',
  },
  {
    title: 'Rispondi quando hai qualcosa da dire',
    description:
      'Scrivi risposte brevi, manda un’onda ai messaggi che ti colpiscono e, se serve, allega una foto. Quando hai finito, chiudi: niente feed infinito.',
  },
];

const differencePoints = [
  {
    title: 'Apri, leggi, chiudi',
    description:
      'Passi qualche minuto su 2–3 thread che ti interessano davvero, non 40 a scorrere video a caso. CoWave finisce quando finisce la conversazione.',
  },
  {
    title: 'Non perdi il filo',
    description:
      'Post iniziale in alto, risposte sotto, repliche leggermente rientrate con “Risposte a questo messaggio”. Capisci sempre chi sta rispondendo a chi.',
  },
  {
    title: 'Decidi tu il ritmo',
    description:
      'Dalla pagina “Strumenti avanzati” puoi impostare sessioni mindful e controlli dell’algoritmo. CoWave ti aiuta a staccare, non a restare agganciato.',
  },
];

const featureCards = [
  {
    title: 'Stanze a tema',
    description:
      'Spazi dedicati a un argomento specifico, dove trovi persone che vogliono parlare di quella cosa, non di tutto e niente.',
  },
  {
    title: 'Thread chiari da seguire',
    description:
      'Ogni conversazione ha un titolo, un post iniziale e risposte organizzate. Tu vedi solo ciò che ti serve: post iniziale, risposte e “Risposte a questo messaggio”.',
  },
  {
    title: 'Risposte con foto',
    description:
      'Quando serve, puoi allegare un’immagine alle tue risposte per spiegarti meglio, raccontare una situazione o dare più contesto.',
  },
  {
    title: 'Onde al posto dei like',
    description:
      'Ti è piaciuto un messaggio? Non lo “liki”. Gli mandi un’onda. È il modo di CoWave per dire: “Questo mi è arrivato davvero”.',
  },
];

const audienceList = [
  'Per chi è stufo di feed infiniti e vuole conversazioni più ordinate.',
  'Per chi preferisce discutere per stanze e thread, non per urla nel mucchio.',
  'Per chi vuole un social che non lo consuma, ma gli restituisce qualcosa.',
];

export default function LandingPage() {
  const { ref: howRef, isInView: howInView } = useInView();
  const { ref: differenceRef, isInView: differenceInView } = useInView();
  const { ref: featuresRef, isInView: featuresInView } = useInView();
  const { ref: audienceRef, isInView: audienceInView } = useInView();
  const { ref: ctaRef, isInView: ctaInView } = useInView();

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
          {/* HERO */}
          <section className="py-12 lg:py-20 grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-6">
              <p className={`${eyebrowClass} inline-flex items-center gap-2 animate-softPulse`}>
                Beta privata
                <span className="text-slate-500 text-[10px] tracking-[0.24em]">
                  Stiamo aprendo CoWave a chi vuole conversare, non solo scorrere.
                </span>
              </p>
              <h1 className={`${pageTitleClass} text-3xl sm:text-4xl lg:text-5xl leading-tight`}>
                Il social per parlare, non per scorrere.
              </h1>
              <p className={`${bodyTextClass} text-base sm:text-lg max-w-2xl`}>
                CoWave è un social a stanze: ogni stanza è un argomento preciso, ogni thread è una
                conversazione che puoi davvero finire. Scegli dove entrare, leggi in ordine e
                rispondi senza perderti in un feed infinito.
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
                Niente video random, niente chiasso nei commenti. Solo stanze che scegli tu
                e thread che puoi seguire dall’inizio alla fine.
              </p>
            </div>

            {/* HERO SIDE CARD */}
            <div className="relative w-full">
              <div className="absolute -inset-12 bg-gradient-to-tr from-accent/25 via-purple-500/20 to-fuchsia-500/25 blur-3xl opacity-60 animate-pulse-soft" />
              <HeroPreview />
            </div>
          </section>

          {/* COME FUNZIONA */}
          <section
            id="come-funziona"
            ref={howRef}
            className={`space-y-8 transition-all duration-700 ease-out ${
              howInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>In 3 step</p>
              <h2 className={`${pageTitleClass} text-3xl`}>
                Come funziona CoWave
              </h2>
              <p className={`${bodyTextClass} text-base max-w-3xl mx-auto`}>
                Non c’è un feed infinito da inseguire: ti muovi tra poche stanze scelte,
                apri i thread che ti interessano e partecipi solo quando vuoi davvero dire qualcosa.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorksSteps.map((card, index) => (
                <article
                  key={card.title}
                  className={`${cardBaseClass} h-full p-4 sm:p-5 lg:p-6 space-y-3 transition-transform transition-colors duration-200 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-accent/60`}
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

          {/* PERCHÉ È DIVERSO */}
          <section
            ref={differenceRef}
            className={`space-y-8 transition-all duration-700 ease-out ${
              differenceInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>Perché CoWave è diverso</p>
              <h3 className={`${pageTitleClass} text-3xl`}>
                Non è l’ennesimo social caotico
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {differencePoints.map((point) => (
                <article
                  key={point.title}
                  className={`${cardBaseClass} h-full p-4 sm:p-5 lg:p-6 space-y-2 transition-transform transition-colors duration-200 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-accent/60`}
                >
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

          {/* COSA TROVI DENTRO */}
          <section
            ref={featuresRef}
            className={`space-y-8 transition-all duration-700 ease-out ${
              featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>Cosa trovi dentro</p>
              <h3 className={`${pageTitleClass} text-3xl`}>
                Cosa trovi dentro CoWave
              </h3>
              <p className={`${bodyTextClass} text-base max-w-3xl mx-auto`}>
                Le funzioni sono poche e mirate: stanze tematiche, thread chiari e
                strumenti pensati per parlare meglio, non per tenerti incollato allo schermo.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className={`${cardBaseClass} h-full p-4 sm:p-5 lg:p-6 space-y-2 transition-transform transition-colors duration-200 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-accent/60`}
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

          {/* PER CHI È */}
          <section
            ref={audienceRef}
            className={`max-w-5xl mx-auto transition-all duration-700 ease-out ${
              audienceInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div
              className={`${cardBaseClass} p-5 sm:p-6 space-y-4 transition-transform transition-colors duration-200 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-accent/60`}
            >
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
            </div>
          </section>

          {/* CTA FINALE */}
          <section
            ref={ctaRef}
            className={`max-w-4xl mx-auto text-center space-y-4 transition-all duration-700 ease-out ${
              ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
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
