import { useMemo, useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import { VENUES, checkAbstract, count, venue } from '../domain/abstract'
import { manuscriptOf } from '../domain/project'
import hrp from '../data/hrp-301.json'
import glv from '../data/glv-12-301.json'

type Disp = { title: string; population?: string; head: string[]; rows: { label: string; cells: { text: string }[] }[]; footnotes?: string[] }
const outputsOf = (study: string) => ((study === 'GLV-12-301' ? glv : hrp) as unknown as { outputs: { id: string; title: string; display?: Disp | null }[] }).outputs.filter((o) => o.display)

export default function AbstractView() {
  const { p, act } = useStore()
  const m = manuscriptOf(p!)
  const study = m.study === 'GLV-12-301' ? 'GLV-12-301' : 'HRP-301'
  const [vid, setVid] = useState(p!.mission?.id === 'RG3' ? 'fennick' : study === 'GLV-12-301' ? 'orrin' : 'fennick')
  const v = venue(vid)
  const a = p!.abstracts.find((x) => x.venue === vid)
  const text = a?.text ?? ''
  const checks = useMemo(() => (text.trim() ? checkAbstract(text, v, study, m.kind !== 'protocol') : []), [text, v, study, m.kind])
  const [table, setTable] = useState('')
  const save = (t: string) => act((q) => { const x = q.abstracts.find((y) => y.venue === vid); if (x) { x.text = t; x.updatedUtc = new Date().toISOString() } else q.abstracts.push({ venue: vid, text: t, updatedUtc: new Date().toISOString() }) })
  const n = count(text, v)
  const outs = outputsOf(study)
  const shown = outs.find((o) => o.id === table)?.display
  return (
    <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 items-start">
      <Panel title="Abstract" sub="Plain text: the first line is the title; start each section on a new line with its heading and a colon (Methods: …). Registration and funding go on a last line.">
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="text-xs text-lab-text-muted">Venue<select className={inputCls} value={vid} disabled={p!.mission?.id === 'RG3'} onChange={(e) => setVid(e.target.value)}>{VENUES.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <div className="text-xs text-lab-text-muted self-end space-y-0.5"><p>Limit: <b className="text-lab-text">{v.limit} {v.unit}</b>. {v.counts}</p><p>{v.extra}</p></div>
        </div>
        <TextArea aria-label="Abstract text" className="min-h-[22rem] font-mono text-[13px]" value={text} onChange={(e) => save(e.target.value)} placeholder={`Title of the abstract\n${v.headings.map((h) => `${h}: `).join('\n')}\nTrial registration: …`} />
        <div className="flex flex-wrap gap-2 items-center">
          <Pill tone={n <= v.limit ? 'green' : 'red'}>{`${n} / ${v.limit} ${v.unit}`}</Pill>
          {!text.trim() && <Btn tone="grey" onClick={() => save(`Title\n${v.headings.map((h) => `${h}: `).join('\n')}\nTrial registration: \nFunding: `)}>Start from the headings</Btn>}
        </div>
      </Panel>
      <div className="space-y-3">
        <Panel title="Checks" sub="CONSORT for Abstracts (paraphrased), the venue's rules, and every number against the study outputs.">
          {!checks.length ? <p className="text-sm text-lab-text-muted">Write the abstract to see the checks.</p> : (
            <ul className="space-y-1">{checks.map((c) => <li key={c.label} className="text-xs flex gap-2"><span className={c.ok ? 'text-lab-cdsco' : 'text-lab-red'}>{c.ok ? '✓' : '✗'}</span><span><b>{c.label}.</b> <span className="text-lab-text-muted">{c.why}</span></span></li>)}</ul>
          )}
        </Panel>
        <Panel title="Study outputs" sub={`${study}: the tables the abstract's numbers must match (from the TLF Programming Lab).`}>
          <select className={inputCls} value={table} onChange={(e) => setTable(e.target.value)} aria-label="Output"><option value="">Choose a table…</option>{outs.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}</select>
          {shown && (
            <div className="overflow-x-auto rounded border border-lab-line">
              <table className="w-full text-xs"><thead className="bg-lab-panel-strong text-lab-text-muted"><tr><th className="px-2 py-1 text-left font-normal"></th>{shown.head.map((h) => <th key={h} className="px-2 py-1 text-left font-normal">{h}</th>)}</tr></thead>
                <tbody>{shown.rows.map((r, i) => <tr key={i} className="border-t border-lab-line/60"><td className="px-2 py-1">{r.label}</td>{r.cells.map((c, j) => <td key={j} className="px-2 py-1 font-mono whitespace-nowrap">{c.text}</td>)}</tr>)}</tbody></table>
              {shown.footnotes?.length ? <p className="px-2 py-1 text-[11px] text-lab-text-muted">{shown.footnotes.join(' ')}</p> : null}
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
