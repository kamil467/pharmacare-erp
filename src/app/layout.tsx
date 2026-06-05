import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaCare — Pharmacy Management System",
  description:
    "Complete pharmacy management system with GST-compliant billing, inventory tracking, expiry management, and reporting for Indian medical stores.",
  keywords: [
    "pharmacy management",
    "medical store",
    "GST billing",
    "inventory management",
    "medicine tracking",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
