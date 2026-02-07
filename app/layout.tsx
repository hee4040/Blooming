import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blooming You",
  description: "두 사람의 마음으로 피어나는 꽃",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
