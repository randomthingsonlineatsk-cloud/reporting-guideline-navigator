// Projects: one per manuscript being checked. A project holds the learner's tags, the abstracts
// and the picker's answers; the manuscript itself comes from the library (or the learner's text).
import type { GuidelineId, Manuscript, Progress, Project, Status, Tag } from './types'
import { fromText } from './manuscripts'
import { LIBRARY, byId, forMission } from './library'
import { allItems, guideline, itemKey } from './guidelines'
import { checkRule } from './rules'

export const FORMAT = 'reporting-guideline-navigator/project' as const
const rid = () => Math.random().toString(36).slice(2, 10)

export function learner(): Pick<Progress, 'name' | 'userId' | 'classId'> { return { name: '', userId: `L-${rid()}`, classId: '' } }

export function createProject(manuscriptId: string, who: { userId: string; classId: string }, opts: { name?: string; ownText?: string; guidelines?: GuidelineId[]; mission?: Project['mission'] } = {}): Project {
  const m = manuscriptId === 'own' ? null : byId(manuscriptId)
  const now = new Date().toISOString()
  return {
    id: `P-${rid()}`, name: opts.name ?? m?.title ?? 'Your manuscript', userId: who.userId, classId: who.classId, createdUtc: now, updatedUtc: now,
    manuscriptId, ownText: opts.ownText, guidelines: opts.guidelines ?? m?.guidelines ?? ['consort-2025'], tags: {}, abstracts: [], mission: opts.mission, history: [{ utc: now, what: 'Created' }],
  }
}

/** The manuscript a project shows, with a mission's planted edits applied. */
export function manuscriptOf(p: Project): Manuscript {
  if (p.manuscriptId === 'own') return fromText(p.ownText ?? '', p.guidelines)
  return forMission(byId(p.manuscriptId)!, p.mission?.id)
}

export function upgrade(p: Project): Project {
  return { ...p, tags: p.tags ?? {}, abstracts: p.abstracts ?? [], history: p.history ?? [], classId: p.classId ?? '', numbers: p.numbers ?? {} }
}

export const tagOf = (p: Project, key: string): Tag => p.tags[key] ?? { paras: [], status: '' }

export function setTag(p: Project, key: string, fn: (t: Tag) => void) {
  const t = structuredClone(tagOf(p, key)); fn(t)
  if (t.status === 'na' && !t.reason?.trim()) t.reason = t.reason ?? ''
  p.tags[key] = t
}

export function toggleTagPara(p: Project, key: string, para: string) {
  setTag(p, key, (t) => {
    t.paras = t.paras.includes(para) ? t.paras.filter((x) => x !== para) : [...t.paras, para]
    if (t.paras.length && !t.status) t.status = 'reported'
  })
}

export interface Flag { key: string; kind: 'untagged' | 'missing' | 'weak' | 'na-reason' | 'ok'; why: string }
/** The workspace's flags for one item: what is untagged, missing, weak, or fine. */
export function flagOf(p: Project, m: Manuscript, key: string): Flag {
  const t = tagOf(p, key)
  if (!t.status) return { key, kind: 'untagged', why: 'Not looked at yet: tag the paragraphs that report it, or mark it missing.' }
  if (t.status === 'na') return t.reason?.trim() ? { key, kind: 'ok', why: `Not applicable: ${t.reason}` } : { key, kind: 'na-reason', why: 'Give the reason it does not apply.' }
  if (t.status === 'missing') return { key, kind: 'missing', why: 'Marked as not reported: the manuscript needs it.' }
  if (!t.paras.length) return { key, kind: 'weak', why: t.status === 'partly' ? 'Marked as partly reported: tag the paragraph that reports part of it, and say in the note what is missing.' : 'Marked as reported, but no paragraph is tagged.' }
  const text = t.paras.map((id) => m.paras.find((x) => x.id === id)?.text ?? '').join(' ')
  const r = checkRule(key, text)
  if (r && !r.ok) return { key, kind: 'weak', why: r.why }
  if (t.status === 'partly') return { key, kind: 'weak', why: 'Marked as partly reported.' }
  return { key, kind: 'ok', why: r ? r.why : 'Tagged as reported.' }
}

