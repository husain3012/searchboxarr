import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return dayjs(dateStr).fromNow();
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return "—";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm");
}

export function formatNumber(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function getCategoryName(id: number): string {
  const map: Record<number, string> = {
    1000: "Games",
    2000: "Movies",
    3000: "Music",
    4000: "Apps",
    5000: "TV",
    6000: "XXX",
    7000: "Books",
    8000: "Other",
  };
  for (const [base, name] of Object.entries(map)) {
    if (id >= Number(base) && id < Number(base) + 1000) return name;
  }
  return "Unknown";
}

export function truncate(str: string, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max).trimEnd() + "…";
}

export function buildMagnetFromUrl(magnetUrl: string): string {
  return magnetUrl;
}

export function clsx(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
