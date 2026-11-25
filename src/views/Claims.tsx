import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import { VERDANT1_REFS, checkClaim, checkRefs, extractClaims, packHtml, packSummary, parseRefs, type Link } from '../domain/claims'
import { OUTPUTS } from '../domain/outputs'
import { manuscriptOf } from '../domain/project'
import { download } from '../domain/store'

export default function Claims() {
  const { p, act } = useStore()
  const [paste, setPaste] = useState(''), [onlyOpen, setOnlyOpen] = useState(false)
  const claims = extractClaims(p!), links = p!.claimLinks ?? {}, refs = p!.refs ?? []
  const sum = packSummary(claims, links, refs), rc = checkRefs(refs, links)
  const setL = (id: string, fn: (l: Link) => void) => act((q) => { q.claimLinks ??= {}; q.claimLinks[id] ??= { kind: '', location: '' }; fn(q.claimLinks[id]) })
  const hrp = manuscriptOf(p!).study === 'HRP-301'
  return (
    <div className="space-y-3">
      <Panel title="Claim-to-source pack" sub="Every claim in the abstract, introduction, results and discussion, tied to the study output, document or reference that supports it, with the exact place. Numbers are checked against the output; references against the retraction notices." right={<div className="flex gap-1 items-center"><Pill tone={sum.ready ? 'green' : 'amber'}>{`${sum.ok} of ${sum.claims} supported`}</Pill>{sum.retracted.length > 0 && <Pill tone="red">cites a retracted paper</Pill>}<Btn tone="grey" onClick={() => download('claim-source-pack.html', packHtml(manuscriptOf(p!).title, claims, links, refs), 'text/html')}>Pack (HTML)</Btn></div>}>
        {!hrp && <p className="text-xs text-lab-text-muted">The study outputs here are VERDANT-1's. For this manuscript, link claims to documents or references.</p>}
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />Show only claims still open</label>
        <ol className="space-y-1.5">{claims.map((c, i) => {
          const l = links[c.id], k = checkClaim(c, l, refs)
          if (onlyOpen && k.ok) return null
          return (
            <li key={c.id} className={`rounded border p-2 space-y-1 ${k.ok ? 'border-lab-line' : 'border-lab-amber/60'}`}>
              <p className="text-sm"><span className="font-mono text-[11px] text-lab-text-muted">{i + 1}. {c.section} · </span>{c.text}</p>
              <div className="grid sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] gap-1.5">
                <select aria-label={`Source type for claim ${i + 1}`} className={inputCls} value={l?.kind ?? ''} onChange={(e) => setL(c.id, (x) => { x.kind = e.target.value as Link['kind'] })}><option value="">Source…</option><option value="output">Study output</option><option value="document">Document</option><option value="reference">Reference</option></select>
                {l?.kind === 'output' ? <select aria-label={`Output for claim ${i + 1}`} className={inputCls} value={l.output ?? ''} onChange={(e) => setL(c.id, (x) => { x.output = e.target.value })}><option value="">Choose…</option>{OUTPUTS.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>
                  : l?.kind === 'document' ? <input aria-label={`Document for claim ${i + 1}`} className={inputCls} value={l.document ?? ''} onChange={(e) => setL(c.id, (x) => { x.document = e.target.value })} placeholder="Protocol, SAP or CSR" />
                  : l?.kind === 'reference' ? <select aria-label={`Reference for claim ${i + 1}`} className={inputCls} value={l.ref ?? ''} onChange={(e) => setL(c.id, (x) => { x.ref = e.target.value })}><option value="">Choose…</option>{refs.map((r) => <option key={r.id} value={r.id}>{r.id}. {r.text.slice(0, 70)}</option>)}</select>
                  : <span className="text-xs text-lab-text-muted self-center">{k.suggest.length ? `Its numbers are in ${k.suggest.join(', ')}.` : ''}</span>}
                <input aria-label={`Where, for claim ${i + 1}`} className={inputCls} value={l?.location ?? ''} onChange={(e) => setL(c.id, (x) => { x.location = e.target.value })} placeholder="Row, section, page, table or figure" />
              </div>
              {k.suggest.length > 0 && l?.kind !== 'output' && <Btn tone="grey" onClick={() => setL(c.id, (x) => { x.kind = 'output'; x.output = k.suggest[0] })}>Link to {k.suggest[0]}</Btn>}
              {!k.ok && <ul className="text-xs text-lab-amber list-disc pl-5">{k.problems.map((x) => <li key={x}>{x}</li>)}</ul>}
            </li>
          )
        })}</ol>
      </Panel>
      <Panel title="References" sub="Paste the reference list, one per line with its DOI. Each is checked against the retraction notices (fictional, standing in for a retraction database)." right={<Btn tone="grey" onClick={() => act((q) => { q.refs = VERDANT1_REFS.map((r) => ({ ...r })) })}>Load the VERDANT-1 reference list</Btn>}>
        <TextArea aria-label="Paste references" className="min-h-16" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={'1. Author A. Title. Journal 2025;1:1-9. doi:10.xxxx/…'} />
        <Btn disabled={!paste.trim()} onClick={() => { act((q) => { q.refs = parseRefs(paste) }); setPaste('') }}>Use this list</Btn>
        <ol className="text-sm space-y-1">{rc.map(({ ref, notice, problems }) => <li key={ref.id}><span className="font-mono text-xs">{ref.id}.</span> {ref.text} <span className="text-xs text-lab-text-muted">doi:{ref.doi || '—'}</span>{notice && <> <Pill tone={notice.kind === 'retraction' ? 'red' : 'amber'}>{notice.kind}</Pill></>}{problems.length > 0 && <span className="block text-xs text-lab-amber">{problems.join(' ')}</span>}</li>)}</ol>
      </Panel>
    </div>
  )
}
