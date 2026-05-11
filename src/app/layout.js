import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CDM-OBE | Centralized Management System",
  description:
    "Centralized Outcome-Based Education Management System for Colegio de Muntinlupa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}

        {/* 🔥 Global Toast Container */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}