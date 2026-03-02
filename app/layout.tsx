import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'For Help ',
  description: 'Generate advertisement log PDFs for digital out-of-home screens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
11:31:23.627 
Warning: Failed to fetch one or more git submodules