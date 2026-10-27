import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Blindspot — AI behavioral diffs', description: 'Find the edge of model reliability. Generate reproducible evaluations, discover behavioral differences, and inspect the evidence.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
