import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, inputCls } from './ui'
import type { PlanRow } from '../domain/phase4'
import { addComment, addVersion, auditCsv, blankReview, closeReview, metrics, openReview, readiness, resolveComment, reviewers, setMilestone, signOff, verifyAudit, type PubReview, type Role } from '../domain/review'
import { download } from '../domain/store'

export function Metrics({ rows }: { rows: PlanRow[] }) {
  const { p } = useStore()
  const m = metrics(rows, p!.reviews ?? {})
  const f = (x: number | null, u = ' days') => (x === null ? '—' : `${x}${u}`)
  const tile = (label: string, v: string) => <div className="rounded border border-lab-line p-2"><p className="text-[11px] text-lab-text-muted">{label}</p><p className="text-lg font-mono">{v}</p></div>
  return (
    <Panel title="Publication metrics" sub="Worked out from the milestones recorded in each publication's review below.">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {tile('Publications', String(m.publications))}{tile('Submitted', String(m.submitted))}{tile('Acceptance rate', f(m.acceptanceRate, '%'))}
        {tile('Median: lock to submission', f(m.medianLockToSubmission))}{tile('Median: submission to decision', f(m.medianSubmissionToDecision))}{tile('Median review round', f(m.medianReviewRound))}
      </div>
      {m.pastTarget.length > 0 && <p className="text-xs text-lab-amber">Past the target month and not submitted: {m.pastTarget.join('; ')}.</p>}
    </Panel>
  )
}

export function ReviewBox({ row }: { row: PlanRow }) {
  const { p, act, progress } = useStore()
  const r = p!.reviews?.[row.id] ?? blankReview()
  const people = [...new Set([...reviewers(row), progress.name.trim() || 'Publications lead', 'Medical reviewer', 'Compliance reviewer'])]
  const [who, setWho] = useState(people[0])
  const [note, setNote] = useState(''), [due, setDue] = useState(''), [text, setText] = useState(''), [reply, setReply] = useState<Record<string, string>>({})
  const [role, setRole] = useState<Role>('author')
  const run = (fn: (x: PubReview) => void) => act((q) => { q.reviews ??= {}; q.reviews[row.id] ??= blankReview(); fn(q.reviews[row.id]) })
  const ready = readiness(r, row), chain = verifyAudit(r.audit), open = r.rounds.find((x) => !x.closed)
  const v = r.versions.at(-1)
  return (
    <div className="mt-2 space-y-2 rounded border border-lab-line/70 bg-lab-panel-strong/40 p-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <label>Acting as <select aria-label="Acting as" className="rounded border border-lab-line bg-lab-panel-strong px-1 py-0.5" value={who} onChange={(e) => setWho(e.target.value)}>{people.map((x) => <option key={x}>{x}</option>)}</select></label>
        <span>Version {v?.n ?? '—'}</span>{open && <Pill tone="amber">round {open.n} open, due {open.due}</Pill>}
        <Pill tone={ready.ok ? 'green' : 'amber'}>{ready.ok ? 'ready to submit' : 'not ready'}</Pill>
        <Pill tone={chain.ok ? 'green' : 'red'}>{chain.ok ? `audit log intact (${r.audit.length})` : `audit log broken at entry ${chain.broken}`}</Pill>
      </div>
      {!ready.ok && <p className="text-lab-text-muted">Still needed: {ready.missing.join('; ')}.</p>}
      <div className="grid md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="font-medium">Versions</p>
          <ul>{r.versions.map((x) => <li key={x.n}>v{x.n} · {x.utc.slice(0, 10)} · {x.by}: {x.note} {r.signoffs.filter((s) => s.version === x.n).length ? `· approved by ${r.signoffs.filter((s) => s.version === x.n).map((s) => s.who).join(', ')}` : ''}</li>)}</ul>
          <span className="flex gap-1"><input aria-label="What changed" className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed in this version" /><Btn tone="grey" onClick={() => { if (run((x) => addVersion(x, who, note))) setNote('') }}>New version</Btn></span>
          <span className="flex gap-1"><input aria-label="Due date" type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} /><Btn tone="grey" onClick={() => run((x) => openReview(x, who, due))}>Send for review</Btn><Btn tone="grey" onClick={() => run((x) => closeReview(x, who))}>Close round</Btn></span>
          <span className="flex gap-1 items-center"><select aria-label="Sign-off role" className="rounded border border-lab-line bg-lab-panel-strong px-1 py-1" value={role} onChange={(e) => setRole(e.target.value as Role)}><option value="author">as author</option><option value="medical">as medical reviewer</option><option value="compliance">as compliance reviewer</option></select><Btn onClick={() => run((x) => signOff(x, who, role))}>Approve latest version</Btn></span>
        </div>
        <div className="space-y-1">
          <p className="font-medium">Comments</p>
          <ul className="space-y-1">{r.comments.map((c) => <li key={c.id} className={c.resolved ? 'text-lab-text-muted' : ''}>{c.id} (round {c.round}) {c.by}: {c.text}{c.resolved ? ` → ${c.reply}` : <span className="flex gap-1 mt-0.5"><input aria-label={`Reply to ${c.id}`} className={inputCls} value={reply[c.id] ?? ''} onChange={(e) => setReply({ ...reply, [c.id]: e.target.value })} placeholder="How it was handled" /><Btn tone="grey" onClick={() => run((x) => resolveComment(x, who, c.id, reply[c.id] ?? ''))}>Resolve</Btn></span>}</li>)}</ul>
          <span className="flex gap-1"><input aria-label="Comment" className={inputCls} value={text} onChange={(e) => setText(e.target.value)} placeholder="A reviewer's comment" /><Btn tone="grey" onClick={() => { if (run((x) => addComment(x, who, text))) setText('') }}>Comment</Btn></span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-end">
        {(['dbl', 'submitted', 'decided', 'published'] as const).map((k) => <label key={k}>{({ dbl: 'Database lock', submitted: 'Submitted', decided: 'Decision date', published: 'Published' })[k]}<input type="date" className={inputCls} value={r.milestones[k] ?? ''} onChange={(e) => run((x) => setMilestone(x, row, who, k, e.target.value))} /></label>)}
        <label>Decision<select className={inputCls} value={r.milestones.decision ?? ''} onChange={(e) => run((x) => setMilestone(x, row, who, 'decision', e.target.value))}><option value="">—</option><option value="accepted">Accepted</option><option value="revise">Revise and resubmit</option><option value="rejected">Rejected</option></select></label>
      </div>
      <details><summary className="cursor-pointer">Audit log ({r.audit.length} entries)</summary>
        <ol className="font-mono text-[11px] space-y-0.5 mt-1">{r.audit.map((e) => <li key={e.seq}>{e.seq}. {e.utc.replace('T', ' ').slice(0, 16)} UTC · {e.who} · {e.what} · #{e.h.slice(-6)}</li>)}</ol>
        <Btn tone="grey" disabled={!r.audit.length} onClick={() => download(`audit-${row.id}.csv`, auditCsv(row, r), 'text/csv')}>Audit log (CSV)</Btn>
      </details>
    </div>
  )
}
