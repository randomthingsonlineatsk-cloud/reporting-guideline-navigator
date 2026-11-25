// Review and approval for each publication in the plan: versions, author review rounds with
// comments, sign-off that a new version cancels, milestones, and an audit log in which every entry
// carries the hash of the one before it, so a changed or deleted entry shows. Plus the metrics a
// publications lead reports. Every action is a function that throws when the rule says no.
import { hash } from './phase4'
import type { PlanRow } from './phase4'

export type Role = 'author' | 'medical' | 'compliance'
export interface Version { n: number; utc: string; note: string; by: string }
export interface Comment { id: string; round: number; by: string; text: string; utc: string; reply?: string; resolved?: boolean }
export interface Round { n: number; version: number; opened: string; due: string; closed?: string }
export interface SignOff { who: string; role: Role; version: number; utc: string }
export interface AuditEntry { seq: number; utc: string; who: string; what: string; prev: string; h: string }
export type Decision = 'accepted' | 'revise' | 'rejected'
export interface Milestones { dbl?: string; submitted?: string; decided?: string; decision?: Decision; published?: string }
export interface PubReview { versions: Version[]; rounds: Round[]; comments: Comment[]; signoffs: SignOff[]; milestones: Milestones; audit: AuditEntry[] }

export const blankReview = (): PubReview => ({ versions: [], rounds: [], comments: [], signoffs: [], milestones: {}, audit: [] })
const now = () => new Date().toISOString()
const day = (s?: string) => (s ? s.slice(0, 10) : '')
export const reviewers = (row: PlanRow): string[] => row.authors.split(/[;,]| and /).map((x) => x.trim()).filter((x) => x.length > 2 && !/criteria|as for|steering committee|kick-off|to be|tbc|chosen/i.test(x))

function log(r: PubReview, who: string, what: string, utc = now()) {
  const prev = r.audit.at(-1)?.h ?? '0'
  const seq = (r.audit.at(-1)?.seq ?? 0) + 1
  r.audit.push({ seq, utc, who, what, prev, h: hash(`${seq}|${utc}|${who}|${what}|${prev}`) })
}
/** Checks the chain: every entry's hash, and that each points to the one before it. */
export function verifyAudit(a: AuditEntry[]): { ok: boolean; broken?: number } {
  let prev = '0'
  for (const [i, e] of a.entries()) {
    if (e.seq !== i + 1 || e.prev !== prev || e.h !== hash(`${e.seq}|${e.utc}|${e.who}|${e.what}|${e.prev}`)) return { ok: false, broken: i + 1 }
    prev = e.h
  }
  return { ok: true }
}

const need = (ok: unknown, msg: string) => { if (!ok) throw new Error(msg) }
const latest = (r: PubReview) => r.versions.at(-1)?.n ?? 0
const openRound = (r: PubReview) => r.rounds.find((x) => !x.closed)

export function addVersion(r: PubReview, by: string, note: string, utc = now()) {
  need(note.trim().length > 3, 'Say what changed in this version.')
  need(!openRound(r), `Close review round ${openRound(r)?.n} before making a new version.`)
  need(!r.milestones.submitted || r.milestones.decision === 'revise', 'The publication has been submitted. A new version is only for a revision the journal asked for.')
  const n = latest(r) + 1
  r.versions.push({ n, utc, note: note.trim(), by })
  const voided = r.signoffs.filter((s) => s.version < n).length
  log(r, by, `Version ${n}: ${note.trim()}${voided ? ` (${voided} earlier sign-off${voided > 1 ? 's' : ''} no longer apply)` : ''}`, utc)
}
export function openReview(r: PubReview, by: string, due: string, utc = now()) {
  need(latest(r) > 0, 'Add the first version before sending it for review.')
  need(!openRound(r), 'A review round is already open.')
  need(/^\d{4}-\d{2}-\d{2}$/.test(due) && due >= day(utc), 'Give a due date that is today or later.')
  const n = r.rounds.length + 1
  r.rounds.push({ n, version: latest(r), opened: utc, due })
  log(r, by, `Review round ${n} opened on version ${latest(r)}, due ${due}`, utc)
}
export function addComment(r: PubReview, by: string, text: string, utc = now()) {
  const o = openRound(r); need(o, 'Open a review round first.')
  need(text.trim().length > 3, 'Write the comment.')
  const id = `c${r.comments.length + 1}`
  r.comments.push({ id, round: o!.n, by, text: text.trim(), utc })
  log(r, by, `Comment ${id} in round ${o!.n}: ${text.trim().slice(0, 80)}`, utc)
}
export function resolveComment(r: PubReview, by: string, id: string, reply: string, utc = now()) {
  const c = r.comments.find((x) => x.id === id); need(c, 'No such comment.')
  need(reply.trim().length > 5, 'Say how the comment was handled before resolving it.')
  c!.reply = reply.trim(); c!.resolved = true
  log(r, by, `Comment ${id} resolved: ${reply.trim().slice(0, 80)}`, utc)
}
export function closeReview(r: PubReview, by: string, utc = now()) {
  const o = openRound(r); need(o, 'No round is open.')
  const open = r.comments.filter((c) => c.round === o!.n && !c.resolved)
  need(!open.length, `Resolve every comment first (${open.map((c) => c.id).join(', ')}).`)
  o!.closed = utc
  log(r, by, `Review round ${o!.n} closed`, utc)
}
export function signOff(r: PubReview, who: string, role: Role, utc = now()) {
  need(latest(r) > 0, 'There is no version to approve.')
  need(!openRound(r), 'Approve after the review round is closed.')
  need(!r.signoffs.some((s) => s.who === who && s.version === latest(r)), `${who} has already approved version ${latest(r)}.`)
  r.signoffs.push({ who, role, version: latest(r), utc })
  log(r, who, `Approved version ${latest(r)} (${role})`, utc)
}

