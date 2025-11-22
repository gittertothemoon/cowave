import { Link } from 'react-router-dom';
import CoWaveLogo from '../components/CoWaveLogo.jsx';
import {
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
    description: 'All’iscrizione te ne proponiamo alcune: tieni solo quelle che senti tue.',
  },
  {
    title: 'Entra nei thread e leggi dall’inizio',
    description: 'Titolo, post iniziale, risposte in ordine. Capisci subito il contesto.',
  },
  {
    title: 'Rispondi quando hai qualcosa da dire',
    description: 'Risposte brevi, foto se serve, un’onda quando qualcosa ti colpisce.',
  },
];

const differencePoints = [
  {
    title: 'Apri, leggi, chiudi',
    description: 'Passi pochi minuti su 2–3 thread. Qui la conversazione finisce, non il feed.',
  },
  {
    title: 'Non perdi il filo',
    description: 'Post iniziale in alto, repliche rientrate. Capisci chi risponde a chi.',
  },
  {
    title: 'Decidi tu il ritmo',
    description: 'Sessioni mindful e controlli dell’algoritmo. Sei tu a decidere quando chiudere.',
  },
];

const featureCards = [
  {
    title: 'Stanze a tema',
    description: 'Spazi dedicati a un argomento preciso, senza rumore di fondo.',
  },
  {
    title: 'Thread chiari da seguire',
    description: 'Titolo, post iniziale e risposte organizzate: tutto leggibile in un colpo d’occhio.',
  },
  {
    title: 'Risposte con foto',
    description: 'Quando serve, alleghi una foto per spiegarti meglio.',
  },
  {
    title: 'Onde al posto dei like',
    description: 'Niente like generici: mandi un’onda quando un messaggio ti arriva davvero.',
  },
];

const audienceList = [
  'Per chi è stufo di feed infiniti e vuole conversazioni più ordinate.',
  'Per chi preferisce discutere per stanze e thread, non per urla nel mucchio.',
  'Per chi vuole un social che non lo consuma, ma gli restituisce qualcosa.',
];

const featureVisuals = [
  {
    badge: 'Screenshot',
    title: 'Stanza “Mindful break”',
    subtitle: 'Solo thread su pause e stacchi',
    tone: 'sky',
    items: [
      { title: 'Stacchi brevi', text: '12 risposte · +3 onde' },
      { title: 'Focus timer', text: 'Thread chiuso ieri' },
    ],
  },
  {
    badge: 'Thread leggibile',
    title: 'Titolo, post iniziale, risposte',
    subtitle: 'Capisci il contesto in 5 secondi',
    tone: 'fuchsia',
    items: [
      { title: 'Post iniziale', text: '“Come stacchi dopo il lavoro?”' },
      { title: 'Risposte', text: 'Marta · Giada · Elena in ordine' },
    ],
  },
  {
    badge: 'Risposta con foto',
    title: 'Allega un’immagine quando serve',
    subtitle: 'Foto dentro il thread, non altrove',
    tone: 'emerald',
    items: [
      { title: 'Anteprima', text: 'Postazione serale · 1 foto' },
      { title: 'Onde', text: '+8 dopo la foto di Sofia' },
    ],
  },
  {
    badge: 'Onde inviate',
    title: 'Reazioni che contano davvero',
    subtitle: 'Meno like generici, più onde mirate',
    tone: 'amber',
    items: [
      { title: 'Stanza “Outdoor & foto”', text: '+5 onde in 1 thread' },
      { title: 'Notifiche', text: 'Solo quando vuoi rispondere' },
    ],
  },
];

