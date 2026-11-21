import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "AEGISOS | Autonomous Cyber Defense & AI Threat Intelligence",
  description:
    "Next-generation multi-agent cybersecurity platform. Real-time threat detection, automated investigation, and zero-day threat neutralization.",
  keywords: [
    "cybersecurity",
    "autonomous AI",
    "threat intelligence",
    "phishing protection",
    "quishing defense",
    "multi-agent security",
  ],
  authors: [{ name: "AEGISOS Defense Systems" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#080B12] text-[#F4F7FB] selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
