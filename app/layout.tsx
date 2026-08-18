import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "La Manne Spirituelle – Association Chrétienne",
  description:
    "La Manne Spirituelle est une association chrétienne dédiée à l'évangélisation, l'entraide communautaire et la croissance spirituelle. Rejoignez-nous pour agir ensemble.",
  keywords: ["association chrétienne", "évangélisation", "communauté", "foi", "manne spirituelle"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

