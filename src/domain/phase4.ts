// Phase 4: the congress poster (RG13), the GPP publication plan (RG14), the plain language summary
// handed to the Plain Language Lab (RG16), the certificate for the Regulatory Skills Passport and
// the hand-off for step 13 of the pharmolecule Ostrevia lifecycle journey. All fictional.
import type { Progress, Project } from './types'
import { unknownNumbers } from './abstract'
import { VERDANT1, VERDANT1_REG } from './manuscripts'
import { checkWritingAck } from './phase3'
import { allItems } from './guidelines'
import { tagOf } from './project'
import { checkAbstract, venue } from './abstract'
import { MISSIONS } from './missions'
import { LESSONS, QUIZ_PASS } from './learn'

export const APP_URL = 'https://randomthingsonlineatsk-cloud.github.io/reporting-guideline-navigator/'

// ---------------------------------------------------------------- poster (RG13)
export interface Poster { title: string; authors: string; sections: Record<string, string>; messages: string[]; figure: string; qr: string; disclosure: string; ack: string; encore: string; size: 'A0 portrait' | 'A0 landscape'; bodyPt: number; titlePt: number; figureAlt?: string }
export const POSTER_SECTIONS = ['Background', 'Methods', 'Results', 'Conclusions'] as const
export const POSTER_RULES = { congress: 'Lantern Dermatology Congress 2027 (fictional)', words: 800, minBody: 24, minTitle: 72, earlier: 'Nordbay Dermatology Meeting, March 2027 (fictional)' }
export const blankPoster = (): Poster => ({ title: '', authors: '', sections: Object.fromEntries(POSTER_SECTIONS.map((s) => [s, ''])), messages: ['', '', ''], figure: '', qr: '', disclosure: '', ack: '', encore: '', size: 'A0 portrait', bodyPt: 28, titlePt: 90 })
const wc = (s: string) => s.split(/\s+/).filter(Boolean).length
export const posterWords = (p: Poster) => wc([p.title, ...Object.values(p.sections), ...p.messages, p.disclosure, p.ack, p.encore].join(' '))

export function posterChecks(p: Poster) {
  const all = [p.title, ...Object.values(p.sections), ...p.messages, p.disclosure].join(' ')
  const unk = unknownNumbers(all, 'HRP-301')
  return [
    { id: 'P1', label: 'A title and the authors with their affiliations', ok: wc(p.title) >= 4 && /,/.test(p.authors) },
    { id: 'P2', label: 'All four sections written', ok: POSTER_SECTIONS.every((s) => wc(p.sections[s] ?? '') >= 15) },
    { id: 'P3', label: `A complete poster in ${POSTER_RULES.words} words or fewer`, ok: posterWords(p) >= 100 && posterWords(p) <= POSTER_RULES.words },
    { id: 'P4', label: 'Three key messages, each 20 words or fewer', ok: p.messages.length === 3 && p.messages.every((m) => wc(m) >= 3 && wc(m) <= 20) },
    { id: 'P5', label: 'A figure from the study outputs', ok: !!p.figure },
    { id: 'P6', label: `Body text at least ${POSTER_RULES.minBody} pt and the title at least ${POSTER_RULES.minTitle} pt, readable from 2 metres`, ok: p.bodyPt >= POSTER_RULES.minBody && p.titlePt >= POSTER_RULES.minTitle },
    { id: 'P7', label: 'The trial registration number', ok: all.includes(VERDANT1_REG.number) },
    { id: 'P8', label: 'A disclosure box: the funder and the authors\' competing interests', ok: /Halcyon|fund/i.test(p.disclosure) && /employ|compet|interest|consult|fee/i.test(p.disclosure) },
    { id: 'P9', label: 'The medical writing acknowledgement (GPP 2022)', ok: checkWritingAck(p.ack).ok },
    { id: 'P10', label: 'A QR code to the full data or summary', ok: /^https:\/\/\S+$/.test(p.qr.trim()) },
    { id: 'P11', label: `Labelled as an encore of the ${POSTER_RULES.earlier}`, ok: /encore/i.test(p.encore) && /Nordbay/i.test(p.encore) },
    { id: 'P12', label: 'Every number is in the study outputs', ok: wc(p.sections.Results ?? '') > 0 && unk.length === 0, why: unk.length ? `Not found: ${unk.join(', ')}` : '' },
  ]
}
export function scoreRG13(p?: Poster) {
  if (!p) return { score: 0, passed: false, detail: ['No poster yet.'] }
  const c = posterChecks(p), ok = c.filter((x) => x.ok).length
  return { score: Math.round((ok / c.length) * 100), passed: ok === c.length, detail: [`${ok} of ${c.length} required elements`, ...c.filter((x) => !x.ok).map((x) => `Missing: ${x.label}${'why' in x && x.why ? ` (${x.why})` : ''}`)] }
}
/** The study page the QR code points to (Decision 9: the app's own study page, so the code works). */
export const QR_TARGET = `${APP_URL}#/study/HRP-301`

