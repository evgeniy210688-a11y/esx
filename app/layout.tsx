import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteAnalytics from "./SiteAnalytics";
import GoogleAnalytics from "./GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  verification: { google: "h3W7OgtraEE4D4XDPv3IHXXD2ONBxWx98qf3wHYqOFM" },
  metadataBase: new URL("https://www.88esx.com"),
  title: "ESX — услуги и общение в Южной Корее",
  appleWebApp: { capable: true, title: "ESX", statusBarStyle: "default" },
  icons: { apple: "/esx-icon-192.png" },
  description: "Услуги, компании и специалисты в Южной Корее. Поиск по городу и языку обслуживания, общение с переводом в ESX.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="initial-site-language" strategy="beforeInteractive">
          {`try { localStorage.setItem("esx-language", "en"); } catch {}`}
        </Script>
        {children}
        <SiteAnalytics />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
