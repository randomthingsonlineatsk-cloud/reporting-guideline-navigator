// Missions, scored by written rules against an answer key. Phase 1 has RG1, RG2, RG3 and RG12; the
// others are listed with the phase that brings them.
import type { Progress, Project } from './types'
import { VERDANT1_PLANTED, PROTOCOL_GAPS } from './manuscripts'
import { PLANTED_BY_MISSION, plantedKeys } from './manuscripts2'
import { byId } from './library'
import { tagOf } from './project'
import { checkAbstract, venue, RG3_FACTS } from './abstract'

export interface Mission { id: string; title: string; core: boolean; phase: number; task: string; pass: string; manuscript?: string; guidelines?: string[] }
export const MISSIONS: Mission[] = [
  { id: 'RG1', title: 'Choose the guideline', core: true, phase: 1, task: 'Pick the guideline and the extensions for 12 study descriptions, including the traps.', pass: '10 of 12 right' },
  { id: 'RG2', title: 'Find the missing CONSORT items', core: true, phase: 1, manuscript: 'verdant-1', task: 'A draft of the VERDANT-1 paper has lost 15 CONSORT 2025 items, or reports them too weakly. Check every item: tag where each is reported, and mark the ones that are missing or only partly reported.', pass: '12 of 15 found, at most 2 marked as reported when they are not' },
  { id: 'RG3', title: 'Write the abstract', core: true, phase: 1, manuscript: 'verdant-1', task: 'Write a structured abstract of the VERDANT-1 paper for the Fennick Journal of Dermatology (250 words), from the paper and its tables.', pass: 'Every CONSORT for Abstracts item, within the limit, and no number that is not in the outputs' },
  { id: 'RG4', title: 'Resolve an authorship dispute', core: true, phase: 3, task: 'Six contributors to the GLYDE-3 paper: authors, acknowledgements, CRediT roles and the writing acknowledgement.', pass: '80%' },
  { id: 'RG5', title: 'Disclosures and statements', core: true, phase: 3, task: 'Complete and reconcile the statements for GLYDE-3.', pass: 'All inconsistencies found' },
  { id: 'RG6', title: 'Answer the reviewers', core: true, phase: 3, task: 'Twelve reviewer comments on the VERDANT-1 paper.', pass: '10 of 12' },
  { id: 'RG7', title: 'Cohort study', core: false, phase: 2, manuscript: 'ostreg-cohort', task: 'A draft of the OSTREG cohort paper has lost or weakened 10 STROBE items. Find them.', pass: '8 of 10 found, at most 2 marked as reported when they are not' },
  { id: 'RG8', title: 'Systematic review', core: false, phase: 2, manuscript: 'kinase-review', task: 'Check the kinase inhibitor review against PRISMA 2020 and PRISMA-S (11 items lost or weakened), and find the number in the flow of studies that does not add up.', pass: '9 of 11 items, and only the wrong count ticked' },
  { id: 'RG9', title: 'Diagnostic accuracy', core: false, phase: 2, manuscript: 'cx7-diagnostic', task: 'Check the CX-7 accuracy study against STARD 2015 (10 items lost or weakened), and recompute the accuracy figures from the 2×2 table to find the one that is wrong.', pass: '8 of 10 items, and only the wrong figure ticked' },
  { id: 'RG10', title: 'Case report', core: false, phase: 2, manuscript: 'zoster-case', task: 'A draft of the herpes zoster case report has lost or weakened 8 CARE items. Find them.', pass: '7 of 8 found' },
  { id: 'RG11', title: 'Economic evaluation', core: false, phase: 2, manuscript: 'ostrevia-cua', task: 'A draft of the Ostrevia cost-utility analysis has lost or weakened 11 CHEERS 2022 items. Find them.', pass: '9 of 11 found' },
  { id: 'RG12', title: 'SPIRIT check of the protocol', core: false, phase: 1, manuscript: 'hrp-301-protocol', task: 'Check the Protocol Builder\'s VERDANT-1 protocol (version 2.0) against SPIRIT 2025, and mark the items it leaves out or only partly reports.', pass: '4 of the 5 gaps found, at most 2 false alarms' },
  { id: 'RG13', title: 'Build the poster', core: false, phase: 4, task: 'A VERDANT-1 poster for a fictional congress.', pass: 'All required elements' },
  { id: 'RG14', title: 'Plan the publications', core: false, phase: 4, task: 'Find the gaps in a draft Ostrevia publication plan.', pass: 'All found' },
  { id: 'RG15', title: 'Ethics cases', core: false, phase: 3, task: 'Eight cases: preprint, embargo, predatory journal and others.', pass: '6 of 8' },
  { id: 'RG16', title: 'Plain language summary', core: false, phase: 4, task: 'Prepare the VERDANT-1 summary and hand it to the Plain Language Lab.', pass: 'Accepted' },
]
export const mission = (id: string) => MISSIONS.find((m) => m.id === id)
export const PHASE_NOW = 2
export const available = (m: Mission) => m.phase <= PHASE_NOW

