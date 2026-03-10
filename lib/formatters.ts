export function formatMoney(value?: number): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  const abs = Math.abs(value);
  if (abs >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  }
  if (abs >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (abs >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (abs >= 1e3) {
    return `$${Math.round(value / 1e3)}K`;
  }

  return `$${Math.round(value).toLocaleString()}`;
}

export function formatEmployees(value?: number): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }

  const abs = Math.abs(value);
  if (abs >= 1e6) {
    return `${(value / 1e6).toFixed(1).replace(/\\.0$/, "")}M`;
  }
  if (abs >= 1e3) {
    return `${Math.round(value / 1e3)}K`;
  }

  return Math.round(value).toLocaleString();
}

export function formatScore(value?: number): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${Math.round(value)}`;
}

export function formatPercent(value?: number): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${value.toFixed(1)}%`;
}

export function formatSignedPercent(value?: number): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
