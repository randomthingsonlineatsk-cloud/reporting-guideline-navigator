// The HRP-301 (VERDANT-1) study outputs from the TLF Lab, as a list a learner can cite, with the
// numbers each one holds. Used by the communication platform, the claim pack and the extras.
import hrp from '../data/hrp-301.json'

interface Display { head: string[]; rows: { label: string; cells: { text: string }[] }[] }
interface Frame { columns: string[]; rows: (string | number | null)[][] }
interface Raw { id: string; title: string; kind: string; display?: Display | null; frame?: Frame }
export interface Output { id: string; title: string; kind: string; numbers: Set<string>; pValues: number[] }

/** Number tokens, leaving out registration numbers and dates. */
export function numbersIn(text: string): string[] {
  const t = text.replace(/NCT\d+|ISRCTN\d+|CTRI\/[\d/]+|\d{4}-5?\d{5,6}-\d{2}-\d{2}|\b\d{4}-\d{2}-\d{2}\b|doi:\S+|10\.\d{4,}\/\S+/gi, ' ')
  return [...t.matchAll(/(?<![\w.])-?\d+(?:\.\d+)?(?![\w])/g)].map((m) => m[0])
}
const norm = (n: string) => { const x = Number(n); return Number.isFinite(x) ? String(x) : n }

export const OUTPUTS: Output[] = (hrp as unknown as { outputs: Raw[] }).outputs.map((o) => {
  const nums = new Set<string>(), p: number[] = []
  const add = (s: string) => { for (const n of numbersIn(s)) { nums.add(n); nums.add(norm(n)); nums.add(norm(n.replace(/^-/, ''))) } }
  add(o.title)
  if (o.display) { o.display.head.forEach(add); for (const r of o.display.rows) { add(r.label); r.cells.forEach((c) => add(c.text)); if (/p-value/i.test(r.label)) r.cells.forEach((c) => { const v = Number(c.text); if (c.text && Number.isFinite(v)) p.push(v) }) } }
  if (o.frame) for (const r of o.frame.rows) for (const v of r) if (typeof v === 'number') { add(String(v)); add(v.toFixed(1)) } else if (v) add(String(v))
  return { id: o.id, title: o.title, kind: o.kind, numbers: nums, pValues: p }
}).filter((o) => o.kind !== 'dataset')
export const outputById = (id: string) => OUTPUTS.find((o) => o.id === id)
/** Small counts and design numbers that need no source (doses, weeks, group counts, CI level). */
export const DESIGN_NUMBERS = /^(?:0|1|2|3|4|10|16|18|25|75|95|100|324|2025|2026|2027)$/
/** The numbers in a text that none of the given outputs holds. */
export function unsupportedNumbers(text: string, ids: string[]): string[] {
  const outs = ids.map(outputById).filter(Boolean) as Output[]
  return [...new Set(numbersIn(text).filter((n) => !DESIGN_NUMBERS.test(n.replace(/^-/, '')) && !outs.some((o) => o.numbers.has(n) || o.numbers.has(norm(n)) || o.numbers.has(norm(n.replace(/^-/, ''))))))]
}
/** The outputs that hold every non-design number in a text (suggested sources). */
export function suggestOutputs(text: string): string[] {
  const nums = numbersIn(text).filter((n) => !DESIGN_NUMBERS.test(n.replace(/^-/, '')))
  if (!nums.length) return []
  const all = OUTPUTS.filter((o) => nums.every((n) => o.numbers.has(n) || o.numbers.has(norm(n))))
  if (all.length) return all.map((o) => o.id)
  return OUTPUTS.filter((o) => nums.some((n) => o.numbers.has(n) || o.numbers.has(norm(n)))).map((o) => o.id)
}
