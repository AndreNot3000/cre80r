import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Crea8or", template: "%s | Crea8or" },
  description: "The business OS for creative professionals",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://crea8or.app"),
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
