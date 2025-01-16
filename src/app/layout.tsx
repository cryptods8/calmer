import type { Metadata } from "next";
import "./globals.css";
import { Playwrite_US_Trad as Playwrite, Inter } from "next/font/google";

const playwrite = Playwrite({
  weight: "400",
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
      <body
        className={`${playwrite.variable} ${inter.variable} font-inter antialiased bg-green-700 text-green-100`}
      >
        {children}
      </body>
    </html>
  );
}
