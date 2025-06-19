import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastContainer } from "react-toastify";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Jio",
  description: "Sample Jio Application",

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <head>
        <link rel="icon" href="/icons/Fab-Icon.jpg" sizes="any" />
        <link rel="shortcut icon" href="/icons/Fab-Icon.jpg" />
        <link rel="apple-touch-icon" href="/icons/Fab-Icon.jpg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >

        <main className="min-h-screen pb-20">
          <ToastContainer position="top-right" autoClose={3000} />
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </main>

      </body>
    </html>
  );
}
