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
  title: "Claude Developer Preparation | Agentic AI Institute",
  description: "Practice for Claude Developer certification with 96 questions across eight open domains. Answer explanations and free retakes included.",
  icons: {
    icon: "/favicon.svg",
  },
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
