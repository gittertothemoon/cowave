import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import { useLogout } from '../hooks/useLogout.js';

const algorithmPresets = [
  {
    id: 'comfort',
    title: 'Comfort',
    description: 'Per iniziare con stimoli morbidi e contenuti brevi.',
  },
  {
    id: 'balanced',
    title: 'Bilanciato',
    description: 'Mix equilibrato di novità, comfort e sfide moderate.',
  },
  {
    id: 'growth',
    title: 'Crescita',
    description: 'Più novità, più profondità, thread lunghi e intensi.',
  },
];

const introBullets = [
  'Unisciti a stanze curate da host reali o aprine di nuove.',
  'Ogni thread è un albero: scegli quali rami nutrire.',
  'Regola l’algoritmo per decidere che tipo di stimoli vuoi.',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const {
    rooms,
    personas,
    completeOnboarding,
    algorithmPreset,
    primaryPersonaId,
  } = useAppState();

  const defaultPersonaId = primaryPersonaId ?? personas[0]?.id ?? null;
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState(defaultPersonaId);
  const [selectedPreset, setSelectedPreset] = useState(algorithmPreset);
  const [roomError, setRoomError] = useState('');

  const roomsInfo = useMemo(
    () => rooms.map((room) => ({ ...room, tags: room.tags ?? [] })),
    [rooms]
  );

  const canComplete =
    selectedRooms.length >= 1 && selectedPersonaId && !!selectedPreset;

  function toggleRoom(roomId) {
    setSelectedRooms((prev) => {
      if (prev.includes(roomId)) {
        const next = prev.filter((id) => id !== roomId);
        if (next.length === 0) {
          setRoomError('Seleziona almeno una stanza per continuare.');
        }
        return next;
      }
      if (prev.length >= 3) {
        setRoomError('Puoi seguire al massimo tre stanze in partenza.');
        return prev;
      }
      setRoomError('');
      return [...prev, roomId];
    });
  }

  function handleSubmit() {
    if (!canComplete) {
      setRoomError('Completa i tre passi prima di proseguire.');
      return;
    }

    completeOnboarding({
      initialRoomIds: selectedRooms,
      primaryPersonaId: selectedPersonaId,
      algorithmPreset: selectedPreset,
    });
    navigate('/app', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden text-slate-100">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.15), transparent 40%), radial-gradient(circle at 80% 0%, rgba(167,139,250,0.2), transparent 45%)',
        }}
      />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        <header className="flex items-center justify-between flex-wrap gap-4 border border-white/10 rounded-3xl px-4 sm:px-5 py-4 bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-slate-900/40">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-sm font-semibold text-white">CoWave</p>
              <p className="text-xs text-slate-400">
                Benvenuto nel tuo rituale sociale consapevole
              </p>
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Onboarding • 1 sola volta
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-xs uppercase tracking-[0.3em] px-4 py-1.5 rounded-2xl border border-white/10 text-slate-300 hover:text-white hover:border-white/30 transition"
          >
            Logout
          </button>
        </header>

        <section className="glass-panel p-5 sm:p-6 space-y-4">
          <p className="text-sm text-accent uppercase tracking-[0.3em]">
            Prima di iniziare
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Allinea CoWave al tuo modo di collaborare
          </h1>
          <p className="text-sm text-slate-300">
            CoWave è una rete a stanze dove i thread crescono come alberi e
            l’algoritmo è sotto il tuo controllo. In tre passi scegliamo mondi,
            persona e vibrazione con cui iniziare.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            {introBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3">
                <span className="text-accent text-base leading-none">✺</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Step 1
            </p>
            <p className="text-xs text-slate-400">
              {selectedRooms.length}/3 selezionate
            </p>
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Scegli le tue stanze iniziali
          </h2>
          <p className="text-sm text-slate-300">
            Seleziona tra 1 e 3 stanze da seguire subito. Potrai aggiungerne
            altre o crearne di nuove dopo l’ingresso.
          </p>
          {roomError && (
            <p className="text-xs text-rose-300">{roomError}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {roomsInfo.map((room) => {
              const isSelected = selectedRooms.includes(room.id);
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => toggleRoom(room.id)}
                  className={`text-left rounded-2xl border px-4 py-4 transition bg-slate-950/60 backdrop-blur ${
                    isSelected
                      ? 'border-accent/80 bg-accent/15 shadow-glow'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {room.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-[0.2em] px-2 py-1 rounded-full ${
                        isSelected
                          ? 'bg-accent text-slate-950'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {isSelected ? 'Scelta' : 'Segui'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {room.tags.map((tag) => (
                      <span
                        key={`${room.id}-${tag}`}
                        className="text-[10px] px-2 py-1 rounded-full border border-white/10 bg-slate-900/70 text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Step 2
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Scegli come vuoi presentarti
          </h2>
          <p className="text-sm text-slate-300">
            Su CoWave puoi attivare personas diverse per ruoli e toni differenti.
            Scegli quella con cui inizierai: sarà l’identità mostrata nei thread
            appena entri.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {personas.map((persona) => {
              const isSelected = persona.id === selectedPersonaId;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition bg-slate-950/60 ${
                    isSelected
                      ? 'border-accent/80 bg-accent/15 shadow-glow'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-semibold text-white ${persona.color}`}
                    >
                      {persona.label[0]}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {persona.label}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Persona curata per i tuoi thread.
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Step 3
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Imposta la vibrazione dell’algoritmo
          </h2>
          <p className="text-sm text-slate-300">
            Decidi il tono con cui CoWave ti proporrà thread, highlight e rituali.
            Potrai cambiarlo in qualunque momento da Impostazioni.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {algorithmPresets.map((preset) => {
              const isSelected = preset.id === selectedPreset;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`rounded-2xl border px-4 py-4 text-left transition bg-slate-950/60 ${
                    isSelected
                      ? 'border-accentBlue/80 bg-accentBlue/15 shadow-glow'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-base font-semibold text-white">
                    {preset.title}
                  </p>
                  <p className="text-sm text-slate-300 mt-1">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-white/10 rounded-3xl px-4 sm:px-5 py-4 bg-slate-950/70 backdrop-blur-xl">
          <div className="text-sm text-slate-300">
            Al termine entrerai nel feed con le stanze, la persona e il preset che hai scelto.
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canComplete}
            className={`px-6 py-3 rounded-2xl text-sm font-semibold transition w-full sm:w-auto text-center ${
              canComplete
                ? 'text-slate-950 shadow-glow'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            style={
              canComplete
                ? {
                    backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
                  }
                : {}
            }
          >
            Completa onboarding
          </button>
        </footer>
      </div>
    </div>
  );
}
