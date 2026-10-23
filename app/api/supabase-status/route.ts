import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        message: "Variabel Supabase belum lengkap di environment Vercel.",
        missing: [
          ...(!url ? ["NEXT_PUBLIC_SUPABASE_URL"] : []),
          ...(!key ? ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] : []),
        ],
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          connected: false,
          message: "Supabase merespons, tetapi koneksi belum valid. Periksa Project URL dan Publishable Key.",
          status: response.status,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        connected: true,
        message: "Koneksi dari server SmartPlant ke Supabase berhasil.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        message: "Server SmartPlant tidak bisa menjangkau Supabase.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
