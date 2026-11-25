// Congress talks, embargoes and encores. Two fictional congresses with their own rules; an oral
// presentation with a title slide, a disclosure slide, a slide limit and timed notes; an embargo
// checker for everything said about the data around the congress; and an encore tracker built from
// the publication plan.
import { unsupportedNumbers, OUTPUTS } from './outputs'
import { claimProblems, LEXICON_SEED, type LexTerm } from './platform'
import type { PlanRow } from './phase4'

export interface Congress { id: string; name: string; slotMin: number; qaMin: number; tz: string; abstractRelease: string; talkStart: string; lateBreaking: boolean; photoPolicy: string; note: string }
export const CONGRESSES: Congress[] = [
  { id: 'nordbay', name: 'Nordbay Dermatology Meeting 2027 (fictional)', slotMin: 10, qaMin: 5, tz: '+01:00', abstractRelease: '2027-03-08T09:00+01:00', talkStart: '2027-03-12T10:30+01:00', lateBreaking: false, photoPolicy: 'No photographs or recordings of slides without the presenter\'s permission.', note: 'Abstracts go online at 09:00 congress time on 8 March; the data in them are embargoed until then. Data added after the abstract (the talk itself) are embargoed until the talk starts.' },
  { id: 'lantern', name: 'Lantern Dermatology Congress 2027 (fictional)', slotMin: 8, qaMin: 4, tz: '+02:00', abstractRelease: '2027-06-14T10:30+02:00', talkStart: '2027-06-14T10:30+02:00', lateBreaking: true, photoPolicy: 'Photographs of slides are not allowed; the presenter may share approved slides afterwards.', note: 'A late-breaking session: the abstract and all data are embargoed until the session starts at 10:30 congress time on 14 June.' },
]
export const congress = (id: string) => CONGRESSES.find((c) => c.id === id) ?? CONGRESSES[0]

export type SlideKind = 'title' | 'disclosure' | 'background' | 'methods' | 'results' | 'safety' | 'conclusion' | 'acknowledgement'
export interface Slide { id: string; kind: SlideKind; title: string; body: string; notes: string }
export interface Talk { congress: string; presenter: string; encore: string; slides: Slide[] }
export const SLIDE_KINDS: { id: SlideKind; label: string }[] = [
  { id: 'title', label: 'Title' }, { id: 'disclosure', label: 'Disclosures' }, { id: 'background', label: 'Background' }, { id: 'methods', label: 'Methods' },
  { id: 'results', label: 'Results' }, { id: 'safety', label: 'Safety' }, { id: 'conclusion', label: 'Conclusions' }, { id: 'acknowledgement', label: 'Acknowledgements' },
]
let n = 0
const slide = (kind: SlideKind, title = ''): Slide => ({ id: `sl${Date.now().toString(36)}${n++}`, kind, title, body: '', notes: '' })
export const blankTalk = (): Talk => ({ congress: 'nordbay', presenter: '', encore: '', slides: [slide('title'), slide('disclosure', 'Disclosures'), slide('background', 'Background'), slide('methods', 'Methods'), slide('results', 'Results'), slide('safety', 'Safety'), slide('conclusion', 'Conclusions'), slide('acknowledgement', 'Acknowledgements')] })
export const newSlide = (kind: SlideKind) => slide(kind)

export const WPM = 130
const wc = (s: string) => s.split(/\s+/).filter(Boolean).length
export const talkSeconds = (t: Talk) => Math.round((wc(t.slides.map((s) => s.notes).join(' ')) / WPM) * 60)
export const slideSeconds = (s: Slide) => Math.round((wc(s.notes) / WPM) * 60)
export interface Rule { id: string; label: string; ok: boolean; why?: string }

