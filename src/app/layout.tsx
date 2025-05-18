import type {Metadata} from 'next';
import {Geist} from 'next/font/google'; // Geist_Mono removed as not explicitly requested for body
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/app/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Aesthete Atelier',
  description: 'AI-Powered Outfit Curation & Virtual Try-On',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="antialiased font-sans">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
