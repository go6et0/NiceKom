import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";
import Providers from "@/app/providers";
import Navbar from "@/components/site/navbar";
import Footer from "@/components/site/footer";
import { getLocale } from "@/lib/locale";

const display = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const body = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NiceKom Oils",
  description: "Industrial oils and greases for modern machinery.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers locale={locale}>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.06),_transparent_55%),linear-gradient(140deg,_#f7f8fb,_#eef2f6_55%,_#e3e8ef)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%),linear-gradient(140deg,_#0a0f1a,_#111827_60%,_#0b1220)]">
            <Navbar />
            {children}
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
