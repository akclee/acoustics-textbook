import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ChatBot from "@/components/ChatBot";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Acoustics: The Science of Sound",
  description: "An open educational resource on the science of sound",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable} data-theme="light">
      <body className="antialiased bg-gray-50 text-gray-900">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-white">
            {children}
          </main>
        </div>
        <ChatBot />
      </body>
    </html>
  )
}