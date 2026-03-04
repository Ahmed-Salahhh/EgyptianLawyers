import type { Metadata } from "next";
import { Cairo, Manrope } from "next/font/google";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lawyers Network Dashboard",
  description: "Admin dashboard for the Egyptian Lawyers Network MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cairo.variable} ${manrope.variable} antialiased`}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
