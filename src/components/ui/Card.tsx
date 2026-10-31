import React from 'react';
import { clsx } from 'clsx';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
