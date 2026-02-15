import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentur Command Center",
  description: "KI-Agenten Management Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased bg-[#0a0a0f]`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
