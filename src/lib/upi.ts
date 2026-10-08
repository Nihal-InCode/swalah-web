export const UPI_ID = '8123312736@superyes';
export const UPI_PAYEE_NAME = 'Swalah';
export const UPI_CURRENCY = 'INR';
export const UPI_NOTE = 'Support Swalah';

/**
 * Build a standard UPI deep link.
 * Opening this on Android launches the UPI app chooser
 * (GPay / PhonePe / Paytm / BHIM) with the payee pre-filled.
 * Amount is intentionally omitted -> payer types whatever they want.
 */
export function buildUpiUrl(): string {
  const enc = (v: string) => encodeURIComponent(v);
  // '@' stays literal: valid in a query string and some UPI apps reject '%40'
  return `upi://pay?pa=${UPI_ID}&pn=${enc(UPI_PAYEE_NAME)}&cu=${UPI_CURRENCY}&tn=${enc(UPI_NOTE)}`;
}

/**
 * True when the current device can handle `upi://` links:
 * Android phones/tablets (desktop and iOS cannot).
 */
export function canOpenUpiApp(): boolean {
  if (typeof navigator === 'undefined') return false;
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean; platform?: string } })
    .userAgentData;
  if (uaData) {
    return uaData.platform === 'Android' && uaData.mobile === true;
  }
  return /Android/i.test(navigator.userAgent) && /Mobile/i.test(navigator.userAgent);
}

/** Try to hand the link to the OS (UPI app chooser). */
export function openUpiApp(): void {
  window.location.href = buildUpiUrl();
}
