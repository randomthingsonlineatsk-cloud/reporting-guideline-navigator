import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill, Stat, inputCls, type Tone } from './ui'
import { CATALOGUE, allItems, guideline } from '../domain/guidelines'
import { PROTOCOL_GAPS } from '../domain/manuscripts'
import { coverage, flagOf, manuscriptOf, setTag, tagOf, toggleTagPara, STATUS_LABEL } from '../domain/project'
import type { Status } from '../domain/types'
import { cn } from '@/lib/utils'

const FLAG_TONE: Record<string, Tone> = { ok: 'green', weak: 'amber', missing: 'red', 'na-reason': 'amber', untagged: 'grey' }
const FLAG_LABEL: Record<string, string> = { ok: 'ok', weak: 'check', missing: 'not reported', 'na-reason': 'reason?', untagged: 'to do' }
const SHORT: Record<string, string> = { 'consort-2025': 'CONSORT', 'consort-abstracts': 'Abstract', 'consort-harms': 'Harms', 'spirit-2025': 'SPIRIT' }
const STATUSES: Status[] = ['reported', 'partly', 'missing', 'na']

export default function Workspace() {
  const { p, act, tick } = useStore()
  const m = useMemo(() => manuscriptOf(p!), [p?.id, p?.ownText, p?.mission?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const [active, setActive] = useState<string>('')
  const [filter, setFilter] = useState<'all' | 'todo' | 'flagged'>('all')
  const [key, setKey] = useState(false)
  const cov = useMemo(() => coverage(p!, m), [p, m, tick]) // eslint-disable-line react-hooks/exhaustive-deps
  const items = allItems(p!.guidelines.filter((g) => guideline(g).built))
  const shown = items.filter((x) => { const f = cov.flags.find((y) => y.key === x.key)!.flag.kind; return filter === 'all' || (filter === 'todo' ? f === 'untagged' : f !== 'ok' && f !== 'untagged') })
  const num = new Map(m.paras.map((x, i) => [x.id, i + 1]))
  const tagsOn = (para: string) => Object.entries(p!.tags).filter(([, t]) => t.paras.includes(para)).map(([k]) => k)
  const activeTag = active ? tagOf(p!, active) : null
  const answer = !p!.mission && m.id !== 'own'
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return
      if (e.key !== 'j' && e.key !== 'k') return
      const i = shown.findIndex((x) => x.key === active), j = e.key === 'j' ? Math.min(shown.length - 1, i + 1) : Math.max(0, i - 1)
      if (shown[j]) { setActive(shown[j].key); document.getElementById(`item-${shown[j].key}`)?.scrollIntoView({ block: 'nearest' }) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  })
  let lastSection = ''
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <Stat label="Items" value={cov.total} />
        <Stat label="Checked" value={`${cov.done}`} tone="blue" />
        <Stat label="Reported" value={cov.ok} tone="green" />
        <Stat label="To look at" value={cov.weak} tone="amber" />
        <Stat label="Not reported" value={cov.missing} tone="red" />
      </div>
      {m.note && <p className="text-xs text-lab-text-muted">{m.note}</p>}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 items-start">
        <Panel title={m.title} sub={`${m.kind === 'protocol' ? m.journal : m.journal || 'Your text'} · ${m.paras.length} paragraphs${active ? ' · click a paragraph to tag it for the selected item' : ' · select an item on the right, then click the paragraphs that report it'}`} className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          {activeTag && <div className="sticky top-0 z-10 rounded border border-lab-fda/60 bg-lab-panel px-2 py-1.5 text-xs flex flex-wrap gap-2 items-center"><Pill tone="blue">{active.split(':')[1]}</Pill><span className="mr-auto">{items.find((x) => x.key === active)?.i.text}</span><button className="underline text-lab-text-muted" onClick={() => setActive('')}>Done</button></div>}
          <ol className="space-y-1.5">
            {m.paras.map((x) => {
              const head = x.section !== lastSection ? x.section : ''; lastSection = x.section
              const on = !!activeTag?.paras.includes(x.id), tags = tagsOn(x.id)
              return (
                <li key={x.id}>
                  {head && <p className="font-mono text-[11px] uppercase text-lab-ema mt-3 mb-1">{head}</p>}
                  <button disabled={!active} onClick={() => act((q) => toggleTagPara(q, active, x.id))} aria-pressed={on}
                    className={cn('w-full text-left rounded border px-2 py-1.5 text-sm leading-relaxed transition', on ? 'border-lab-fda bg-lab-fda-soft' : 'border-transparent hover:border-lab-line', !active && 'cursor-default')}>
                    <span className="font-mono text-[10px] text-lab-text-muted mr-1.5">¶{num.get(x.id)}</span>
                    {x.heading && <b className="mr-1">{x.heading}.</b>}{x.text}
                    {tags.length > 0 && <span className="block mt-1 flex flex-wrap gap-1">{tags.map((k) => <Pill key={k} tone={k === active ? 'blue' : 'grey'}>{`${SHORT[k.split(':')[0]] ?? ''} ${k.split(':')[1]}`}</Pill>)}</span>}
                  </button>
                </li>
              )
            })}
          </ol>
        </Panel>

        <Panel title="Checklist" sub="Items are paraphrased; the official wording is on each guideline's site. Tag the paragraphs that report an item, then choose its status. A rule flags tagged text that looks weak." right={
          <div className="flex flex-wrap gap-1">{(['all', 'todo', 'flagged'] as const).map((f) => <Btn key={f} tone={filter === f ? 'blue' : 'grey'} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'todo' ? 'To do' : 'Flagged'}</Btn>)}</div>}>
          {!p!.mission && <div className="flex flex-wrap gap-2 items-center text-xs text-lab-text-muted">Guidelines:
            {CATALOGUE.filter((g) => g.built).map((g) => <label key={g.id} className="flex items-center gap-1"><input type="checkbox" checked={p!.guidelines.includes(g.id)} onChange={(e) => act((q) => { q.guidelines = e.target.checked ? [...q.guidelines, g.id] : q.guidelines.filter((x) => x !== g.id) })} />{g.name}</label>)}
            {answer && <label className="flex items-center gap-1 ml-auto"><input type="checkbox" checked={key} onChange={(e) => setKey(e.target.checked)} />Show the answer key</label>}
          </div>}
          {p!.guidelines.filter((g) => guideline(g).built).map((gid) => {
            const g = guideline(gid), list = shown.filter((x) => x.g === gid)
            if (!list.length) return null
            let sec = ''
            return (
              <div key={gid} className="space-y-1">
                <p className="font-mono text-xs text-lab-fda pt-2">{g.name} <span className="text-lab-text-muted">· {g.covers} · <a className="underline" href={g.url} target="_blank" rel="noreferrer">official checklist</a></span></p>
                {list.map(({ i, key: k }) => {
                  const t = tagOf(p!, k), f = flagOf(p!, m, k), head = i.section !== sec ? i.section : ''; sec = i.section
                  const isActive = active === k, keyParas = m.key[k] ?? []
                  return (
                    <div key={k} id={`item-${k}`}>
                      {head && <p className="text-[11px] uppercase text-lab-text-muted mt-2">{head}</p>}
                      <div className={cn('rounded border px-2 py-1.5 space-y-1', isActive ? 'border-lab-fda bg-lab-fda-soft/40' : 'border-lab-line/60')}>
                        <div className="flex gap-2 items-start">
                          <button className="font-mono text-xs text-lab-fda w-9 shrink-0 text-left" onClick={() => setActive(isActive ? '' : k)} aria-label={`Select item ${i.id}`}>{i.id}</button>
                          <button className="text-left text-sm flex-1" onClick={() => setActive(isActive ? '' : k)}>{i.text}{i.change && <Pill tone="purple" className="ml-1">{i.change}</Pill>}{i.ifApplicable && <span className="text-[11px] text-lab-text-muted"> (where relevant)</span>}</button>
                          <Pill tone={FLAG_TONE[f.kind]}>{FLAG_LABEL[f.kind]}</Pill>
                        </div>
                        {isActive && (
                          <div className="pl-11 space-y-1.5">
                            {i.look && <p className="text-[11px] text-lab-text-muted">Look for: {i.look}</p>}
                            <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={`Status of item ${i.id}`}>
                              {STATUSES.map((s) => <Btn key={s} role="radio" aria-checked={t.status === s} tone={t.status === s ? (s === 'reported' ? 'green' : s === 'missing' ? 'red' : s === 'partly' ? 'amber' : 'purple') : 'grey'} onClick={() => act((q) => setTag(q, k, (x) => { x.status = x.status === s ? '' : s }))}>{STATUS_LABEL[s]}</Btn>)}
                            </div>
                            <p className="text-xs">Tagged: {t.paras.length ? t.paras.map((x) => `¶${num.get(x)}`).join(', ') : 'none yet (click paragraphs on the left)'}</p>
                            {t.status === 'na' && <input className={inputCls} placeholder="Why it does not apply" value={t.reason ?? ''} onChange={(e) => act((q) => setTag(q, k, (x) => { x.reason = e.target.value }))} />}
                            <input className={inputCls} placeholder="Note (optional)" value={t.note ?? ''} onChange={(e) => act((q) => setTag(q, k, (x) => { x.note = e.target.value }))} />
                            <p className={cn('text-xs', f.kind === 'ok' ? 'text-lab-cdsco' : f.kind === 'untagged' ? 'text-lab-text-muted' : 'text-lab-amber')}>{f.why}</p>
                            {key && <p className="text-xs text-lab-ema">Answer key: {m.id === 'hrp-301-protocol' && PROTOCOL_GAPS[i.id] && k.startsWith('spirit') ? `${keyParas.length ? 'partly reported' : 'not reported'}: ${PROTOCOL_GAPS[i.id]}` : keyParas.length ? `reported in ${keyParas.map((x) => `¶${num.get(x)}`).join(', ')}` : m.na.includes(k) ? 'not applicable' : 'not reported in this manuscript'}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
          {shown.length === 0 && <p className="text-sm text-lab-text-muted">Nothing in this filter.</p>}
        </Panel>
      </div>
    </div>
  )
}
