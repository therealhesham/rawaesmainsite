import type { Metadata } from "next";
import { Tajawal, Manrope, Cairo } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "مجموعة روائس - Rawaes Group",
  description:
    "كيان استثماري مكون من عدة شركات في مجالات وقطاعات مختلفة. الاستثمار، تأجير السيارات، الضيافة، الاستقدام.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Round|Material+Symbols+Outlined:wght,FILL@100..700,0..1"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${tajawal.variable} ${manrope.variable} ${cairo.variable} min-h-screen antialiased bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light font-body`}
      >
        {children}
      </body>
    </html>
  );
}
