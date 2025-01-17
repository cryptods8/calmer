import type { Metadata } from "next";
import "./globals.css";
import { Playwrite_US_Trad as Playwrite, Inter } from "next/font/google";
import { Providers } from "@/app/providers/providers";

const playwrite = Playwrite({
  weight: "variable",
  variable: "--font-playwrite",
});

const inter = Inter({
  weight: "variable",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Calmer",
  description: "Breath and relax",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
      </head>
      <body
        className={`${playwrite.variable} ${inter.variable} font-inter antialiased bg-green-700 text-green-100`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
