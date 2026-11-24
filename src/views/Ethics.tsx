import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel } from './ui'
import { ETHICS_CASES, scoreRG15 } from '../domain/phase3'
import { record } from '../domain/missions'

export default function Ethics() {
  const { progress, record: rec } = useStore()
  const ans = progress.ethics ?? {}
  const [res, setRes] = useState<ReturnType<typeof scoreRG15> | null>(null)
  return (
    <Panel title="Mission RG15 · Publication ethics cases" sub="Eight situations from the life of a paper. Choose what the COPE guidance and the ICMJE Recommendations support. Pass: 6 of 8.">
      <ol className="space-y-3">
        {ETHICS_CASES.map((c, i) => (
          <li key={c.id} className="space-y-1">
            <p className="text-sm"><b>{i + 1}. {c.title}.</b> {c.text}</p>
            <div className="grid sm:grid-cols-2 gap-1" role="radiogroup" aria-label={c.title}>
              {c.options.map((o, j) => { const chosen = ans[c.id] === j, shown = !!res, right = shown && j === c.answer, wrong = shown && chosen && j !== c.answer; return (
                <button key={j} role="radio" aria-checked={chosen} onClick={() => { setRes(null); rec((g) => { g.ethics = { ...(g.ethics ?? {}), [c.id]: j } }) }} className={`text-left rounded border px-2 py-1 text-sm ${right ? 'border-lab-cdsco bg-lab-cdsco-soft' : wrong ? 'border-lab-red bg-lab-red-soft' : chosen ? 'border-lab-fda bg-lab-fda-soft' : 'border-lab-line'}`}>{o}</button>) })}
            </div>
            {res && <p className="text-xs text-lab-text-muted">{c.why}</p>}
          </li>
        ))}
      </ol>
      <Btn tone="purple" disabled={Object.keys(ans).length < ETHICS_CASES.length} onClick={() => { const r = scoreRG15(ans); rec((g) => record(g, 'RG15', r)); setRes(r) }}>Score this attempt</Btn>
      {res && <p role="status" className={`text-sm ${res.passed ? 'text-lab-cdsco' : 'text-lab-amber'}`}>{res.detail[0]} · score {res.score} · {res.passed ? 'passed' : 'not yet'}</p>}
    </Panel>
  )
}