export function coverage(p: Project, m: Manuscript) {
  const items = allItems(p.guidelines.filter((g) => guideline(g).built))
  const flags = items.map((x) => ({ ...x, flag: flagOf(p, m, x.key) }))
  const by = (k: Flag['kind']) => flags.filter((f) => f.flag.kind === k).length
  return { total: items.length, done: items.length - by('untagged'), ok: by('ok'), weak: by('weak') + by('na-reason'), missing: by('missing'), untagged: by('untagged'), flags }
}

export const STATUS_LABEL: Record<Status, string> = { reported: 'Reported', partly: 'Partly reported', missing: 'Not reported', na: 'Not applicable' }

/** The completed checklist as rows journals ask for: item, where reported (paragraph numbers). */
export function checklistRows(p: Project, m: Manuscript) {
  const num = new Map(m.paras.map((x, i) => [x.id, i + 1]))
  return allItems(p.guidelines.filter((g) => guideline(g).built)).map(({ g, i, key }) => {
    const t = tagOf(p, key)
    return { guideline: guideline(g).name, section: i.section, item: i.id, text: i.text, status: t.status ? STATUS_LABEL[t.status] : '', where: t.paras.map((x) => `¶${num.get(x)}`).join(', '), reason: t.reason ?? '' }
  })
}
export function checklistCsv(p: Project, m: Manuscript) {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`
  return ['Guideline,Section,Item,Item (paraphrased),Status,Where reported,Reason or note', ...checklistRows(p, m).map((r) => [r.guideline, r.section, r.item, r.text, r.status, r.where, r.reason].map(q).join(','))].join('\n')
}
export function checklistHtml(p: Project, m: Manuscript) {
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
  const rows = checklistRows(p, m).map((r) => `<tr><td>${esc(r.guideline)}</td><td>${esc(r.item)}</td><td>${esc(r.text)}</td><td>${esc(r.status)}</td><td>${esc(r.where)}</td><td>${esc(r.reason)}</td></tr>`).join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Reporting checklist: ${esc(p.name)}</title><style>body{font:12px system-ui,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:4px;vertical-align:top;text-align:left}th{background:#eee}</style></head><body><h1>Reporting checklist</h1><p>${esc(m.title)} · ${esc(p.guidelines.map((g) => guideline(g).name).join(', '))}. Paragraph numbers (¶) refer to the manuscript as shown in the Reporting Guideline Navigator. Items are paraphrased; check the official wording on each guideline's site.</p><table><tr><th>Guideline</th><th>Item</th><th>Item (paraphrased)</th><th>Status</th><th>Where reported</th><th>Reason or note</th></tr>${rows}</table><p>Training only. Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
}

export function exportProject(p: Project) { return JSON.stringify({ format: FORMAT, schema: 1, exportedUtc: new Date().toISOString(), project: p }, null, 2) }
export function importProject(text: string, who: { userId: string; classId: string }): Project {
  let d: { format?: string; project?: Project }
  try { d = JSON.parse(text) } catch { throw new Error('This file is not a project file (it is not JSON).') }
  if (d.format !== FORMAT || !d.project) throw new Error('This file is not a Reporting Guideline Navigator project.')
  const p = upgrade(d.project)
  if (p.manuscriptId !== 'own' && !LIBRARY.some((m) => m.id === p.manuscriptId)) throw new Error(`The project uses a manuscript this version does not have (${p.manuscriptId}).`)
  return { ...p, id: `P-${rid()}`, userId: who.userId, classId: who.classId, history: [...p.history, { utc: new Date().toISOString(), what: 'Imported' }] }
}
export { itemKey }
