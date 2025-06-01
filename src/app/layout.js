import "./globals.css";

export const metadata = {
    title: "비디오 프레임 분석기",
    description: "비디오에서 프레임을 추출하고 AI로 분석하는 앱",
};

export default function RootLayout({ children }) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}