const uiShots = [
  {
    badge: 'Stanze scelte',
    title: 'Mindful break · Caffè creativo',
    subtitle: '3 stanze attive oggi',
    tone: 'sky',
    items: [
      { title: 'Stacchi brevi', text: '12 risposte · +3 onde' },
      { title: 'Outdoor & foto', text: 'Nuova risposta con foto' },
    ],
  },
  {
    badge: 'Thread',
    title: '“Come stacchi dopo il lavoro?”',
    subtitle: 'Thread in corso · 12 risposte',
    tone: 'fuchsia',
    items: [
      { title: 'Marta · Host', text: 'Timer da 20 minuti + tè caldo.' },
      { title: 'Giada', text: 'Passeggiata corta, poi diario.' },
    ],
  },
  {
    badge: 'Risposta con foto',
    title: 'Foto allegata da Sofia',
    subtitle: 'Thread “Telefono spento”',
    tone: 'emerald',
    items: [
      { title: 'Nota', text: '24h offline, meno notifiche.' },
      { title: 'Onde', text: '+8 ricevute' },
    ],
  },
  {
    badge: 'Stanza “Outdoor & foto”',
    title: 'Post di Riccardo',
    subtitle: '2 risposte con immagini',
    tone: 'amber',
    items: [
      { title: 'Elena', text: 'Foto del giro in bici.' },
      { title: 'Teo', text: 'Consiglia il sentiero breve.' },
    ],
  },
];

const storyMoments = [
  {
    badge: 'Screenshot dal thread',
    title: 'Mindful break · foto allegata',
    subtitle: 'Thread “Telefono spento”',
    tone: 'sky',
    items: [
      { title: 'Sofia', text: 'Mostra la scrivania prima di chiudere tutto.' },
      { title: 'Teo', text: '“24h offline, guadagnato 1h di sonno.”' },
    ],
  },
  {
    badge: 'Risposta con onda',
    title: 'Passeggiata al tramonto',
    subtitle: 'Stanza “Outdoor & foto”',
    tone: 'emerald',
    items: [
      { title: 'Riccardo', text: 'Condivide il percorso e manda onde a chi prova.' },
      { title: 'Chiara', text: 'Allega foto del sentiero breve.' },
    ],
  },
  {
    badge: 'Stanza “Caffè creativo”',
    title: 'Workshop remoto',
    subtitle: 'Thread “Creare meglio”',
    tone: 'fuchsia',
    items: [
      { title: 'Host', text: 'Condivide la lavagna e chiede feedback.' },
      { title: 'Luca', text: 'Risponde con note e manda un’onda.' },
    ],
  },
  {
    badge: 'Challenge di gruppo',
    title: 'Weekend senza notifiche',
    subtitle: 'Thread “Telefono spento”',
    tone: 'amber',
    items: [
      { title: 'Riepilogo', text: '24h offline · 8 persone hanno chiuso le notifiche.' },
      { title: 'Onde', text: '+12 in arrivo per chi ha resistito.' },
    ],
  },
];

const toneStyles = {
  sky: {
    border: 'border-sky-500/30',
    gradient: 'from-sky-500/15 via-slate-950/60 to-slate-950/90',
    dot: 'bg-sky-400',
  },
  fuchsia: {
    border: 'border-fuchsia-500/30',
    gradient: 'from-fuchsia-500/15 via-slate-950/60 to-slate-950/90',
    dot: 'bg-fuchsia-400',
  },
  emerald: {
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-400/15 via-slate-950/60 to-slate-950/90',
    dot: 'bg-emerald-400',
  },
  amber: {
    border: 'border-amber-400/30',
    gradient: 'from-amber-400/15 via-slate-950/60 to-slate-950/90',
    dot: 'bg-amber-300',
  },
};

const quietPrimaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-950 bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 shadow-none';
const quietSecondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-100 border border-slate-800 bg-slate-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 shadow-none';

