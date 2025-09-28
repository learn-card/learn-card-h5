'use client';

import type { HTMLAttributes } from 'react';

type LoadingSpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
};

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClass =
    size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-8 w-8 border-[3px]' : 'h-6 w-6 border-2';

  const wrapperClassName = `inline-flex items-center justify-center${className ? ` ${className}` : ''}`;

  return (
    <span className={wrapperClassName}>
      <span
        className={`${sizeClass} inline-block animate-spin rounded-full border-emerald-300/70 border-t-transparent`}
      />
    </span>
  );
}

export function Skeleton({ className = '', ...rest }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-800/60 ${className}`.trim()}
      {...rest}
    />
  );
}
