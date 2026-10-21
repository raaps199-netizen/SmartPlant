# SmartPlant Dashboard

Responsive Next.js dashboard for the SmartPlant ESP8266 irrigation project.

## Blynk integration

The dashboard uses the Blynk Cloud Device HTTPS API through a server-side Next.js route. The device token is read only by the server and should never be placed in client-side code or committed to GitHub.

Set this environment variable in Vercel:

- `BLYNK_AUTH_TOKEN`: the device auth token from Blynk Device Info.

After adding or changing the variable, redeploy the project.

## Datastream mapping

| Virtual pin | Name | Dashboard use |
| --- | --- | --- |
| V0 | Pump Control | Manual pump control |
| V1 | Jadwal Aktif | Enable/disable scheduled watering |
| V2 / V3 | Jam Siram 1 / Menit Siram 1 | Schedule 1 |
| V4 / V5 | Jam Siram 2 / Menit Siram 2 | Schedule 2 |
| V6 | Durasi Siram | Watering duration |
| V7 | Detail Jadwal | Schedule detail display |
| V8 | Integer V8 | Additional timer value display |
| V9 | String V9 | Additional status display |
| V10 | Integer V10 | Soil moisture percentage |
| V11 | Soil Auto Toggle | Enable/disable soil-based automation |
| V12 | Moisture Threshold | Soil moisture threshold |

V8 and V9 currently retain their generic Blynk names. The CSV does not identify a second soil-moisture datastream, so the dashboard only displays the configured moisture value from V10.

## Run locally

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

For local development, place `BLYNK_AUTH_TOKEN=...` in `.env.local`. Never commit real device tokens or Wi-Fi credentials.
