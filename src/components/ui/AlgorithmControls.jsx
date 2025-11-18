import { useState } from 'react';

export default function AlgorithmControls({ compact }) {
  const [novelty, setNovelty] = useState(60); // nuovo vs familiari
  const [challenge, setChallenge] = useState(55); // quanto ti sfida
  const [lengthPref, setLengthPref] = useState(40); // breve vs lungo

  const baseLabelClass =
    'text-[10px] uppercase tracking-[0.16em] text-slate-400';

  if (compact) {
    return (
      <div className="flex flex-col gap-1.5 text-[10px] bg-slate-950/50 border border-white/10 rounded-2xl px-3 py-2">
        <p className={baseLabelClass}>Algoritmo • sessione</p>
        <div className="flex gap-2">
          <MiniSlider label="Nuovo" value={novelty} onChange={setNovelty} />
          <MiniSlider label="Sfida" value={challenge} onChange={setChallenge} />
          <MiniSlider
            label="Lunghi"
            value={lengthPref}
            onChange={setLengthPref}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel glass-panel--interactive px-3.5 py-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
            Algoritmo
          </p>
          <p className="text-[11px] text-slate-500">controllo manuale</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
          live
        </span>
      </div>
      <div className="space-y-4">
        <Slider
          labelLeft="Familiari"
          labelRight="Nuovi"
          value={novelty}
          onChange={setNovelty}
        />
        <Slider
          labelLeft="Comfort"
          labelRight="Sfida"
          value={challenge}
          onChange={setChallenge}
        />
        <Slider
          labelLeft="Brevi"
          labelRight="Lunghi"
          value={lengthPref}
          onChange={setLengthPref}
        />
      </div>
    </div>
  );
}

function Slider({ labelLeft, labelRight, value, onChange }) {
  const position = Math.min(Math.max(value, 6), 94);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[10px] text-slate-400 uppercase tracking-[0.14em]">
        <span>{labelLeft}</span>
        <span>{labelRight}</span>
      </div>
      <div className="relative pt-4">
        <div
          className="absolute -top-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/10 text-white pointer-events-none transition-all duration-200"
          style={{
            left: `calc(${position}% - 20px)`,
          }}
        >
          {value}%
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-accent cursor-pointer"
        />
      </div>
    </div>
  );
}

function MiniSlider({ label, value, onChange }) {
  return (
    <div className="flex-1 flex flex-col gap-0.5">
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent cursor-pointer"
      />
    </div>
  );
}
