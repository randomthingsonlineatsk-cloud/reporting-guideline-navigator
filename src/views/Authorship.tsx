import type { Project } from '../domain/types'
import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import { CREDIT_ROLES, ICMJE_CRITERIA, RG4_AI_QUESTION, RG4_CONTRIBUTORS, checkWritingAck, orcidValid, type Criterion, type Degree } from '../domain/phase3'
import { download } from '../domain/store'
import { BylinePanel } from './Pack'

type Person = { id: string; name: string; role: string; orcid: string; did: string }

export default function Authorship() {
  const { p, act } = useStore()
  const cast = p!.manuscriptId === 'glyde-3'
  const people: Person[] = cast ? RG4_CONTRIBUTORS : (p!.people ?? []).map((x) => ({ ...x, role: '', orcid: '' }))
  const a = p!.rg4 ?? { people: {}, ack: '' }
  const upd = (fn: (x: NonNullable<Project['rg4']>) => void) => act((q) => { q.rg4 ??= { people: {}, ack: '' }; fn(q.rg4) })
  const [nn, setNn] = useState(''), [nd, setNd] = useState('')
  const ack = checkWritingAck(a.ack)
  const authors = people.filter((x) => a.people[x.id]?.author)
  const credit = people.filter((x) => Object.keys(a.people[x.id]?.roles ?? {}).length).map((x) => `${x.name.replace(/,.*$/, '')}: ${Object.entries(a.people[x.id].roles).map(([r, d]) => `${r} (${d})`).join(', ')}.`).join('\n')
  return (
    <div className="space-y-3">
      <Panel title="Authorship and contributions" sub="For each contributor, tick the ICMJE criteria their work meets. An author meets all four; everyone else who contributed is acknowledged. Then give each person's CRediT roles and how much they did.">
        <details className="text-xs text-lab-text-muted"><summary className="cursor-pointer">The four ICMJE criteria (January 2026, in this app's words)</summary><ol className="list-decimal pl-5 mt-1 space-y-0.5">{ICMJE_CRITERIA.map((c) => <li key={c.id}>{c.text}</li>)}</ol></details>
        {!cast && (
          <div className="grid sm:grid-cols-[14rem_1fr_auto] gap-2 items-end">
            <label className="text-xs text-lab-text-muted">Name<input className={inputCls} value={nn} onChange={(e) => setNn(e.target.value)} /></label>
            <label className="text-xs text-lab-text-muted">What they did<input className={inputCls} value={nd} onChange={(e) => setNd(e.target.value)} /></label>
            <Btn disabled={!nn.trim()} onClick={() => { act((q) => { q.people = [...(q.people ?? []), { id: `u${Date.now().toString(36)}`, name: nn.trim(), did: nd.trim() }] }); setNn(''); setNd('') }}>Add contributor</Btn>
          </div>
        )}
        {people.length === 0 && <p className="text-sm text-lab-text-muted">Add the people who worked on this paper. (Open the GLYDE-3 paper, or start mission RG4, for a worked case with six contributors.)</p>}
        <div className="space-y-2">
          {people.map((x) => {
            const ans = a.people[x.id] ?? { criteria: {}, roles: {} }
            const all = ICMJE_CRITERIA.every((c) => ans.criteria[c.id])
            return (
              <div key={x.id} className="rounded border border-lab-line p-2 space-y-1.5">
                <div className="flex flex-wrap gap-2 items-baseline"><b className="text-sm">{x.name}</b><span className="text-xs text-lab-text-muted">{x.role}</span>{x.orcid && <Pill tone={orcidValid(x.orcid) ? 'green' : 'red'}>{`ORCID ${x.orcid} · ${orcidValid(x.orcid) ? 'check digit ok' : 'check digit wrong'}`}</Pill>}</div>
                <p className="text-sm">{x.did}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {ICMJE_CRITERIA.map((c, i) => <label key={c.id} className="flex items-center gap-1" title={c.text}><input type="checkbox" checked={!!ans.criteria[c.id]} onChange={(e) => upd((r) => { r.people[x.id] ??= { criteria: {}, roles: {} }; r.people[x.id].criteria[c.id as Criterion] = e.target.checked })} />{i + 1}. {c.short}</label>)}
                  <span className="ml-auto flex gap-1" role="radiogroup" aria-label={`Decision for ${x.name}`}>
                    {[true, false].map((v) => <Btn key={String(v)} role="radio" aria-checked={ans.author === v} tone={ans.author === v ? (v ? 'green' : 'purple') : 'grey'} onClick={() => upd((r) => { r.people[x.id] ??= { criteria: {}, roles: {} }; r.people[x.id].author = v })}>{v ? 'Author' : 'Acknowledge'}</Btn>)}
                  </span>
                </div>
                {ans.author === true && !all && <p className="text-xs text-lab-amber">An author must meet all four criteria; you have ticked {ICMJE_CRITERIA.filter((c) => ans.criteria[c.id]).length}.</p>}
                <details className="text-xs"><summary className="cursor-pointer text-lab-text-muted">CRediT roles ({Object.keys(ans.roles ?? {}).length})</summary>
                  <div className="grid sm:grid-cols-2 gap-1 mt-1">{CREDIT_ROLES.map(([r, def]) => (
                    <label key={r} className="flex items-center gap-1" title={def}>
                      <select aria-label={`${r} for ${x.name}`} className="rounded border border-lab-line bg-lab-panel-strong px-1 py-0.5" value={ans.roles?.[r] ?? ''} onChange={(e) => upd((q) => { q.people[x.id] ??= { criteria: {}, roles: {} }; if (e.target.value) q.people[x.id].roles[r] = e.target.value as Degree; else delete q.people[x.id].roles[r] })}>
                        <option value="">—</option><option value="lead">lead</option><option value="equal">equal</option><option value="supporting">supporting</option>
                      </select>{r}
                    </label>))}</div>
                </details>
              </div>
            )
          })}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-3 items-start">
        <Panel title="Medical writing acknowledgement" sub="GPP 2022: name the writer, their qualifications and affiliation, and who paid for the support.">
          <TextArea value={a.ack} onChange={(e) => upd((r) => { r.ack = e.target.value })} placeholder="Medical writing support was provided by …" />
          {a.ack.trim() && <p className={`text-xs ${ack.ok ? 'text-lab-cdsco' : 'text-lab-amber'}`}>{ack.ok ? 'Complete.' : `Missing: ${ack.missing.join(', ')}.`}</p>}
        </Panel>
        {cast && (
          <Panel title="An AI tool in the byline?" sub={RG4_AI_QUESTION.q}>
            <div className="grid gap-1" role="radiogroup" aria-label="AI tool">{RG4_AI_QUESTION.options.map((o, i) => <button key={i} role="radio" aria-checked={a.ai === i} onClick={() => upd((r) => { r.ai = i })} className={`text-left rounded border px-2 py-1 text-sm ${a.ai === i ? 'border-lab-fda bg-lab-fda-soft' : 'border-lab-line'}`}>{o}</button>)}</div>
          </Panel>
        )}
      </div>

      <Panel title="Byline and contributor statement" right={<Btn tone="grey" disabled={!credit} onClick={() => download('contributors.txt', `Authors: ${authors.map((x) => x.name).join('; ')}\n\nCRediT contributions:\n${credit}\n\nAcknowledgements: ${a.ack}`, 'text/plain')}>Download</Btn>}>
        <p className="text-sm"><b>Authors:</b> {authors.length ? authors.map((x) => x.name).join('; ') : '—'}</p>
        <p className="text-sm"><b>Acknowledged:</b> {people.filter((x) => a.people[x.id]?.author === false).map((x) => x.name).join('; ') || '—'}</p>
        <pre className="text-xs whitespace-pre-wrap text-lab-text-muted">{credit || 'No CRediT roles yet.'}</pre>
      </Panel>
      {!p!.mission && <BylinePanel />}
    </div>
  )
}
