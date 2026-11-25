import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import type { Project } from '../domain/types'
import { DRAFT_STATEMENTS, KINDS, align, blankPlatform, checkStatement, platformHtml, type Platform as PF, type Target } from '../domain/platform'
import { OUTPUTS, suggestOutputs } from '../domain/outputs'
import { download } from '../domain/store'

/** Every key message in the project that the platform should govern. */
export function targetsOf(p: Project): Target[] {
  const t: Target[] = []
  p.poster?.messages.forEach((m, i) => t.push({ where: `Poster, key message ${i + 1}`, text: m }))
  if (p.poster?.sections.Conclusions) t.push({ where: 'Poster, conclusions', text: p.poster.sections.Conclusions })
  for (const a of p.abstracts) { const c = /Conclusions?:\s*([^\n]+)/i.exec(a.text)?.[1]; if (c) t.push({ where: `Abstract (${a.venue}), conclusions`, text: c }) }
  const ex = (p as Project & { extras?: { visual?: { headline?: string; conclusion?: string } } }).extras?.visual
  if (ex?.headline) t.push({ where: 'Visual abstract, headline', text: ex.headline })
  if (ex?.conclusion) t.push({ where: 'Visual abstract, conclusion', text: ex.conclusion })
  const talk = (p as Project & { talk?: { slides: { kind: string; title: string; body: string }[] } }).talk
  talk?.slides.filter((s) => s.kind === 'conclusion').forEach((s, i) => t.push({ where: `Talk, conclusions slide ${i + 1}`, text: s.body }))
  return t
}

export default function Platform() {
  const { p, act } = useStore()
  const pf = p!.platform ?? blankPlatform()
  const upd = (fn: (x: PF) => void) => act((q) => { q.platform ??= blankPlatform(); fn(q.platform) })
  const checks = pf.statements.map((s) => checkStatement(s, pf.lexicon))
  const clean = checks.filter((c) => !c.length).length
  const al = align(pf, targetsOf(p!))
  return (
    <div className="space-y-3">
      <Panel title="Scientific communication platform" sub="Five core statements that every abstract, poster, talk and visual abstract must come back to, each tied to the study outputs that support it. Fictional product and study." right={<div className="flex gap-1 items-center"><Pill tone={clean === pf.statements.length ? 'green' : 'amber'}>{`${clean} of ${pf.statements.length} clean`}</Pill><Btn tone="grey" onClick={() => upd((x) => { x.statements = DRAFT_STATEMENTS.map((s) => ({ ...s, support: [...s.support] })) })}>Load a colleague's draft</Btn><Btn tone="grey" onClick={() => download('communication-platform.html', platformHtml(pf), 'text/html')}>Platform (HTML)</Btn></div>}>
        <div className="space-y-2">
          {pf.statements.map((s, i) => (
            <div key={s.id} className={`rounded border p-2 space-y-1.5 ${checks[i].length ? 'border-lab-amber/60' : 'border-lab-line'}`}>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono">{i + 1}.</span>
                <select aria-label={`Theme of statement ${i + 1}`} className="rounded border border-lab-line bg-lab-panel-strong px-1 py-0.5" value={s.kind} onChange={(e) => upd((x) => { x.statements[i].kind = e.target.value as typeof s.kind })}>{KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}</select>
                {suggestOutputs(s.text).filter((id) => !s.support.includes(id)).length > 0 && <span className="text-lab-text-muted">Numbers found in: {suggestOutputs(s.text).join(', ')}</span>}
              </div>
              <TextArea aria-label={`Core statement ${i + 1}`} className="min-h-14" value={s.text} onChange={(e) => upd((x) => { x.statements[i].text = e.target.value })} />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">{OUTPUTS.map((o) => <label key={o.id} className="flex items-center gap-1"><input type="checkbox" checked={s.support.includes(o.id)} onChange={(e) => upd((x) => { const sp = x.statements[i].support; x.statements[i].support = e.target.checked ? [...sp, o.id] : sp.filter((y) => y !== o.id) })} />{o.title.replace(/:.*/, '')}</label>)}</div>
              {checks[i].length > 0 && <ul className="text-xs text-lab-amber list-disc pl-5">{checks[i].map((f, j) => <li key={j}><b>{f.rule}:</b> {f.text}</li>)}</ul>}
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Lexicon" sub="The agreed terms. Any message that uses a term in the second column is flagged.">
        <div className="space-y-1">
          {pf.lexicon.map((t, i) => (
            <div key={i} className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto] gap-1.5">
              <input aria-label="Use" className={inputCls} value={t.use} onChange={(e) => upd((x) => { x.lexicon[i].use = e.target.value })} />
              <input aria-label="Not" className={inputCls} value={t.avoid.join(', ')} onChange={(e) => upd((x) => { x.lexicon[i].avoid = e.target.value.split(',').map((y) => y.trim()) })} />
              <input aria-label="Note" className={inputCls} value={t.note} onChange={(e) => upd((x) => { x.lexicon[i].note = e.target.value })} />
              <Btn tone="grey" onClick={() => upd((x) => { x.lexicon.splice(i, 1) })}>Remove</Btn>
            </div>
          ))}
          <Btn tone="grey" onClick={() => upd((x) => { x.lexicon.push({ use: '', avoid: [], note: '' }) })}>Add a term</Btn>
        </div>
      </Panel>
      <Panel title="Do the messages match the platform?" sub="The key messages from the poster, the abstract conclusions, the visual abstract and the talk, each matched to its closest core statement.">
        {al.length === 0 ? <p className="text-sm text-lab-text-muted">No messages yet. Write the poster's key messages or an abstract first.</p> : (
          <ul className="space-y-1.5 text-sm">{al.map((a, i) => (
            <li key={i} className={`rounded border p-2 ${a.aligned ? 'border-lab-line' : 'border-lab-amber/60'}`}>
              <div className="flex flex-wrap justify-between gap-2 text-xs"><span className="text-lab-text-muted">{a.where}</span><Pill tone={a.aligned ? 'green' : 'amber'}>{a.aligned ? `matches statement ${a.best?.slice(1)}` : a.overlap < 0.35 ? 'not on the platform' : 'claims more than the platform'}</Pill></div>
              <p>{a.text}</p>
              {a.problems.length > 0 && <ul className="text-xs text-lab-amber list-disc pl-5">{a.problems.map((f, j) => <li key={j}><b>{f.rule}:</b> {f.text}</li>)}</ul>}
            </li>
          ))}</ul>
        )}
      </Panel>
    </div>
  )
}
