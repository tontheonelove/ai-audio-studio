import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "AI Audio Studio — Translator • TTS • Music Separator • ASR",
  description: "AI Audio Studio Dashboard: แปลงเสียง, แปลภาษา, TTS, แยกเพลง, Speech-to-Text",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${prompt.variable} font-prompt antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <div className="animated-gradient min-h-screen">
            <Sidebar />
            {/* Content area: เว้นที่ซ้ายให้ sidebar (md+) + เว้นบนให้ mobile nav */}
            <main className="md:pl-64 pt-[104px] md:pt-0 min-h-screen">
              <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}