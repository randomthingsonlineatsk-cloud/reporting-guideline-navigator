// Panels for the learner's own manuscript pack: byline, statements, title page, revision record.
import { useRef, useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import type { Project } from '../domain/types'
import { RG4_CONTRIBUTORS } from '../domain/phase3'
import { download } from '../domain/store'
import { INPUTS, TASKS, blankEntry, checkLog, disclosure, type AiEntry } from '../domain/ailog'
import {
  GROUP_MODES, blankByline, blankRevision, blankStatements, blankTitlePage, bylineText, checkByline, checkRevision, checkRevisions, checkStatements, checkTitlePage,
  orderedAuthors, readProtocolBuilder, revisionHtml, revisionsFrom, statementsText, titlePageHtml, wordCounts, type Byline, type Registry, type Revision, type Rule, type Statements,
} from '../domain/manuscriptpack'

function usePack() {
  const { p, act } = useStore()
  const cast = p!.manuscriptId === 'glyde-3'
  const people = cast ? RG4_CONTRIBUTORS.map((x) => ({ id: x.id, name: x.name.replace(/,.*$/, '') })) : (p!.people ?? []).map((x) => ({ id: x.id, name: x.name }))
  const b = p!.byline ?? blankByline()
  const authors = orderedAuthors(people, (id) => !!p!.rg4?.people[id]?.author, b)
  const updB = (fn: (x: Byline) => void) => act((q) => { q.byline ??= blankByline(); fn(q.byline) })
  return { p: p!, act, authors, b, updB }
}
const Rules = ({ rules }: { rules: Rule[] }) => (
  <ul className="text-xs space-y-0.5">{rules.map((r) => <li key={r.id} className={r.ok ? 'text-lab-cdsco' : r.level === 'warn' ? 'text-lab-amber' : 'text-lab-text-muted'}>{r.ok ? '✓' : r.level === 'warn' ? '!' : '○'} {r.label}{!r.ok && r.why ? `: ${r.why}` : ''}</li>)}</ul>
)
const ok = (rules: Rule[]) => <Pill tone={rules.every((r) => r.ok) ? 'green' : 'amber'}>{`${rules.filter((r) => r.ok).length} of ${rules.length}`}</Pill>

export function BylinePanel() {
  const { authors, b, updB } = usePack()
  const rules = checkByline(authors, b)
  const move = (i: number, d: number) => updB((x) => { const ids = authors.map((a) => a.id); const j = i + d; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; x.order = ids })
  return (
    <Panel title="Author order, corresponding author and group" sub="Put the authors in the order they agreed (the first author usually did most of the work, and the order is settled before writing). Choose the corresponding author, and if a study group is named in the byline, list its members who are not authors as collaborators." right={ok(rules)}>
      {authors.length === 0 ? <p className="text-sm text-lab-text-muted">Mark the authors above first.</p> : (
        <ol className="space-y-1.5">
          {authors.map((a, i) => (
            <li key={a.id} className="grid sm:grid-cols-[2rem_minmax(0,12rem)_minmax(0,1fr)_auto] gap-1.5 items-center text-sm">
              <span className="font-mono text-xs text-lab-text-muted">{i + 1}.</span><span>{a.name}</span>
              <input aria-label={`Affiliation of ${a.name}`} className={inputCls} value={b.affiliations[a.id] ?? ''} onChange={(e) => updB((x) => { x.affiliations[a.id] = e.target.value })} placeholder="Department, institution, city, country" />
              <span className="flex gap-1"><Btn tone="grey" aria-label={`Move ${a.name} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</Btn><Btn tone="grey" aria-label={`Move ${a.name} down`} disabled={i === authors.length - 1} onClick={() => move(i, 1)}>↓</Btn>
                <Btn tone={b.corresponding === a.id ? 'green' : 'grey'} aria-pressed={b.corresponding === a.id} onClick={() => updB((x) => { x.corresponding = a.id })}>Corresponding</Btn></span>
            </li>
          ))}
        </ol>
      )}
      <div className="grid sm:grid-cols-2 gap-2">
        <label className="text-xs text-lab-text-muted">Corresponding author's email<input className={inputCls} value={b.email ?? ''} onChange={(e) => updB((x) => { x.email = e.target.value })} placeholder="name@example.org" /></label>
        <label className="text-xs text-lab-text-muted">Postal address<input className={inputCls} value={b.address ?? ''} onChange={(e) => updB((x) => { x.address = e.target.value })} /></label>
        <label className="text-xs text-lab-text-muted">Group in the byline<select className={inputCls} value={b.groupMode} onChange={(e) => updB((x) => { x.groupMode = e.target.value as Byline['groupMode'] })}>{GROUP_MODES.map((g) => <option key={g.id} value={g.id}>{g.label} (e.g. {g.example})</option>)}</select></label>
        <label className="text-xs text-lab-text-muted">Group name<input className={inputCls} disabled={b.groupMode === 'none'} value={b.group ?? ''} onChange={(e) => updB((x) => { x.group = e.target.value })} placeholder="VERDANT-1 Investigators" /></label>
      </div>
      {b.groupMode !== 'none' && <label className="block text-xs text-lab-text-muted">Collaborators (one per line: Name, place: what they did){b.groupMode === 'only' && '. Name the writing committee who take responsibility.'}<TextArea className="min-h-20" value={b.collaborators} onChange={(e) => updB((x) => { x.collaborators = e.target.value })} placeholder={'Li Wen, Toronto: site principal investigator\nMarta Keller, Hamburg: writing committee, takes responsibility for the article'} /></label>}
      <p className="text-sm"><b>Byline:</b> {bylineText(authors, b) || '—'}</p>
      <Rules rules={rules} />
    </Panel>
  )
}

const REGISTRIES: Registry[] = ['ClinicalTrials.gov', 'EU CTIS', 'CTRI', 'ISRCTN', 'Other']
export function StatementsPanel() {
  const { p, act } = usePack()
  const { setError } = useStore()
  const file = useRef<HTMLInputElement>(null)
  const s = p.statements ?? blankStatements()
  const upd = (fn: (x: Statements) => void) => act((q) => { q.statements ??= blankStatements(); fn(q.statements) })
  const ab = p.abstracts.find((a) => a.text.trim())?.text
  const rules = checkStatements(s, p.registration, ab, p.aiLog?.length ?? 0)
  const coi = 'as declared on each author\'s ICMJE disclosure form (see the forms submitted with the article).'
  const f = (k: keyof Statements, label: string, ph = '', area = false) => <label className="block text-xs text-lab-text-muted">{label}{area ? <TextArea className="min-h-16" value={String(s[k])} onChange={(e) => upd((x) => { (x as unknown as Record<string, string>)[k] = e.target.value })} placeholder={ph} /> : <input className={inputCls} value={String(s[k])} onChange={(e) => upd((x) => { (x as unknown as Record<string, string>)[k] = e.target.value })} placeholder={ph} />}</label>
  return (
    <Panel title="Statements for your manuscript" sub="Registration, funding, ethics, data sharing and AI use, checked as you write. Read the registration number from the Protocol Builder so a mistyped number is caught." right={<div className="flex gap-1 items-center">{ok(rules)}<Btn tone="grey" onClick={() => download('statements.txt', statementsText(s, coi), 'text/plain')}>Download</Btn></div>}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <input ref={file} type="file" accept=".json,application/json" className="hidden" onChange={async (e) => { const fl = e.target.files?.[0]; e.target.value = ''; if (!fl) return; try { const r = readProtocolBuilder(JSON.parse(await fl.text()), fl.name); act((q) => { q.registration = r; q.statements ??= blankStatements(); if (!q.statements.number.trim()) { q.statements.number = r.numbers.nct ?? r.numbers.euct ?? r.numbers.ctri ?? ''; q.statements.registry = r.numbers.nct ? 'ClinicalTrials.gov' : r.numbers.euct ? 'EU CTIS' : 'CTRI' } }) } catch (err) { setError((err as Error).message) } }} />
        <Btn tone="grey" onClick={() => file.current?.click()}>Read the registration from the Protocol Builder</Btn>
        {p.registration ? <span>From {p.registration.file || 'the Protocol Builder'}: {p.registration.acronym || p.registration.protocolId} · {[p.registration.numbers.nct, p.registration.numbers.euct, p.registration.numbers.ctri].filter(Boolean).join(' · ')}</span> : <span className="text-lab-text-muted">Its project file or application bundle (Export page).</span>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <label className="block text-xs text-lab-text-muted">Registry<select className={inputCls} value={s.registry} onChange={(e) => upd((x) => { x.registry = e.target.value as Registry })}>{REGISTRIES.map((r) => <option key={r}>{r}</option>)}</select></label>
        {f('number', 'Registration number', 'NCT…')}
        <label className="block text-xs text-lab-text-muted">Registered on<input type="date" className={inputCls} value={s.registered} onChange={(e) => upd((x) => { x.registered = e.target.value })} /></label>
        <label className="block text-xs text-lab-text-muted">First participant enrolled<input type="date" className={inputCls} value={s.firstEnrolment} onChange={(e) => upd((x) => { x.firstEnrolment = e.target.value })} /></label>
      </div>
      {s.registered && s.firstEnrolment && s.registered > s.firstEnrolment && f('retroReason', 'Why it was registered after the first enrolment (goes in the paper)', '', true)}
      <div className="grid md:grid-cols-2 gap-2">
        {f('funding', 'Funding and the funder\'s role', 'Funded by …; the funder was involved in / had no role in …', true)}
        {f('ethics', 'Ethics approval and consent', 'Approved by … ethics committee (reference …); written informed consent …', true)}
        {f('dataSharing', 'Data sharing', 'Which data, from when, to whom, how', true)}
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.aiUsed} onChange={(e) => upd((x) => { x.aiUsed = e.target.checked })} />An AI tool was used in writing</label>
          {s.aiUsed && <>{f('aiTool', 'The tool')}{f('aiHow', 'What it was used for', 'check the grammar of …')}</>}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.aiAuthor} onChange={(e) => upd((x) => { x.aiAuthor = e.target.checked })} />List the AI tool as an author</label>
        </div>
      </div>
      <Rules rules={rules} />
    </Panel>
  )
}

export function TitlePagePanel() {
  const { p, act, authors, b } = usePack()
  const t = p.titlePage ?? blankTitlePage()
  const upd = (fn: (x: NonNullable<Project['titlePage']>) => void) => act((q) => { q.titlePage ??= blankTitlePage(); fn(q.titlePage) })
  const rules = checkTitlePage(p, authors, b, t, p.statements)
  const w = wordCounts(p)
  return (
    <Panel title="Title page" sub={`Built from the byline (Authorship page) and the statements (Disclosures page). Word counts from the manuscript: abstract ${w.abstract}, main text ${w.main}.`} right={<div className="flex gap-1 items-center">{ok(rules)}<Btn tone="grey" onClick={() => download('title-page.html', titlePageHtml(p, authors, b, t, p.statements), 'text/html')}>Title page (HTML)</Btn></div>}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <label className="block text-xs text-lab-text-muted">Running title ({t.running.length}/40)<input className={inputCls} value={t.running} onChange={(e) => upd((x) => { x.running = e.target.value })} /></label>
        <label className="block text-xs text-lab-text-muted">Keywords (; between)<input className={inputCls} value={t.keywords} onChange={(e) => upd((x) => { x.keywords = e.target.value })} /></label>
        <label className="block text-xs text-lab-text-muted">Tables<input type="number" min={0} className={inputCls} value={t.tables} onChange={(e) => upd((x) => { x.tables = Number(e.target.value) })} /></label>
        <label className="block text-xs text-lab-text-muted">Figures<input type="number" min={0} className={inputCls} value={t.figures} onChange={(e) => upd((x) => { x.figures = Number(e.target.value) })} /></label>
      </div>
      <Rules rules={rules} />
    </Panel>
  )
}

export function RevisionPanel() {
  const { p, act } = usePack()
  const [paste, setPaste] = useState('')
  const rows = p.revisions ?? []
  const upd = (fn: (x: Revision[]) => void) => act((q) => { q.revisions ??= []; fn(q.revisions) })
  const all = checkRevisions(rows)
  const m = wordCounts(p).title
  return (
    <Panel title="Revision record" sub="One row per reviewer comment: the comment it answers, whether the paper changed, where, and the new text quoted, or why not. Journals ask for it with the revised manuscript." right={<div className="flex gap-1 items-center"><Pill tone={all.ok ? 'green' : 'amber'}>{all.ok ? 'complete' : `${all.open.length} open`}</Pill><Btn tone="grey" disabled={!rows.length} onClick={() => download('revision-record.html', revisionHtml(rows, m), 'text/html')}>Revision record (HTML)</Btn></div>}>
      <details className="text-xs" open={!rows.length}><summary className="cursor-pointer">Paste the reviewers' comments</summary>
        <TextArea className="min-h-20 mt-1" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'R1.1: Give the randomisation method.\nR1.2: …\nReviewer 2, comment 1: …'} />
        <Btn disabled={!paste.trim()} onClick={() => { const r = revisionsFrom(paste); upd((x) => { x.push(...r) }); setPaste('') }}>Add as rows</Btn>
      </details>
      {all.dup.length > 0 && <p className="text-xs text-lab-amber">Numbered twice: {all.dup.join(', ')}.</p>}
      <div className="space-y-2">
        {rows.map((r, i) => {
          const c = checkRevision(r), set = (fn: (x: Revision) => void) => upd((x) => { fn(x[i]) })
          return (
            <div key={r.id} className={`rounded border p-2 space-y-1.5 ${c.every((x) => x.ok) ? 'border-lab-line' : 'border-lab-amber/60'}`}>
              <div className="grid sm:grid-cols-[6rem_minmax(0,1fr)_auto] gap-1.5">
                <input aria-label="Comment number" className={inputCls} value={r.ref} onChange={(e) => set((x) => { x.ref = e.target.value })} placeholder="R1.1" />
                <input aria-label={`Comment ${r.ref}`} className={inputCls} value={r.comment} onChange={(e) => set((x) => { x.comment = e.target.value })} placeholder="The reviewer's point" />
                <select aria-label={`Response to ${r.ref}`} className={inputCls} value={r.action} onChange={(e) => set((x) => { x.action = e.target.value as Revision['action'] })}><option value="">Response…</option><option value="changed">Changed</option><option value="not changed">Not changed</option></select>
              </div>
              {r.action === 'changed' && <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-1.5"><input aria-label={`Where for ${r.ref}`} className={inputCls} value={r.where} onChange={(e) => set((x) => { x.where = e.target.value })} placeholder="Methods, paragraph 3 (page 7, lines 12–15)" /><input aria-label={`New text for ${r.ref}`} className={inputCls} value={r.newText} onChange={(e) => set((x) => { x.newText = e.target.value })} placeholder="The new text, quoted" /></div>}
              {r.action === 'not changed' && <input aria-label={`Reason for ${r.ref}`} className={inputCls} value={r.reason} onChange={(e) => set((x) => { x.reason = e.target.value })} placeholder="Why not, with the evidence" />}
              <div className="flex justify-between items-start gap-2"><Rules rules={c} /><Btn tone="grey" onClick={() => upd((x) => { x.splice(i, 1) })}>Remove</Btn></div>
            </div>
          )
        })}
      </div>
      <Btn tone="grey" onClick={() => upd((x) => { x.push(blankRevision(x.length)) })}>Add a row</Btn>
    </Panel>
  )
}

export function AiLogPanel() {
  const { p, act } = usePack()
  const cast = p.manuscriptId === 'glyde-3'
  const people = cast ? RG4_CONTRIBUTORS.map((x) => x.name.replace(/,.*$/, '')) : (p.people ?? []).map((x) => x.name)
  const log = p.aiLog ?? []
  const upd = (fn: (x: AiEntry[]) => void) => act((q) => { q.aiLog ??= []; fn(q.aiLog) })
  const c = checkLog(log, people), d = disclosure(log)
  return (
    <Panel title="AI use log" sub="Every use of an AI tool on this manuscript: the tool and version, what it did and where, what went into it, and the named person who checked the output. The disclosure is written from the log." right={<div className="flex gap-1 items-center"><Pill tone={log.length && c.ok ? 'green' : log.length ? 'amber' : 'grey'}>{log.length ? (c.ok ? `${log.length} entries, all checked` : `${c.open} open`) : 'no entries'}</Pill><Btn tone="grey" disabled={!log.length} onClick={() => act((q) => { q.statements ??= blankStatements(); q.statements.aiUsed = true; q.statements.aiTool = d.tools; q.statements.aiHow = d.uses })}>Fill the statements from the log</Btn></div>}>
      <div className="space-y-2">
        {log.map((e, i) => {
          const rules = c.per[i].rules, set = (fn: (x: AiEntry) => void) => upd((x) => { fn(x[i]) })
          const t = (k: keyof AiEntry, label: string, type = 'text', ph = '') => <label className="block text-[11px] text-lab-text-muted">{label}<input type={type} className={inputCls} value={String(e[k])} placeholder={ph} onChange={(ev) => set((x) => { (x as unknown as Record<string, string>)[k] = ev.target.value })} /></label>
          return (
            <div key={e.id} className={`rounded border p-2 space-y-1.5 ${rules.every((r) => r.ok) ? 'border-lab-line' : 'border-lab-amber/60'}`}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                {t('date', 'Date used', 'date')}{t('tool', 'Tool', 'text', 'A general AI writing assistant')}{t('version', 'Version or model')}
                <label className="block text-[11px] text-lab-text-muted">Task<select className={inputCls} value={e.task} onChange={(ev) => set((x) => { x.task = ev.target.value as AiEntry['task'] })}>{TASKS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select></label>
                {t('section', 'Where in the manuscript', 'text', 'the Discussion')}
                <label className="block text-[11px] text-lab-text-muted">What went into it<select className={inputCls} value={e.input} onChange={(ev) => set((x) => { x.input = ev.target.value as AiEntry['input'] })}>{INPUTS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select></label>
                <label className="block text-[11px] text-lab-text-muted">Checked by<select className={inputCls} value={e.checkedBy} onChange={(ev) => set((x) => { x.checkedBy = ev.target.value })}><option value="">—</option>{people.map((n) => <option key={n}>{n}</option>)}</select></label>
                {t('checkedDate', 'Checked on', 'date')}
              </div>
              {t('purpose', 'What it did')}{t('verification', 'How the output was checked')}
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={e.approved} onChange={(ev) => set((x) => { x.approved = ev.target.checked })} />A tool your organisation has approved for confidential material</label>
              <div className="flex justify-between items-start gap-2"><Rules rules={rules} /><Btn tone="grey" onClick={() => upd((x) => { x.splice(i, 1) })}>Remove</Btn></div>
            </div>
          )
        })}
        <Btn tone="grey" onClick={() => upd((x) => { x.push(blankEntry(x.length)) })}>Add a use</Btn>
        {people.length === 0 && <p className="text-xs text-lab-text-muted">Add the contributors on the Authorship page so the checker can be chosen.</p>}
      </div>
      {log.length > 0 && <div className="text-sm space-y-1">
        {d.acknowledgements && <p><b>Acknowledgements:</b> {d.acknowledgements}</p>}
        {d.methods && <p><b>Methods:</b> {d.methods}</p>}
        <Btn tone="grey" onClick={() => download('ai-use-log.json', JSON.stringify({ format: 'reporting-guideline-navigator/ai-use-log', schema: 1, project: p.name, entries: log, disclosure: d }, null, 2))}>AI use log (.json)</Btn>
      </div>}
    </Panel>
  )
}
