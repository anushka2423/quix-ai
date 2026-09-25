import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EmailGateProvider } from "@/components/EmailGate";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Quix AI",
  description: "Test your Gen AI PM skills",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <EmailGateProvider>{children}</EmailGateProvider>
      </body>
    </html>
  );
}
