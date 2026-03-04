'use client';

import type { ReactNode } from 'react';

type DashboardModalProps = {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
  closeLabel?: string;
};

export function DashboardModal({
  open,
  title,
  onClose,
  children,
  maxWidthClassName = 'max-w-md',
  closeLabel = 'Close dialog',
}: DashboardModalProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#0f1f3a]/40 p-4'>
      <div
        className={`w-full ${maxWidthClassName} rounded-xl border border-[#d8e2f3] bg-white p-4 shadow-xl`}
      >
        <div className='flex items-start justify-between gap-3'>
          <h3 className='text-base font-semibold text-[#1a2f52]'>{title}</h3>
          <button
            type='button'
            onClick={onClose}
            aria-label={closeLabel}
            className='inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8e2f3] bg-white text-[#314866] hover:bg-[#f7faff]'
          >
            &times;
          </button>
        </div>
        <div className='mt-3'>{children}</div>
      </div>
    </div>
  );
}
