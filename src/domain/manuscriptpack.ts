// The learner's own manuscript pack (additions to Phase 3): author order and the byline with a
// group name and collaborators; the statements with live rules; the registration read from the
// Protocol Builder; the title page; and the revision record that ties every change to a reviewer
// comment. All rules are written here; nothing is sent anywhere.
import type { Project } from './types'
import { manuscriptOf } from './project'

const wc = (s: string) => s.split(/\s+/).filter(Boolean).length
const strip = (s: string) => s.replace(/\s*\(fictional\)\s*/gi, '').trim()
export interface Rule { id: string; label: string; ok: boolean; why?: string; level?: 'error' | 'warn' }

// ---------------------------------------------------------------- authors, byline and group
export type GroupMode = 'none' | 'and' | 'for' | 'only'
export interface Byline {
  order: string[]
  corresponding?: string
  email?: string
  address?: string
  affiliations: Record<string, string>
  group?: string
  groupMode: GroupMode
  /** Non-author collaborators (members of the group who are not in the byline), one per line: "Name, place: what they did". */
  collaborators: string
}
export const blankByline = (): Byline => ({ order: [], affiliations: {}, groupMode: 'none', collaborators: '' })
export const GROUP_MODES: { id: GroupMode; label: string; example: string }[] = [
  { id: 'none', label: 'No group name', example: 'A Rao, S Iyer, M Keller' },
  { id: 'and', label: 'Authors and the group', example: 'A Rao, S Iyer, and the VERDANT-1 Investigators' },
  { id: 'for', label: 'Authors writing for the group', example: 'A Rao, S Iyer, for the VERDANT-1 Investigators' },
  { id: 'only', label: 'The group alone', example: 'The VERDANT-1 Investigators' },
]

export interface Person { id: string; name: string }
/** The authors as decided on the Authorship page, in byline order (anyone not yet ordered goes last). */
export function orderedAuthors(people: Person[], isAuthor: (id: string) => boolean, b: Byline): Person[] {
  const authors = people.filter((x) => isAuthor(x.id))
  const known = b.order.map((id) => authors.find((x) => x.id === id)).filter(Boolean) as Person[]
  return [...known, ...authors.filter((x) => !b.order.includes(x.id))]
}
export function bylineText(authors: Person[], b: Byline): string {
  const names = authors.map((x) => x.name)
  const list = names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')}${b.groupMode === 'none' ? ' and ' : ', '}${names.at(-1)}`
  const g = b.group?.trim()
  if (b.groupMode === 'only') return g ? `The ${g.replace(/^the /i, '')}` : ''
  if (b.groupMode === 'and' && g) return `${list}, and the ${g.replace(/^the /i, '')}`
  if (b.groupMode === 'for' && g) return `${list}, for the ${g.replace(/^the /i, '')}`
  return list
}
export function checkByline(authors: Person[], b: Byline): Rule[] {
  const g = b.group?.trim() ?? '', collab = b.collaborators.split('\n').filter((l) => l.trim())
  const corr = authors.find((x) => x.id === b.corresponding)
  return [
    { id: 'B1', label: 'At least one author decided on the Authorship page', ok: authors.length > 0, why: 'Tick the four ICMJE criteria and mark the authors first.' },
    { id: 'B2', label: 'Every author has an affiliation', ok: authors.length > 0 && authors.every((x) => (b.affiliations[x.id] ?? '').trim().length > 3), why: `Missing for: ${authors.filter((x) => (b.affiliations[x.id] ?? '').trim().length <= 3).map((x) => x.name).join(', ')}` },
    { id: 'B3', label: 'A corresponding author who is in the byline', ok: !!corr, why: 'Choose one of the authors. The corresponding author handles the journal\'s questions during and after review.' },
    { id: 'B4', label: 'The corresponding author\'s email and postal address', ok: /^\S+@\S+\.\S+$/.test(b.email?.trim() ?? '') && (b.address ?? '').trim().length > 8 },
    { id: 'B5', label: 'A group name when the byline uses one', ok: b.groupMode === 'none' || g.length > 3, why: 'Name the group, for example the VERDANT-1 Investigators.' },
    { id: 'B6', label: 'Group members listed as collaborators, with where they work and what they did', ok: b.groupMode === 'none' || (collab.length > 0 && collab.every((l) => /,.+:/.test(l))), why: 'One per line: "Name, place: what they did". Listing them in the article lets the indexes record them as collaborators.' },
    { id: 'B7', label: 'A group as the only author names who takes responsibility', ok: b.groupMode !== 'only' || collab.some((l) => /writing (committee|group)|responsib/i.test(l)), why: 'When the group is the sole author, say which members meet the authorship criteria and take responsibility (for example a writing committee).' },
    { id: 'B8', label: 'No collaborator is also in the byline', ok: !collab.some((l) => authors.some((a) => l.toLowerCase().startsWith(a.name.toLowerCase().replace(/,.*$/, '')))), why: 'An author is not listed again as a collaborator.' },
  ]
}

