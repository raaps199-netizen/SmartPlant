import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BLYNK_API = "https://blynk.cloud/external/api";
const writablePins = new Set(["V0", "V1", "V2", "V3", "V4", "V5", "V6", "V11", "V12"]);

function tokenOrNull() {
  return process.env.BLYNK_AUTH_TOKEN?.trim() || null;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const token = tokenOrNull();
  if (!token) {
    return jsonError("BLYNK_AUTH_TOKEN belum diatur di Vercel.", 503);
  }

  try {
    const query = new URLSearchParams({ token });
    const [valuesResponse, connectionResponse] = await Promise.all([
      fetch(`${BLYNK_API}/getAll?${query.toString()}`, { cache: "no-store" }),
      fetch(`${BLYNK_API}/isHardwareConnected?${query.toString()}`, { cache: "no-store" }),
    ]);

    if (!valuesResponse.ok) {
      return jsonError("Gagal membaca datastream Blynk. Periksa token dan koneksi Blynk.", 502);
    }

    const values = await valuesResponse.json();
    const connectionText = connectionResponse.ok ? await connectionResponse.text() : "false";

    return NextResponse.json(
      { configured: true, connected: connectionText.trim().toLowerCase() === "true", values },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return jsonError("Tidak bisa terhubung ke Blynk Cloud.", 502);
  }
}

export async function POST(request: Request) {
  const token = tokenOrNull();
  if (!token) {
    return jsonError("BLYNK_AUTH_TOKEN belum diatur di Vercel.", 503);
  }

  let body: { pin?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Format permintaan tidak valid.", 400);
  }

  const pin = typeof body.pin === "string" ? body.pin.toUpperCase() : "";
  const value = typeof body.value === "number" ? body.value : Number(body.value);

  if (!writablePins.has(pin)) {
    return jsonError("Datastream ini tidak diizinkan untuk diubah dari dashboard.", 400);
  }
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return jsonError("Nilai harus berupa bilangan bulat.", 400);
  }

  const ranges: Record<string, [number, number]> = {
    V0: [0, 1],
    V1: [0, 1],
    V2: [0, 23],
    V3: [0, 59],
    V4: [0, 23],
    V5: [0, 59],
    V6: [1, 120],
    V11: [0, 1],
    V12: [10, 80],
  };
  const [min, max] = ranges[pin];
  if (value < min || value > max) {
    return jsonError(`Nilai ${pin} harus berada di antara ${min} dan ${max}.`, 400);
  }

  try {
    const query = new URLSearchParams({ token, [pin]: String(value) });
    const response = await fetch(`${BLYNK_API}/update?${query.toString()}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return jsonError("Blynk menolak perubahan datastream.", 502);
    }

    const responseText = await response.text();
    if (responseText.toLowerCase().includes("error")) {
      return jsonError("Blynk tidak bisa menyimpan nilai datastream.", 502);
    }

    return NextResponse.json({ ok: true, pin, value });
  } catch {
    return jsonError("Tidak bisa mengirim perubahan ke Blynk Cloud.", 502);
  }
}
