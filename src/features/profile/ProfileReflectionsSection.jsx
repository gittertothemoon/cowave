import { useCallback, useEffect, useMemo, useState } from 'react';
import { listReflections, upsertReflection } from '../../data/reflections';
import { useAuth } from '../../state/AuthContext.jsx';
import { useAchievements } from '../achievements/useAchievements.js';
import {
  bodyTextClass,
  buttonPrimaryClass,
  cardBaseClass,
  cardMutedClass,
  eyebrowClass,
  inputBaseClass,
  labelClass,
} from '../../components/ui/primitives.js';

const MAX_LENGTH = 2000;

export default function ProfileReflectionsSection() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { unlockAchievement, unlockedSet } = useAchievements();
  const [reflections, setReflections] = useState([]);
  const [todayBody, setTodayBody] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loadState, setLoadState] = useState({
    loading: true,
    error: null,
    errorType: null,
  });
  const [saveState, setSaveState] = useState({
    saving: false,
    error: null,
    errorType: null,
    successAt: null,
  });
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const todayKey = getTodayKey();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const todayReflection = useMemo(
    () => reflections.find((reflection) => reflection.forDate === todayKey) || null,
    [reflections, todayKey]
  );

  const pastReflections = useMemo(() => {
    const list = reflections.filter((reflection) => reflection.forDate !== todayKey);
    return list.sort(sortByDateDesc).slice(0, 14);
  }, [reflections, todayKey]);

  const loadReflections = useCallback(async () => {
    if (!userId) {
      setLoadState({
        loading: false,
        error: new Error('Accedi per vedere e salvare le tue riflessioni.'),
        errorType: 'permission',
      });
      setHasHydrated(true);
      return;
    }
    setLoadState({ loading: true, error: null, errorType: null });
    const { reflections: rows, error, errorType } = await listReflections({
      userId,
      limit: 32,
    });
    if (error) {
      setLoadState({
        loading: false,
        error,
        errorType: errorType ?? (isOffline ? 'offline' : null),
      });
      setHasHydrated(true);
      return;
    }
    setReflections(rows);
    setLoadState({ loading: false, error: null, errorType: null });
    setHasHydrated(true);
  }, [userId, isOffline]);

  useEffect(() => {
    loadReflections();
  }, [loadReflections]);

  useEffect(() => {
    if (todayReflection) {
      setTodayBody(todayReflection.body);
      setLastSavedAt(todayReflection.updatedAt || todayReflection.createdAt);
      return;
    }
    if (hasHydrated && todayBody.trim().length === 0) {
      setLastSavedAt(null);
    }
  }, [todayReflection, hasHydrated, todayBody]);

  async function handleSave() {
    const trimmed = todayBody.trim();
    if (!userId) {
      setSaveState({
        saving: false,
        error: new Error('Accedi per salvare la tua riflessione.'),
        errorType: 'permission',
        successAt: null,
      });
      return;
    }
    if (isOffline) {
      setSaveState({
        saving: false,
        error: new Error('Sei offline: tengo qui il testo, salva appena torni online.'),
        errorType: 'offline',
        successAt: null,
      });
      return;
    }
    if (!trimmed) {
      setSaveState({
        saving: false,
        error: new Error('Scrivi almeno qualche parola su cosa ti porti via.'),
        errorType: null,
        successAt: null,
      });
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setSaveState({
        saving: false,
        error: new Error('Hai superato il limite di 2000 caratteri.'),
        errorType: null,
        successAt: null,
      });
      return;
    }

    setSaveState({ saving: true, error: null, errorType: null, successAt: null });
    const { reflection, error, errorType } = await upsertReflection({
      userId,
      forDate: todayKey,
      body: trimmed,
      isPublic: false,
    });

    if (!reflection || error) {
      setSaveState({
        saving: false,
        error: error ?? new Error('Non riesco a salvare ora. Riprova tra poco.'),
        errorType: errorType ?? null,
        successAt: null,
      });
      return;
    }

    const nextList = [
      reflection,
      ...reflections.filter((item) => item.forDate !== reflection.forDate),
    ].sort(sortByDateDesc);
    setReflections(nextList);
    setLastSavedAt(reflection.updatedAt || reflection.createdAt);
    setSaveState({
      saving: false,
      error: null,
      errorType: null,
      successAt: reflection.updatedAt || reflection.createdAt,
    });

    if (!unlockedSet.has('CONSISTENT_3') && hasThreeDayStreak(nextList)) {
      await unlockAchievement('CONSISTENT_3');
    }
  }

  const bodyLength = todayBody.length;
  const isSavingDisabled =
    saveState.saving ||
    loadState.loading ||
    isOffline ||
    !userId ||
    bodyLength === 0 ||
    todayBody.trim().length === 0 ||
    bodyLength > MAX_LENGTH;

  const statusText = (() => {
    if (saveState.error) {
      return saveState.error.message;
    }
    if (isOffline) {
      return 'Sei offline: il testo rimane qui fino al prossimo salvataggio.';
    }
    if (lastSavedAt) {
      return `Ultimo salvataggio: ${formatTimeAgo(lastSavedAt)}`;
    }
    if (loadState.loading) {
      return 'Sto recuperando le tue note...';
    }
    return 'Scrivi cosa ti porti via da oggi: resta visibile solo a te.';
  })();

  const listBanner = (() => {
    if (loadState.errorType === 'permission') {
      return 'Non riusciamo a leggere le riflessioni: controlla di essere connesso con il tuo profilo.';
    }
    if (loadState.errorType === 'offline') {
      return 'Sembra che tu sia offline: le note arriveranno appena torna la connessione.';
    }
    if (loadState.error) {
      return 'Qualcosa è andato storto nel caricare le note. Riprova tra poco.';
    }
    return null;
  })();

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
        <div className="space-y-1">
          <p className={eyebrowClass}>Riflessioni</p>
          <h2 className="text-lg font-semibold text-white">
            Cosa ti porti via da oggi?
          </h2>
          <p className={`${bodyTextClass} text-sm text-slate-300`}>
            Prenditi un momento per fissare cosa è rimasto della giornata. Rimane privato nel tuo profilo.
          </p>
        </div>

        <div className="space-y-2">
          <label className={labelClass} htmlFor="today-reflection">
            Oggi
          </label>
          <textarea
            id="today-reflection"
            className={`${inputBaseClass} min-h-[140px] resize-none text-sm leading-relaxed`}
            placeholder="Una frase, un’immagine, un pensiero che vuoi conservare..."
            value={todayBody}
            onChange={(event) => {
              setTodayBody(event.target.value);
              if (saveState.successAt) {
                setSaveState((prev) => ({ ...prev, successAt: null }));
              }
            }}
            maxLength={MAX_LENGTH}
            disabled={loadState.loading}
          />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[12px] text-slate-400">
            <span className={saveState.error ? 'text-amber-400' : 'text-slate-400'}>
              {statusText}
            </span>
            <div className="flex items-center gap-3">
              <span className={bodyLength >= MAX_LENGTH ? 'text-amber-400' : 'text-slate-400'}>
                {bodyLength}/{MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingDisabled}
                className={`${buttonPrimaryClass} text-sm disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {saveState.saving ? 'Sto salvando...' : 'Salva riflessione di oggi'}
              </button>
            </div>
          </div>
          {saveState.successAt && !saveState.error ? (
            <p className="text-[12px] text-emerald-400">
              Salvato alle {formatTime(saveState.successAt)}.
            </p>
          ) : null}
        </div>
      </div>

      <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className={eyebrowClass}>Le tue note recenti</p>
          {listBanner ? (
            <span className="text-[12px] text-amber-300">{listBanner}</span>
          ) : null}
        </div>

        {loadState.loading && reflections.length === 0 ? (
          <div className={`${cardMutedClass} p-3 sm:p-4 space-y-2 animate-pulse`}>
            <div className="h-4 w-28 rounded-full bg-slate-800" />
            <div className="h-3 w-full rounded-full bg-slate-800" />
            <div className="h-3 w-5/6 rounded-full bg-slate-800" />
          </div>
        ) : null}

        {!loadState.loading && pastReflections.length === 0 ? (
          <div className={`${cardMutedClass} p-3 sm:p-4 space-y-1`}>
            <p className="font-semibold text-slate-100">Ancora nessuna nota precedente.</p>
            <p className="text-[13px] text-slate-400">
              Quando vorrai, potrai rileggere qui cosa ti sei portato via nei giorni scorsi.
            </p>
          </div>
        ) : null}

        {pastReflections.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {pastReflections.map((reflection) => (
              <article
                key={reflection.id}
                className={`${cardMutedClass} p-3 sm:p-4 space-y-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-slate-400">
                    {formatDayLabel(reflection.forDate)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Aggiornata alle {formatTime(reflection.updatedAt || reflection.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">
                  {reflection.body}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getTodayKey() {
  return buildDayKey(0);
}

function hasThreeDayStreak(list) {
  const dates = new Set(list.map((item) => item.forDate));
  return [0, 1, 2].every((offset) => dates.has(buildDayKey(offset)));
}

function buildDayKey(daysAgo = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function sortByDateDesc(a, b) {
  if (a.forDate === b.forDate) {
    return new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime();
  }
  return new Date(b.forDate).getTime() - new Date(a.forDate).getTime();
}

function formatDayLabel(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 'Data non disponibile';
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTimeAgo(dateLike) {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return 'poco fa';
  const now = new Date();
  const diffMinutes = Math.max(0, Math.round((now.getTime() - date.getTime()) / 60000));
  if (diffMinutes < 1) return 'pochi secondi fa';
  if (diffMinutes === 1) return 'un minuto fa';
  if (diffMinutes < 60) return `${diffMinutes} minuti fa`;
  const isSameDay = now.toDateString() === date.toDateString();
  if (isSameDay) {
    return `oggi alle ${formatTime(dateLike)}`;
  }
  return `${formatDayLabel(dateLike)} alle ${formatTime(dateLike)}`;
}
