import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type FilterOption = {
  value: string;
  label: ReactNode;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  disabled?: boolean;
  className?: string;
  clearLabel?: string;
};

export function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  disabled,
  className,
  clearLabel = "Clear",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        className="w-full rounded-xl border border-[#d8e2f3] bg-white px-3 py-2.5 pe-16 text-start text-sm text-[#314866] outline-none ring-[#245ce2] transition-colors hover:border-[#b9c9e8] focus:ring-2 disabled:cursor-not-allowed disabled:bg-[#f5f7fc] disabled:text-[#8ca0bf]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? "text-[#314866]" : "text-[#6e82a4]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>
      {value && !disabled ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleSelect("");
          }}
          className="absolute inset-y-0 end-8 inline-flex items-center text-[#8ca0bf] transition-colors hover:text-[#5f7397]"
          aria-label={clearLabel}
          title={clearLabel}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M4.22 4.22a.75.75 0 0 1 1.06 0L10 8.94l4.72-4.72a.75.75 0 1 1 1.06 1.06L11.06 10l4.72 4.72a.75.75 0 0 1-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 0 1-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : null}
      <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-[#6c7fa1]">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.1 1.02l-4.25 4.5a.75.75 0 0 1-1.1 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      {open ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#d8e2f3] bg-white shadow-[0_12px_28px_rgba(33,61,110,0.18)]">
          <ul role="listbox" className="max-h-64 overflow-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm text-start transition-colors ${
                      isSelected
                        ? "bg-[#245ce2] text-white"
                        : "text-[#3a4f71] hover:bg-[#eef4ff]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path
                          fillRule="evenodd"
                          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.312a1 1 0 0 1-1.418.002l-3.75-3.75a1 1 0 1 1 1.414-1.414l3.04 3.04 6.54-6.598a1 1 0 0 1 1.418-.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
