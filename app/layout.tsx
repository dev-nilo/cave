import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import Nav from "@/components/Nav";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

// Auto-hospedada pelo next/font: nada é buscado de CDN em tempo de execução,
// então o app continua inteiro offline.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Pilares",
  description: "Controle diário e semanal dos sete pilares de um dia bom.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pilares", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf3" },
    { media: "(prefers-color-scheme: dark)", color: "#002204" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={bricolage.variable}>
      <body className="min-h-dvh">
        <main className="mx-auto w-full max-w-2xl px-4 pt-6 pb-28">{children}</main>
        <Nav />
        <RegisterSW />
      </body>
    </html>
  );
}