export interface Readiness { ok: boolean; missing: string[] }
/** Who still has to approve the latest version before it can go to the journal or congress. */
export function readiness(r: PubReview, row: PlanRow): Readiness {
  const v = latest(r), on = (role: Role) => r.signoffs.filter((s) => s.version === v && s.role === role)
  const missing: string[] = []
  if (!v) missing.push('a version')
  if (!r.rounds.some((x) => x.closed)) missing.push('a closed author review round')
  if (openRound(r)) missing.push(`round ${openRound(r)!.n} to close`)
  for (const a of reviewers(row)) if (!on('author').some((s) => s.who === a)) missing.push(`approval from ${a}`)
  if (!reviewers(row).length && !on('author').length) missing.push('approval from every author')
  if (!on('medical').length) missing.push('medical review sign-off')
  if (!on('compliance').length) missing.push('compliance check (disclosures, GPP 2022)')
  return { ok: missing.length === 0, missing }
}
export function setMilestone(r: PubReview, row: PlanRow, by: string, k: keyof Milestones, value: string, utc = now()) {
  if (k === 'submitted') { const ok = readiness(r, row); need(ok.ok, `Not ready to submit: ${ok.missing.join('; ')}.`) }
  if (k === 'decided' || k === 'decision') need(r.milestones.submitted, 'Record the submission first.')
  if (k === 'published') need(r.milestones.decision === 'accepted', 'Only an accepted publication can be published.')
  if (k !== 'decision') need(/^\d{4}-\d{2}-\d{2}$/.test(value), 'Use a date (yyyy-mm-dd).')
  const order: (keyof Milestones)[] = ['dbl', 'submitted', 'decided', 'published']
  const i = order.indexOf(k)
  if (i > 0) { const before = order.slice(0, i).map((x) => r.milestones[x]).filter(Boolean) as string[]; need(before.every((d) => d <= value), `The ${k} date cannot be before the earlier milestones.`) }
  ;(r.milestones as Record<string, string>)[k] = value
  if (k === 'decision' && value === 'revise') { r.milestones.submitted = undefined; r.milestones.decided = undefined }
  log(r, by, `${k === 'dbl' ? 'Database lock' : k[0].toUpperCase() + k.slice(1)}: ${value}`, utc)
}

// ---------------------------------------------------------------- metrics
const days = (a?: string, b?: string) => (a && b ? Math.round((Date.parse(b) - Date.parse(a)) / 86400000) : null)
const median = (xs: number[]) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2 }
export function metrics(rows: PlanRow[], reviews: Record<string, PubReview>, today = now().slice(0, 10)) {
  const rs = rows.map((row) => ({ row, r: reviews[row.id] ?? blankReview() }))
  const toSub = rs.map(({ r }) => days(r.milestones.dbl, r.milestones.submitted)).filter((x): x is number => x !== null)
  const toDec = rs.map(({ r }) => days(r.milestones.submitted, r.milestones.decided)).filter((x): x is number => x !== null)
  const decided = rs.filter(({ r }) => r.milestones.decision === 'accepted' || r.milestones.decision === 'rejected')
  const late = rs.filter(({ row, r }) => /^\d{4}-\d{2}$/.test(row.target) && !r.milestones.submitted && `${row.target}-31` < today)
  const rounds = rs.flatMap(({ r }) => r.rounds.filter((x) => x.closed).map((x) => days(x.opened, x.closed)!))
  return {
    publications: rows.length,
    submitted: rs.filter(({ r }) => r.milestones.submitted).length,
    accepted: rs.filter(({ r }) => r.milestones.decision === 'accepted').length,
    acceptanceRate: decided.length ? Math.round((rs.filter(({ r }) => r.milestones.decision === 'accepted').length / decided.length) * 100) : null,
    medianLockToSubmission: median(toSub), medianSubmissionToDecision: median(toDec), medianReviewRound: median(rounds),
    pastTarget: late.map(({ row }) => row.what + (row.venue ? ` (${row.venue})` : '')),
  }
}
export function auditCsv(row: PlanRow, r: PubReview): string {
  const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`
  return ['seq,utc,who,what,prev,hash', ...r.audit.map((e) => [e.seq, e.utc, q(e.who), q(e.what), e.prev, e.h].join(','))].join('\n') + `\n# ${row.what} (${row.venue})\n`
}
