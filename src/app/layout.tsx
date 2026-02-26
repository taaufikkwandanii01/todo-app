import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ConsoleMessage from "@/components/ConsoleMessage";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "TaskFlow — Smart Todo App",
  description:
    "Todo app modern dengan pelacak deadline otomatis dan autentikasi Google.",
  keywords: ["ToDo", "Catatan", "Notes", "Rengsekeun"],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "TaskFlow — Smart Todo App",
    description:
      "Todo app modern dengan pelacak deadline otomatis dan autentikasi Google.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className={`${geist.variable} antialiased`}>
        <ConsoleMessage />
        {children}
      </body>
    </html>
  );
}
