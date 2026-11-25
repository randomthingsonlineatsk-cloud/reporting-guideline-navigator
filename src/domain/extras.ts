// Publication extras: a visual abstract, and a video abstract or podcast script, with the checks a
// publications team applies (length, numbers from the outputs, citation and funder, claims, and
// accessibility).
import { OUTPUTS, unsupportedNumbers } from './outputs'
import { claimProblems, LEXICON_SEED, type LexTerm } from './platform'
import { checkAlt, checkPalette, checkText } from './a11y'
import { VERDANT1_CITATION } from './phase4'

export interface Rule { id: string; label: string; ok: boolean; why?: string }
const wc = (s: string) => s.split(/\s+/).filter(Boolean).length
const ALL = OUTPUTS.map((o) => o.id)

export interface Visual { title: string; population: string; design: string; arms: string; headline: string; safety: string; conclusion: string; citation: string; funder: string; alt: string; palette: string[]; fg: string; bg: string }
export const blankVisual = (): Visual => ({ title: '', population: '', design: '', arms: '', headline: '', safety: '', conclusion: '', citation: VERDANT1_CITATION, funder: '', alt: '', palette: ['#0072B2', '#D55E00', '#555555'], fg: '#111111', bg: '#ffffff' })
const vText = (v: Visual) => [v.title, v.population, v.design, v.arms, v.headline, v.safety, v.conclusion].join(' ')
export function checkVisual(v: Visual, lex: LexTerm[] = LEXICON_SEED): Rule[] {
  const body = vText(v), unk = unsupportedNumbers(body, ALL), pal = checkPalette(v.palette, v.bg), txt = checkText(v.fg, v.bg)
  const claims = [v.headline, v.conclusion, v.safety].flatMap((t) => claimProblems(t, ALL, lex)).filter((f) => f.rule !== 'Number not in its source')
  const heads = [...v.headline.matchAll(/-?\d+(?:\.\d+)?%/g)].map((m) => m[0])
  const alt = checkAlt(v.alt, heads.slice(0, 2))
  return [
    { id: 'V1', label: 'A title of 15 words or fewer', ok: wc(v.title) > 2 && wc(v.title) <= 15 },
    { id: 'V2', label: 'Who, what was compared and how it was studied', ok: wc(v.population) > 2 && wc(v.arms) > 2 && wc(v.design) > 1 },
    { id: 'V3', label: 'The main result with its numbers', ok: heads.length > 0 },
    { id: 'V4', label: 'Safety as well as efficacy', ok: wc(v.safety) > 3 },
    { id: 'V5', label: '80 words or fewer in all', ok: wc(body) > 10 && wc(body) <= 80, why: `${wc(body)} words.` },
    { id: 'V6', label: 'Every number is in the study outputs', ok: wc(body) > 10 && unk.length === 0, why: unk.length ? `Not found: ${unk.join(', ')}` : '' },
    { id: 'V7', label: 'No claim beyond the data, and the agreed terms', ok: wc(v.headline + ' ' + v.conclusion) > 5 && claims.length === 0, why: claims.map((c) => c.text).join(' ') },
    { id: 'V8', label: 'The article citation and the funder', ok: /doi|10\.\d{4}/i.test(v.citation) && wc(v.funder) > 1 },
    { id: 'V9', label: 'Alt text that gives the main result', ok: alt.ok, why: alt.why },
    { id: 'V10', label: `Text contrast at least 4.5:1 (now ${txt.ratio}:1)`, ok: txt.ok },
    { id: 'V11', label: 'Colours that stay apart with colour-vision deficiency and 3:1 against the background', ok: pal.ok, why: pal.problems.join(' ') },
  ]
}
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
function wrap(s: string, n: number): string[] { const out: string[] = []; let line = ''; for (const w of s.split(/\s+/).filter(Boolean)) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w } else line += ' ' + w } if (line.trim()) out.push(line.trim()); return out }
const tspans = (s: string, x: number, y: number, n: number, size: number, fill: string, weight = 'normal') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}">${wrap(s, n).map((l, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${esc(l)}</tspan>`).join('')}</text>`
export function visualSvg(v: Visual): string {
  const [c1, c2, c3] = [v.palette[0] ?? '#0072B2', v.palette[1] ?? '#D55E00', v.palette[2] ?? '#555555']
  const box = (x: number, label: string, text: string, c: string) => `<rect x="${x}" y="150" width="360" height="300" rx="16" fill="${v.bg}" stroke="${c}" stroke-width="6"/><text x="${x + 24}" y="196" font-size="22" font-weight="bold" fill="${c}">${esc(label)}</text>${tspans(text, x + 24, 236, 30, 20, v.fg)}`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" font-family="Arial, sans-serif" role="img" aria-label="${esc(v.alt)}"><rect width="1200" height="675" fill="${v.bg}"/>${tspans(v.title, 40, 64, 80, 34, v.fg, 'bold')}
${box(40, 'Who and how', `${v.population} ${v.design}`, c1)}${box(420, 'What was compared', v.arms, c3)}${box(800, 'What was found', `${v.headline} ${v.safety}`, c2)}
<rect x="40" y="480" width="1120" height="110" rx="16" fill="${c1}"/>${tspans(v.conclusion, 64, 526, 95, 24, '#ffffff', 'bold')}
${tspans(`${v.citation} · ${v.funder}`, 40, 625, 140, 14, v.fg)}<text x="1160" y="662" font-size="12" text-anchor="end" fill="${v.fg}">Fictional study, for training</text></svg>`
}

export type ScriptKind = 'video' | 'podcast'
export interface Segment { visual: string; narration: string }
export interface Script { kind: ScriptKind; segments: Segment[]; captions: boolean; transcript: boolean }
export const LIMITS: Record<ScriptKind, { seconds: number; wpm: number }> = { video: { seconds: 180, wpm: 150 }, podcast: { seconds: 600, wpm: 150 } }
export const blankScript = (kind: ScriptKind = 'video'): Script => ({ kind, segments: [{ visual: '', narration: '' }], captions: false, transcript: false })
export const seconds = (s: Script) => Math.round((wc(s.segments.map((x) => x.narration).join(' ')) / LIMITS[s.kind].wpm) * 60)
export function checkScript(s: Script, lex: LexTerm[] = LEXICON_SEED): Rule[] {
  const all = s.segments.map((x) => x.narration).join(' '), sec = seconds(s), lim = LIMITS[s.kind].seconds, unk = unsupportedNumbers(all, ALL)
  const claims = s.segments.flatMap((x) => claimProblems(x.narration, ALL, lex)).filter((f) => f.rule !== 'Number not in its source')
  const first = s.segments[0]?.narration ?? ''
  return [
    { id: 'S1', label: `${lim / 60} minutes or less at ${LIMITS[s.kind].wpm} words a minute (now ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')})`, ok: sec > 20 && sec <= lim },
    { id: 'S2', label: 'Opens with the study and who is speaking', ok: /VERDANT-1|this (study|trial)/i.test(first) && /\b(I am|I'm|my name|this is)\b/i.test(first) },
    { id: 'S3', label: 'Every number is in the study outputs', ok: wc(all) > 10 && unk.length === 0, why: unk.length ? `Not found: ${unk.join(', ')}` : '' },
    { id: 'S4', label: 'No claim beyond the data, and the agreed terms', ok: wc(all) > 10 && claims.length === 0, why: claims.map((c) => c.text).join(' ') },
    { id: 'S5', label: 'Says who funded the study and the speaker\'s interests', ok: /fund|paid for|sponsor/i.test(all) && /(employee|consult|interest|disclos|no conflicts)/i.test(all) },
    { id: 'S6', label: 'Points to the article', ok: /doi|journal|article|full paper/i.test(all) },
    { id: 'S7', label: s.kind === 'video' ? 'Every segment says what is on screen' : 'A transcript is provided', ok: s.kind === 'video' ? s.segments.every((x) => wc(x.visual) > 1) : s.transcript },
    { id: 'S8', label: s.kind === 'video' ? 'Captions and a transcript' : 'Speaker named at the start of each part', ok: s.kind === 'video' ? s.captions && s.transcript : s.segments.every((x) => /^[A-Z][\w .'-]{1,40}:/.test(x.narration.trim())) },
  ]
}
export function scriptText(s: Script): string {
  return s.segments.map((x, i) => `${i + 1}. ${s.kind === 'video' ? `[On screen: ${x.visual}]\n` : ''}${x.narration}`).join('\n\n')
}