export function checkTalk(t: Talk, lex: LexTerm[] = LEXICON_SEED): Rule[] {
  const c = congress(t.congress), sec = talkSeconds(t), lim = c.slotMin * 60
  const s = t.slides, k = (x: SlideKind) => s.filter((y) => y.kind === x)
  const content = s.filter((x) => !['title', 'disclosure', 'acknowledgement'].includes(x.kind))
  const text = s.map((x) => `${x.title} ${x.body} ${x.notes}`).join(' ')
  const unk = unsupportedNumbers(text, OUTPUTS.map((o) => o.id))
  const claims = s.flatMap((x) => [...claimProblems(x.body, OUTPUTS.map((o) => o.id), lex), ...claimProblems(x.notes, OUTPUTS.map((o) => o.id), lex)]).filter((f) => f.rule !== 'Number not in its source')
  const wordy = s.filter((x) => wc(x.body) > 40 || x.body.split('\n').filter((l) => l.trim()).length > 6)
  const ack = k('acknowledgement')[0]?.body ?? '', dis = k('disclosure')[0]?.body ?? ''
  return [
    { id: 'C1', label: 'A title slide first, with the presenter and affiliation', ok: s[0]?.kind === 'title' && wc(s[0].title) > 3 && t.presenter.trim().length > 3 && /,/.test(t.presenter) },
    { id: 'C2', label: 'The disclosure slide comes second: funder and the presenter\'s interests', ok: s[1]?.kind === 'disclosure' && /fund|sponsor/i.test(dis) && /(employee|consult|fees|grant|honorari|shares|no (relevant )?(conflicts|interests))/i.test(dis), why: s[1]?.kind !== 'disclosure' ? 'Most congresses ask for disclosures at the start, right after the title.' : '' },
    { id: 'C3', label: `At most ${c.slotMin} content slides for a ${c.slotMin}-minute slot (now ${content.length})`, ok: content.length > 0 && content.length <= c.slotMin },
    { id: 'C4', label: `The spoken notes fit the slot: ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')} of ${c.slotMin}:00 at ${WPM} words a minute`, ok: sec <= lim && sec >= lim * 0.6, why: sec > lim ? 'Cut the notes; the chair will stop you.' : 'Write notes for each slide: the talk is too short.' },
    { id: 'C5', label: 'No slide over 40 words or 6 lines', ok: wordy.length === 0, why: wordy.map((x) => x.title || x.kind).join(', ') },
    { id: 'C6', label: 'Every number is in the study outputs', ok: wc(text) > 20 && unk.length === 0, why: unk.length ? `Not found: ${unk.join(', ')}` : '' },
    { id: 'C7', label: 'No claim beyond the data, and the agreed terms', ok: claims.length === 0, why: [...new Set(claims.map((x) => x.text))].join(' ') },
    { id: 'C8', label: 'Results, safety and a conclusions slide', ok: k('results').length > 0 && k('safety').length > 0 && k('conclusion').some((x) => wc(x.body) > 5) },
    { id: 'C9', label: 'Acknowledgements: participants, investigators and the medical writing support with its funder', ok: /participant|patient/i.test(ack) && /investigator/i.test(ack) && /writing/i.test(ack) && /fund|paid/i.test(ack) },
    { id: 'C10', label: 'The trial registration number', ok: /NCT\d{8}/.test(text) },
    { id: 'C11', label: 'An encore says where it was first shown', ok: !t.encore.trim() || (/encore/i.test(`${s[0]?.title} ${s[0]?.body}`) && `${s[0]?.title} ${s[0]?.body}`.includes(t.encore.trim().split(/[,(]/)[0].trim())), why: 'Put “Encore of …” with the first congress on the title slide.' },
  ]
}
const esc = (x: string) => x.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[ch]!)
export function talkHtml(t: Talk): string {
  const c = congress(t.congress)
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(t.slides[0]?.title || 'Talk')}</title><style>@page{size:254mm 142.9mm;margin:0}body{margin:0;font-family:Arial,sans-serif;background:#ddd}.s{width:254mm;height:142.9mm;box-sizing:border-box;padding:12mm 16mm;background:#fff;color:#111;page-break-after:always;display:flex;flex-direction:column;margin:0 auto 6mm}h1{font-size:26pt;margin:0 0 6mm}h2{font-size:22pt;margin:0 0 6mm;border-bottom:2mm solid #0072B2}p{font-size:18pt;line-height:1.35;margin:0 0 3mm;white-space:pre-wrap}.f{margin-top:auto;font-size:9pt;color:#444}.n{display:none}@media screen{.n{display:block;font-size:11pt;background:#f4f4f4;padding:3mm;margin-top:3mm}}</style></head><body>${t.slides.map((s, i) => `<section class="s">${s.kind === 'title' ? `<h1>${esc(s.title)}</h1><p>${esc(t.presenter)}</p><p>${esc(s.body)}</p>` : `<h2>${esc(s.title)}</h2><p>${esc(s.body)}</p>`}<div class="f">${esc(c.name)} · ${i + 1}/${t.slides.length} · Fictional study, for training</div><div class="n">Notes: ${esc(s.notes)}</div></section>`).join('')}</body></html>`
}

