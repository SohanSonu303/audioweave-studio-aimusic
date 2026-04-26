import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "AudioWeave Studio",
  description: "AI music generation studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        {/* ambient rotating orb — fixed behind all content */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: "calc(50% - 180px)",
            left: "calc(50% - 180px)",
            width: 250,
            height: 250,
            background:
              "conic-gradient(from 0deg, #e8a055 0%, #c05828 30%, #7a1a0a 55%, #c05828 75%, #e8a055 100%)",
            opacity: 0.20,
            filter: "blur(72px)",
            animation: "orb-morph 10s ease-in-out infinite, orb-drift 8s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
