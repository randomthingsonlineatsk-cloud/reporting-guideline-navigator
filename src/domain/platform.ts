// The scientific communication platform: a short set of agreed core statements, each tied to the
// study outputs that support it, and a lexicon of agreed terms. Every abstract, poster, talk and
// visual abstract is checked against it: does each key message come from a core statement, use the
// agreed terms, and claim no more than the data show?
import { OUTPUTS, outputById, unsupportedNumbers } from './outputs'

export type StatementKind = 'disease' | 'mechanism' | 'design' | 'efficacy' | 'safety'
export interface CoreStatement { id: string; kind: StatementKind; text: string; support: string[] }
export interface LexTerm { use: string; avoid: string[]; note: string }
export interface Platform { statements: CoreStatement[]; lexicon: LexTerm[] }
export interface Finding { rule: string; text: string }

export const KINDS: { id: StatementKind; label: string }[] = [
  { id: 'disease', label: 'Disease and need' }, { id: 'mechanism', label: 'How the medicine works' }, { id: 'design', label: 'How it was studied' },
  { id: 'efficacy', label: 'Efficacy' }, { id: 'safety', label: 'Safety' },
]
export const LEXICON_SEED: LexTerm[] = [
  { use: 'lumiravostat', avoid: ['Ostrevia'], note: 'The generic name in scientific communication; the brand name is for promotional material.' },
  { use: 'chronic hand eczema', avoid: ['hand dermatitis', 'dishpan hands'], note: 'The agreed name of the condition.' },
  { use: 'treatment success', avoid: ['cure', 'cured', 'clear skin'], note: 'IGA-CHE 0 or 1 with at least a 2-grade improvement; not a cure.' },
  { use: 'adverse events', avoid: ['side effects'], note: 'In scientific material; plain language summaries may say side effects.' },
  { use: 'STRK1 inhibitor', avoid: ['STRK1 blocker'], note: 'The agreed mechanism wording.' },
  { use: 'first cohort', avoid: ['final results', 'full results'], note: 'These are the first 45 of 324 planned participants.' },
]
export const blankPlatform = (): Platform => ({ statements: KINDS.map((k, i) => ({ id: `s${i + 1}`, kind: k.id, text: '', support: [] })), lexicon: LEXICON_SEED.map((t) => ({ ...t, avoid: [...t.avoid] })) })
/** A first draft from a colleague, with problems to find. */
export const DRAFT_STATEMENTS: CoreStatement[] = [
  { id: 's1', kind: 'disease', text: 'Moderate to severe chronic hand eczema that topical corticosteroids do not control is a long-lasting condition that affects work and daily life.', support: [] },
  { id: 's2', kind: 'mechanism', text: 'Lumiravostat is an oral STRK1 blocker taken once daily.', support: [] },
  { id: 's3', kind: 'design', text: 'VERDANT-1 is a randomised, double-blind, placebo-controlled trial of lumiravostat 10 mg and 25 mg for 16 weeks; these are the first 45 participants.', support: ['T5'] },
  { id: 's4', kind: 'efficacy', text: 'Ostrevia significantly improves treatment success, with 31.3% of patients on 25 mg reaching it.', support: ['T3'] },
  { id: 's5', kind: 'safety', text: 'Lumiravostat is safe: adverse events occurred in 57.1% and 62.5% on 10 mg and 25 mg and 53.3% on placebo.', support: [] },
]

const STOP = new Set('a an and are as at be by for from in into is it its of on or that the their this to was were which with we our than not no did does do had has have after before over under all each per'.split(' '))
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, '')
export const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9.%\s-]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w) && !/^\d/.test(w)).map(stem)
const hedged = (s: string) => /\b(did not|no clear|not clearly|numerically|not (statistically )?significant|no (statistically )?significant|similar|uncertain|wide|small|early|first cohort)\b/i.test(s)

