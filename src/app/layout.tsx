import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "FA Petroli — Portale Clienti B2B",
  description:
    "Portale riservato ai clienti B2B di FA Petroli: ordina carburanti, monitora le consegne e gestisci il tuo profilo aziendale.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
