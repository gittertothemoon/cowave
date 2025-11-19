export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <header className="glass-panel p-4 sm:p-5 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Impostazioni
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Sessione e sicurezza
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Imposta limiti chiari, filtri e promemoria per mantenere ogni sessione
          intenzionale.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 text-sm">
        <div className="glass-panel p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Limite consigliato per oggi</span>
            <select className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 w-full sm:w-auto">
              <option>30 minuti</option>
              <option>45 minuti</option>
              <option>60 minuti</option>
              <option>Nessun limite</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Modalità contenuti intensi</span>
            <label className="inline-flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" className="accent-accent h-4 w-4" defaultChecked />
              disattiva trigger forti
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Promemoria respiro</span>
            <select className="bg-slate-950/70 border border-white/10 rounded-xl px-3 py-2 text-xs w-full sm:w-auto">
              <option>Ogni 20 min</option>
              <option>Ogni 30 min</option>
              <option>Off</option>
            </select>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Filtro stanze NSFW</span>
            <input type="checkbox" className="accent-accent h-4 w-4" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>Notifiche solo in finestre attive</span>
            <input type="checkbox" className="accent-accent h-4 w-4" defaultChecked />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              In arrivo
            </p>
            <p className="text-xs text-slate-400">
              A breve potrai esportare queste impostazioni come preset e
              condividerle con i co-host.
            </p>
          </div>
        </div>
      </section>

      <section className="glass-panel p-4 sm:p-5 space-y-3 text-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Programma break suggerito
        </p>
        <div className="grid md:grid-cols-3 gap-3">
          {['Mattino', 'Pomeriggio', 'Sera'].map((slot) => (
            <div key={slot} className="rounded-2xl border border-white/10 px-3 py-3 bg-slate-950/40">
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
