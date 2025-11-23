import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  cardMutedClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
  inputBaseClass,
  labelClass,
} from '../components/ui/primitives.js';
import { useAppState } from '../state/AppStateContext.jsx';

export default function SettingsPage() {
  const {
    currentUser,
    updateCurrentUser,
    personas,
    activePersonaId,
    setActivePersonaId,
  } = useAppState();
  const [profileForm, setProfileForm] = useState(() => ({
    nickname: currentUser?.nickname || '',
    handle: currentUser?.handle || '',
    bio: currentUser?.bio || '',
  }));
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const limitId = 'limit-select';
  const intenseModeId = 'intense-mode';
  const reminderId = 'reminder-select';
  const nsfwId = 'nsfw-toggle';
  const activeWindowId = 'active-window-toggle';
  const nicknameId = useId();
  const handleId = useId();
  const bioId = useId();
  const personaId = useId();

  useEffect(() => {
    setProfileForm({
      nickname: currentUser?.nickname || '',
      handle: currentUser?.handle || '',
      bio: currentUser?.bio || '',
    });
  }, [currentUser?.nickname, currentUser?.handle, currentUser?.bio]);

  function buildHandle(nickname, handleInput) {
    const base = (handleInput || '').trim() || nickname.trim() || 'tu';
    const cleaned = base.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned ? `@${cleaned}` : '@tu';
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    const nickname = profileForm.nickname.trim() || 'Tu';
    const handle = buildHandle(nickname, profileForm.handle);
    const bio = profileForm.bio.trim();
    if (!nickname) {
      setProfileError('Inserisci un nickname valido.');
      setProfileMessage('');
      return;
    }
    updateCurrentUser({
      nickname,
      handle,
      bio,
    });
    setProfileMessage('Profilo aggiornato.');
    setProfileError('');
  }

  function handlePersonaChange(nextId) {
    setActivePersonaId?.(nextId);
  }

  return (
    <div className="space-y-5">
      <header className={`${cardBaseClass} p-4 sm:p-5 space-y-2`}>
        <p className={eyebrowClass}>Impostazioni</p>
        <h1 className={`${pageTitleClass} text-2xl`}>Sessione e sicurezza</h1>
        <p className={`${bodyTextClass} max-w-2xl`}>
          Limiti chiari, filtri e promemoria per mantenere ogni sessione intenzionale.
        </p>
      </header>

      <section
        id="profilo"
        className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}
      >
        <div className="flex flex-col gap-1">
          <p className={eyebrowClass}>Profilo pubblico</p>
          <h2 className={`${pageTitleClass} text-xl`}>Identità e bio</h2>
          <p className={`${bodyTextClass} text-sm`}>
            Aggiorna come appari nelle stanze e nel profilo.
          </p>
        </div>
        {profileMessage ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-xs text-emerald-100">
            {profileMessage}
          </div>
        ) : null}
        {profileError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-100">
            {profileError}
          </div>
        ) : null}
        <form onSubmit={handleProfileSubmit} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className={labelClass} htmlFor={nicknameId}>
              Nome visualizzato
            </label>
            <input
              id={nicknameId}
              type="text"
              value={profileForm.nickname}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  nickname: e.target.value,
                }))
              }
              className={inputBaseClass}
              placeholder="Es. Arianna"
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor={handleId}>
              Handle
            </label>
            <input
              id={handleId}
              type="text"
              value={profileForm.handle}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  handle: e.target.value,
                }))
              }
              className={inputBaseClass}
              placeholder="@tu"
            />
            <p className="text-[12px] text-slate-500">
              Se lo lasci vuoto useremo il tuo nome per generarlo.
            </p>
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor={bioId}>
              Bio
            </label>
            <textarea
              id={bioId}
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  bio: e.target.value,
                }))
              }
              className={`${inputBaseClass} min-h-[90px]`}
              placeholder="Aggiungi una breve descrizione su come vuoi usare CoWave."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className={`${buttonPrimaryClass} rounded-full`}
            >
              Salva profilo
            </button>
            <Link
              to="/app/profile"
              className={`${buttonSecondaryClass} rounded-full`}
            >
              Torna al profilo
            </Link>
          </div>
        </form>
      </section>

      <section
        id="persona-attiva"
        className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}
      >
        <div className="flex flex-col gap-1">
          <p className={eyebrowClass}>Persona attiva</p>
          <h2 className={`${pageTitleClass} text-xl`}>Voce con cui navighi</h2>
          <p className={`${bodyTextClass} text-sm`}>
            Scegli rapidamente quale persona usare per thread e risposte.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {personas.map((persona) => {
            const isActive = persona.id === activePersonaId;
            return (
              <label
                key={persona.id}
                className={`${cardMutedClass} p-3 rounded-2xl border ${isActive ? 'border-accent/70' : 'border-slate-800'} flex gap-3 cursor-pointer`}
              >
                <input
                  type="radio"
                  name="persona"
                  value={persona.id}
                  checked={isActive}
                  onChange={() => handlePersonaChange(persona.id)}
                  className="mt-1 accent-accent"
                  aria-describedby={personaId}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${persona.color}`}
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-white">
                      {persona.title}
                    </p>
                  </div>
                  <p className="text-[12px] text-slate-400">
                    {persona.description}
                  </p>
                  {isActive ? (
                    <span className="inline-flex w-fit rounded-full border border-accent/50 bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent">
                      Attiva ora
                    </span>
                  ) : null}
                </div>
              </label>
            );
          })}
        </div>
        <p className="text-[12px] text-slate-500" id={personaId}>
          La persona attiva verrà usata di default quando avvii thread o rispondi.
        </p>
      </section>

      <div className={`${cardMutedClass} p-4 sm:p-5 space-y-2 text-sm`}>
        <p className={eyebrowClass}>Vuoi più controllo?</p>
        <p className={bodyTextClass}>
          Sessione mindful, radar e slider dell’algoritmo sono negli Strumenti avanzati.
        </p>
        <Link
          to="/app/settings/esperienza"
          className={`${buttonSecondaryClass} inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] rounded-full`}
        >
          Vai agli strumenti avanzati →
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 text-sm">
        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor={limitId}
              className="text-slate-200 font-medium"
            >
              Limite consigliato per oggi
            </label>
            <select
              id={limitId}
              className={`${inputBaseClass} w-full sm:w-auto`}
              defaultValue="30 minuti"
            >
              <option>30 minuti</option>
              <option>45 minuti</option>
              <option>60 minuti</option>
              <option>Nessun limite</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-200 font-medium">
                Modalità contenuti intensi
              </p>
              <p className="text-xs text-slate-400">
                Disattiva trigger forti durante questa sessione.
              </p>
            </div>
            <label
              htmlFor={intenseModeId}
              className="inline-flex items-center gap-2 text-sm text-slate-400"
            >
              <input
                id={intenseModeId}
                type="checkbox"
                className="accent-accent h-4 w-4"
                defaultChecked
              />
              Attiva
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor={reminderId}
              className="text-slate-200 font-medium"
            >
              Promemoria respiro
            </label>
            <select
              id={reminderId}
              className={`${inputBaseClass} w-full sm:w-auto`}
              defaultValue="Ogni 20 min"
            >
              <option>Ogni 20 min</option>
              <option>Ogni 30 min</option>
              <option>Off</option>
            </select>
          </div>
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor={nsfwId}
              className="text-slate-200 font-medium"
            >
              Filtro stanze NSFW
            </label>
            <input
              id={nsfwId}
              type="checkbox"
              className="accent-accent h-4 w-4"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor={activeWindowId}
              className="text-slate-200 font-medium"
            >
              Notifiche solo in finestre attive
            </label>
            <input
              id={activeWindowId}
              type="checkbox"
              className="accent-accent h-4 w-4"
              defaultChecked
            />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              In arrivo
            </p>
            <p className="text-xs text-slate-400">
              Potrai esportare queste impostazioni come preset e condividerle con i co-host.
            </p>
          </div>
        </div>
      </section>

      <section className={`${cardBaseClass} p-4 sm:p-5 space-y-3 text-sm`}>
        <p className={eyebrowClass}>Programma break suggerito</p>
        <div className="grid md:grid-cols-3 gap-3">
          {['Mattino', 'Pomeriggio', 'Sera'].map((slot) => (
            <div
              key={slot}
              className="rounded-2xl border border-white/10 px-3 py-3 bg-slate-950/50"
            >
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">
                {slot}
              </p>
              <p className="text-[13px] text-white">2 blocchi focus</p>
              <p className="text-[11px] text-slate-400">Pausa 5 min respiro</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          Salva queste routine e condividile con le stanze che ospiti per
          mantenere il ritmo collettivo.
        </p>
      </section>
    </div>
  );
}
