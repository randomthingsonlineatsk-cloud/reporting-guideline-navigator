// Classroom mode: the only feature that talks to a server. It uses the shared classroom Worker
// (Cloudflare Worker + D1) kept in the eCTD Dossier Builder repository, routes under /rg/v1, with
// rg_ tables. Instructors create a class and set missions as assignments; students join with a
// code, run the mission and submit it; instructors re-score each submission in their own browser
// with this app's scoring, comment, and see a leaderboard.
import type { Progress, Project } from './types'
import { MISSIONS } from './missions'
import { scoreProject } from './scoring'
import { scoreRG1, type CaseAnswer } from './picker'
import { scoreRG15 } from './phase3'
import { upgrade } from './project'

export const DEFAULT_API = 'https://ectd-classroom.randomthingsonlineatsk.workers.dev/rg/v1'
export const BUILT_IN_API = (import.meta.env?.VITE_CLASSROOM_API as string | undefined) || DEFAULT_API
export const STATUS_PAGE = DEFAULT_API.replace(/\/rg\/v1$/, '/')
export const SUBMISSION_KIND = 'reporting-guideline-navigator/mission-submission'
const KEY = 'reporting-guideline-navigator:classroom'

export interface Session { api: string; token?: string; role?: 'instructor' | 'student'; className?: string; name?: string }
export function loadSession(): Session {
  try { const s = JSON.parse(localStorage.getItem(KEY) ?? '{}'); return { ...s, api: s.api || BUILT_IN_API } } catch { return { api: BUILT_IN_API } }
}
export function saveSession(s: Session) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private window: the session lasts for this page only */ } }

export async function api<T = Record<string, unknown>>(s: Session, method: string, path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(s.api.replace(/\/+$/, '') + path, { method, headers: { 'content-type': 'application/json', ...(s.token ? { authorization: `Bearer ${s.token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  } catch { throw new Error('Could not reach the classroom server. Check the address and your connection.') }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `The classroom server answered ${res.status}.`)
  return data as T
}

export async function gzip(text: string): Promise<string> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))
  const buf = new Uint8Array(await new Response(stream).arrayBuffer())
  let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000))
  return btoa(bin)
}
export async function gunzip(b64: string): Promise<string> {
  const bin = atob(b64); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}

/** What is sent: a mission project, or for RG1 and RG15 (which have no project) the answers. */
export type Payload = { project: Project } | { answers: { id: 'RG1'; rg1: Record<string, CaseAnswer> } | { id: 'RG15'; ethics: Record<string, number> } }
export interface Submission { kind: typeof SUBMISSION_KIND; missionId: string; startedUtc: string; score: number; detail: string[]; gz: string; size: number }

function scorePayload(missionId: string, x: Payload) {
  if ('project' in x) {
    const p = upgrade(x.project)
    if (p.mission?.id !== missionId) throw new Error(`The submitted project is not a run of ${missionId}.`)
    return scoreProject(p)
  }
  if (x.answers.id !== missionId) throw new Error(`The submitted answers are not for ${missionId}.`)
  if (x.answers.id === 'RG1') { const r = scoreRG1(x.answers.rg1); return { score: r.score, passed: r.passed, detail: [`${r.right} of ${r.detail.length} cases right`] } }
  return scoreRG15(x.answers.ethics)
}

/** The latest run of a mission: its newest scored project, or the progress answers for RG1 and RG15. */
export function latestRun(missionId: string, projects: Project[], g: Progress): Payload | null {
  if (missionId === 'RG1') return Object.keys(g.rg1 ?? {}).length ? { answers: { id: 'RG1', rg1: g.rg1 } } : null
  if (missionId === 'RG15') return Object.keys(g.ethics ?? {}).length ? { answers: { id: 'RG15', ethics: g.ethics! } } : null
  const p = projects.filter((x) => x.mission?.id === missionId && x.mission.scoredUtc).sort((a, b) => b.mission!.scoredUtc!.localeCompare(a.mission!.scoredUtc!))[0]
  return p ? { project: p } : null
}

export async function submissionPayload(missionId: string, x: Payload) {
  if (!MISSIONS.some((m) => m.id === missionId)) throw new Error(`Unknown mission ${missionId}.`)
  const r = scorePayload(missionId, x), text = JSON.stringify(x)
  const sub: Submission = { kind: SUBMISSION_KIND, missionId, startedUtc: 'project' in x ? x.project.mission!.startedUtc : new Date().toISOString(), score: r.score, detail: r.detail, gz: await gzip(text), size: text.length }
  return { project: sub, score: r.score, checks: r.detail.map((d, i) => ({ id: `d${i + 1}`, label: d, ok: r.passed })) }
}

/** Re-score a submission with this copy of the app's scoring. */
export async function verifySubmission(file: Submission): Promise<{ score: number; detail: string[] }> {
  if (file?.kind !== SUBMISSION_KIND) throw new Error('This is not a Reporting Guideline Navigator mission submission.')
  const x = JSON.parse(await gunzip(file.gz)) as Payload
  const r = scorePayload(file.missionId, x)
  return { score: r.score, detail: r.detail }
}