export interface Result { score: number; passed: boolean; detail: string[] }
const found = (p: Project, key: string) => ['missing', 'partly'].includes(tagOf(p, key).status)

export function scoreRG2(p: Project): Result {
  const planted = VERDANT1_PLANTED.items.map((i) => `consort-2025:${i}`)
  const hit = planted.filter((k) => found(p, k))
  const wrong = planted.filter((k) => ['reported', 'na'].includes(tagOf(p, k).status))
  const alarms = Object.entries(p.tags).filter(([k, t]) => k.startsWith('consort-2025:') && !planted.includes(k) && t.status === 'missing').map(([k]) => k)
  const score = Math.max(0, Math.round((hit.length / planted.length) * 100) - 5 * wrong.length - 2 * alarms.length)
  const passed = hit.length >= 12 && wrong.length <= 2
  const name = (k: string) => `item ${k.split(':')[1]}`
  return { score, passed, detail: [
    `${hit.length} of ${planted.length} planted items found`,
    wrong.length ? `Marked as reported or not applicable, but missing or weak: ${wrong.map(name).join(', ')}` : 'No planted item was marked as reported',
    alarms.length ? `Marked as not reported, but the paper reports them: ${alarms.map(name).join(', ')}` : 'No false alarms',
    ...planted.filter((k) => !hit.includes(k)).map((k) => `Missed: ${name(k)}`),
  ] }
}

export function scoreRG12(p: Project): Result {
  const gaps = Object.keys(PROTOCOL_GAPS).map((i) => `spirit-2025:${i}`)
  const hit = gaps.filter((k) => found(p, k))
  const alarms = Object.entries(p.tags).filter(([k, t]) => k.startsWith('spirit-2025:') && !gaps.includes(k) && k !== 'spirit-2025:14b' && t.status === 'missing').map(([k]) => k)
  const score = Math.max(0, Math.round((hit.length / gaps.length) * 100) - 5 * alarms.length)
  return { score, passed: hit.length >= 4 && alarms.length <= 2, detail: [
    `${hit.length} of ${gaps.length} gaps found`,
    ...gaps.map((k) => `${hit.includes(k) ? 'Found' : 'Missed'}: item ${k.split(':')[1]}. ${PROTOCOL_GAPS[k.split(':')[1]]}`),
    alarms.length ? `Marked as not reported, but the protocol reports them: ${alarms.map((k) => `item ${k.split(':')[1]}`).join(', ')}` : 'No false alarms',
  ] }
}

