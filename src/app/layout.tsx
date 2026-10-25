import type { Metadata } from "next";
import { Playfair_Display, Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DealershipProvider } from "@/context/DealershipContext";
import { AppShell } from "@/components/layout/AppShell";
import { LiquidGlassProvider } from "@/components/ui/LiquidGlass";

const lyonDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-lyon-display",
  display: "swap",
});

const suisseIntl = Inter({
  subsets: ["latin"],
  variable: "--font-suisse-intl",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vehisoft® Dealership OS — Luxury Automotive Gallery",
  description:
    "Midnight automotive gallery and dealership management system powered by 24/7 AI Sales Consultant.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lyonDisplay.variable} ${suisseIntl.variable} ${robotoMono.variable} dark`}
    >
      <body className="bg-[#0f1011] text-[#ffffff] antialiased selection:bg-[#847dff] selection:text-[#ffffff]">
        <LiquidGlassProvider />
        <AuthProvider>
          <DealershipProvider>
            <AppShell>{children}</AppShell>
          </DealershipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
