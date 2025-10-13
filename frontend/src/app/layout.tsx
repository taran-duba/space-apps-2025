import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clairify",
  description: "An air quality index app that uses satellite data to provide real-time air quality information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{
          backgroundImage:
            "url('https://eoimages.gsfc.nasa.gov/images/imagerecords/8000/8108/ipcc_bluemarble_west_front.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Analytics />
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
