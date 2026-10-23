import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartPlant | Kontrol Tanaman",
  description: "Pantau kelembapan dan atur penyiraman tanaman melalui SmartPlant."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}