import type { FormEvent, ReactNode } from "react";

type Props = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  submitLabel: string;
  className?: string;
  submitClassName?: string;
};

export function FilterFormRow({
  onSubmit,
  children,
  submitLabel,
  className,
  submitClassName,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className={`mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] ${className ?? ""}`}
    >
      {children}
      <button
        type="submit"
        className={`w-full rounded-xl bg-[#245ce2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1f4fd0] md:w-auto ${submitClassName ?? ""}`}
      >
        {submitLabel}
      </button>
    </form>
  );
}
