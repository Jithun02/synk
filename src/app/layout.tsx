import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "synk — Enterprise Collaborative Engineering Intelligence Platform",
  description: "Enterprise Collaborative Engineering & Cybersecurity Architecture Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased overflow-hidden">
      <body className={`${inter.className} h-full w-full overflow-hidden`}>{children}</body>
    </html>
  );
}
