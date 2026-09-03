import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Crea8or — The Creative Business OS", template: "%s | Crea8or" },
  description:
    "The all-in-one operating system for African and global creative professionals. Invoices, 4K galleries, digital call sheets, and instant Paystack settlements.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://cre80r-web-iota.vercel.app"),
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "Crea8or — The Creative Business OS",
    description:
      "The all-in-one operating system for African and global creative professionals. Invoices, 4K galleries, digital call sheets, and instant Paystack settlements.",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://cre80r-web-iota.vercel.app",
    siteName: "Crea8or OS",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crea8or — The Creative Business OS",
    description:
      "The all-in-one operating system for African and global creative professionals. Invoices, 4K galleries, digital call sheets, and instant Paystack settlements.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable} suppressHydrationWarning>
        <QueryProvider>
          {children}
          <Toaster
            theme="dark"
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              style: {
                background: "#0c0d17",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
