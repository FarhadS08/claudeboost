import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ClaudeBoost",
  description: "Prompt enhancement dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 pt-20 pb-12">{children}</main>
      </body>
    </html>
  );
}