export function scoreRG3(p: Project): Result {
  const a = p.abstracts.find((x) => x.venue === 'fennick')
  if (!a?.text.trim()) return { score: 0, passed: false, detail: ['No abstract for the Fennick Journal of Dermatology yet.'] }
  const checks = checkAbstract(a.text, venue('fennick'), 'HRP-301')
  const items = checks.filter((c) => c.item), itemsOk = items.filter((c) => c.ok).length
  const limit = checks[0].ok, numbers = checks.find((c) => c.label.startsWith('Every number'))!.ok
  const facts = RG3_FACTS.map((f) => ({ ...f, ok: f.re.test(a.text) }))
  const factsOk = facts.filter((f) => f.ok).length
  const score = Math.round((itemsOk / items.length) * 60 + (limit ? 12 : 0) + (numbers ? 12 : 0) + (factsOk / facts.length) * 16)
  return { score, passed: itemsOk === items.length && limit && numbers, detail: [
    `${itemsOk} of ${items.length} CONSORT for Abstracts items found`,
    ...items.filter((c) => !c.ok).map((c) => `Missing: ${c.label.replace('CONSORT for Abstracts ', 'item ')}. ${c.why}`),
    `${checks[0].label}: ${limit ? 'yes' : 'no'}. ${checks[0].why}`,
    numbers ? 'Every number is in the outputs or the paper' : checks.find((c) => c.label.startsWith('Every number'))!.why,
    ...facts.map((f) => `${f.ok ? 'Has' : 'Lacks'}: ${f.label}`),
  ] }
}

/** Missions RG7 to RG11: the planted items, and for RG8 and RG9 the number that does not add up. */
export function scoreDesign(p: Project, id: string): Result {
  const x = PLANTED_BY_MISSION[id], keys = plantedKeys(id), m = byId(x.manuscript)!
  const hit = keys.filter((k) => found(p, k))
  const wrong = keys.filter((k) => ['reported', 'na'].includes(tagOf(p, k).status))
  const alarms = Object.entries(p.tags).filter(([k, t]) => x.guidelines.some((g) => k.startsWith(`${g}:`)) && !keys.includes(k) && !m.na.includes(k) && t.status === 'missing').map(([k]) => k)
  const need = Math.ceil(keys.length * 0.8)
  const nums = x.planted.numbers ?? []
  const numRight = nums.filter((n) => !!p.numbers?.[n.id] === n.wrong).length
  const numOk = !nums.length || numRight === nums.length
  const itemPart = nums.length ? 80 : 100
  const score = Math.max(0, Math.round((hit.length / keys.length) * itemPart + (nums.length ? (numRight / nums.length) * 20 : 0)) - 5 * wrong.length - 2 * alarms.length)
  const name = (k: string) => `${k.startsWith('prisma-s:') ? 'PRISMA-S ' : ''}item ${k.split(':')[1]}`
  return { score, passed: hit.length >= need && wrong.length <= 2 && numOk, detail: [
    `${hit.length} of ${keys.length} planted items found (pass: ${need})`,
    wrong.length ? `Marked as reported or not applicable, but missing or weak: ${wrong.map(name).join(', ')}` : 'No planted item was marked as reported',
    alarms.length ? `Marked as not reported, but the paper reports them: ${alarms.map(name).join(', ')}` : 'No false alarms',
    ...keys.filter((k) => !hit.includes(k)).map((k) => `Missed: ${name(k)}`),
    ...nums.map((n) => `${!!p.numbers?.[n.id] === n.wrong ? 'Right' : 'Not right'}: ${n.label} (${n.shown}) is ${n.wrong ? 'wrong' : 'correct'}. ${n.why}`),
  ] }
}

export function record(g: Progress, id: string, r: Result) {
  const prev = g.missions[id]
  const passed = r.passed || !!prev?.passed
  if (!prev || r.score >= prev.score) g.missions[id] = { score: r.score, passed, utc: new Date().toISOString(), detail: r.detail }
  else g.missions[id] = { ...prev, passed }
}
export const passedMission = (g: Progress, id: string) => !!g.missions[id]?.passed
