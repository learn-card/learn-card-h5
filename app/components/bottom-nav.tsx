'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  {
    href: '/',
    label: '首页',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 12.5V21h13v-8.5" />
      </svg>
    ),
  },
  {
    href: '/my',
    label: '我的',
    icon: (
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Z" />
        <path d="M4.5 20.4a8 8 0 0 1 15 0" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-white/10 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around px-6 py-3 pb-[clamp(0.75rem,1.5vw,1.25rem)] text-sm text-slate-300">
        {items.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' || pathname.startsWith('/learn') : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                isActive ? 'text-emerald-300' : 'text-slate-400 hover:text-emerald-200'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
