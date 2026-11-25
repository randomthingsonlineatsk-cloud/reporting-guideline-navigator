// The claim-to-source pack: every claim in the manuscript tied to the output, document or
// reference that supports it, with the exact place; numbers checked against the output; references
// checked against a (fictional) list of retraction notices. Publications teams build this pack for
// the final review before sign-off.
import type { Project } from './types'
import { manuscriptOf } from './project'
import { DESIGN_NUMBERS, numbersIn, suggestOutputs, unsupportedNumbers, outputById } from './outputs'

export interface Claim { id: string; para: string; section: string; text: string }
export type SourceKind = 'output' | 'document' | 'reference' | ''
export interface Link { kind: SourceKind; output?: string; document?: string; ref?: string; location: string }
export interface Ref { id: string; text: string; doi: string }
export interface Notice { doi: string; kind: 'retraction' | 'expression of concern' | 'correction'; date: string; reason: string }

/** Fictional notices for fictional papers, standing in for a retraction database. */
export const NOTICES: Notice[] = [
  { doi: '10.0000/pjd.2024.118', kind: 'retraction', date: '2026-05-04', reason: 'Duplicated images in Figure 2; the authors could not supply the original data.' },
  { doi: '10.0000/ojmm.2023.077', kind: 'expression of concern', date: '2026-02-17', reason: 'Questions about the randomisation records at one site are under investigation.' },
  { doi: '10.0000/fjd.2025.031', kind: 'correction', date: '2025-11-30', reason: 'Table 3 had the placebo and active columns swapped; the conclusions do not change.' },
]
/** A reference list for the VERDANT-1 paper (all fictional), to start from. */
export const VERDANT1_REFS: Ref[] = [
  { id: '1', text: 'Holm T, Saari P. The burden of chronic hand eczema in working adults. Pell J Dermatol 2024;12:201-9.', doi: '10.0000/pjd.2024.118' },
  { id: '2', text: 'Mendez L, et al. Topical corticosteroid failure in hand eczema: a cohort study. Fennick J Dermatol 2025;8:44-52.', doi: '10.0000/fjd.2025.031' },
  { id: '3', text: 'Okafor D, Brandt H. STRK1 signalling in skin barrier repair. Orrin J Mol Dermatol 2023;5:310-8.', doi: '10.0000/ojmd.2023.212' },
  { id: '4', text: 'Iyer S, et al. Lumiravostat phase 2 dose-ranging study (HRP-201). Lantern Clin Dermatol 2025;3:77-86.', doi: '10.0000/lcd.2025.009' },
  { id: '5', text: 'Keller M. IGA-CHE: validation of a static global assessment for hand eczema. Fennick J Dermatol 2022;5:120-7.', doi: '10.0000/fjd.2022.140' },
  { id: '6', text: 'Brandt H, et al. Oral kinase inhibitors and infection risk: a meta-analysis. Orrin J Metab Med 2023;11:65-74.', doi: '10.0000/ojmm.2023.077' },
]
const CLAIMY = /\b(show(s|ed|n)?|improv|reduc|increas|decreas|associat|lead to|caus|effective|safe|tolerat|known|report(s|ed)?|previous|studies|trials?|evidence|burden|affects?|common|rare|higher|lower|more|fewer|similar|no clear|differen|benefit|risk|inhibit)/i
const sentences = (t: string) => t.split(/(?<=[.!?])\s+(?=[A-Z(])/).map((s) => s.trim()).filter((s) => s.length > 15)
export function extractClaims(p: Project): Claim[] {
  const m = manuscriptOf(p)
  const out: Claim[] = []
  for (const para of m.paras) {
    if (!/^(Abstract|Introduction|Background|Results|Discussion|Conclusions?)/i.test(para.section)) continue
    sentences(para.text).forEach((s, i) => {
      const nums = numbersIn(s).filter((n) => !DESIGN_NUMBERS.test(n.replace(/^-/, '')))
      if (nums.length || CLAIMY.test(s)) out.push({ id: `${para.id}#${i + 1}`, para: para.id, section: para.section, text: s })
    })
  }
  return out
}
export const noticeFor = (doi: string) => NOTICES.find((n) => n.doi.toLowerCase() === doi.trim().toLowerCase())
export function parseRefs(text: string): Ref[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => {
    const m = /^\[?(\d+)[\].)]\s*(.+)$/.exec(l), body = m ? m[2] : l
    const doi = /\b(10\.\d{4,9}\/[^\s;,]+[^\s;,.])/i.exec(body)?.[1] ?? ''
    return { id: m ? m[1] : String(i + 1), text: body.replace(/\s*(doi:\s*)?10\.\d{4,9}\/\S+\s*$/i, '').trim(), doi }
  })
}
export interface ClaimCheck { ok: boolean; problems: string[]; suggest: string[] }
export function checkClaim(c: Claim, l: Link | undefined, refs: Ref[]): ClaimCheck {
  const problems: string[] = [], nums = numbersIn(c.text).filter((n) => !DESIGN_NUMBERS.test(n.replace(/^-/, '')))
  const suggest = suggestOutputs(c.text)
  if (!l || !l.kind) return { ok: false, problems: ['Not linked to a source.'], suggest }
  if (l.kind === 'output') {
    if (!outputById(l.output ?? '')) problems.push('Choose the output.')
    else { const miss = unsupportedNumbers(c.text, [l.output!]); if (miss.length) problems.push(`${miss.join(', ')} not in ${outputById(l.output!)!.title.replace(/:.*/, '')}.`) }
    if (!l.location.trim()) problems.push('Give the row or cell (for example "row: treatment success, 25 mg").')
  }
  if (l.kind === 'document') { if ((l.document ?? '').trim().length < 3) problems.push('Name the document (protocol, SAP, CSR).'); if (!/\b(section|§|page|p\.|table|figure|appendix)\s*\S/i.test(l.location)) problems.push('Give the section, table or page.') }
  if (l.kind === 'reference') {
    const r = refs.find((x) => x.id === l.ref)
    if (!r) problems.push('Choose the reference.')
    else {
      const n = noticeFor(r.doi)
      if (n?.kind === 'retraction') problems.push(`Reference ${r.id} was retracted on ${n.date}: ${n.reason} Find another source or remove the claim.`)
      if (n?.kind === 'expression of concern') problems.push(`Reference ${r.id} has an expression of concern (${n.date}): ${n.reason} Say so, or use another source.`)
      if (nums.length && !/\b(page|p\.|table|figure|fig\.|abstract|results)\b/i.test(l.location)) problems.push('A number from a paper needs the page, table or figure it is on.')
    }
    if (!l.location.trim()) problems.push('Give where in the paper (page, table or figure).')
  }
  return { ok: problems.length === 0, problems, suggest }
}
export function checkRefs(refs: Ref[], links: Record<string, Link>) {
  const cited = new Set(Object.values(links).filter((l) => l.kind === 'reference').map((l) => l.ref))
  return refs.map((r) => {
    const n = noticeFor(r.doi), p: string[] = []
    if (!/^10\.\d{4,9}\/\S+$/.test(r.doi.trim())) p.push('No DOI, or not a DOI.')
    if (n) p.push(`${n.kind[0].toUpperCase()}${n.kind.slice(1)}, ${n.date}: ${n.reason}`)
    if (!cited.has(r.id)) p.push('Not linked to any claim yet.')
    return { ref: r, notice: n, problems: p }
  })
}
export function packSummary(claims: Claim[], links: Record<string, Link>, refs: Ref[]) {
  const checks = claims.map((c) => checkClaim(c, links[c.id], refs))
  const linked = checks.filter((c, i) => links[claims[i].id]?.kind).length, ok = checks.filter((c) => c.ok).length
  const retracted = checkRefs(refs, links).filter((r) => r.notice?.kind === 'retraction' && Object.values(links).some((l) => l.kind === 'reference' && l.ref === r.ref.id)).map((r) => r.ref.id)
  return { claims: claims.length, linked, ok, retracted, ready: claims.length > 0 && ok === claims.length && retracted.length === 0 }
}
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
export function packHtml(title: string, claims: Claim[], links: Record<string, Link>, refs: Ref[]): string {
  const src = (l?: Link) => !l?.kind ? '<i>none</i>' : l.kind === 'output' ? esc(outputById(l.output ?? '')?.title ?? '') : l.kind === 'document' ? esc(l.document ?? '') : `Reference ${esc(l.ref ?? '')}`
  const s = packSummary(claims, links, refs)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Claim-to-source pack</title><style>body{font:10pt Arial,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:4px;vertical-align:top;text-align:left}th{background:#eee}.x{color:#a33}</style></head><body><h1>Claim-to-source pack</h1><p>${esc(title)}</p><p>${s.ok} of ${s.claims} claims supported${s.retracted.length ? `; cites retracted reference ${s.retracted.join(', ')}` : ''}.</p><table><tr><th>#</th><th>Section</th><th>Claim</th><th>Source</th><th>Where</th><th>Check</th></tr>${claims.map((c, i) => { const k = checkClaim(c, links[c.id], refs); return `<tr><td>${i + 1}</td><td>${esc(c.section)}</td><td>${esc(c.text)}</td><td>${src(links[c.id])}</td><td>${esc(links[c.id]?.location ?? '')}</td><td class="${k.ok ? '' : 'x'}">${k.ok ? 'Supported' : esc(k.problems.join(' '))}</td></tr>` }).join('')}</table><h2>References</h2><ol>${checkRefs(refs, links).map((r) => `<li value="${esc(r.ref.id)}">${esc(r.ref.text)} doi:${esc(r.ref.doi)}${r.notice ? ` <b class="x">${esc(r.notice.kind)} (${r.notice.date})</b>` : ''}</li>`).join('')}</ol><p style="font-size:8pt">Training document. Fictional study, papers and notices. Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
}
