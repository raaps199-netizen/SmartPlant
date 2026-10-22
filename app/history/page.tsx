"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, ArrowLeft, Droplets, RefreshCw, Trash2 } from "lucide-react";

type EventItem = { id: string; time: string; kind: "start" | "stop"; moisture: number | null; note: string };
type Snapshot = { values?: Record<string, unknown>; connected?: boolean };
const STORAGE_KEY = "smartplant-watering-history-v1";

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function HistoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEvents(JSON.parse(saved) as EventItem[]);
    } catch {
      setError("Riwayat lokal tidak bisa dibaca.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 200)));
  }, [events, ready]);

  const poll = useCallback(async () => {
    try {
      const response = await fetch("/api/blynk", { cache: "no-store" });
      const data = (await response.json()) as Snapshot & { error?: string };
      if (!response.ok) throw new Error(data.error || "Gagal membaca data perangkat.");
      setConnected(Boolean(data.connected));
      setError("");
      const pump = asNumber(data.values?.v0) === 1;
      const moisture = asNumber(data.values?.v10);
      const previous = sessionStorage.getItem("smartplant-history-last-pump");
      if (previous === null) {
        sessionStorage.setItem("smartplant-history-last-pump", pump ? "1" : "0");
        return;
      }
      const current = pump ? "1" : "0";
      if (previous !== current) {
        const kind = pump ? "start" : "stop";
        const event: EventItem = {
          id: `${Date.now()}-${kind}`,
          time: new Date().toISOString(),
          kind,
          moisture,
          note: pump ? "Pompa terdeteksi menyala" : "Pompa terdeteksi berhenti",
        };
        setEvents(old => [event, ...old].slice(0, 200));
        sessionStorage.setItem("smartplant-history-last-pump", current);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat memuat riwayat.");
    }
  }, []);

  useEffect(() => {
    void poll();
    const timer = window.setInterval(() => void poll(), 4000);
    return () => window.clearInterval(timer);
  }, [poll]);

  function clearHistory() {
    setEvents([]);
    sessionStorage.removeItem("smartplant-history-last-pump");
  }

  const starts = events.filter(e => e.kind === "start").length;
  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200"><ArrowLeft size={16}/> Kembali ke dashboard</a>
        <header className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">SmartPlant IoT</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Riwayat Penyiraman</h1><p className="mt-2 text-sm text-slate-400">Catatan perubahan status pompa yang terdeteksi dashboard.</p></div>
          <div className={`rounded-full border px-4 py-2 text-sm ${connected ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{connected ? "NodeMCU Online" : "NodeMCU Offline"}</div>
        </header>
        {error && <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-sm text-amber-100">{error}</p>}
        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><Activity className="text-emerald-300"/><p className="mt-4 text-sm text-slate-400">Kejadian tercatat</p><strong className="mt-1 block text-3xl">{events.length}</strong></article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><Droplets className="text-sky-300"/><p className="mt-4 text-sm text-slate-400">Pompa mulai menyala</p><strong className="mt-1 block text-3xl">{starts}</strong></article>
          <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><RefreshCw className="text-violet-300"/><p className="mt-4 text-sm text-slate-400">Pembaruan</p><strong className="mt-1 block text-lg">Setiap 4 detik</strong></article>
        </section>
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5"><div><h2 className="text-lg font-bold">Aktivitas terbaru</h2><p className="mt-1 text-sm text-slate-400">Maksimal 200 catatan tersimpan di browser ini.</p></div><button onClick={clearHistory} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5"><Trash2 size={15}/> Hapus riwayat</button></div>
          {events.length === 0 ? <div className="p-10 text-center"><Droplets className="mx-auto text-slate-500" size={32}/><p className="mt-3 font-semibold">Belum ada kejadian tercatat</p><p className="mt-1 text-sm text-slate-400">Halaman ini mulai mencatat saat status pompa berubah dan terdeteksi.</p></div> : <div className="divide-y divide-white/10">{events.map(event => <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-5"><div className="flex items-center gap-3"><div className={`grid h-10 w-10 place-items-center rounded-xl ${event.kind === "start" ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-400/10 text-slate-300"}`}><Droplets size={19}/></div><div><p className="font-semibold">{event.kind === "start" ? "Pompa menyala" : "Pompa berhenti"}</p><p className="mt-1 text-sm text-slate-400">{new Date(event.time).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "medium" })}</p></div></div><div className="text-right"><p className="text-sm text-slate-300">{event.moisture === null ? "Kelembapan tidak tersedia" : `Kelembapan ${event.moisture}%`}</p><p className="mt-1 text-xs text-slate-500">{event.note}</p></div></div>)}</div>}
        </section>
        <p className="mt-5 text-xs leading-5 text-slate-500">Catatan: riwayat versi ini tersimpan di browser dan hanya mencatat perubahan status yang terdeteksi ketika halaman dibuka. Kejadian saat halaman tertutup dapat terlewat. Untuk riwayat permanen lintas perangkat, simpan event ke database seperti Supabase.</p>
      </div>
    </main>
  );
}