// ---------------------------------------------------------------- publication plan (RG14)
export interface PlanRow { id: string; what: string; data: string; venue: string; type: string; target: string; status: string; authors: string; writer: string; gap?: string }
// A draft GPP plan for Ostrevia, with five planted gaps for RG14.
export const PLAN_SEED: PlanRow[] = [
  { id: 'a1', what: 'VERDANT-1 primary results (first cohort)', data: 'HRP-301 CSR, database lock', venue: 'Fennick Journal of Dermatology', type: 'Primary manuscript', target: '2027-03', status: 'In development', authors: 'Steering committee; ICMJE criteria agreed at kick-off', writer: 'P. Natarajan (sponsor), GPP 2022' },
  { id: 'a2', what: 'VERDANT-1 primary results', data: 'HRP-301 CSR', venue: 'Nordbay Dermatology Meeting 2027 (fictional)', type: 'Congress abstract and oral', target: '2027-03', status: 'Accepted', authors: 'As for the primary manuscript', writer: 'P. Natarajan (sponsor), GPP 2022' },
  { id: 'a3', what: 'VERDANT-1 primary results', data: 'HRP-301 CSR', venue: 'Lantern Dermatology Congress 2027', type: 'Encore poster', target: '2027-06', status: 'Planned', authors: 'As for the primary manuscript', writer: 'P. Natarajan (sponsor), GPP 2022' },
  { id: 'a4', what: 'HECSI-75 and itch: secondary outcomes in depth', data: 'HRP-301 CSR', venue: 'Lantern Clinical Dermatology', type: 'Secondary manuscript', target: '2027-01', status: 'In development', authors: 'Subset of the steering committee', writer: 'P. Natarajan (sponsor), GPP 2022', gap: 'order' },
  { id: 'a5', what: 'Infections in routine care (OSTREG)', data: 'OSTREG registry, 2027–2030', venue: 'Pell Pharmacoepidemiology', type: 'Primary manuscript', target: '2030-09', status: 'Planned', authors: 'Registry steering group', writer: 'None planned' },
  { id: 'a6', what: 'Patient-reported outcomes', data: 'HRP-301 CSR', venue: 'Orrin Quality of Life Research (fictional)', type: 'Secondary manuscript', target: '2027-09', status: 'Planned', authors: 'To be decided by the sponsor after drafting', writer: 'Corran Medical Communications', gap: 'authorship' },
  { id: 'a7', what: 'VERDANT-1 primary results', data: 'HRP-301 CSR', venue: 'Wexley Skin Week 2027 (fictional)', type: 'Encore poster', target: '2027-02', status: 'Planned', authors: 'As for the primary manuscript', writer: 'P. Natarajan (sponsor), GPP 2022', gap: 'encore' },
  { id: 'a8', what: 'VERDANT-AC (HRP-205), stopped early', data: 'HRP-205 abbreviated CSR', venue: '—', type: 'Not planned', target: '—', status: 'Not planned: "negative and stopped early"', authors: '—', writer: '—', gap: 'missing' },
  { id: 'a9', what: 'Plain language summary of the primary paper', data: 'Primary manuscript', venue: 'Fennick Journal of Dermatology', type: 'Plain language summary', target: '2027-04', status: 'Planned', authors: 'Primary authors with two patient partners', writer: 'P. Natarajan (sponsor), GPP 2022' },
  { id: 'a10', what: 'Cost-utility analysis', data: 'Model; VERDANT-1 utilities', venue: 'Orrin Journal of Health Economics', type: 'Primary manuscript', target: '2027-11', status: 'Planned', authors: 'Health economics team and two clinicians', writer: 'Undisclosed agency', gap: 'writer' },
]
export const GAPS: Record<string, { label: string; why: string }> = {
  order: { label: 'Out of order', why: 'A secondary paper is due before the primary results are published (2027-01 against 2027-03). GPP 2022: the primary results come first.' },
  encore: { label: 'Encore before the original', why: 'An encore poster in February 2027, before the first presentation in March 2027: an encore repeats an earlier presentation, so it cannot come first.' },
  missing: { label: 'Results not planned', why: 'HRP-205 stopped early, but its results must still be published or disclosed; leaving them out because they are negative is publication bias.' },
  authorship: { label: 'Authorship not agreed', why: 'Authorship is to be decided by the sponsor after drafting. GPP 2022 and ICMJE: authorship criteria are agreed by the team before writing starts.' },
  writer: { label: 'Writing support not disclosed', why: 'An "undisclosed agency" would write the paper: professional writing support must be named and acknowledged with its funding.' },
}
export function scoreRG14(flags: Record<string, string>) {
  const planted = PLAN_SEED.filter((r) => r.gap)
  const right = planted.filter((r) => flags[r.id] === r.gap).length
  const flaggedClean = PLAN_SEED.filter((r) => !r.gap && flags[r.id]).length
  const score = Math.max(0, Math.round((right / planted.length) * 100) - 10 * flaggedClean)
  return { score, passed: right === planted.length && flaggedClean === 0, detail: [`${right} of ${planted.length} gaps found and named; ${flaggedClean} rows flagged that have no gap`, ...planted.filter((r) => flags[r.id] !== r.gap).map((r) => `${r.what} (${r.venue}): ${GAPS[r.gap!].why}`)] }
}
export function planCsv(rows: PlanRow[]) {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`
  return ['Publication,Data source,Venue,Type,Target,Status,Authorship,Writing support', ...rows.map((r) => [r.what, r.data, r.venue, r.type, r.target, r.status, r.authors, r.writer].map(q).join(','))].join('\n')
}

// ---------------------------------------------------------------- plain language summary (RG16)
export const PLS_SOURCE_FORMAT = 'reporting-guideline-navigator/pls-source'
export const PLS_RETURN_FORMAT = 'plain-language-lab/publication-summary'
export const VERDANT1_CITATION = 'Rao A, Iyer S, Keller M, Okafor D, Brandt H. Lumiravostat for moderate to severe chronic hand eczema: the first 45 participants of VERDANT-1, a randomised, double-blind, placebo-controlled phase 3 trial. Fennick J Dermatol 2027 (fictional). doi:10.0000/fjd.2027.0045 (fictional).'
export function plsSource() {
  const p = (id: string) => VERDANT1.paras.find((x) => x.id === id)!.text
  const abstract = ['v-ab-bg', 'v-ab-methods', 'v-ab-results', 'v-ab-concl', 'v-ab-reg'].map((id) => `${VERDANT1.paras.find((x) => x.id === id)!.heading}: ${p(id)}`).join('\n')
  return { format: PLS_SOURCE_FORMAT, schema: 1, study: 'HRP-301', citation: VERDANT1_CITATION, abstract, funder: 'Halcyon Ridge Pharmaceuticals', sponsorAuthors: 3, journal: { name: 'Fennick Journal of Dermatology (fictional)', words: 300, headings: ['What is this summary about?', 'What did the researchers do?', 'What did they find?', 'What do the results mean?', 'Who paid for and wrote the study?', 'Where can I read the full article?'] }, note: 'Write the summary in the Plain Language Lab (Publication summary page, Open an article), then bring the finished summary back.' }
}
export interface PlsReturn { format: string; schema: number; study: string; citation: string; title: string; sections: Record<string, string>; panels: Record<string, string>; checks: { total: number; failed: string[] }; words: number; grade: number }
export function checkPlsReturn(j: Partial<PlsReturn>): { ok: boolean; problems: string[] } {
  const problems: string[] = []
  if (j?.format !== PLS_RETURN_FORMAT) problems.push('This is not a publication summary from the Plain Language Lab. Download it from its Publication summary page.')
  else {
    if (j.study !== 'HRP-301') problems.push(`The summary is for ${j.study}; it must summarise the VERDANT-1 first-cohort article.`)
    if (j.citation !== VERDANT1_CITATION) problems.push('The summary was written from a different article. In the Plain Language Lab, open the file this page gave you (Open an article) and write from it.')
    if ((j.checks?.failed ?? ['?']).length) problems.push(`Checks still failing in the Plain Language Lab: ${(j.checks?.failed ?? []).join(', ')}.`)
    if (!(typeof j.words === 'number' && j.words > 0 && j.words <= 300)) problems.push(`The summary has ${j.words} words; the journal allows 300.`)
    if (!(typeof j.grade === 'number' && j.grade <= 8)) problems.push(`The summary reads at grade ${j.grade}; aim for 8 or below.`)
  }
  return { ok: problems.length === 0, problems }
}
export function scoreRG16(p: Project) {
  if (!p.plsReturn) return { score: 0, passed: false, detail: ['No summary brought back from the Plain Language Lab yet.'] }
  const c = checkPlsReturn(p.plsReturn as Partial<PlsReturn>)
  return { score: c.ok ? 100 : 40, passed: c.ok, detail: c.ok ? ['Accepted: the Plain Language Lab summary of the VERDANT-1 article passes its checks.'] : c.problems }
}

// ---------------------------------------------------------------- certificate and Skills Passport
// The verification code is cyrb53 of the basis, the same method as the CSR & Narrative Studio and
// the other cyrb53 apps; the pharmolecule hub's Skills Passport recomputes it (verify.js, prefix RG-).
export const PASSPORT_KIND = 'pharmolecule/passport-record' as const
export const PASSPORT_PAGE = 'https://randomthingsonlineatsk-cloud.github.io/pharmolecule/passport.html'
export const APP_ID = 'reporting-guideline-navigator'
export const APP_NAME = 'Reporting Guideline Navigator'
const NOTICE = 'Portfolio certificate from a training app. Not an accreditation.'
export function hash(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677) }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
}
export const REQUIRED = MISSIONS.filter((m) => m.core).map((m) => m.id)
export interface Cert { eligible: boolean; distinction: boolean; basis: string; code: string; criteria: { label: string; met: boolean }[]; quizzes: number }
export function certificate(g: Progress): Cert {
  const passed = (id: string) => !!g.missions[id]?.passed
  const quizzes = LESSONS.filter((l) => (g.quizzes[l.id]?.score ?? 0) >= QUIZ_PASS).length
  const criteria = [...REQUIRED.map((id) => ({ label: `${id} ${MISSIONS.find((m) => m.id === id)?.title ?? ''} passed`, met: passed(id) })), { label: `All ${LESSONS.length} Learn quizzes passed (${QUIZ_PASS} of 8 or better)`, met: quizzes === LESSONS.length }]
  const eligible = criteria.every((c) => c.met)
  const distinction = eligible && MISSIONS.every((m) => passed(m.id))
  const basis = `${g.name.trim().toLowerCase()}|${MISSIONS.filter((m) => passed(m.id)).map((m) => `${m.id}:${g.missions[m.id].score}`).join(',')}|quiz:${quizzes}/${LESSONS.length}|${g.userId}`
  const h = hash(basis).slice(-10).toUpperCase()
  return { eligible, distinction, basis, code: `RG-${h.slice(0, 5)}-${h.slice(5)}`, criteria, quizzes }
}
export const sealOf = (rec: object) => { const { seal: _s, ...rest } = rec as Record<string, unknown>; void _s; return hash(JSON.stringify(rest)) }
export function passportRecord(c: Cert, g: Pick<Progress, 'name' | 'userId'>, issued = new Date().toISOString().slice(0, 10)) {
  const rec = { kind: PASSPORT_KIND, schema: 1, app: APP_ID, appName: APP_NAME, certificate: c.distinction ? 'Reporting guidelines and publication writing, with distinction' : 'Reporting guidelines and publication writing', appUrl: APP_URL, name: g.name.trim(), userId: g.userId, issued, basis: c.basis, code: c.code, criteria: c.criteria, distinction: c.distinction, alg: 'cyrb53' as const, notice: NOTICE }
  return { ...rec, seal: sealOf(rec) }
}
const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!)
export function certificateHtml(c: Cert, g: Progress, issued = new Date().toISOString().slice(0, 10)) {
  const rows = MISSIONS.map((m) => `<tr><td>${m.id}</td><td>${esc(m.title)}${m.core ? ' (core)' : ''}</td><td>${g.missions[m.id] ? `${g.missions[m.id].score}${g.missions[m.id].passed ? ', passed' : ''}` : '—'}</td></tr>`).join('')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Certificate: reporting guidelines and publication writing</title><style>body{font-family:Georgia,serif;max-width:46rem;margin:3rem auto;padding:2rem;border:6px double #333;color:#111}h1{font-size:1.6rem}table{border-collapse:collapse;width:100%;font:0.85rem sans-serif}td{border-bottom:1px solid #ccc;padding:0.3rem}code{font-size:1.1rem}.n{font:0.8rem sans-serif;color:#555}</style></head><body>
<p class="n">Reporting Guideline Navigator · training certificate</p><h1>Reporting guidelines and publication writing${c.distinction ? ', with distinction' : ''}</h1>
<p>This certifies that <b>${esc(g.name)}</b> chose reporting guidelines for study designs; checked manuscripts and a protocol against CONSORT 2025, SPIRIT 2025 and the guidelines for other designs; wrote a trial abstract to its limits with every number traced to the study outputs; applied the ICMJE authorship criteria, CRediT and GPP 2022; reconciled the disclosures and statements of a submission; and answered peer reviewers.</p>
<table>${rows}<tr><td></td><td>Learn quizzes</td><td>${c.quizzes} of ${LESSONS.length} passed</td></tr></table>
<p>Issued ${issued}. Verification code: <code>${c.code}</code></p>
<p class="n">Check it on the Regulatory Skills Passport: ${PASSPORT_PAGE}. ${NOTICE} All studies, products, journals and people are fictional.</p>
<p class="n">Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
}

// ---------------------------------------------------------------- journey step 13
export const HANDOFF_FORMAT = 'reporting-guideline-navigator-handoff'
/** The hand-off for step 13 of the Ostrevia journey: the VERDANT-1 submission pack, measured. */
export function journeyHandoff(p: Project) {
  const items = allItems(['consort-2025'])
  const untagged = items.filter((x) => !tagOf(p, x.key).status).map((x) => x.i.id)
  const missing = items.filter((x) => tagOf(p, x.key).status === 'missing').map((x) => x.i.id)
  const ab = p.abstracts.find((a) => a.venue === 'fennick')
  const abChecks = ab?.text.trim() ? checkAbstract(ab.text, venue('fennick'), 'HRP-301') : []
  const people = p.people ?? []
  const authors = people.filter((x) => p.rg4?.people[x.id]?.author)
  const fourOk = authors.filter((x) => ['c1', 'c2', 'c3', 'c4'].every((c) => p.rg4?.people[x.id]?.criteria[c as 'c1'])).length
  const reg = /NCT\d{8}/.exec(ab?.text ?? '')?.[0] ?? null
  return {
    format: HANDOFF_FORMAT, schema: 1, exportedUtc: new Date().toISOString(),
    study: { id: p.manuscriptId === 'verdant-1' ? 'HRP-301' : p.manuscriptId, project: p.name, kind: p.mission ? 'mission' : 'own' },
    consort: { items: items.length, untagged, missing },
    abstract: ab?.text.trim() ? { venue: 'fennick', failed: abChecks.filter((c) => !c.ok).map((c) => c.label), registration: reg } : null,
    registration: { expected: VERDANT1_REG.number },
    authorship: { authors: authors.length, meetingAllFour: fourOk },
    acknowledgement: { ok: checkWritingAck(p.rg4?.ack ?? '').ok },
  }
}
