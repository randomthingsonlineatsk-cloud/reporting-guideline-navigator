import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill } from './ui'
import { LESSONS, QUIZ_PASS } from '../domain/learn'

export default function Learn() {
  const { progress, record } = useStore()
  const [open, setOpen] = useState(LESSONS[0].id)
  const [ans, setAns] = useState<Record<string, number>>({})
  const [done, setDone] = useState(false)
  const l = LESSONS.find((x) => x.id === open)!
  const score = l.quiz.filter((q, i) => ans[`${l.id}-${i}`] === q.answer).length
  return (
    <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] gap-3 items-start">
      <nav aria-label="Lessons" className="space-y-1">
        {LESSONS.map((x) => { const s = progress.quizzes[x.id]?.score; return (
          <button key={x.id} onClick={() => { setOpen(x.id); setAns({}); setDone(false); window.scrollTo(0, 0) }} aria-current={open === x.id ? 'page' : undefined} className={`w-full text-left rounded border px-3 py-2 text-sm ${open === x.id ? 'border-lab-fda bg-lab-fda-soft/40' : 'border-lab-line hover:border-lab-fda/60'}`}>
            {x.title}{s !== undefined && <Pill tone={s >= QUIZ_PASS ? 'green' : 'amber'} className="ml-2">{`${s}/8`}</Pill>}
          </button>) })}
        <p className="text-[11px] text-lab-text-muted px-1">A lesson on posters and publication planning comes with the final phase.</p>
      </nav>
      <div className="space-y-3">
        <Panel title={l.title} sub={`Checked ${l.checked}.`}>
          <div className="space-y-2 text-sm leading-relaxed max-w-3xl">{l.body.map((b, i) => <p key={i}>{b}</p>)}</div>
          <p className="text-xs text-lab-text-muted">Sources: {l.sources.map((s, i) => <span key={s.url}>{i ? ' · ' : ''}<a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.label}</a></span>)}</p>
        </Panel>
        <Panel title="Quiz" sub={`${QUIZ_PASS} of 8 to pass. Your best score is kept.`}>
          <ol className="space-y-3">
            {l.quiz.map((q, i) => { const k = `${l.id}-${i}`; return (
              <li key={k} className="space-y-1">
                <p className="text-sm">{i + 1}. {q.q}</p>
                <div className="grid sm:grid-cols-2 gap-1" role="radiogroup" aria-label={`Question ${i + 1}`}>
                  {q.options.map((o, j) => { const chosen = ans[k] === j, right = done && j === q.answer, wrong = done && chosen && j !== q.answer; return (
                    <button key={j} role="radio" aria-checked={chosen} disabled={done} onClick={() => setAns({ ...ans, [k]: j })} className={`text-left rounded border px-2 py-1 text-sm ${right ? 'border-lab-cdsco bg-lab-cdsco-soft' : wrong ? 'border-lab-red bg-lab-red-soft' : chosen ? 'border-lab-fda bg-lab-fda-soft' : 'border-lab-line'}`}>{o}</button>) })}
                </div>
                {done && <p className="text-xs text-lab-text-muted">{q.why}</p>}
              </li>) })}
          </ol>
          {done ? <p role="status" className="text-sm">You scored <b>{score} of 8</b>{score >= QUIZ_PASS ? ' — passed.' : '. Read the lesson again and retry.'} <Btn tone="grey" onClick={() => { setAns({}); setDone(false) }}>Try again</Btn></p>
            : <Btn tone="solid" disabled={Object.keys(ans).filter((k) => k.startsWith(`${l.id}-`)).length < 8} onClick={() => { setDone(true); record((g) => { if ((g.quizzes[l.id]?.score ?? -1) < score) g.quizzes[l.id] = { score, utc: new Date().toISOString() } }) }}>Check my answers</Btn>}
        </Panel>
      </div>
    </div>
  )
}
