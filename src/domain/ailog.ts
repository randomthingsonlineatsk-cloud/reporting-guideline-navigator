// The AI use log for a manuscript: every use of an AI tool, what went in, what it did, and the
// named person who checked the output. The disclosure text is written from it, split the way the
// ICMJE asks: writing help in the acknowledgements, use in the research itself in the methods.
// (ISMPP's 2023 position and its September 2025 enhanced guidance ask for the same transparency and
// human oversight.)
export type AiTask = 'search' | 'summarise' | 'draft' | 'language' | 'translate' | 'references' | 'analysis' | 'figure' | 'review'
export type AiInput = 'public' | 'unpublished' | 'confidential' | 'personal'
export interface AiEntry { id: string; date: string; tool: string; version: string; task: AiTask; section: string; purpose: string; input: AiInput; approved: boolean; checkedBy: string; checkedDate: string; verification: string }
export const TASKS: { id: AiTask; label: string; place: 'acknowledgements' | 'methods' | 'none'; verb: string }[] = [
  { id: 'language', label: 'Language editing', place: 'acknowledgements', verb: 'edit the language of' },
  { id: 'draft', label: 'Drafting text', place: 'acknowledgements', verb: 'draft parts of' },
  { id: 'summarise', label: 'Summarising sources', place: 'acknowledgements', verb: 'summarise sources for' },
  { id: 'translate', label: 'Translation', place: 'acknowledgements', verb: 'translate' },
  { id: 'references', label: 'Formatting references', place: 'acknowledgements', verb: 'format the references in' },
  { id: 'search', label: 'Literature searching', place: 'methods', verb: 'search the literature for' },
  { id: 'analysis', label: 'Data analysis or code', place: 'methods', verb: 'write analysis code for' },
  { id: 'figure', label: 'Creating or changing images of data', place: 'none', verb: 'create images for' },
  { id: 'review', label: 'Peer reviewing a manuscript', place: 'none', verb: 'review' },
]
export const INPUTS: { id: AiInput; label: string }[] = [
  { id: 'public', label: 'Published or public material only' }, { id: 'unpublished', label: 'Unpublished results or drafts' },
  { id: 'confidential', label: 'Confidential sponsor documents' }, { id: 'personal', label: 'Participant-level or personal data' },
]
export const blankEntry = (n: number): AiEntry => ({ id: `ai${Date.now().toString(36)}${n}`, date: '', tool: '', version: '', task: 'language', section: '', purpose: '', input: 'public', approved: false, checkedBy: '', checkedDate: '', verification: '' })
export interface AiRule { id: string; label: string; ok: boolean; why?: string }
const date = /^\d{4}-\d{2}-\d{2}$/

export function checkEntry(e: AiEntry, people: string[]): AiRule[] {
  const known = people.map((x) => x.toLowerCase().trim())
  const r: AiRule[] = [
    { id: 'L1', label: 'Tool, version and date', ok: e.tool.trim().length > 1 && e.version.trim().length > 0 && date.test(e.date) },
    { id: 'L2', label: 'What it was used for, and where in the manuscript', ok: e.purpose.trim().length > 10 && e.section.trim().length > 2 },
    { id: 'L3', label: 'Checked by a named person on the team, on or after the date of use', ok: !!e.checkedBy.trim() && (known.length === 0 || known.includes(e.checkedBy.toLowerCase().trim())) && date.test(e.checkedDate) && e.checkedDate >= e.date, why: e.checkedBy && known.length && !known.includes(e.checkedBy.toLowerCase().trim()) ? `${e.checkedBy} is not one of the contributors.` : '' },
    { id: 'L4', label: 'How the output was checked', ok: e.verification.trim().length > 20 && (e.task !== 'references' || /\b(each|every|all|against|sources?|original)\b/i.test(e.verification)) && (e.task !== 'search' || /\b(screened|screening|read|checked|reviewed)\b/i.test(e.verification)), why: e.task === 'references' ? 'Say that every reference was checked against its source; AI tools invent references.' : e.task === 'search' ? 'Say that a person screened the results.' : '' },
  ]
  if (e.task === 'figure') r.push({ id: 'L5', label: 'No AI-made or AI-changed images of data', ok: false, why: 'Images of results must come from the data. Redraw the figure from the analysis outputs.' })
  if (e.task === 'review') r.push({ id: 'L6', label: 'No manuscript under review put into an AI tool', ok: false, why: 'A manuscript under review is confidential: reviewers ask the journal before using AI, and most journals forbid uploading it.' })
  if (e.input === 'confidential' || e.input === 'unpublished') r.push({ id: 'L7', label: 'Confidential or unpublished material only in a tool your organisation has approved', ok: e.approved, why: 'Use a tool approved for confidential data, or leave the material out.' })
  if (e.input === 'personal') r.push({ id: 'L8', label: 'No participant-level or personal data in an AI tool', ok: false, why: 'Personal data stays in the validated systems; use summaries from the outputs.' })
  return r
}
export function checkLog(log: AiEntry[], people: string[]) {
  const per = log.map((e) => ({ e, rules: checkEntry(e, people) }))
  return { ok: per.every((x) => x.rules.every((r) => r.ok)), open: per.filter((x) => x.rules.some((r) => !r.ok)).length, per }
}
const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`)
/** The disclosure, from the log: one sentence per tool, in the place the ICMJE asks for. */
export function disclosure(log: AiEntry[]): { acknowledgements: string; methods: string; tools: string; uses: string } {
  const part = (place: 'acknowledgements' | 'methods') => {
    const es = log.filter((e) => TASKS.find((t) => t.id === e.task)?.place === place)
    const tools = [...new Set(es.map((e) => `${e.tool.trim()} (${e.version.trim()})`))]
    if (!tools.length) return ''
    const lines = tools.map((tl) => { const mine = es.filter((e) => `${e.tool.trim()} (${e.version.trim()})` === tl); return `${tl} was used to ${list([...new Set(mine.map((e) => `${TASKS.find((t) => t.id === e.task)!.verb} ${e.section.trim()}`))])}` })
    const who = [...new Set(es.map((e) => e.checkedBy.trim()).filter(Boolean))]
    return `${lines.join('; ')}. ${list(who)} checked the output${place === 'methods' ? ' against the source data' : ''}; the authors take full responsibility for the content.`
  }
  return {
    acknowledgements: part('acknowledgements'), methods: part('methods'),
    tools: [...new Set(log.map((e) => `${e.tool.trim()} (${e.version.trim()})`))].join('; '),
    uses: [...new Set(log.map((e) => `${TASKS.find((t) => t.id === e.task)!.verb} ${e.section.trim()}`))].join('; '),
  }
}
