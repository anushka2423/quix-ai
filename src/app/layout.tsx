import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import { EmailGateProvider } from "@/components/EmailGate";

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${golosText.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <EmailGateProvider>{children}</EmailGateProvider>
      </body>
    </html>
  );
}
