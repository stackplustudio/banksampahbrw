import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

// PERBAIKAN: SEO dan Judul Website
export const metadata: Metadata = {
  title: "Bank Sampah | Sobat Banjar Arum Berseri",
  description: "Platform digital pengelolaan Bank Sampah Desa Banjar Arum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // PERBAIKAN: Mengubah lang="en" menjadi "id" untuk SEO Indonesia
    <html lang="id"> 
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}