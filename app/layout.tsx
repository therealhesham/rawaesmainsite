import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
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
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${tajawal.variable} min-h-screen antialiased bg-background-light dark:bg-background-dark text-text-dark dark:text-text-light font-body`}
      >
        {children}
      </body>
    </html>
  );
}
