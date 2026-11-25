import { useEffect, useRef, useState } from 'react'
import qrcode from 'qrcode-generator'
import { useStore } from '../state'
import { Btn, Panel, TextArea, inputCls } from './ui'
import { POSTER_RULES, POSTER_SECTIONS, QR_TARGET, blankPoster, posterChecks, posterWords, type Poster as P } from '../domain/phase4'
import { download } from '../domain/store'
import hrp from '../data/hrp-301.json'

type Frame = { columns: string[]; rows: (string | null)[][] }
export const FIGURE_COLORS = ['#6b7280', '#2b7bd3', '#c0392b']
const FIGS = (hrp as unknown as { outputs: { id: string; title: string; kind: string; frame?: Frame }[] }).outputs.filter((o) => o.kind === 'figure')

/** The figure, drawn from its data frame (mean percent change by visit, one line per group). */
export function figureSvg(id: string, w = 520, h = 300, alt = ''): string {
  const f = FIGS.find((x) => x.id === id); if (!f?.frame) return ''
  const c = (n: string) => f.frame!.columns.indexOf(n)
  const groups = [...new Set(f.frame.rows.map((r) => String(r[c('TRT01P')])))]
  const pts = f.frame.rows.map((r) => ({ g: String(r[c('TRT01P')]), x: Number(r[c('AVISITN')]), y: Number(r[c('MEAN')]) }))
  const xs = [...new Set(pts.map((p) => p.x))].sort((a, b) => a - b), ymin = Math.floor(Math.min(...pts.map((p) => p.y)) / 10) * 10
  const X = (x: number) => 60 + ((x - xs[0]) / (xs.at(-1)! - xs[0])) * (w - 90), Y = (y: number) => 30 + (y / ymin) * (h - 80)
  const col = FIGURE_COLORS
  const lines = groups.map((g, i) => { const ps = pts.filter((p) => p.g === g).sort((a, b) => a.x - b.x); return `<polyline fill="none" stroke="${col[i % 3]}" stroke-width="3" points="${ps.map((p) => `${X(p.x)},${Y(p.y)}`).join(' ')}"/><text x="${w - 20}" y="${Y(ps.at(-1)!.y) + 4}" text-anchor="end" font-size="13" fill="${col[i % 3]}" dy="${i * 14 - 14}">${g}</text>` }).join('')
  const ticks = xs.map((x) => `<text x="${X(x)}" y="${h - 30}" text-anchor="middle" font-size="12" fill="#333">${x}</text>`).join('')
  const yt = [0, ymin / 2, ymin].map((v) => `<text x="52" y="${Y(v) + 4}" text-anchor="end" font-size="12" fill="#333">${v}</text><line x1="58" x2="${w - 30}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ddd"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" font-family="Arial, sans-serif" role="img" aria-label="${(alt || f.title).replace(/"/g, '&quot;')}">${yt}${ticks}${lines}<text x="${w / 2}" y="${h - 8}" text-anchor="middle" font-size="12" fill="#333">Week</text><text x="14" y="${h / 2}" transform="rotate(-90 14 ${h / 2})" text-anchor="middle" font-size="12" fill="#333">Mean % change in HECSI</text></svg>`
}

export function qrSvg(text: string): string {
  if (!text.trim()) return ''
  const q = qrcode(0, 'M'); q.addData(text); q.make()
  return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true })
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
export function posterHtml(p: P): string {
  const land = p.size === 'A0 landscape'
  const sec = (s: string) => `<section><h2>${s}</h2><p>${esc(p.sections[s] ?? '')}</p>${s === 'Results' && p.figure ? `<figure>${figureSvg(p.figure, 520, 300, p.figureAlt ?? '')}<figcaption>${esc(FIGS.find((f) => f.id === p.figure)?.title ?? '')}</figcaption></figure>` : ''}</section>`
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(p.title)}</title><style>@page{size:A0 ${land ? 'landscape' : 'portrait'};margin:0}body{margin:0;font-family:Arial,sans-serif;color:#111}.p{width:${land ? 1189 : 841}mm;height:${land ? 841 : 1189}mm;box-sizing:border-box;padding:30mm;display:flex;flex-direction:column;gap:14mm}h1{font-size:${p.titlePt}pt;margin:0;line-height:1.1}.a{font-size:${Math.round(p.bodyPt * 0.9)}pt}.enc{font-size:${p.bodyPt}pt;background:#fde9b8;padding:4mm 8mm;align-self:flex-start}.cols{display:grid;grid-template-columns:repeat(${land ? 3 : 2},1fr);gap:14mm;font-size:${p.bodyPt}pt;line-height:1.35}h2{font-size:${Math.round(p.bodyPt * 1.5)}pt;border-bottom:3mm solid #2b7bd3;margin:0 0 4mm}figure{margin:6mm 0}figcaption{font-size:${Math.round(p.bodyPt * 0.8)}pt}.k{background:#e8f1fb;padding:8mm;font-size:${Math.round(p.bodyPt * 1.15)}pt}.k li{margin-bottom:4mm}.f{display:flex;gap:12mm;align-items:flex-end;font-size:${Math.round(p.bodyPt * 0.75)}pt;margin-top:auto}.f svg{width:60mm;height:60mm}</style></head><body><div class="p"><h1>${esc(p.title)}</h1><div class="a">${esc(p.authors)}</div>${p.encore ? `<div class="enc">${esc(p.encore)}</div>` : ''}<div class="k"><b>Key messages</b><ol>${p.messages.map((m) => `<li>${esc(m)}</li>`).join('')}</ol></div><div class="cols">${POSTER_SECTIONS.map(sec).join('')}</div><div class="f">${qrSvg(p.qr)}<div><p>${esc(p.disclosure)}</p><p>${esc(p.ack)}</p><p>Scan for the full data: ${esc(p.qr)}</p></div></div></div></body></html>`
}

