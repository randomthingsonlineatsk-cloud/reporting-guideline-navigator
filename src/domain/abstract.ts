// The abstract builder: each fictional venue's structure and limit, the CONSORT for Abstracts
// items, and a check that every number in the abstract is one the study's outputs or the paper
// contain. How a limit is counted is part of the venue's rule, because venues differ.
import hrp from '../data/hrp-301.json'
import glv from '../data/glv-12-301.json'
import { VERDANT1, GLYDE3, VERDANT1_REG, GLYDE3_REG } from './manuscripts'
import { checkRule } from './rules'

export interface Venue { id: string; name: string; kind: 'journal' | 'congress'; headings: string[]; limit: number; unit: 'words' | 'characters'; counts: string; countHeadings: boolean; countTitle: boolean; extra: string }
export const VENUES: Venue[] = [
  { id: 'fennick', name: 'Fennick Journal of Dermatology (fictional)', kind: 'journal', headings: ['Background', 'Methods', 'Results', 'Conclusions'], limit: 250, unit: 'words', counts: 'Words in the four sections; the title, headings and registration line are not counted.', countHeadings: false, countTitle: false, extra: 'End with the trial registration (registry and number) and the funder on their own line.' },
  { id: 'lantern', name: 'Lantern Dermatology Congress 2027 (fictional)', kind: 'congress', headings: ['Introduction', 'Methods', 'Results', 'Conclusion'], limit: 2000, unit: 'characters', counts: 'Characters including spaces in the body and headings; the title and authors are not counted.', countHeadings: true, countTitle: false, extra: 'Embargo: the abstract is public at 08:00 on the day of the session; no press release before then. An abstract shown before must be marked as an encore.' },
  { id: 'orrin', name: 'Orrin Journal of Metabolic Medicine (fictional)', kind: 'journal', headings: ['Aims', 'Methods', 'Results', 'Conclusions'], limit: 250, unit: 'words', counts: 'Every word, including the headings; the title is not counted.', countHeadings: true, countTitle: false, extra: 'Registration number at the end of the Methods.' },
]
export const venue = (id: string) => VENUES.find((v) => v.id === id) ?? VENUES[0]

