import type { Metadata } from "next";
import { Inter, LXGW_WenKai_TC } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lxgwWenKai = LXGW_WenKai_TC({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lxgw",
  display: "swap",
});

export const metadata: Metadata = {
  title: "旅行规划助手",
  description: "个性化旅行行程生成器 - 告诉我们你的偏好，获取专属行程",
  keywords: "旅行, 行程规划, 旅游",
  authors: [{ name: "Tour Planner" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Language" content="zh-CN" />
      </head>
      <body className={`${inter.variable} ${lxgwWenKai.variable} antialiased min-h-screen`}>
        <div
          className="fixed inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 20% 20%, rgba(249,115,22,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(14,165,233,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(15,13,11,1) 0%, rgba(10,8,6,1) 100%)",
          }}
        />
        {children}
      </body>
    </html>
  );
}
