import type { Metadata } from "next";
import { Golos_Text } from "next/font/google";
import "./globals.css";
import { EmailGateProvider } from "@/components/EmailGate";
import DisclaimerBanner from "@/components/DisclaimerBanner";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const golosText = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Claude Certification Practice Test & Mock Exam | Anthropic Certification Prep",
  description: "Free Claude certification mock tests for the Associate (CCAO-F) and Developer (CCDV-F) exams. Instant feedback, a readiness score out of 1,000 and a study plan. Independent Anthropic certification prep, not affiliated with Anthropic.",
  keywords: ["claude certification", "anthropic certification", "claude developer certification mock test", "claude mock test", "claude certified associate", "claude certified developer"],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Claude Certification Practice Test & Mock Exam",
    description: "Free Claude mock tests for the Associate and Developer certification exams.",
    images: ["/agentic-ai-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Certification Practice Test & Mock Exam",
    description: "Free Claude mock tests for the Associate and Developer certification exams.",
    images: ["/agentic-ai-logo.png"],
  },
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
        <EmailGateProvider>
          <DisclaimerBanner />
          {children}
        </EmailGateProvider>
      </body>
    </html>
  );
}
