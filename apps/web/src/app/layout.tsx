import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // TAMBAHKAN IMPORT INI

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stack Plus Studio",
  description: "Core Engine V1.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" reverseOrder={false} /> {/* TAMBAHKAN INI */}
      </body>
    </html>
  );
}