function ScreenshotCard({ badge, title, subtitle, items = [], tone = 'sky' }) {
  const toneStyle = toneStyles[tone] ?? toneStyles.sky;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${toneStyle.border} bg-slate-950/80 shadow-soft`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${toneStyle.gradient}`}
        aria-hidden="true"
      />
      <div className="relative p-4 space-y-3">
        {badge ? (
          <span className="inline-flex items-center rounded-full bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-100 border border-slate-800">
            {badge}
          </span>
        ) : null}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white leading-snug">{title}</p>
          <p className="text-xs text-slate-200/80">{subtitle}</p>
        </div>
        <div className="space-y-1.5">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-2 rounded-xl border border-slate-800/60 bg-slate-900/60 px-2.5 py-2"
            >
              <span className={`mt-1 h-2 w-2 rounded-full ${item.accent ?? toneStyle.dot}`} />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">{item.title}</p>
                {item.text ? (
                  <p className="text-xs text-slate-300 leading-snug">{item.text}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

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
            <Link to="/auth/login" className={quietSecondaryButton}>
              Accedi
            </Link>
            <Link
              to="/auth/register"
              className={quietPrimaryButton}
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
                  Accesso anticipato a chi vuole conversare, non solo scorrere.
                </span>
              </p>
              <h1 className={`${pageTitleClass} text-3xl sm:text-4xl lg:text-5xl leading-tight`}>
                Il social per parlare, non per scorrere.
              </h1>
              <p className={`${bodyTextClass} text-base sm:text-lg max-w-2xl`}>
                Poche stanze, thread che finiscono, foto solo quando servono. Apri, leggi,
                rispondi e richiudi. Fine del feed infinito.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  to="/auth/register"
                  className={`${quietPrimaryButton} w-full sm:w-auto text-base`}
                >
                  Inizia ora
                </Link>
                <a
                  href="#come-funziona"
                  className={`${quietSecondaryButton} w-full sm:w-auto`}
                >
                  Guarda come funziona
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {uiShots.slice(0, 3).map((shot) => (
                  <ScreenshotCard
                    key={shot.title}
                    badge="Screenshot reale"
                    title={shot.title}
                    subtitle={shot.subtitle}
                    items={shot.items}
                    tone={shot.tone}
                  />
                ))}
              </div>
            </div>

            {/* HERO SIDE CARD */}
            <div className="relative w-full">
              <div className="absolute -inset-12 bg-gradient-to-tr from-accent/25 via-purple-500/20 to-fuchsia-500/25 blur-3xl opacity-60" />
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
                Poche stanze, thread chiari, risposte brevi. Tutto è pensato per farti chiudere
                l’app senza sensi di colpa.
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

          {/* SCENE REALI */}
          <section className="space-y-8">
            <div className="text-center space-y-3">
              <p className={eyebrowClass}>Scene reali</p>
              <h3 className={`${pageTitleClass} text-3xl`}>
                Cosa succede dentro le stanze
              </h3>
              <p className={`${bodyTextClass} text-base max-w-3xl mx-auto`}>
                Meno parole, più contesto: thread con foto e persone che raccontano la loro giornata.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-[1.05fr,0.95fr]">
              <div className="grid sm:grid-cols-2 gap-4">
                {storyMoments.map((story) => (
                  <ScreenshotCard
                    key={story.title}
                    badge={story.badge}
                    title={story.title}
                    subtitle={story.subtitle}
                    items={story.items}
                    tone={story.tone}
                  />
                ))}
              </div>
              <div className={`${cardBaseClass} p-5 sm:p-6 space-y-4 h-full`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={eyebrowClass}>Thread in corso</p>
                    <p className="text-xl font-semibold text-white">“Come stacchi dopo il lavoro?”</p>
                  </div>
                  <span className="rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-200">
                    +8 nuove onde
                  </span>
                </div>
                <div className="grid gap-3">
                  {uiShots.slice(0, 2).map((shot) => (
                    <ScreenshotCard
                      key={shot.title}
                      badge={shot.badge}
                      title={shot.title}
                      subtitle={shot.subtitle}
                      items={shot.items}
                      tone={shot.tone}
                    />
                  ))}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                    <p className="text-sm font-semibold text-white">Risposte rapide</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/40 text-xs font-semibold text-sky-200">
                            M
                          </span>
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-white">Marta</p>
                            <p className="text-xs text-slate-400">“Timer da 20 minuti + tè caldo.”</p>
                          </div>
                        </div>
                        <span className="text-accent" aria-hidden="true">🌊</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-xs font-semibold text-slate-200">
                          G
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-white">Giada</p>
                          <p className="text-xs text-slate-400">“Passeggiata corta, poi diario.”</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                Niente Caos
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
              {featureVisuals.map((visual) => (
                <ScreenshotCard
                  key={visual.title}
                  badge={visual.badge}
                  title={visual.title}
                  subtitle={visual.subtitle}
                  items={visual.items}
                  tone={visual.tone}
                />
              ))}
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
                className={`${quietPrimaryButton} text-base`}
              >
                Registrati gratis
              </Link>
              <Link
                to="/auth/login"
                className={`${quietSecondaryButton} text-base`}
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