// ---------------------------------------------------------------- registration from the Protocol Builder
export interface Registration { from: 'protocol-builder'; file: string; protocolId: string; acronym: string; title: string; numbers: { nct?: string; euct?: string; ctri?: string } }
/** Reads the Protocol Builder's project file or its application bundle. */
export function readProtocolBuilder(j: unknown, file = ''): Registration {
  const o = j as Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  let t: Record<string, string> | null = null
  if (o?.format === 'protocol-builder-application-bundle') {
    const pr = o.protocol ?? {}
    t = { 'Sponsor Protocol Identifier': pr.id, 'Trial Acronym': pr.acronym, 'Full Title': pr.title, 'NCT Number': pr.nctNumber, 'EU CT Number': pr.euCtNumber, 'CTRI Number': pr.ctriNumber }
  } else if (o?.format === 'protocol-builder-project') {
    const proj = o.project ?? o
    t = proj?.versions?.at?.(-1)?.data?.title ?? null
  }
  if (!t) throw new Error('This is not a Protocol Builder file. Use its project file or its application bundle (Export page).')
  const n = (k: string) => (t![k] ? strip(String(t![k])) : undefined)
  const r: Registration = { from: 'protocol-builder', file, protocolId: n('Sponsor Protocol Identifier') ?? '', acronym: n('Trial Acronym') ?? '', title: n('Full Title') ?? '', numbers: { nct: n('NCT Number'), euct: n('EU CT Number'), ctri: n('CTRI Number') } }
  if (!r.numbers.nct && !r.numbers.euct && !r.numbers.ctri) throw new Error('The protocol has no registration number yet. Add the NCT, EU CT or CTRI number on its title page in the Protocol Builder.')
  return r
}

// ---------------------------------------------------------------- statements
export type Registry = 'ClinicalTrials.gov' | 'EU CTIS' | 'CTRI' | 'ISRCTN' | 'Other'
export interface Statements {
  registry: Registry; number: string; registered: string; firstEnrolment: string; retroReason: string
  dataSharing: string
  aiUsed: boolean; aiTool: string; aiHow: string; aiAuthor: boolean
  funding: string; ethics: string
}
export const blankStatements = (): Statements => ({ registry: 'ClinicalTrials.gov', number: '', registered: '', firstEnrolment: '', retroReason: '', dataSharing: '', aiUsed: false, aiTool: '', aiHow: '', aiAuthor: false, funding: '', ethics: '' })
const FORMATS: Record<Registry, RegExp> = { 'ClinicalTrials.gov': /^NCT\d{8}$/, 'EU CTIS': /^\d{4}-5\d{5}-\d{2}-\d{2}$/, CTRI: /^CTRI\/\d{4}\/\d{2,3}\/\d{6}$/, ISRCTN: /^ISRCTN\d{8}$/, Other: /\S{4,}/ }
const pbNumber = (r: Registration, reg: Registry) => (reg === 'ClinicalTrials.gov' ? r.numbers.nct : reg === 'EU CTIS' ? r.numbers.euct : reg === 'CTRI' ? r.numbers.ctri : undefined)

