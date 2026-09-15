import type { Metadata } from "next";
import { Source_Sans_3, Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-solo-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-solo-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Solo",
  description: "Solo education platform — Phase 0 frontend foundation",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} ${sourceSans.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
