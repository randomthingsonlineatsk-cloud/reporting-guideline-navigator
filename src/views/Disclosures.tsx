import { useState } from 'react'
import { useStore } from '../state'
import { Panel, Pill, inputCls } from './ui'
import { AiLogPanel, StatementsPanel } from './Pack'
import { DISCLOSURE_ITEMS, RG5_FORMS, RG5_SOURCES, RG5_STATEMENTS, RG4_CONTRIBUTORS } from '../domain/phase3'

export default function Disclosures() {
  const { p, act } = useStore()
  const cast = p!.manuscriptId === 'glyde-3'
  const authors = cast ? RG4_CONTRIBUTORS.filter((x) => x.author).map((x) => x.name.replace(/,.*$/, '')) : (p!.people ?? []).filter((x) => p!.rg4?.people[x.id]?.author).map((x) => x.name)
  const [who, setWho] = useState(authors[0] ?? '')
  const forms = p!.forms ?? {}
  const seed = (name: string) => RG5_FORMS.find((f) => f.who === name)?.entries ?? {}
  const entry = (name: string, i: number) => forms[name]?.[i] ?? (cast ? seed(name)[i] ?? '' : '')
  const summary = authors.map((n) => { const e = DISCLOSURE_ITEMS.map((_, i) => entry(n, i + 1)).filter(Boolean); return `${n}: ${e.length ? e.join(' ') : 'nothing to disclose.'}` })
  const flags = p!.rg5 ?? {}
  return (
    <div className="space-y-3">
      <Panel title="ICMJE disclosure forms" sub="One form per author. Item 1 covers the support for this work with no time limit; items 2 to 13 cover the past 36 months, whether or not the author thinks they matter. The competing interests statement summarises the forms.">
        {authors.length === 0 ? <p className="text-sm text-lab-text-muted">Decide the authors on the Authorship page first.</p> : (
          <>
            <div className="flex flex-wrap gap-1">{authors.map((a) => <button key={a} onClick={() => setWho(a)} className={`rounded border px-2 py-1 text-xs ${who === a ? 'border-lab-fda text-lab-fda' : 'border-lab-line'}`}>{a}</button>)}</div>
            <div className="grid md:grid-cols-2 gap-2">
              {DISCLOSURE_ITEMS.map((label, i) => (
                <label key={i} className="text-xs text-lab-text-muted">{i + 1}. {label}
                  <input className={inputCls} value={entry(who, i + 1)} placeholder="None" onChange={(e) => act((q) => { q.forms ??= {}; q.forms[who] ??= {}; q.forms[who][i + 1] = e.target.value })} /></label>
              ))}
            </div>
            <p className="text-xs"><b>Competing interests, from the forms:</b> {summary.join(' ')}</p>
          </>
        )}
      </Panel>

      {cast && (
        <Panel title="The statements for the GLYDE-3 submission" sub="Read each against the sources, and tick the ones that do not agree with them. (Mission RG5 scores these ticks.)">
          <div className="grid lg:grid-cols-2 gap-3 items-start">
            <div className="space-y-1.5">
              {RG5_STATEMENTS.map((s) => (
                <label key={s.id} className={`block rounded border p-2 text-sm ${flags[s.id] ? 'border-lab-red/70 bg-lab-red-soft/40' : 'border-lab-line'}`}>
                  <span className="flex items-start gap-2"><input type="checkbox" className="mt-1" checked={!!flags[s.id]} onChange={(e) => act((q) => { q.rg5 = { ...(q.rg5 ?? {}), [s.id]: e.target.checked } })} /><span><b>{s.label}.</b> {s.text}</span></span>
                </label>
              ))}
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-mono text-lab-text-muted uppercase">Sources</p>
              {Object.entries(RG5_SOURCES).map(([k, v]) => <p key={k} className="rounded border border-lab-line p-2">{v}</p>)}
              <p className="rounded border border-lab-line p-2">Disclosure forms: {RG5_FORMS.map((f) => `${f.who}: ${Object.entries(f.entries).map(([i, t]) => `item ${i}, ${t}`).join(' ')}`).join(' · ')}</p>
              {(!p!.mission || p!.mission.scoredUtc) && <p className="text-lab-text-muted">ICMJE: registration at or before the first enrolment, in a WHO primary registry or ClinicalTrials.gov; a data sharing statement in which "undecided" is not acceptable; AI writing assistance disclosed in the acknowledgements; the funder's role stated as it was. <Pill>January 2026</Pill></p>}
            </div>
          </div>
        </Panel>
      )}
      {!p!.mission && <><StatementsPanel /><AiLogPanel /></>}
    </div>
  )
}
