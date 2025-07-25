// Utility to format phone numbers for display in ProfileContact
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';
  // Try to match country code
  const codeMatch = phone.match(/^(\+\d{1,4})/);
  const code = codeMatch ? codeMatch[1] : '';
  const local = phone.replace(code, '').replace(/\D/g, '');
  if (code === '+91') {
    if (local.length <= 5) return `${code} ${local}`;
    if (local.length <= 10) return `${code} ${local.slice(0, 5)} ${local.slice(5, 10)}`;
    return `${code} ${local.slice(0, 5)} ${local.slice(5, 10)}`;
  }
  if (code === '+1') {
    if (local.length <= 3) return `${code} ${local}`;
    if (local.length <= 6) return `${code} (${local.slice(0, 3)}) ${local.slice(3)}`;
    return `${code} (${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6, 10)}`;
  }
  // Default: just group by 4
  return `${code} ${local}`.trim();
}
