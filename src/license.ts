const SLUG = 'bike-check-card';
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${TOKEN_KEY}:verdict`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number };

export function checkoutUrl() {
  return `https://api.sociobot.in/api/v1/products/${SLUG}/checkout`;
}

export function captureLicenseFromUrl() {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function storeLicense(token: string) {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function hasOptimisticUnlock() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict | null;
    return cached?.valid !== false;
  } catch {
    return true;
  }
}

export function hasStoredLicense() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export async function verifyLicense() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  let cached: Verdict | null = null;
  try { cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as Verdict | null; } catch { /* recheck */ }
  if (cached && Date.now() - cached.checkedAt < DAY) return cached.valid;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable.');
    const data = await response.json() as { valid: boolean };
    localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: data.valid, checkedAt: Date.now() }));
    return data.valid;
  } catch {
    return hasOptimisticUnlock();
  }
}