// ---------------------------------------------------------------- embargo
export type Channel = 'press release' | 'social media post' | 'journal online publication' | 'investor news' | 'company website' | 'email to customers' | 'slide photo on social media'
export const CHANNELS: Channel[] = ['press release', 'social media post', 'journal online publication', 'investor news', 'company website', 'email to customers', 'slide photo on social media']
export interface Comm { id: string; channel: Channel; when: string; what: 'abstract data' | 'new data from the talk'; note: string }
export const blankComm = (k: number): Comm => ({ id: `e${Date.now().toString(36)}${k}`, channel: 'press release', when: '', what: 'abstract data', note: '' })
/** When the data in a communication may first be made public under the congress rules. */
export function lift(c: Congress, what: Comm['what']) { return c.lateBreaking || what === 'new data from the talk' ? c.talkStart : c.abstractRelease }
export function checkComm(c: Congress, e: Comm): { ok: boolean; why: string } {
  if (!e.when) return { ok: false, why: 'Give the date and time, with the time zone.' }
  const t = Date.parse(e.when), l = Date.parse(lift(c, e.what))
  if (Number.isNaN(t)) return { ok: false, why: 'Use a date and time like 2027-03-12T10:45+01:00.' }
  if (e.channel === 'slide photo on social media' && !/permission|approved/i.test(e.note)) return { ok: false, why: c.photoPolicy }
  if (t < l) return { ok: false, why: `Breaks the embargo: ${e.what} are embargoed until ${lift(c, e.what).replace('T', ' ')} (congress time). This is ${Math.round((l - t) / 60000)} minutes early.` }
  if (e.channel === 'journal online publication' && t < Date.parse(c.talkStart)) return { ok: false, why: 'Online publication before the talk breaks the embargo; simultaneous publication must be agreed with the congress and the journal.' }
  return { ok: true, why: '' }
}

// ---------------------------------------------------------------- encores
export interface EncoreRow { id: string; what: string; venue: string; type: string; target: string; encore: boolean; ok: boolean; why: string }
/** Each congress presentation in the plan, and whether its encore status is right. */
export function encores(rows: PlanRow[]): EncoreRow[] {
  const cong = rows.filter((r) => /congress|poster|oral|encore|abstract/i.test(r.type))
  return cong.map((r) => {
    const encore = /encore/i.test(r.type)
    const same = cong.filter((x) => x.id !== r.id && x.what === r.what)
    const firsts = same.filter((x) => !/encore/i.test(x.type))
    const earlier = firsts.filter((x) => x.target < r.target)
    let ok = true, why = ''
    if (encore && !earlier.length) { ok = false; why = firsts.length ? `An encore before the first presentation (${firsts.map((x) => `${x.venue}, ${x.target}`).join('; ')}).` : 'An encore of a presentation that is not in the plan.' }
    if (!encore && same.some((x) => !/encore/i.test(x.type) && x.target < r.target)) { ok = false; why = 'Already presented earlier: label it as an encore.' }
    return { id: r.id, what: r.what, venue: r.venue, type: r.type, target: r.target, encore, ok, why }
  }).sort((a, b) => a.target.localeCompare(b.target))
}
