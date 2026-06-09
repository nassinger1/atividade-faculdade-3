// Mirrors the back-end business rule (EnrollmentController.calculateEndDate):
// end = start + durationMonths, advancing the month component.
export function calculateEndDate(startISO: string, months: number): string {
  // startISO is "YYYY-MM-DD" from a date input. Parse as a plain local date.
  const [y, m, d] = startISO.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setMonth(date.getMonth() + months);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

// Format any date-ish value to dd/mm/yyyy in pt-BR. Tolerates full ISO
// timestamps (what the API returns) and plain YYYY-MM-DD (form values).
export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const datePart = value.includes("T") ? value.split("T")[0] : value;
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

// Normalize an API date value to YYYY-MM-DD for use in <input type="date">.
export function toDateInput(value?: string | null): string {
  if (!value) return "";
  return value.includes("T") ? value.split("T")[0] : value;
}

// True if endDate is in the past (access expired).
export function isExpired(endISO?: string | null): boolean {
  if (!endISO) return false;
  const end = new Date(endISO.includes("T") ? endISO : `${endISO}T23:59:59`);
  return end.getTime() < Date.now();
}

// Months/days remaining label for an active enrollment.
export function accessStatus(endISO?: string | null): {
  expired: boolean;
  label: string;
} {
  if (!endISO) return { expired: false, label: "—" };
  const expired = isExpired(endISO);
  if (expired) return { expired: true, label: "Acesso expirado" };
  const end = new Date(endISO.includes("T") ? endISO : `${endISO}T23:59:59`);
  const diffDays = Math.ceil((end.getTime() - Date.now()) / 86_400_000);
  if (diffDays > 60)
    return { expired: false, label: `~${Math.round(diffDays / 30)} meses restantes` };
  return { expired: false, label: `${diffDays} dias restantes` };
}