export function checkStatements(s: Statements, reg?: Registration, abstractText?: string, aiLogEntries = 0): Rule[] {
  const retro = !!s.registered && !!s.firstEnrolment && s.registered > s.firstEnrolment
  const num = s.number.trim(), pb = reg ? pbNumber(reg, s.registry) : undefined
  const abNum = abstractText ? (/NCT\d{8}|\d{4}-5\d{5}-\d{2}-\d{2}|CTRI\/\d{4}\/\d{2,3}\/\d{6}|ISRCTN\d{8}/.exec(abstractText)?.[0] ?? null) : undefined
  const ds = s.dataSharing.trim()
  return [
    { id: 'S1', label: 'Registry and number in the registry\'s format', ok: FORMATS[s.registry].test(num), level: 'error', why: num ? `“${num}” is not a ${s.registry} number.` : 'Give the registration number.' },
    { id: 'S2', label: 'Registration and first enrolment dates', ok: !!s.registered && !!s.firstEnrolment, level: 'error' },
    { id: 'S3', label: 'Registered at or before the first participant was enrolled', ok: !retro || s.retroReason.trim().length > 20, level: retro ? 'warn' : 'error', why: retro ? 'Retrospective registration: the ICMJE asks for registration at or before the first enrolment. Say in the paper when and why it was registered late; editors may still decline it.' : '' },
    { id: 'S4', label: 'The number matches the protocol in the Protocol Builder', ok: !reg || !pb || pb === num, level: 'error', why: reg ? (pb ? `The Protocol Builder file gives ${pb}.` : `The Protocol Builder file has no ${s.registry} number.`) : '' },
    { id: 'S5', label: 'The abstract gives the same number', ok: abNum === undefined || abNum === num, level: 'error', why: abNum === null ? 'The abstract has no registration number.' : `The abstract gives ${abNum}.` },
    { id: 'S6', label: 'Data sharing: says what is shared, when, with whom and how (not "undecided")', ok: ds.length > 40 && !/\b(undecided|not (yet )?decided|to be (decided|determined)|tbd|will decide)\b/i.test(ds) && /\b(no|not|will|available|shared?|request|repository)\b/i.test(ds), level: 'error', why: /undecided|not (yet )?decided|to be (decided|determined)|tbd/i.test(ds) ? 'The ICMJE does not accept "undecided": state the plan, even if it is that data will not be shared, and why.' : 'Say whether individual participant data will be shared, which data, from when, with whom, and by what route.' },
    { id: 'S7', label: 'AI use disclosed: the tool and what it was used for', ok: !s.aiUsed || (s.aiTool.trim().length > 1 && s.aiHow.trim().length > 10), level: 'error' },
    { id: 'S7b', label: 'Matches the AI use log', ok: aiLogEntries === 0 || s.aiUsed, level: 'error', why: `The AI use log has ${aiLogEntries} entr${aiLogEntries === 1 ? 'y' : 'ies'}; disclose them (Fill from the AI use log).` },
    { id: 'S8', label: 'No AI tool listed as an author', ok: !s.aiAuthor, level: 'error', why: 'AI tools cannot be authors: they cannot take responsibility or approve the work. Disclose the use and keep the authors responsible.' },
    { id: 'S9', label: 'Funding: the funder, the grant if any, and the funder\'s role', ok: s.funding.trim().length > 20 && /role|design|no part|not involved|involved/i.test(s.funding), level: 'error' },
    { id: 'S10', label: 'Ethics: the committee that approved it and consent', ok: /committee|board|IRB|IEC|REC/i.test(s.ethics) && /consent/i.test(s.ethics), level: 'error' },
  ]
}
export function statementsText(s: Statements, coi: string): string {
  return [
    `Trial registration: ${s.registry} ${s.number.trim()}, registered ${s.registered}${s.registered && s.firstEnrolment && s.registered > s.firstEnrolment ? ` (after the first enrolment on ${s.firstEnrolment}: ${s.retroReason.trim()})` : ''}.`,
    `Funding: ${s.funding.trim()}`,
    `Competing interests: ${coi}`,
    `Ethics: ${s.ethics.trim()}`,
    `Data sharing: ${s.dataSharing.trim()}`,
    `Use of AI: ${s.aiUsed ? `${s.aiTool.trim()} was used to ${s.aiHow.trim().replace(/^to /i, '')}. The authors reviewed and edited the output and take full responsibility for the content.` : 'No AI tools were used in writing this article.'}`,
  ].join('\n')
}

