import { ToastProvider } from "@/components/ui/toast";
import { brand } from "@/config/brand";
import { env } from "@/config/env";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Manrope, Quicksand } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: env.appName,
    template: `%s · ${env.appName}`,
  },
  description: "FLYT ride-hailing administration console",
  icons: {
    icon: brand.logos.icon,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: next/font CSS variables on <html> can differ
    // between SSR and the first client paint (extensions / font swap).
    <html
      lang="en"
      className={`${manrope.variable} ${quicksand.variable}`}
      suppressHydrationWarning
    >
      <body className={manrope.className} suppressHydrationWarning>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
