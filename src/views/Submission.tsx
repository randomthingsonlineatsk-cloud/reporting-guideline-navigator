import type { Project } from '../domain/types'
import { useStore } from '../state'
import { Btn, Panel, Pill, Table, TextArea } from './ui'
import { RevisionPanel, TitlePagePanel } from './Pack'
import { JOURNALS, REVIEWERS, RG6_COMMENTS, checkCover, checkResponse, journalFit } from '../domain/phase3'
import { manuscriptOf } from '../domain/project'
import { download } from '../domain/store'

export default function Submission() {
  const { p, act } = useStore()
  const m = manuscriptOf(p!)
  const sub = p!.submission ?? {}
  const set = (fn: (s: NonNullable<Project['submission']>) => void) => act((q) => { q.submission ??= {}; fn(q.submission) })
  const words = m.paras.filter((x) => !/^(Title|Abstract|Back matter)$/.test(x.section)).reduce((n, x) => n + x.text.split(/\s+/).length, 0)
  const field = /GLV|diabet/i.test(m.study + m.title) ? 'diabet|metabol' : /cohort|OSTREG/i.test(m.title) ? 'pharmacoepid|safety|skin' : 'skin|dermat'
  const type = m.kind === 'protocol' ? 'Protocol' : /case/i.test(m.title) ? 'Case report' : /review/i.test(m.title) ? 'Systematic review' : /cohort/i.test(m.title) ? 'Cohort' : 'Randomised trial'
  const j = JOURNALS.find((x) => x.id === sub.journal)
  const fit = j ? journalFit(j, { type, words, field }) : []
  const cover = checkCover(sub.cover ?? '')
  const rv = sub.reviewers ?? []
  const responses = p!.rg6 ?? {}
  const rg6 = p!.manuscriptId === 'verdant-1'
  const hide = p!.mission?.id === 'RG6' && !p!.mission.scoredUtc
  return (
    <div className="space-y-3">
      <Panel title="Choose the journal" sub={`${m.title}: a ${type.toLowerCase()} of about ${words.toLocaleString('en-GB')} words (main text). All journals are fictional; two show the warning signs of predatory publishing.`}>
        <Table head={['', 'Journal', 'Scope', 'Types', 'Words', 'Fees', 'Indexed', 'Review']} rows={JOURNALS.map((x) => [
          <input type="radio" name="journal" aria-label={x.name} checked={sub.journal === x.id} onChange={() => set((s) => { s.journal = x.id })} />, x.name, x.scope, x.types.join(', '), x.words === 99999 ? '—' : x.words, x.fee, x.indexed ? 'yes' : 'no', x.review])} />
        {j && <ul className="text-xs space-y-0.5">{fit.map((f, i) => <li key={i} className={f.ok ? 'text-lab-cdsco' : 'text-lab-red'}>{f.ok ? '✓' : '✗'} {f.why}</li>)}</ul>}
      </Panel>

      <div className="grid lg:grid-cols-2 gap-3 items-start">
        <Panel title="Cover letter" sub="What editors look for, checked as you write.">
          <TextArea className="min-h-56" value={sub.cover ?? ''} onChange={(e) => set((s) => { s.cover = e.target.value })} placeholder="Dear Editor, …" />
          <ul className="text-xs space-y-0.5">{cover.map((c) => <li key={c.label} className={c.ok ? 'text-lab-cdsco' : 'text-lab-text-muted'}>{c.ok ? '✓' : '○'} {c.label}</li>)}</ul>
          <Btn tone="grey" disabled={!sub.cover?.trim()} onClick={() => download('cover-letter.txt', sub.cover ?? '', 'text/plain')}>Download</Btn>
        </Panel>
        <Panel title="Suggested reviewers" sub="Pick three. A suggested reviewer should have no conflict with the authors: not the same institution, no recent joint papers, not the sponsor.">
          <div className="space-y-1">{REVIEWERS.map((r) => (
            <label key={r.id} className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={rv.includes(r.id)} onChange={(e) => set((s) => { s.reviewers = e.target.checked ? [...rv, r.id] : rv.filter((x) => x !== r.id) })} />
              <span>{r.name}, {r.where}{rv.includes(r.id) && r.conflict && <span className="block text-xs text-lab-red">Conflict: {r.conflict}</span>}</span></label>))}</div>
          <p className="text-xs">{rv.length} chosen{rv.length === 3 && rv.every((x) => !REVIEWERS.find((r) => r.id === x)!.conflict) ? ' · no conflicts' : ''}</p>
        </Panel>
      </div>

      {rg6 && (
        <Panel title="Response to reviewers" sub="Answer each comment. For a change, say where it is (¶ number, table, supplement) and quote the new text; when you do not make a change, give the reason courteously. Never claim more than the data show. (Mission RG6 scores these.)">
          <ol className="space-y-3">
            {RG6_COMMENTS.map((c, i) => {
              const r = responses[c.id] ?? '', full = r.trim() ? checkResponse(c, r) : null
              // In the mission, the checks that would reveal the answer key (key terms, whether to refuse) appear after the first score.
              const chk = full && hide ? { ...full, checks: full.checks.filter((x) => !/^Mentions|^Gives a reason|^Says where|^Quotes/.test(x.label)) } : full
              return (
                <li key={c.id} className="space-y-1">
                  <p className="text-sm"><Pill>{`Reviewer ${c.reviewer}`}</Pill> <b>{i + 1}.</b> {c.text}</p>
                  <TextArea aria-label={`Response to comment ${i + 1}`} value={r} onChange={(e) => act((q) => { q.rg6 = { ...(q.rg6 ?? {}), [c.id]: e.target.value } })} placeholder="Response…" />
                  {chk && <p className="text-xs">{chk.checks.map((x) => <span key={x.label} className={`mr-3 ${x.ok ? 'text-lab-cdsco' : 'text-lab-amber'}`}>{x.ok ? '✓' : '○'} {x.label}</span>)}</p>}
                </li>
              )
            })}
          </ol>
          <Btn tone="grey" onClick={() => download('response-to-reviewers.txt', RG6_COMMENTS.map((c, i) => `Reviewer ${c.reviewer}, comment ${i + 1}: ${c.text}\nResponse: ${responses[c.id] ?? ''}`).join('\n\n'), 'text/plain')}>Download the response letter</Btn>
        </Panel>
      )}
      {!p!.mission && <><TitlePagePanel /><RevisionPanel /></>}
    </div>
  )
}
