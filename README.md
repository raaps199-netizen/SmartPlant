# SmartPlant Dashboard

A responsive Next.js dashboard foundation for the SmartPlant ESP8266 irrigation project.

## Current status

- [x] Initial dashboard UI
- [x] Sensor status placeholders
- [x] Automatic/manual mode selector (UI only)
- [x] Pump toggle simulation (UI only)
- [x] Moisture threshold and watering-duration controls (UI only)
- [ ] Supabase authentication and database
- [ ] Authenticated device API
- [ ] ESP8266 integration
- [ ] Vercel deployment

**Important:** The current controls are preview-only and do not send commands to physical hardware. The existing Blynk firmware is intentionally not replaced in this commit.

## Run locally

Requirements: Node.js 20 or later.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` when Supabase integration is added. Never commit real keys, Wi-Fi credentials, or device tokens.

## Next integration step

Review the current working ESP8266/Blynk sketch and agree on the data/command contract before migrating hardware control. Keep the Blynk version as a backup until the custom dashboard has been tested end-to-end.
