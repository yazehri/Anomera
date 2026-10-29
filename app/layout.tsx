import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
const geist = localFont({src:'../public/fonts/geist-latin.woff2', variable:'--font-geist', display:'swap'});
const mono = localFont({src:'../public/fonts/geist-mono-latin.woff2', variable:'--font-geist-mono', display:'swap'});
export const metadata: Metadata = { title: 'Blindspot — AI behavioral diffs', description: 'Find the edge of model reliability. Generate reproducible evaluations, discover behavioral differences, and inspect the evidence.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en" className={`${geist.variable} ${mono.variable}`}><body>{children}</body></html>; }
