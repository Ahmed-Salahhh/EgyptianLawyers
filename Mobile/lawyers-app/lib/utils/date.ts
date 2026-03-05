const FALLBACK_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
};

function parseApiUtcDate(value: string): Date {
  // Backend returns UTC, but sometimes without timezone suffix.
  // Example: 2026-03-05T14:48:00.0000000 (no Z / offset)
  // In that case JS treats it as local time, so force UTC by appending Z.
  const hasTimezone = /[zZ]|[+\-]\d{2}:\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

export function formatUtcDateTime(
  iso: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseApiUtcDate(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, options ?? FALLBACK_DATE_TIME_OPTIONS).format(date);
}

export function formatUtcRelative(iso: string): string {
  const date = parseApiUtcDate(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const safeRtf =
    typeof Intl !== "undefined" && typeof Intl.RelativeTimeFormat === "function"
      ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
      : null;

  const fallback = (value: number, unit: "second" | "minute" | "hour" | "day") => {
    const absValue = Math.abs(value);
    const suffix = value < 0 ? "ago" : "from now";
    const label = absValue === 1 ? unit : `${unit}s`;
    return `${absValue} ${label} ${suffix}`;
  };

  if (abs < 60) {
    return safeRtf?.format(diffSeconds, "second") ?? fallback(diffSeconds, "second");
  }
  if (abs < 3600) {
    const minutes = Math.round(diffSeconds / 60);
    return safeRtf?.format(minutes, "minute") ?? fallback(minutes, "minute");
  }
  if (abs < 86400) {
    const hours = Math.round(diffSeconds / 3600);
    return safeRtf?.format(hours, "hour") ?? fallback(hours, "hour");
  }
  if (abs < 604800) {
    const days = Math.round(diffSeconds / 86400);
    return safeRtf?.format(days, "day") ?? fallback(days, "day");
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}