export interface Parsed { title: string; sections: { heading: string; body: string }[]; tail: string }
/** The abstract is plain text: the first line is the title; a line "Heading: text" starts a section. */
export function parse(text: string, v: Venue): Parsed {
  const lines = text.replace(/\r/g, '').split('\n')
  const title = (lines.shift() ?? '').trim()
  const sections: Parsed['sections'] = []
  let tail = ''
  for (const raw of lines) {
    const line = raw.trim(); if (!line) continue
    const m = /^([A-Z][A-Za-z ]{2,30}):\s*(.*)$/.exec(line)
    if (m && v.headings.some((h) => h.toLowerCase() === m[1].trim().toLowerCase())) { sections.push({ heading: m[1].trim(), body: m[2] }); continue }
    if (m && /registration|funding|registered|trial registration/i.test(m[1])) { tail += (tail ? ' ' : '') + line; continue }
    if (sections.length) sections[sections.length - 1].body += ` ${line}`; else tail += (tail ? ' ' : '') + line
  }
  return { title, sections, tail }
}
const words = (s: string) => (s.match(/[A-Za-z0-9][\w'’%.,/-]*/g) ?? []).length

export function count(text: string, v: Venue): number {
  const p = parse(text, v)
  const body = p.sections.map((s) => (v.countHeadings ? `${s.heading}: ` : '') + s.body).join(v.unit === 'characters' ? '\n' : ' ')
  return v.unit === 'words' ? words(body) : body.length
}

// Numbers the study's outputs and the paper contain: any other number in an abstract is flagged.
const tokens = (s: string) => s.match(/-?\d+(?:\.\d+)?/g) ?? []
function poolOf(study: 'HRP-301' | 'GLV-12-301'): Set<string> {
  const src = study === 'HRP-301' ? hrp : glv, m = study === 'HRP-301' ? VERDANT1 : GLYDE3, reg = study === 'HRP-301' ? VERDANT1_REG : GLYDE3_REG
  const set = new Set<string>()
  const add = (s: string) => { for (const t of tokens(s)) { set.add(t); set.add(t.replace(/^-/, '')); if (t.includes('.')) set.add(String(Number(t))) } }
  for (const o of (src as unknown as { outputs: { title: string; display?: { head: string[]; rows: { label: string; cells: { text: string }[] }[] } | null }[] }).outputs) {
    add(o.title)
    if (o.display) { o.display.head.forEach(add); for (const r of o.display.rows) { add(r.label); r.cells.forEach((c) => add(c.text)) } }
  }
  m.paras.forEach((p) => add(p.text)); add(Object.values(reg).join(' '))
  return set
}
const POOLS: Record<string, Set<string>> = {}
export const pool = (study: 'HRP-301' | 'GLV-12-301') => (POOLS[study] ??= poolOf(study))

export function unknownNumbers(text: string, study: 'HRP-301' | 'GLV-12-301'): string[] {
  const p = pool(study), out: string[] = []
  for (const t of tokens(text.replace(/NCT\d+|CTRI\/[\d/]+|\d{4}-\d{6}-\d{2}-\d{2}/g, ''))) {
    const n = t.replace(/^-/, '')
    if (p.has(t) || p.has(n)) continue
    if (/^(?:1|2|3|4|5|6|10|12|16|18|20|25|26|75|95|100|2025|2026|2027)$/.test(n)) continue
    out.push(t)
  }
  return [...new Set(out)]
}

export interface Check { label: string; ok: boolean; why: string; item?: string }
// CONSORT for Abstracts: a rule where one exists, otherwise a plain test of the words.
const PLAIN: Record<string, [RegExp, string]> = {
  A4: [/adults?|aged|patients|participants|people with/i, 'who took part (the eligibility)'],
  A5: [/placebo|\d+\s*mg|compared with|versus|or (?:usual|standard)/i, 'what each group received'],
  A6: [/assess|compare|evaluat|investigat|aim|whether|tested/i, 'the objective'],
  A10: [/\b\d+\b[^.]{0,80}randomi[sz]ed|randomi[sz]ed[^.]{0,30}\b\d+\b/i, 'the numbers randomised'],
  A11: [/recruit|closed|continues|ongoing|completed/i, 'whether recruitment is closed or continuing'],
  A12: [/analy[sz]ed|included in the analysis|all were/i, 'the numbers analysed'],
  A15: [/conclu|suggest|did not|show/i, 'a conclusion'],
}
export function checkAbstract(text: string, v: Venue, study: 'HRP-301' | 'GLV-12-301', trial = true): Check[] {
  const p = parse(text, v), all = text
  const out: Check[] = []
  const n = count(text, v)
  out.push({ label: `Within the limit (${v.limit} ${v.unit})`, ok: n <= v.limit && n > 0, why: `${n} ${v.unit} counted. ${v.counts}` })
  for (const h of v.headings) out.push({ label: `Heading: ${h}`, ok: p.sections.some((s) => s.heading.toLowerCase() === h.toLowerCase() && s.body.trim().length > 0), why: `${v.name} asks for the headings ${v.headings.join(', ')}, each followed by a colon.` })
  if (trial) {
    for (const id of ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15', 'A16', 'A17']) {
      const target = id === 'A1' ? p.title : all
      const r = checkRule(`consort-abstracts:${id}`, target)
      if (r) out.push({ label: `CONSORT for Abstracts ${id}`, ok: r.ok, why: id === 'A1' ? `In the title (the first line). ${r.why}` : r.why, item: id })
      else { const [re, what] = PLAIN[id]; out.push({ label: `CONSORT for Abstracts ${id}`, ok: re.test(target), why: `Looked for ${what}.`, item: id }) }
    }
  }
  const unk = unknownNumbers(all, study)
  out.push({ label: 'Every number is in the study outputs or the paper', ok: unk.length === 0, why: unk.length ? `Not found in the outputs or the paper: ${unk.join(', ')}. Check each against Table 14.x before submitting.` : 'All numbers were found in the outputs or the paper.' })
  out.push({ label: 'No citations in the abstract', ok: !/\[\d+\]|\(\w+ et al\.?,? \d{4}\)/.test(all), why: 'Abstracts stand alone: no reference citations.' })
  return out
}

/** Facts mission RG3 requires in the VERDANT-1 abstract. */
export const RG3_FACTS: { label: string; re: RegExp }[] = [
  { label: 'The number randomised (45)', re: /\b45\b/ },
  { label: 'The primary result on 25 mg (5 of 16, 31.3%)', re: /\b31\.3\b|\b5 of 16\b|\b5\/16\b/ },
  { label: 'The primary result on placebo (3 of 15, 20.0%)', re: /\b20\.0\b|\b3 of 15\b|\b3\/15\b/ },
  { label: 'A confidence interval for a difference from placebo', re: /-?19\.2|41\.7|-?28\.1|31\.0/ },
  { label: 'The registration number', re: /NCT99930101/ },
]
