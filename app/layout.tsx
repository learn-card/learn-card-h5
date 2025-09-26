import './globals.css';

import { GeistSans } from 'geist/font/sans';

import { AppShell } from './components/app-shell';
import { AppProviders } from './providers';

const title = '学习卡片';
const description = '简洁高效的英语单词学习卡片，随时随地巩固记忆。';

export const metadata = {
  title,
  description,
  metadataBase: new URL('https://example.com'),
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${GeistSans.variable} bg-slate-950 text-white`}>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
