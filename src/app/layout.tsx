import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Antenatal Care Management System",
    template: "%s | Antenatal Care Management System",
  },
  description:
    "A secure and organized workspace for antenatal care coordination.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
