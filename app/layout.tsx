import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreamVault - Premium IPTV Player",
  description: "Stream live TV, VOD movies, and series with an elegant glassmorphism user interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content page-enter">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