/** Claim rules that apply to any scientific message. */
export function claimProblems(text: string, support: string[], lex: LexTerm[]): Finding[] {
  const f: Finding[] = []
  const t = text.trim(); if (!t) return f
  const sup = /\b(best|breakthrough|miracle|revolutionary|game[- ]changing|unprecedented|first-in-class|superior)\b/i.exec(t)
  if (sup) f.push({ rule: 'Superlative', text: `“${sup[0]}” is a promotional claim, not a finding.` })
  if (/\b(is|are|was|proved?|shown to be)\s+(completely |entirely )?safe\b|\bno (side effects|adverse events|safety concerns)\b/i.test(t)) f.push({ rule: 'Absolute safety', text: 'No medicine is simply “safe”: report what was seen (rates, serious events) and over how long.' })
  const ps = support.flatMap((id) => outputById(id)?.pValues ?? [])
  if (/\bsignificant(ly)?\b/i.test(t) && !/\b(not|no|non)[- ](statistically )?significant/i.test(t) && !ps.some((p) => p < 0.05)) f.push({ rule: 'Significance', text: ps.length ? `The supporting outputs give p = ${ps.join(', ')}: no difference was statistically significant.` : '“Significant” needs a supporting output with the test result.' })
  if (/\b(improve[sd]?|effective|efficacious|reduce[sd]?|works?)\b/i.test(t) && ps.length && !ps.some((p) => p < 0.05) && !hedged(t)) f.push({ rule: 'Overstated effect', text: 'The data do not show a clear difference from placebo; say what was seen and that the trial continues.' })
  const nums = unsupportedNumbers(t, support)
  if (nums.length) f.push({ rule: 'Number not in its source', text: support.length ? `${nums.join(', ')} not found in ${support.join(', ')}.` : `${nums.join(', ')}: tie the statement to the output that holds ${nums.length > 1 ? 'them' : 'it'}.` })
  for (const term of lex) for (const a of term.avoid) if (a && new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t)) f.push({ rule: 'Lexicon', text: `Use “${term.use}”, not “${a}”.` })
  return f
}
export function checkStatement(s: CoreStatement, lex: LexTerm[]): Finding[] {
  const f: Finding[] = []
  const n = s.text.split(/\s+/).filter(Boolean).length
  if (!n) return [{ rule: 'Empty', text: 'Write the statement.' }]
  if (n > 40) f.push({ rule: 'Length', text: `${n} words: a core statement is one sentence of 40 words or fewer.` })
  if (['design', 'efficacy', 'safety'].includes(s.kind) && !s.support.length) f.push({ rule: 'Support', text: 'Tie it to the study output that supports it.' })
  if (s.kind === 'safety' && !s.support.some((id) => ['T2', 'L1', 'T6'].includes(id))) f.push({ rule: 'Support', text: 'A safety statement needs the adverse event table (14.3.1), the serious adverse event listing or exposure.' })
  if (s.kind === 'efficacy' && !s.support.some((id) => ['T3', 'T4', 'F1'].includes(id))) f.push({ rule: 'Support', text: 'An efficacy statement needs an efficacy output (Tables 14.2.1, 14.2.2 or Figure 14.2.3).' })
  return [...f, ...claimProblems(s.text, s.support, lex)]
}

export interface Target { where: string; text: string }
export interface Alignment { where: string; text: string; best?: string; overlap: number; aligned: boolean; problems: Finding[] }
/** For each message, the core statement it is closest to, and whether it stays within the platform. */
export function align(pf: Platform, targets: Target[]): Alignment[] {
  const sts = pf.statements.filter((s) => s.text.trim())
  const allSupport = [...new Set(sts.flatMap((s) => s.support))]
  return targets.filter((t) => t.text.trim()).map((t) => {
    const w = new Set(words(t.text))
    let best: CoreStatement | undefined, ov = 0
    for (const s of sts) { const sw = new Set(words(s.text)); const o = w.size ? [...w].filter((x) => sw.has(x)).length / w.size : 0; if (o > ov) { ov = o; best = s } }
    const problems = claimProblems(t.text, best?.support.length ? best.support : allSupport.length ? allSupport : OUTPUTS.map((o) => o.id), pf.lexicon)
    return { where: t.where, text: t.text, best: best?.id, overlap: Math.round(ov * 100) / 100, aligned: ov >= 0.35 && !problems.length, problems }
  })
}
export function platformHtml(pf: Platform): string {
  const esc = (x: string) => x.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Scientific communication platform</title><style>body{font:11pt Arial,sans-serif;margin:2rem;max-width:60rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:5px;text-align:left;vertical-align:top}th{background:#eee}</style></head><body><h1>Scientific communication platform: lumiravostat in chronic hand eczema</h1><h2>Core statements</h2><table><tr><th>#</th><th>Theme</th><th>Statement</th><th>Supported by</th></tr>${pf.statements.map((s, i) => `<tr><td>${i + 1}</td><td>${KINDS.find((k) => k.id === s.kind)?.label}</td><td>${esc(s.text)}</td><td>${s.support.map((id) => esc(outputById(id)?.title ?? id)).join('<br>')}</td></tr>`).join('')}</table><h2>Lexicon</h2><table><tr><th>Use</th><th>Not</th><th>Note</th></tr>${pf.lexicon.map((t) => `<tr><td>${esc(t.use)}</td><td>${esc(t.avoid.join(', '))}</td><td>${esc(t.note)}</td></tr>`).join('')}</table><p style="font-size:9pt">Training document. Fictional product and study. Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
}
