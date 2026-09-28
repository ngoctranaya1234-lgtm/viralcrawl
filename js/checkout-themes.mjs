// js/checkout-themes.mjs — Seven internal simulated checkout themes
// Strictly simulated: no real money, no banking endpoints, no payment credentials

export const SIMULATION_BANNER_TEXT = 'NỘI BỘ / MÔ PHỎNG — ĐIỂM ẢO — KHÔNG CHUYỂN HOẶC RÚT TIỀN THẬT';

const THEMES_RAW = [
  { id: 'momo', label: 'MoMo Simulation', accent: '#a50064', icon: 'M' },
  { id: 'mbbank', label: 'MB Bank Simulation', accent: '#002878', icon: 'MB' },
  { id: 'techcombank', label: 'Techcombank Simulation', accent: '#e31837', icon: 'TCB' },
  { id: 'sacombank', label: 'Sacombank Simulation', accent: '#005baa', icon: 'SCB' },
  { id: 'visa', label: 'Visa Card Simulation', accent: '#1a1f71', icon: 'VISA' },
  { id: 'applepay', label: 'Apple Pay Simulation', accent: '#000000', icon: '' },
  { id: 'googlepay', label: 'Google Pay Simulation', accent: '#4285f4', icon: 'GPay' }
];

export const CHECKOUT_THEMES = Object.freeze(THEMES_RAW.map(t => Object.freeze({ ...t })));

const THEME_MAP = new Map(CHECKOUT_THEMES.map(t => [t.id, t]));

export function validateTheme(themeId) {
  if (!themeId || typeof themeId !== 'string') return null;
  return THEME_MAP.get(themeId.trim().toLowerCase()) || null;
}
