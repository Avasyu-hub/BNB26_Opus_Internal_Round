// Proper minus sign for maths display
export const num = (n) => (n < 0 ? `−${Math.abs(n)}` : `${n}`);
export const signed = (n) => (n > 0 ? `+${n}` : num(n));
export const pct = (v, d = 0) => `${(v * 100).toFixed(d)}%`;
