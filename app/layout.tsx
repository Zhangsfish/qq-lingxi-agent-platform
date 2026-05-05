import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QQ 灵犀群域 - 多 Agent 对话底座",
  description: "最小可运行的多 Agent 对话底座",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