/** The A0 page (at 96 dpi) scaled to the width of its box, so it never widens the page. */
function Scaled({ html, land }: { html: string; land: boolean }) {
  const box = useRef<HTMLDivElement>(null), [w, setW] = useState(0)
  const W = land ? 4494 : 3179, H = land ? 3179 : 4494
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setW(el.clientWidth)); ro.observe(el); setW(el.clientWidth); return () => ro.disconnect() }, [])
  return (
    <div ref={box} className="relative w-full min-w-0 rounded border border-lab-line bg-white overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
      {w > 0 && <iframe title="Poster preview" srcDoc={html} className="absolute left-0 top-0 origin-top-left border-0" style={{ width: W, height: H, transform: `scale(${w / W})` }} />}
    </div>
  )
}

export default function Poster() {
  const { p, act } = useStore()
  const d = p!.poster ?? blankPoster()
  const upd = (fn: (x: P) => void) => act((q) => { q.poster ??= blankPoster(); fn(q.poster) })
  const checks = posterChecks(d)
  const html = posterHtml(d)
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-3 items-start">
      <div className="space-y-3">
        <Panel title="Congress poster" sub={`${POSTER_RULES.congress}: A0, at most ${POSTER_RULES.words} words, body text at least ${POSTER_RULES.minBody} pt and title at least ${POSTER_RULES.minTitle} pt. A poster shown before must say so (an encore). ${posterWords(d)} words so far.`}>
          <label className="block text-xs text-lab-text-muted">Title<input className={inputCls} value={d.title} onChange={(e) => upd((x) => { x.title = e.target.value })} /></label>
          <label className="block text-xs text-lab-text-muted">Authors and affiliations<input className={inputCls} value={d.authors} onChange={(e) => upd((x) => { x.authors = e.target.value })} placeholder="A. Rao, Western Coast Medical College, Mumbai; …" /></label>
          <label className="block text-xs text-lab-text-muted">Encore label<input className={inputCls} value={d.encore} onChange={(e) => upd((x) => { x.encore = e.target.value })} placeholder="Encore: first presented at …" /></label>
          <div className="grid sm:grid-cols-2 gap-2">{POSTER_SECTIONS.map((s) => <label key={s} className="block text-xs text-lab-text-muted">{s}<TextArea className="min-h-28" value={d.sections[s] ?? ''} onChange={(e) => upd((x) => { x.sections[s] = e.target.value })} /></label>)}</div>
          <div className="grid sm:grid-cols-3 gap-2">{d.messages.map((m, i) => <label key={i} className="block text-xs text-lab-text-muted">Key message {i + 1}<TextArea className="min-h-16" value={m} onChange={(e) => upd((x) => { x.messages[i] = e.target.value })} /></label>)}</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <label className="block text-xs text-lab-text-muted">Figure<select className={inputCls} value={d.figure} onChange={(e) => upd((x) => { x.figure = e.target.value })}><option value="">None</option>{FIGS.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}</select></label>
            <label className="block text-xs text-lab-text-muted">Figure alt text (what it shows and its main result)<input className={inputCls} value={d.figureAlt ?? ''} onChange={(e) => upd((x) => { x.figureAlt = e.target.value })} /></label>
            <label className="block text-xs text-lab-text-muted">QR code target<span className="flex gap-1"><input className={inputCls} value={d.qr} onChange={(e) => upd((x) => { x.qr = e.target.value })} placeholder="https://…" /><Btn tone="grey" onClick={() => upd((x) => { x.qr = QR_TARGET })}>Study page</Btn></span></label>
            <label className="block text-xs text-lab-text-muted">Size<select className={inputCls} value={d.size} onChange={(e) => upd((x) => { x.size = e.target.value as P['size'] })}><option>A0 portrait</option><option>A0 landscape</option></select></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs text-lab-text-muted">Body text (pt)<input type="number" className={inputCls} value={d.bodyPt} onChange={(e) => upd((x) => { x.bodyPt = Number(e.target.value) })} /></label>
              <label className="block text-xs text-lab-text-muted">Title (pt)<input type="number" className={inputCls} value={d.titlePt} onChange={(e) => upd((x) => { x.titlePt = Number(e.target.value) })} /></label>
            </div>
          </div>
          <label className="block text-xs text-lab-text-muted">Disclosures and funding<TextArea className="min-h-16" value={d.disclosure} onChange={(e) => upd((x) => { x.disclosure = e.target.value })} /></label>
          <label className="block text-xs text-lab-text-muted">Medical writing acknowledgement<TextArea className="min-h-16" value={d.ack} onChange={(e) => upd((x) => { x.ack = e.target.value })} /></label>
        </Panel>
      </div>
      <div className="space-y-3">
        <Panel title="Required elements">
          <ul className="text-xs space-y-0.5">{checks.map((c) => <li key={c.id} className={c.ok ? 'text-lab-cdsco' : 'text-lab-text-muted'}>{c.ok ? '✓' : '○'} {c.label}{!c.ok && 'why' in c && c.why ? `: ${c.why}` : ''}</li>)}</ul>
        </Panel>
        <Panel title="Preview" right={<Btn tone="grey" onClick={() => download('poster.html', html, 'text/html')}>Download (print to PDF at A0)</Btn>}>
          <Scaled html={html} land={d.size === 'A0 landscape'} />
        </Panel>
      </div>
    </div>
  )
}
