"use client";

import { useState } from "react";
import { Activity, Droplets, Leaf, Power, Settings2, Sprout, Wifi, WifiOff } from "lucide-react";

type Mode = "auto" | "manual";

export default function Home() {
  const [mode, setMode] = useState<Mode>("auto");
  const [pumpOn, setPumpOn] = useState(false);
  const [threshold, setThreshold] = useState(35);
  const [duration, setDuration] = useState(5);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-emerald-950"><Sprout size={27} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">SmartPlant IoT</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Plant Control Center</h1></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-amber-200"><span className="h-2 w-2 rounded-full bg-amber-300" /> Preview mode · device not connected</div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Soil moisture · Sensor 1</span><Droplets className="text-sky-300" /></div>
            <div className="mt-5 flex items-end gap-2"><strong className="text-5xl">--</strong><span className="pb-1 text-slate-400">%</span></div>
            <p className="mt-3 text-sm text-slate-400">Menunggu data dari ESP8266</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-0 rounded-full bg-sky-300" /></div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Soil moisture · Sensor 2</span><Activity className="text-violet-300" /></div>
            <div className="mt-5 flex items-end gap-2"><strong className="text-5xl">--</strong><span className="pb-1 text-slate-400">%</span></div>
            <p className="mt-3 text-sm text-slate-400">Menunggu data dari ESP8266</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-0 rounded-full bg-violet-300" /></div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Device connection</span><WifiOff className="text-amber-300" /></div>
            <div className="mt-5 text-2xl font-bold">Belum terhubung</div>
            <p className="mt-3 text-sm text-slate-400">Integrasi API akan diaktifkan setelah firmware dan database disiapkan.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200"><Wifi size={14} /> Waiting for device</div>
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300"><Power size={22} /></div><div><h2 className="text-xl font-bold">Watering control</h2><p className="mt-1 text-sm text-slate-400">Kontrol pompa akan aktif setelah API terhubung.</p></div></div>
            <div className="mt-7 grid grid-cols-2 gap-3 rounded-2xl bg-black/20 p-1.5">
              <button onClick={() => setMode("auto")} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${mode === "auto" ? "bg-emerald-300 text-emerald-950" : "text-slate-400 hover:bg-white/5"}`}>Automatic</button>
              <button onClick={() => setMode("manual")} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${mode === "manual" ? "bg-emerald-300 text-emerald-950" : "text-slate-400 hover:bg-white/5"}`}>Manual</button>
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 p-4">
              <div><p className="font-semibold">Water pump</p><p className="mt-1 text-sm text-slate-400">{pumpOn ? "Simulasi: pompa ON" : "Simulasi: pompa OFF"}</p></div>
              <button aria-pressed={pumpOn} onClick={() => setPumpOn(v => !v)} disabled={mode !== "manual"} className={`rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${pumpOn ? "bg-rose-400 text-rose-950" : "bg-emerald-300 text-emerald-950"}`}>{pumpOn ? "Turn off" : "Turn on"}</button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Tombol saat ini hanya simulasi UI. Tidak mengirim perintah ke perangkat fisik.</p>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-300/10 text-sky-200"><Settings2 size={22} /></div><div><h2 className="text-xl font-bold">Automation settings</h2><p className="mt-1 text-sm text-slate-400">Pengaturan tampilan, belum dikirim ke ESP8266.</p></div></div>
            <label className="mt-7 block"><div className="flex justify-between gap-4 text-sm"><span className="text-slate-300">Moisture threshold</span><strong>{threshold}%</strong></div><input className="mt-4 w-full accent-emerald-300" type="range" min="10" max="80" value={threshold} onChange={e => setThreshold(Number(e.target.value))} /><div className="mt-1 flex justify-between text-xs text-slate-500"><span>10% · drier</span><span>80% · wetter</span></div></label>
            <label className="mt-7 block"><div className="flex justify-between gap-4 text-sm"><span className="text-slate-300">Watering duration</span><strong>{duration} sec</strong></div><input className="mt-4 w-full accent-emerald-300" type="range" min="1" max="20" value={duration} onChange={e => setDuration(Number(e.target.value))} /><div className="mt-1 flex justify-between text-xs text-slate-500"><span>1 second</span><span>20 seconds</span></div></label>
            <div className="mt-7 rounded-2xl border border-dashed border-white/15 p-4 text-sm text-slate-400"><Leaf className="mb-2 text-emerald-300" size={19} />Nilai pengaturan hanya tersimpan di halaman ini untuk sementara. Backend dan penyimpanan permanen menyusul.</div>
          </article>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-500"><span>SmartPlant · dashboard foundation</span><span>Preview only · no hardware commands sent</span></footer>
      </div>
    </main>
  );
}