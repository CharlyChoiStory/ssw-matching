import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";

export const metadata: Metadata = {
  title: "상상우리 매칭 시스템",
  description: "시니어와 일자리를 규칙 기반으로 매칭하는 Day 2 로컬 프로토타입"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <Link className="brand" href="/register">
            상상우리 매칭
          </Link>
          <nav aria-label="주요 화면">
            <Link href="/register">시니어 등록</Link>
            <Link href="/recommendations">추천 목록</Link>
            <Link href="/admin">관리자</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
