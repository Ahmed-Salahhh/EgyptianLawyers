import type { Metadata } from "next";
import { Cairo, Playfair_Display } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Egyptian Lawyers Network",
  description:
    "A trusted legal network connecting verified lawyers across Egypt for fast, city-based court collaboration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cairo.variable} ${playfair.variable}`}>
        {children}
      </body>
    </html>
  );
}
