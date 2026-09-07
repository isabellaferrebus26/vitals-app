import "./globals.css";

export const metadata = {
  title: "Vitals — Check your vitals. Own your exam.",
  description: "Adaptive TEAS 7 practice, a bilingual AI tutor, and a study plan built around your exam date.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
