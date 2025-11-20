import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import { useAppState } from '../state/AppStateContext.jsx';

const algorithmPresets = [
  {
    id: 'comfort',
    title: 'Comfort',
    description: 'Ritmo morbido, thread brevi e stanze familiari.',
  },
  {
    id: 'balanced',
    title: 'Bilanciato',
    description: 'Mix equo tra novità, comfort e stimoli medi.',
  },
  {
    id: 'growth',
    title: 'Crescita',
    description: 'Più profondità, nuove stanze e thread lunghi.',
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const {
    rooms,
    personas,
    completeOnboarding,
    algorithmPreset,
    primaryPersonaId,
    addCustomPersona,
    currentUser,
    initialRoomIds,
  } = useAppState();

  const defaultPersonaId = primaryPersonaId ?? personas[0]?.id ?? null;
  const [selectedRooms, setSelectedRooms] = useState(
    initialRoomIds?.length ? initialRoomIds : []
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState(defaultPersonaId);
  const [selectedPreset, setSelectedPreset] = useState(algorithmPreset);
  const [roomError, setRoomError] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customPersonaName, setCustomPersonaName] = useState('');
  const [customPersonaTagline, setCustomPersonaTagline] = useState('');
  const [customPersonaError, setCustomPersonaError] = useState('');
  const selectionLimit = 3;
  const customPersonaFormId = 'custom-persona-form';
  const nickname =
    currentUser?.nickname?.trim().split(' ')?.[0] || currentUser?.nickname || 'Tu';

  const roomsInfo = useMemo(
    () => rooms.map((room) => ({ ...room, tags: room.tags ?? [] })),
    [rooms]
  );

  const canComplete =
    selectedRooms.length >= 1 && selectedPersonaId && !!selectedPreset;

  function handleCustomPersonaCreate() {
    if (!customPersonaName.trim()) {
      setCustomPersonaError('Dai un nome alla tua persona.');
      return;
    }
    const newId = addCustomPersona(customPersonaName, customPersonaTagline);
    if (newId) {
      setSelectedPersonaId(newId);
      setCustomPersonaName('');
      setCustomPersonaTagline('');
      setCustomPersonaError('');
      setShowCustomForm(false);
    }
  }

  function toggleRoom(roomId) {
    setSelectedRooms((prev) => {
      if (prev.includes(roomId)) {
        const next = prev.filter((id) => id !== roomId);
        if (next.length === 0) {
          setRoomError('Seleziona almeno una stanza per continuare.');
        }
        return next;
      }
      if (prev.length >= selectionLimit) {
        setRoomError(`Puoi scegliere al massimo ${selectionLimit} stanze ora.`);
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
                {currentUser?.nickname
                  ? `${currentUser.nickname}, bastano tre scelte`
                  : 'Bastano tre scelte per iniziare'}
              </p>
            </div>
          </div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
            Onboarding • unico passaggio
          </div>
        </header>

        <section className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Step 1
            </p>
            <p className="text-xs text-slate-400">
              {selectedRooms.length}/{selectionLimit} selezionate
            </p>
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Scegli le tue stanze iniziali
          </h2>
          <p className="text-sm text-slate-300">
            Seleziona da 1 a {selectionLimit} stanze curate: il feed partirà solo da qui e
            potrai aggiornarle in qualsiasi momento.
          </p>
          {roomError && (
            <p
              className="text-xs text-rose-300"
              role="status"
              aria-live="assertive"
            >
              {roomError}
            </p>
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
                  aria-pressed={isSelected}
                  aria-label={`${isSelected ? 'Rimuovi' : 'Segui'} la stanza ${
                    room.name
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
                  <div className="flex flex-wrap gap-1 mt-3" aria-hidden="true">
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
            Scegli la tua persona iniziale
          </h2>
          <p className="text-sm text-slate-300">
            {nickname}, con quale tono vuoi apparire nei primi thread? Puoi
            cambiare o creare nuove personas quando vuoi.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  aria-pressed={isSelected}
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
                        {persona.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            <div
              className={`rounded-2xl border px-4 py-4 text-left transition bg-slate-950/60 ${
                showCustomForm
                  ? 'border-accent/60 shadow-glow'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Crea persona personalizzata
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Nome + linea opzionale, tutto in pochi secondi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomForm((prev) => !prev);
                    setCustomPersonaError('');
                  }}
                  className="rounded-full border border-white/10 w-8 h-8 text-lg text-white"
                  aria-expanded={showCustomForm}
                  aria-controls={customPersonaFormId}
                  aria-label="Apri form persona personalizzata"
                >
                  {showCustomForm ? '−' : '+'}
                </button>
              </div>
              {showCustomForm && (
                <div id={customPersonaFormId} className="mt-3 space-y-2">
                  <input
                    type="text"
                    className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-slate-100"
                    placeholder="Es. Guida notturna"
                    value={customPersonaName}
                    onChange={(e) => {
                      setCustomPersonaName(e.target.value);
                      setCustomPersonaError('');
                    }}
                  />
                  <input
                    type="text"
                    className="w-full bg-slate-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-slate-100"
                    placeholder="Linea opzionale (es. tono caldo e lento)"
                    value={customPersonaTagline}
                    onChange={(e) => setCustomPersonaTagline(e.target.value)}
                  />
                  {customPersonaError && (
                    <p
                      className="text-xs text-rose-300"
                      role="status"
                      aria-live="assertive"
                    >
                      {customPersonaError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleCustomPersonaCreate}
                    className="w-full text-sm font-semibold rounded-2xl px-3 py-2 text-slate-950 shadow-glow"
                    style={{
                      backgroundImage:
                        'linear-gradient(120deg, #a78bfa, #38bdf8)',
                    }}
                  >
                    Salva persona
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Step 3
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Imposta la vibrazione del feed
          </h2>
          <p className="text-sm text-slate-300">
            Tre preset chiari per decidere come dosare comfort, novità e ritmo.
            Potrai spostarli in seguito dagli Strumenti avanzati.
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
                  aria-pressed={isSelected}
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
            Al termine entri nel feed con queste scelte. Tutto resta modificabile.
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
            Entra in CoWave
          </button>
        </footer>
      </div>
    </div>
  );
}
