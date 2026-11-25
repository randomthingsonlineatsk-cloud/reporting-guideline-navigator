// Accessibility checks for figures, slides and visual abstracts: WCAG 2.2 contrast, and whether
// colours stay apart for people with colour-vision deficiency (simulated with the Machado, Oliveira
// and Fernandes 2009 matrices at full severity, compared in CIELAB).
export type Rgb = [number, number, number]
export function hexRgb(h: string): Rgb | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h.trim()); if (!m) return null
  const x = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1]
  return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)) as Rgb
}
const lin = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
const gam = (c: number) => { const v = Math.min(1, Math.max(0, c)); return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) }
export function luminance([r, g, b]: Rgb) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) }
export function contrast(a: string, b: string): number {
  const x = hexRgb(a), y = hexRgb(b); if (!x || !y) return 0
  const [l1, l2] = [luminance(x), luminance(y)].sort((m, n) => n - m)
  return Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100
}
const M = {
  protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
} as const
export type Cvd = keyof typeof M | 'normal'
export function simulate(c: Rgb, t: Cvd): Rgb {
  if (t === 'normal') return c
  const l = c.map(lin), m = M[t]
  return m.map((row) => gam(row[0] * l[0] + row[1] * l[1] + row[2] * l[2])) as Rgb
}
function lab([r, g, b]: Rgb): [number, number, number] {
  const [R, G, B] = [r, g, b].map(lin)
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]
}
export const deltaE = (a: Rgb, b: Rgb) => { const x = lab(a), y = lab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) }
/** This app's rule: colours closer than this in CIELAB (ΔE 1976) are hard to tell apart in a legend. */
export const MIN_DELTA_E = 15
export interface PaletteCheck { ok: boolean; worst: { vision: Cvd; a: string; b: string; dE: number } | null; problems: string[] }
export function checkPalette(colors: string[], bg = '#ffffff'): PaletteCheck {
  const cs = colors.map((c) => [c, hexRgb(c)] as const).filter(([, r]) => r) as [string, Rgb][]
  const problems: string[] = []
  if (cs.length < colors.length) problems.push('Some colours are not hex values (#rrggbb).')
  let worst: PaletteCheck['worst'] = null
  for (const v of ['normal', 'protanopia', 'deuteranopia', 'tritanopia'] as Cvd[]) for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
    const dE = Math.round(deltaE(simulate(cs[i][1], v), simulate(cs[j][1], v)))
    if (!worst || dE < worst.dE) worst = { vision: v, a: cs[i][0], b: cs[j][0], dE }
    if (dE < MIN_DELTA_E) problems.push(`${cs[i][0]} and ${cs[j][0]} look alike${v === 'normal' ? '' : ` with ${v}`} (ΔE ${dE}).`)
  }
  for (const [c] of cs) { const r = contrast(c, bg); if (r < 3) problems.push(`${c} on ${bg} has contrast ${r}:1; lines and shapes need 3:1.`) }
  return { ok: problems.length === 0, worst, problems }
}
/** Five of the Okabe–Ito colours (the ones dark enough for 3:1 on white). */
export const SAFE_PALETTE = ['#0072B2', '#D55E00', '#009E73', '#CC79A7', '#000000']
export function checkText(fg: string, bg: string, large = false) { const r = contrast(fg, bg), need = large ? 3 : 4.5; return { ratio: r, need, ok: r >= need } }
export function checkAlt(alt: string, mustMention: string[] = []): { ok: boolean; why: string } {
  const w = alt.trim().split(/\s+/).filter(Boolean).length
  if (w < 12) return { ok: false, why: 'Describe what the figure shows and its main result, not just its title (at least 12 words).' }
  if (w > 150) return { ok: false, why: 'Keep alt text to 150 words or fewer; put the rest in a long description.' }
  if (/^(image|picture|graph|figure|chart) of\b/i.test(alt.trim())) return { ok: false, why: 'Screen readers already say it is an image: start with what it shows.' }
  const miss = mustMention.filter((m) => !alt.includes(m))
  if (miss.length) return { ok: false, why: `Give the main numbers too (${miss.join(', ')}).` }
  return { ok: true, why: '' }
}
