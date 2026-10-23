"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Leaf, LoaderCircle, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabase) {
      setMessage("Konfigurasi Supabase belum lengkap. Periksa Environment Variables di Vercel.");
      return;
    }
    if (password.length < 8) {
      setMessage("Kata sandi minimal 8 karakter.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setMessage(data.session
          ? "Akun berhasil dibuat. Mengalihkan ke dashboard..."
          : "Akun dibuat. Periksa email untuk konfirmasi, lalu masuk.");
        if (data.session) window.location.assign("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.assign("/");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Proses autentikasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f4ed] px-4 py-10 text-stone-900">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-800 text-white"><Leaf size={28} /></div>
        <p className="mt-5 text-center text-xs font-bold uppercase tracking-[0.24em] text-emerald-800">SmartPlant IoT</p>
        <h1 className="mt-2 text-center text-3xl font-bold">{mode === "login" ? "Selamat datang" : "Buat akun"}</h1>
        <p className="mt-2 text-center text-sm text-stone-500">
          {mode === "login" ? "Masuk untuk mengelola perangkat tanamanmu." : "Buat akun untuk menyimpan perangkatmu sendiri."}
        </p>

        <div className="mt-7 grid grid-cols-2 rounded-xl bg-stone-50 p-1">
          <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "login" ? "bg-emerald-800 text-white" : "text-stone-500"}`}>Masuk</button>
          <button type="button" onClick={() => { setMode("register"); setMessage(""); }} className={`rounded-lg px-3 py-2 text-sm font-semibold ${mode === "register" ? "bg-emerald-800 text-white" : "text-stone-500"}`}>Daftar</button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-stone-700">Email</span>
            <input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-700" placeholder="nama@email.com" />
          </label>
          <label className="block">
            <span className="text-sm text-stone-700">Kata sandi</span>
            <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none focus:border-emerald-700" placeholder="Minimal 8 karakter" />
          </label>
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 font-bold text-white disabled:opacity-50">
            {busy ? <LoaderCircle size={18} className="animate-spin" /> : mode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />}
            {busy ? "Memproses..." : mode === "login" ? "Masuk ke SmartPlant" : "Buat akun"}
          </button>
        </form>

        {message && <p role="status" className="mt-4 break-words rounded-xl bg-stone-100 px-3 py-3 text-sm text-stone-700">{message}</p>}
        <p className="mt-6 text-center text-xs text-stone-500">Gunakan email yang bisa kamu akses untuk konfirmasi akun.</p>
      </section>
    </main>
  );
}
