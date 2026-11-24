import { useState } from 'react'
import { useStore } from '../state'
import { useNav } from '../nav'
import { Btn, Panel, Pill, Tabs, inputCls } from './ui'
import { QUESTIONS, nextQuestion, recommend, RG1_CASES, scoreRG1 } from '../domain/picker'
import { CATALOGUE, guideline } from '../domain/guidelines'
import { record } from '../domain/missions'
import type { GuidelineId } from '../domain/types'

function Wizard() {
  const [a, setA] = useState<Record<string, string>>({})
  const q = nextQuestion(a), rec = recommend(a)
  const asked = QUESTIONS.filter((x) => x.id in a)
  const back = () => { const last = asked.at(-1); if (!last) return; const n = { ...a }; delete n[last.id]; setA(n) }
  return (
    <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 items-start">
      <Panel title={q ? q.ask : 'The guidelines for this study'} sub={q ? `Question ${asked.length + 1}` : 'Each with the reason it applies. Those marked "checklist in the app" can be checked in the workspace; the others link to their official pages.'}>
        {q && <div className="grid gap-1.5" role="radiogroup" aria-label={q.ask}>{q.options.map((o) => <button key={o.value} role="radio" aria-checked={false} className="text-left rounded border border-lab-line px-3 py-2 text-sm hover:border-lab-fda hover:bg-lab-fda-soft/40" onClick={() => setA({ ...a, [q.id]: o.value })}>{o.label}</button>)}</div>}
        {rec && (
          <div className="space-y-2">
            {rec.main ? <Rec id={rec.main} why={rec.why} main /> : <p className="text-sm rounded border border-lab-amber/60 bg-lab-amber-soft p-2">{rec.why} <a className="underline" href="https://www.equator-network.org/library/" target="_blank" rel="noreferrer">EQUATOR library</a></p>}
            {rec.also.map((x) => <Rec key={x.id} id={x.id} why={x.why} />)}
            {rec.traps.map((t) => <p key={t} className="text-xs text-lab-amber">Watch out: {t}</p>)}
          </div>
        )}
        <div className="flex gap-2">{asked.length > 0 && <Btn tone="grey" onClick={back}>Back</Btn>}{asked.length > 0 && <Btn tone="grey" onClick={() => setA({})}>Start again</Btn>}</div>
      </Panel>
      <Panel title="Your answers">
        {asked.length === 0 ? <p className="text-sm text-lab-text-muted">Answer the questions to see which guidelines apply.</p> : <ul className="text-sm space-y-1">{asked.map((x) => <li key={x.id}><span className="text-lab-text-muted">{x.ask}</span><br />{x.options.find((o) => o.value === a[x.id])?.label}</li>)}</ul>}
      </Panel>
    </div>
  )
}

function Rec({ id, why, main }: { id: GuidelineId; why: string; main?: boolean }) {
  const g = guideline(id)
  return (
    <div className={`rounded border p-2 space-y-0.5 ${main ? 'border-lab-cdsco/60 bg-lab-cdsco-soft/40' : 'border-lab-line'}`}>
      <p className="text-sm"><b>{g.name}</b> <span className="text-xs text-lab-text-muted">({g.version})</span> {main ? <Pill tone="green">main</Pill> : <Pill>also</Pill>} {g.built && <Pill tone="blue">checklist in the app</Pill>}</p>
      <p className="text-xs">{why}</p>
      <p className="text-xs text-lab-text-muted">{g.covers}. {g.note} <a className="underline" href={g.url} target="_blank" rel="noreferrer">Official page</a></p>
    </div>
  )
}

const EXT: GuidelineId[] = ['consort-abstracts', 'consort-harms', 'consort-ni', 'consort-cluster', 'prisma-s', 'stard-2015', 'tidier', 'tripod-cluster']
function RG1() {
  const { progress, record: rec } = useStore()
  const [res, setRes] = useState<ReturnType<typeof scoreRG1> | null>(null)
  const ans = progress.rg1
  const set = (id: string, fn: (x: { main: string; also: string[] }) => void) => rec((g) => { const x = g.rg1[id] ?? { main: '', also: [] }; fn(x); g.rg1[id] = x })
  return (
    <Panel title="Mission RG1 · Choose the guideline" sub="For each study, choose the main guideline (or none, when nothing fits) and every extension that also applies. Pass: 10 of 12.">
      <ol className="space-y-2">
        {RG1_CASES.map((c, i) => {
          const a = ans[c.id] ?? { main: '', also: [] }
          const d = res?.detail.find((x) => x.id === c.id)
          return (
            <li key={c.id} className="rounded border border-lab-line p-2 space-y-1.5">
              <p className="text-sm"><span className="font-mono text-xs text-lab-fda mr-1">{i + 1}.</span>{c.text}</p>
              <div className="grid sm:grid-cols-[16rem_1fr] gap-2 items-start">
                <select aria-label={`Main guideline for study ${i + 1}`} className={inputCls} value={a.main} onChange={(e) => set(c.id, (x) => { x.main = e.target.value })}>
                  <option value="" disabled>Choose…</option><option value="none">None fits: search the EQUATOR library</option>
                  {CATALOGUE.filter((g) => !EXT.includes(g.id) || g.id === 'stard-2015').map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">{EXT.map((e) => <label key={e} className="flex items-center gap-1"><input type="checkbox" checked={a.also.includes(e)} onChange={(ev) => set(c.id, (x) => { x.also = ev.target.checked ? [...x.also, e] : x.also.filter((y) => y !== e) })} />{guideline(e).name}</label>)}</div>
              </div>
              {d && <p className={`text-xs ${d.ok ? 'text-lab-cdsco' : 'text-lab-red'}`}>{d.ok ? '✓ Right.' : `✗ ${!d.mainOk ? 'The main guideline is not right.' : 'The extensions are not right.'}`} {c.why}</p>}
            </li>
          )
        })}
      </ol>
      <Btn tone="purple" onClick={() => { const r = scoreRG1(progress.rg1); rec((g) => record(g, 'RG1', { score: r.score, passed: r.passed, detail: [`${r.right} of 12 right`, ...r.detail.filter((d) => !d.ok).map((d) => `Study ${RG1_CASES.findIndex((c) => c.id === d.id) + 1}: ${d.why}`)] })); setRes(r) }}>Score this attempt</Btn>
      {res && <p role="status" className={`text-sm ${res.passed ? 'text-lab-cdsco' : 'text-lab-amber'}`}>{res.right} of 12 right · score {res.score} · {res.passed ? 'passed' : 'not yet'}. The reasons are shown under each study.</p>}
    </Panel>
  )
}

export default function Picker() {
  const { arg } = useNav()
  const [tab, setTab] = useState<'wizard' | 'rg1'>(arg === 'rg1' ? 'rg1' : 'wizard')
  return (
    <div className="space-y-3">
      <Tabs tabs={[{ id: 'wizard', label: 'Picker' }, { id: 'rg1', label: 'Mission RG1' }]} value={tab} onChange={setTab} />
      {tab === 'wizard' ? <Wizard /> : <RG1 />}
    </div>
  )
}