// ---------------------------------------------------------------- title page
export interface TitlePageInfo { running: string; keywords: string; tables: number; figures: number }
export const blankTitlePage = (): TitlePageInfo => ({ running: '', keywords: '', tables: 0, figures: 0 })
export function wordCounts(p: Project) {
  const m = manuscriptOf(p)
  const main = m.paras.filter((x) => !/^(Title|Abstract|References?|Acknowledg|Funding|Declarations?)/i.test(x.section)).map((x) => x.text).join(' ')
  const ab = p.abstracts.find((a) => a.text.trim())?.text ?? m.paras.filter((x) => /^Abstract/i.test(x.section)).map((x) => x.text).join(' ')
  return { title: m.paras.find((x) => x.section === 'Title' && !x.heading)?.text ?? m.title, main: wc(main), abstract: wc(ab) }
}
export function checkTitlePage(p: Project, authors: Person[], b: Byline, t: TitlePageInfo, s?: Statements): Rule[] {
  const w = wordCounts(p)
  return [
    { id: 'T1', label: 'The full title', ok: wc(w.title) >= 6 },
    { id: 'T2', label: 'A running title of 40 characters or fewer', ok: t.running.trim().length > 3 && t.running.trim().length <= 40, why: `${t.running.trim().length} characters.` },
    { id: 'T3', label: 'Every author with an affiliation', ok: checkByline(authors, b).find((r) => r.id === 'B2')!.ok },
    { id: 'T4', label: 'The corresponding author with email and address', ok: !!authors.find((x) => x.id === b.corresponding) && checkByline(authors, b).find((r) => r.id === 'B4')!.ok },
    { id: 'T5', label: 'Word counts for the abstract and the main text', ok: w.main > 0 && w.abstract > 0 },
    { id: 'T6', label: 'The number of tables and figures', ok: t.tables + t.figures > 0 },
    { id: 'T7', label: '3 to 6 keywords', ok: (() => { const k = t.keywords.split(/[;,]/).filter((x) => x.trim()).length; return k >= 3 && k <= 6 })() },
    { id: 'T8', label: 'The registration number', ok: !!s && FORMATS[s.registry].test(s.number.trim()) },
  ]
}
const esc = (x: string) => x.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
export function titlePageHtml(p: Project, authors: Person[], b: Byline, t: TitlePageInfo, s?: Statements): string {
  const w = wordCounts(p)
  const places = [...new Set(authors.map((a) => (b.affiliations[a.id] ?? '').trim()).filter(Boolean))]
  const sup = (a: Person) => places.indexOf((b.affiliations[a.id] ?? '').trim()) + 1
  const corr = authors.find((x) => x.id === b.corresponding)
  const names = b.groupMode === 'only' ? esc(bylineText(authors, b)) : authors.map((a) => `${esc(a.name)}<sup>${sup(a) || ''}</sup>`).join(', ') + (b.groupMode !== 'none' && b.group ? `, ${b.groupMode === 'for' ? 'for' : 'and'} the ${esc(b.group.replace(/^the /i, ''))}` : '')
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Title page</title><style>body{font:12pt/1.5 Georgia,serif;max-width:42rem;margin:3rem auto;padding:0 1rem}h1{font-size:1.4rem}p{margin:.5rem 0}.s{font:10pt Arial,sans-serif;color:#444}</style></head><body>
<p class="s">Title page</p><h1>${esc(w.title)}</h1><p><b>Running title:</b> ${esc(t.running)}</p><p>${names}</p>
<ol>${places.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
<p><b>Corresponding author:</b> ${corr ? `${esc(corr.name)}, ${esc(b.address ?? '')}; ${esc(b.email ?? '')}` : ''}</p>
<p><b>Word counts:</b> abstract ${w.abstract}; main text ${w.main}. <b>Tables:</b> ${t.tables}. <b>Figures:</b> ${t.figures}.</p>
<p><b>Keywords:</b> ${esc(t.keywords)}</p>
${s ? `<p><b>Trial registration:</b> ${esc(s.registry)} ${esc(s.number)}</p>` : ''}
${b.groupMode !== 'none' && b.collaborators.trim() ? `<p><b>Collaborators (${esc(b.group ?? '')}):</b> listed in the appendix.</p>` : ''}
<p class="s">Training document from the Reporting Guideline Navigator. Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
}

// ---------------------------------------------------------------- revision record
export interface Revision { id: string; ref: string; comment: string; action: 'changed' | 'not changed' | ''; where: string; newText: string; reason: string }
export const blankRevision = (n: number): Revision => ({ id: `r${Date.now().toString(36)}${n}`, ref: '', comment: '', action: '', where: '', newText: '', reason: '' })
/** Paste comments one per line, optionally numbered "R1.2: …"; each becomes a row. */
export function revisionsFrom(text: string): Revision[] {
  let r = 0, c = 0
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const m = /^(R(\d+)\.(\d+)|Reviewer\s+(\d+),?\s+comment\s+(\d+))\s*[:.)-]\s*(.+)$/i.exec(l)
    if (m) { r = Number(m[2] ?? m[4]); c = Number(m[3] ?? m[5]) } else c++
    return { ...blankRevision(i), ref: `R${r || 1}.${c}`, comment: m ? m[6] : l }
  })
}
export function checkRevision(x: Revision): Rule[] {
  const r: Rule[] = [
    { id: 'V1', label: 'Linked to a numbered reviewer comment', ok: /^R\d+\.\d+$/.test(x.ref.trim()) && x.comment.trim().length > 5 },
    { id: 'V2', label: 'Says whether the paper changed', ok: x.action !== '' },
  ]
  if (x.action === 'changed') r.push({ id: 'V3', label: 'Says where the change is and quotes the new text', ok: /\b(page|p\.|line|section|paragraph|table|figure|abstract|methods|results|discussion|introduction|supplement)\b/i.test(x.where) && x.newText.trim().length > 10 })
  if (x.action === 'not changed') r.push({ id: 'V4', label: 'Gives the reason, with the evidence', ok: x.reason.trim().length > 20 })
  return r
}
export function checkRevisions(rows: Revision[]) {
  const refs = rows.map((r) => r.ref.trim()), dup = refs.filter((r, i) => r && refs.indexOf(r) !== i)
  const open = rows.filter((r) => checkRevision(r).some((c) => !c.ok)).map((r) => r.ref || '(no number)')
  return { ok: rows.length > 0 && !dup.length && !open.length, dup: [...new Set(dup)], open }
}
export function revisionHtml(rows: Revision[], title: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Revision record</title><style>body{font:11pt Arial,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:5px;vertical-align:top;text-align:left}th{background:#eee}</style></head><body><h1>Revision record</h1><p>${esc(title)}</p><table><tr><th>Comment</th><th>Reviewer's point</th><th>Response</th><th>Where</th><th>New text</th></tr>${rows.map((r) => `<tr><td>${esc(r.ref)}</td><td>${esc(r.comment)}</td><td>${r.action === 'changed' ? 'Changed' : `Not changed: ${esc(r.reason)}`}</td><td>${esc(r.where)}</td><td>${r.newText ? `“${esc(r.newText)}”` : ''}</td></tr>`).join('')}</table><p style="font-size:9pt">Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
}
