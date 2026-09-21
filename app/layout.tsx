import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stratford Energy Response | Corrective Action Platform",
  description: "Corrective-action programme management, installer delivery and evidence-led close-out.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
