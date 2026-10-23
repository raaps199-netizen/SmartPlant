"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Droplets, Leaf, Power, RefreshCw, Sprout, Wifi, WifiOff } from "lucide-react";

type BlynkData = {
  configured: boolean;
  connected: boolean;
  values: Record<string, unknown>;
};

type PinChange = { pin: string; value: number };

function numberValue(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return value === null || value === undefined || value === "" || !Number.isFinite(parsed)
    ? fallback
    : parsed;
}

function timeValue(hour: unknown, minute: unknown, fallback: string): string {
  if (hour === undefined || minute === undefined || hour === null || minute === null) return fallback;
  return `${String(numberValue(hour)).padStart(2, "0")}:${String(numberValue(minute)).padStart(2, "0")}`;
}

function parseTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return { hour, minute };
}

export default function Home() {
  const [data, setData] = useState<BlynkData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [busyPin, setBusyPin] = useState<string | null>(null);
  const [controlsInitialized, setControlsInitialized] = useState(false);
  const [schedule1, setSchedule1] = useState("07:00");
  const [schedule2, setSchedule2] = useState("17:00");
  const [threshold, setThreshold] = useState(10);
  const [duration, setDuration] = useState(5);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/blynk", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) {
        setLoadError(typeof result.error === "string" ? result.error : "Gagal membaca data Blynk.");
        return;
      }
      setData(result as BlynkData);
      setLoadError("");
    } catch {
      setLoadError("Dashboard tidak bisa terhubung ke server.");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (!data || controlsInitialized) return;
    const values = data.values;
    setSchedule1(timeValue(values.v2, values.v3, "07:00"));
    setSchedule2(timeValue(values.v4, values.v5, "17:00"));
    setThreshold(numberValue(values.v12, 10));
    setDuration(numberValue(values.v6, 5));
    setControlsInitialized(true);
  }, [data, controlsInitialized]);

  async function sendChanges(changes: PinChange[], label: string) {
    setBusyPin(label);
    setMessage("");
    try {
      for (const change of changes) {
        const response = await fetch("/api/blynk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(change),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(typeof result.error === "string" ? result.error : "Perubahan gagal disimpan.");
        }
      }
      await refresh();
      setMessage(`${label} berhasil disimpan.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Perubahan gagal disimpan.");
    } finally {
      setBusyPin(null);
    }
  }

  const values = data?.values ?? {};
  const pumpOn = numberValue(values.v0) === 1;
  const scheduleActive = numberValue(values.v1) === 1;
  const soilAuto = numberValue(values.v11) === 1;
  const moistureValue = values.v10;
  const hasMoisture = moistureValue !== undefined && moistureValue !== null && moistureValue !== "";
  const moisture = numberValue(moistureValue);
  const scheduleDetail = typeof values.v7 === "string" ? values.v7 : "";
  const extraStatus = typeof values.v9 === "string" ? values.v9 : "";
  const timerValue = values.v8;

  function saveSchedule(which: 1 | 2) {
    const selected = which === 1 ? schedule1 : schedule2;
    const time = parseTime(selected);
    return sendChanges(
      which === 1
        ? [{ pin: "V2", value: time.hour }, { pin: "V3", value: time.minute }]
        : [{ pin: "V4", value: time.hour }, { pin: "V5", value: time.minute }],
      `Jadwal ${which}`,
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f4ed] px-4 py-6 text-stone-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-stone-800 text-white"><Sprout size={27} /></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-800">SmartPlant IoT</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Kondisi kebun</h1>
            </div>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${data?.connected ? "border-emerald-200 bg-stone-800/10 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            {data?.connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {data?.connected ? "NodeMCU Online" : "NodeMCU Offline"}
            <button onClick={() => void refresh()} aria-label="Refresh data" className="ml-1 rounded-full p-1 hover:bg-stone-200"><RefreshCw size={14} /></button>
          </div>
        </header>

        {loadError && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {loadError}
            {!data && loadError.includes("BLYNK_AUTH_TOKEN") && <span className="mt-1 block text-amber-900/80">Tambahkan BLYNK_AUTH_TOKEN di Vercel → Project Settings → Environment Variables, lalu redeploy.</span>}
          </div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-sm text-stone-500">Kelembapan tanah · V10</span><Droplets className="text-sky-700" /></div>
            <div className="mt-5 flex items-end gap-2"><strong className="text-5xl">{hasMoisture ? moisture : "--"}</strong><span className="pb-1 text-stone-500">%</span></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-stone-200"><div className="h-full rounded-full bg-sky-700 transition-all" style={{ width: `${Math.max(0, Math.min(100, moisture))}%` }} /></div>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-center justify-between"><span className="text-sm text-stone-500">Pompa air · V0</span><Power className={pumpOn ? "text-emerald-800" : "text-stone-500"} /></div>
            <div className="mt-5 text-3xl font-bold">{pumpOn ? "MENYALA" : "MATI"}</div>
            <p className="mt-2 text-sm text-stone-500">Status pompa dari Blynk</p>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between"><span className="text-sm text-stone-500">Jadwal penyiraman · V1</span><Activity className="text-violet-700" /></div>
            <div className="mt-5 text-3xl font-bold">{scheduleActive ? "AKTIF" : "NONAKTIF"}</div>
            <p className="mt-2 text-sm text-stone-500">{scheduleDetail || "Status jadwal"}</p>
            {timerValue !== undefined && timerValue !== null && timerValue !== "" && <p className="mt-2 text-xs text-stone-500">V8 · {String(timerValue)} detik</p>}
            {extraStatus && <p className="mt-2 text-xs text-stone-500">{extraStatus}</p>}
          </article>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-stone-800/10 text-emerald-800"><Power size={22} /></div>
              <div><h2 className="text-xl font-bold">Kontrol penyiraman</h2><p className="mt-1 text-sm text-stone-500">Kontrol pompa dan mode otomatis.</p></div>
            </div>

            <div className="mt-7 flex items-center justify-between gap-4 rounded-2xl border border-stone-200 p-4">
              <div><p className="font-semibold">Pompa air</p><p className="mt-1 text-sm text-stone-500">{pumpOn ? "Pompa sedang menyala" : "Pompa sedang mati"}</p></div>
              <button onClick={() => void sendChanges([{ pin: "V0", value: pumpOn ? 0 : 1 }], "Pompa")} disabled={!data?.connected || busyPin !== null} className={`rounded-xl px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${pumpOn ? "bg-rose-700 text-white" : "bg-stone-800 text-white"}`}>{busyPin === "Pompa" ? "Menyimpan..." : pumpOn ? "Matikan" : "Nyalakan"}</button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 p-4">
                <div><p className="font-semibold">Jadwal aktif</p><p className="mt-1 text-xs text-stone-500">Datastream V1</p></div>
                <button onClick={() => void sendChanges([{ pin: "V1", value: scheduleActive ? 0 : 1 }], "Jadwal")} disabled={!data || busyPin !== null} className={`rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40 ${scheduleActive ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-700"}`}>{scheduleActive ? "Aktif" : "Nonaktif"}</button>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 p-4">
                <div><p className="font-semibold">Otomatis sensor</p><p className="mt-1 text-xs text-stone-500">Datastream V11</p></div>
                <button onClick={() => void sendChanges([{ pin: "V11", value: soilAuto ? 0 : 1 }], "Mode otomatis")} disabled={!data || busyPin !== null} className={`rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-40 ${soilAuto ? "bg-stone-800 text-white" : "bg-stone-200 text-stone-700"}`}>{soilAuto ? "Aktif" : "Nonaktif"}</button>
              </div>
            </div>

            <div className="mt-7 border-t border-stone-200 pt-6">
              <h3 className="font-semibold">Jadwal penyiraman</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="text-sm text-stone-700">Jadwal 1 · V2/V3</span><input className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-lg" type="time" value={schedule1} onChange={e => setSchedule1(e.target.value)} /></label>
                <label className="block"><span className="text-sm text-stone-700">Jadwal 2 · V4/V5</span><input className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-lg" type="time" value={schedule2} onChange={e => setSchedule2(e.target.value)} /></label>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => void saveSchedule(1)} disabled={!data || busyPin !== null} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold hover:bg-stone-100 disabled:opacity-40">{busyPin === "Jadwal 1" ? "Menyimpan..." : "Simpan jadwal 1"}</button>
                <button onClick={() => void saveSchedule(2)} disabled={!data || busyPin !== null} className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold hover:bg-stone-100 disabled:opacity-40">{busyPin === "Jadwal 2" ? "Menyimpan..." : "Simpan jadwal 2"}</button>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-700/10 text-sky-800"><Leaf size={22} /></div><div><h2 className="text-xl font-bold">Pengaturan otomatis</h2><p className="mt-1 text-sm text-stone-500">Nilai diambil dari datastream Blynk.</p></div></div>

            <label className="mt-7 block">
              <div className="flex justify-between gap-4 text-sm"><span className="text-stone-700">Batas kelembapan · V12</span><strong>{threshold}%</strong></div>
              <input className="mt-4 w-full accent-emerald-300" type="range" min="10" max="80" value={threshold} onChange={e => setThreshold(Number(e.target.value))} />
              <div className="mt-1 flex justify-between text-xs text-stone-500"><span>10%</span><span>80%</span></div>
            </label>

            <label className="mt-7 block">
              <div className="flex justify-between gap-4 text-sm"><span className="text-stone-700">Durasi siram · V6</span><strong>{duration} detik</strong></div>
              <input className="mt-4 w-full accent-emerald-300" type="range" min="1" max="120" value={duration} onChange={e => setDuration(Number(e.target.value))} />
              <div className="mt-1 flex justify-between text-xs text-stone-500"><span>1 detik</span><span>120 detik</span></div>
            </label>

            <button onClick={() => void sendChanges([{ pin: "V12", value: threshold }, { pin: "V6", value: duration }], "Pengaturan otomatis")} disabled={!data || busyPin !== null} className="mt-7 w-full rounded-xl bg-stone-800 px-4 py-3 font-bold text-white hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-40">{busyPin === "Pengaturan otomatis" ? "Menyimpan..." : "Simpan pengaturan"}</button>

            {message && <p aria-live="polite" className="mt-4 rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-700">{message}</p>}
            <p className="mt-5 text-xs text-stone-500">Kelembapan terakhir: {hasMoisture ? `${moisture}%` : "belum ada data"}.</p>
          </article>
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-5 text-xs text-stone-500"><span>SmartPlant · Blynk Cloud</span><span>Refresh otomatis setiap 4 detik</span></footer>
      </div>
    </main>
  );
}
