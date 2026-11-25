import { useStore } from '../state'
import { Btn, Panel, Pill, TextArea, inputCls } from './ui'
import { LIMITS, blankScript, blankVisual, checkScript, checkVisual, scriptText, seconds, visualSvg, type Script, type Visual } from '../domain/extras'
import { LEXICON_SEED } from '../domain/platform'
import { SAFE_PALETTE, checkAlt, checkPalette, checkText } from '../domain/a11y'
import { FIGURE_COLORS } from './Poster'
import { download } from '../domain/store'
import type { Rule } from '../domain/extras'

const Rules = ({ rules }: { rules: Rule[] }) => <ul className="text-xs space-y-0.5">{rules.map((r) => <li key={r.id} className={r.ok ? 'text-lab-cdsco' : 'text-lab-text-muted'}>{r.ok ? '✓' : '○'} {r.label}{!r.ok && r.why ? `: ${r.why}` : ''}</li>)}</ul>
const score = (rules: Rule[]) => <Pill tone={rules.every((r) => r.ok) ? 'green' : 'amber'}>{`${rules.filter((r) => r.ok).length} of ${rules.length}`}</Pill>

export default function Extras() {
  const { p, act } = useStore()
  const lex = p!.platform?.lexicon ?? LEXICON_SEED
  const v = p!.extras?.visual ?? blankVisual(), s = p!.extras?.script ?? blankScript()
  const updV = (fn: (x: Visual) => void) => act((q) => { q.extras ??= {}; q.extras.visual ??= blankVisual(); fn(q.extras.visual) })
  const updS = (fn: (x: Script) => void) => act((q) => { q.extras ??= {}; q.extras.script ??= blankScript(); fn(q.extras.script) })
  const vr = checkVisual(v, lex), sr = checkScript(s, lex), sec = seconds(s)
  const field = (k: keyof Visual, label: string, ph = '') => <label className="block text-xs text-lab-text-muted">{label}<input className={inputCls} value={String(v[k])} placeholder={ph} onChange={(e) => updV((x) => { (x as unknown as Record<string, string>)[k] = e.target.value })} /></label>
  const poster = p!.poster, posterAlt = checkAlt(poster?.figureAlt ?? ''), posterPal = checkPalette(FIGURE_COLORS)
  return (
    <div className="space-y-3">
      <Panel title="Visual abstract" sub="One landscape image that sums up the article for social media and the journal page: who, what was compared, what was found (with safety), and the conclusion, with the citation and the funder." right={<div className="flex gap-1 items-center">{score(vr)}<Btn tone="grey" onClick={() => download('visual-abstract.svg', visualSvg(v), 'image/svg+xml')}>Download (SVG)</Btn></div>}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3">
          <div className="space-y-1.5">
            {field('title', 'Title (15 words or fewer)')}{field('population', 'Who took part')}{field('design', 'How it was studied')}{field('arms', 'What was compared')}
            {field('headline', 'Main result, with numbers')}{field('safety', 'Safety')}{field('conclusion', 'Conclusion')}{field('citation', 'Citation')}{field('funder', 'Funder')}
            <label className="block text-xs text-lab-text-muted">Alt text<TextArea className="min-h-16" value={v.alt} onChange={(e) => updV((x) => { x.alt = e.target.value })} /></label>
            <div className="flex flex-wrap items-end gap-2 text-xs">
              {v.palette.map((c, i) => <label key={i} className="text-lab-text-muted">Colour {i + 1}<input type="color" aria-label={`Colour ${i + 1}`} className="block h-8 w-14" value={c} onChange={(e) => updV((x) => { x.palette[i] = e.target.value })} /></label>)}
              <label className="text-lab-text-muted">Text<input type="color" aria-label="Text colour" className="block h-8 w-14" value={v.fg} onChange={(e) => updV((x) => { x.fg = e.target.value })} /></label>
              <label className="text-lab-text-muted">Background<input type="color" aria-label="Background colour" className="block h-8 w-14" value={v.bg} onChange={(e) => updV((x) => { x.bg = e.target.value })} /></label>
              <Btn tone="grey" onClick={() => updV((x) => { x.palette = [SAFE_PALETTE[0], SAFE_PALETTE[1], '#555555']; x.fg = '#111111'; x.bg = '#ffffff' })}>Use a colour-safe palette</Btn>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded border border-lab-line bg-white" dangerouslySetInnerHTML={{ __html: visualSvg(v) }} />
            <Rules rules={vr} />
          </div>
        </div>
      </Panel>

      <Panel title={s.kind === 'video' ? 'Video abstract script' : 'Podcast script'} sub={`Narration is timed at ${LIMITS[s.kind].wpm} words a minute; the limit is ${LIMITS[s.kind].seconds / 60} minutes. Now ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}.`} right={<div className="flex gap-1 items-center">{score(sr)}<Btn tone="grey" onClick={() => download(`${s.kind}-script.txt`, scriptText(s), 'text/plain')}>Script (.txt)</Btn></div>}>
        <div className="flex flex-wrap gap-3 text-sm">
          {(['video', 'podcast'] as const).map((k) => <label key={k} className="flex items-center gap-1"><input type="radio" name="kind" checked={s.kind === k} onChange={() => updS((x) => { x.kind = k })} />{k === 'video' ? 'Video abstract (3 minutes)' : 'Podcast (10 minutes)'}</label>)}
          <label className="flex items-center gap-1"><input type="checkbox" checked={s.captions} onChange={(e) => updS((x) => { x.captions = e.target.checked })} />Captions</label>
          <label className="flex items-center gap-1"><input type="checkbox" checked={s.transcript} onChange={(e) => updS((x) => { x.transcript = e.target.checked })} />Transcript</label>
        </div>
        <ol className="space-y-2">{s.segments.map((g, i) => (
          <li key={i} className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] gap-1.5">
            {s.kind === 'video' ? <input aria-label={`On screen ${i + 1}`} className={inputCls} value={g.visual} onChange={(e) => updS((x) => { x.segments[i].visual = e.target.value })} placeholder="On screen" /> : <span className="text-xs text-lab-text-muted self-center">Part {i + 1}</span>}
            <TextArea aria-label={`Narration ${i + 1}`} className="min-h-16" value={g.narration} onChange={(e) => updS((x) => { x.segments[i].narration = e.target.value })} placeholder={s.kind === 'podcast' ? 'Host: …' : 'What is said'} />
            <Btn tone="grey" onClick={() => updS((x) => { x.segments.splice(i, 1) })} disabled={s.segments.length < 2}>Remove</Btn>
          </li>
        ))}</ol>
        <Btn tone="grey" onClick={() => updS((x) => { x.segments.push({ visual: '', narration: '' }) })}>Add a segment</Btn>
        <Rules rules={sr} />
      </Panel>

      <Panel title="Accessibility of the poster and figures" sub="The checks a reader using a screen reader, or with colour-vision deficiency, depends on.">
        <Rules rules={[
          { id: 'A1', label: 'The poster figure has alt text that gives its main result (Poster page)', ok: !poster?.figure || posterAlt.ok, why: poster?.figure ? posterAlt.why : '' },
          { id: 'A2', label: 'The figure\'s line colours stay apart with colour-vision deficiency', ok: posterPal.ok, why: posterPal.problems.join(' ') },
          { id: 'A3', label: `Poster body text at least 24 pt (now ${poster?.bodyPt ?? '—'})`, ok: !poster || poster.bodyPt >= 24 },
        ]} />
      </Panel>
    </div>
  )
}
