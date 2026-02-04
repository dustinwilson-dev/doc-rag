import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dustin Wilson | AI RAG Chat App",
  description:
    "A full-stack Next.js RAG application showcasing document ingestion, vector search, and AI-powered question answering.",
  openGraph: {
    title: "Dustin Wilson | AI RAG Chat App",
    description:
      "Upload documents and chat with them using AI-powered semantic search.",
    url: "https://doc-rag-demo.vercel.app/",
    siteName: "Dustin Wilson Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI RAG Chat App Preview",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
