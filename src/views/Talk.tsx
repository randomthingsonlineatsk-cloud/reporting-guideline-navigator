import { useEffect, useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import { CHANNELS, CONGRESSES, SLIDE_KINDS, blankComm, blankTalk, checkComm, checkTalk, congress, encores, lift, newSlide, slideSeconds, talkHtml, talkSeconds, type Comm, type Talk as T } from '../domain/congress'
import { LEXICON_SEED } from '../domain/platform'
import { PLAN_SEED } from '../domain/phase4'
import { rulesHidden } from '../domain/project'
import { download } from '../domain/store'

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function Rehearse({ t }: { t: T }) {
  const [on, setOn] = useState(false), [el, setEl] = useState(0), [i, setI] = useState(0)
  useEffect(() => { if (!on) return; const h = setInterval(() => setEl((x) => x + 1), 1000); return () => clearInterval(h) }, [on])
  const c = congress(t.congress), lim = c.slotMin * 60, s = t.slides[i]
  const budget = t.slides.slice(0, i + 1).reduce((a, x) => a + slideSeconds(x), 0)
  return (
    <Panel title="Rehearse" sub={`Run the talk against the ${c.slotMin}-minute slot. The budget for each slide comes from its notes at 130 words a minute.`} right={<Pill tone={el > lim ? 'red' : el > lim - 60 ? 'amber' : 'green'}>{mmss(el)} / {mmss(lim)}</Pill>}>
      <div className="flex flex-wrap gap-1">
        <Btn onClick={() => setOn(!on)}>{on ? 'Pause' : el ? 'Resume' : 'Start'}</Btn>
        <Btn tone="grey" disabled={i === 0} onClick={() => setI(i - 1)}>Previous slide</Btn>
        <Btn tone="grey" disabled={i >= t.slides.length - 1} onClick={() => setI(i + 1)}>Next slide</Btn>
        <Btn tone="grey" onClick={() => { setOn(false); setEl(0); setI(0) }}>Reset</Btn>
      </div>
      {s && <div className="rounded border border-lab-line bg-white text-gray-900 p-4 aspect-video overflow-hidden"><p className="text-lg font-bold border-b-4 border-[#0072B2] mb-2">{s.title || '(no title)'}</p><p className="whitespace-pre-wrap text-sm">{s.body}</p></div>}
      {s && <p className="text-xs text-lab-text-muted">Slide {i + 1} of {t.slides.length} · {el > budget ? `${mmss(el - budget)} behind` : `${mmss(budget - el)} in hand`} · Notes: {s.notes || '—'}</p>}
    </Panel>
  )
}

export default function Talk() {
  const { p, act } = useStore()
  const t = p!.talk ?? blankTalk(), lex = p!.platform?.lexicon ?? LEXICON_SEED
  const upd = (fn: (x: T) => void) => act((q) => { q.talk ??= blankTalk(); fn(q.talk) })
  const rules = checkTalk(t, lex), c = congress(t.congress), sec = talkSeconds(t)
  const comms = p!.comms ?? []
  const updC = (fn: (x: Comm[]) => void) => act((q) => { q.comms ??= []; fn(q.comms) })
  const hide = rulesHidden(p!) && p!.mission?.id === 'RG14'
  const enc = encores(p!.plan ?? PLAN_SEED)
  const move = (i: number, d: number) => upd((x) => { const j = i + d; if (j < 0 || j >= x.slides.length) return; [x.slides[i], x.slides[j]] = [x.slides[j], x.slides[i]] })
  return (
    <div className="space-y-3">
      <Panel title="Congress talk" sub={`${c.name}: ${c.slotMin} minutes plus ${c.qaMin} for questions. ${c.photoPolicy}`} right={<div className="flex gap-1 items-center"><Pill tone={rules.every((r) => r.ok) ? 'green' : 'amber'}>{`${rules.filter((r) => r.ok).length} of ${rules.length}`}</Pill><Btn tone="grey" onClick={() => download('talk-slides.html', talkHtml(t), 'text/html')}>Slides (HTML, print 16:9)</Btn></div>}>
        <div className="grid sm:grid-cols-3 gap-2">
          <label className="block text-xs text-lab-text-muted">Congress<select className={inputCls} value={t.congress} onChange={(e) => upd((x) => { x.congress = e.target.value })}>{CONGRESSES.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select></label>
          <label className="block text-xs text-lab-text-muted">Presenter and affiliation<input className={inputCls} value={t.presenter} onChange={(e) => upd((x) => { x.presenter = e.target.value })} placeholder="A. Rao, Western Coast Medical College, Mumbai" /></label>
          <label className="block text-xs text-lab-text-muted">Encore of (leave blank if first shown here)<input className={inputCls} value={t.encore} onChange={(e) => upd((x) => { x.encore = e.target.value })} /></label>
        </div>
        <p className="text-xs text-lab-text-muted">{t.slides.length} slides · spoken notes {mmss(sec)} of {c.slotMin}:00</p>
        <ol className="space-y-2">{t.slides.map((s, i) => (
          <li key={s.id} className="rounded border border-lab-line p-2 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-mono">{i + 1}.</span>
              <select aria-label={`Kind of slide ${i + 1}`} className="rounded border border-lab-line bg-lab-panel-strong px-1 py-0.5" value={s.kind} onChange={(e) => upd((x) => { x.slides[i].kind = e.target.value as typeof s.kind })}>{SLIDE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
              <input aria-label={`Title of slide ${i + 1}`} className={`${inputCls} flex-1 min-w-40`} value={s.title} onChange={(e) => upd((x) => { x.slides[i].title = e.target.value })} placeholder="Slide title" />
              <Btn tone="grey" aria-label={`Move slide ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</Btn><Btn tone="grey" aria-label={`Move slide ${i + 1} down`} disabled={i === t.slides.length - 1} onClick={() => move(i, 1)}>↓</Btn>
              <Btn tone="grey" onClick={() => upd((x) => { x.slides.splice(i, 1) })}>Remove</Btn>
              <span className="text-lab-text-muted">{s.body.split(/\s+/).filter(Boolean).length} words · {mmss(slideSeconds(s))}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-1.5">
              <TextArea aria-label={`Slide ${i + 1} text`} className="min-h-16" value={s.body} onChange={(e) => upd((x) => { x.slides[i].body = e.target.value })} placeholder="On the slide (40 words, 6 lines at most)" />
              <TextArea aria-label={`Slide ${i + 1} notes`} className="min-h-16" value={s.notes} onChange={(e) => upd((x) => { x.slides[i].notes = e.target.value })} placeholder="What you will say" />
            </div>
          </li>
        ))}</ol>
        <div className="flex flex-wrap gap-1">{SLIDE_KINDS.filter((k) => ['background', 'methods', 'results', 'safety'].includes(k.id)).map((k) => <Btn key={k.id} tone="grey" onClick={() => upd((x) => { const at = x.slides.findIndex((y) => y.kind === 'conclusion'); x.slides.splice(at < 0 ? x.slides.length : at, 0, newSlide(k.id)) })}>Add a {k.label.toLowerCase()} slide</Btn>)}</div>
        <ul className="text-xs space-y-0.5">{rules.map((r) => <li key={r.id} className={r.ok ? 'text-lab-cdsco' : 'text-lab-text-muted'}>{r.ok ? '✓' : '○'} {r.label}{!r.ok && r.why ? `: ${r.why}` : ''}</li>)}</ul>
      </Panel>
      <Rehearse t={t} />
      <Panel title="Embargo" sub={c.note}>
        <p className="text-xs">Abstract data may be public from <b>{lift(c, 'abstract data').replace('T', ' ')}</b>; data first shown in the talk from <b>{lift(c, 'new data from the talk').replace('T', ' ')}</b> (congress time, UTC{c.tz}).</p>
        <div className="space-y-1.5">{comms.map((e, i) => {
          const r = checkComm(c, e), local = e.when ? e.when.slice(0, 16) : ''
          return (
            <div key={e.id} className={`grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-1.5 items-center rounded border p-1.5 ${r.ok ? 'border-lab-line' : 'border-lab-amber/60'}`}>
              <select aria-label="Channel" className={inputCls} value={e.channel} onChange={(ev) => updC((x) => { x[i].channel = ev.target.value as Comm['channel'] })}>{CHANNELS.map((k) => <option key={k}>{k}</option>)}</select>
              <select aria-label="Data" className={inputCls} value={e.what} onChange={(ev) => updC((x) => { x[i].what = ev.target.value as Comm['what'] })}><option>abstract data</option><option>new data from the talk</option></select>
              <input aria-label="When (congress time)" type="datetime-local" className={inputCls} value={local} onChange={(ev) => updC((x) => { x[i].when = ev.target.value ? `${ev.target.value}${c.tz}` : '' })} />
              <input aria-label="Note" className={inputCls} value={e.note} onChange={(ev) => updC((x) => { x[i].note = ev.target.value })} placeholder="Note (e.g. presenter's permission)" />
              <Btn tone="grey" onClick={() => updC((x) => { x.splice(i, 1) })}>Remove</Btn>
              <p className={`sm:col-span-5 text-xs ${r.ok ? 'text-lab-cdsco' : 'text-lab-amber'}`}>{r.ok ? '✓ Within the embargo rules.' : r.why}</p>
            </div>
          )
        })}</div>
        <Btn tone="grey" onClick={() => updC((x) => { x.push(blankComm(x.length)) })}>Add a communication</Btn>
      </Panel>
      <Panel title="Encore tracker" sub="Every congress presentation in the publication plan, in date order. An encore must come after the first presentation and say so.">
        <ul className="text-sm space-y-1">{enc.map((e) => <li key={e.id} className="flex flex-wrap gap-2 items-baseline"><span className="font-mono text-xs">{e.target}</span><span>{e.venue}</span><span className="text-xs text-lab-text-muted">{e.type} · {e.what}</span>{!hide && (e.ok ? <Pill tone="green">ok</Pill> : <span className="text-xs text-lab-amber">{e.why}</span>)}</li>)}</ul>
        {hide && <p className="text-xs text-lab-text-muted">The checks show after you score mission RG14.</p>}
      </Panel>
    </div>
  )
}
