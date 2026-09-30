import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arnav Ketineni — Personal website',
  description: 'The personal website of Arnav Ketineni. Projects, blog, about, and contact.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
