import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartPlant | Dashboard",
  description: "Monitor and control your SmartPlant irrigation system."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}