import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedFinance – Consultation Tracker",
  description:
    "Track medical consultation finances: bill amounts, doctor share, tax deductions, and net receivables.",
  keywords: ["medical finance", "consultation tracker", "doctor earnings", "billing"],
  openGraph: {
    title: "MedFinance – Consultation Tracker",
    description: "Track medical consultation finances with ease.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
