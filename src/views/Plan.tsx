import { useStore } from '../state'
import { Btn, Panel, inputCls } from './ui'
import { GAPS, PLAN_SEED, planCsv, type PlanRow } from '../domain/phase4'
import { download } from '../domain/store'

type Field = Exclude<keyof PlanRow, 'gap' | 'id'>
const FIELDS: [Field, string][] = [['what', 'Publication'], ['data', 'Data source'], ['venue', 'Venue'], ['type', 'Type'], ['target', 'Target (yyyy-mm)'], ['status', 'Status'], ['authors', 'Authorship'], ['writer', 'Writing support']]

export default function Plan() {
  const { p, act } = useStore()
  const seed = (): PlanRow[] => PLAN_SEED.map(({ gap: _g, ...r }) => { void _g; return r })
  const rows: PlanRow[] = p!.plan ?? seed()
  const flags = p!.planFlags ?? {}
  const upd = (fn: (r: PlanRow[]) => void) => act((q) => { q.plan ??= seed(); fn(q.plan) })
  const html = () => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Publication plan: Ostrevia</title><style>body{font:11px Arial,sans-serif;margin:2rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:4px;vertical-align:top;text-align:left}th{background:#eee}</style></head><body><h1>Publication plan: Ostrevia (lumiravostat)</h1><p>Steering committee: the VERDANT-1 investigators' steering committee with two patient partners. Principles: GPP 2022 and the ICMJE Recommendations; all results published whatever the outcome; primary results before secondary analyses; encores labelled; authorship agreed before writing; writing support acknowledged with its funding.</p><table><tr>${FIELDS.map(([, l]) => `<th>${l}</th>`).join('')}</tr>${rows.map((r) => `<tr>${FIELDS.map(([k]) => `<td>${String(r[k] ?? '').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('')}</table><p>Training document. Fictional product, sponsor and venues. Built by Khan Gulrez Shagufa Fazal Ahmed.</p></body></html>`
  return (
    <div className="space-y-3">
      <Panel title="Publication plan: Ostrevia" sub="A GPP 2022 plan across congresses and journals, timed from database lock and the CSR. Edit any cell; flag a row and name its gap if something about it breaks GPP 2022 or the ICMJE Recommendations. (Mission RG14 scores the flags.)" right={<div className="flex gap-1"><Btn tone="grey" onClick={() => download('publication-plan.html', html(), 'text/html')}>Plan (HTML)</Btn><Btn tone="grey" onClick={() => download('publication-tracker.csv', planCsv(rows), 'text/csv')}>Tracker (CSV)</Btn></div>}>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.id} className={`rounded border p-2 ${flags[r.id] ? 'border-lab-amber/70' : 'border-lab-line'}`}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                {FIELDS.map(([k, l]) => <label key={k} className="text-[11px] text-lab-text-muted">{l}<input className={inputCls} value={String(r[k] ?? '')} onChange={(e) => upd((x) => { x[i][k] = e.target.value })} /></label>)}
              </div>
              <label className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">Gap:
                <select aria-label={`Gap in ${r.what}`} className="rounded border border-lab-line bg-lab-panel-strong px-1 py-0.5" value={flags[r.id] ?? ''} onChange={(e) => act((q) => { q.planFlags = { ...(q.planFlags ?? {}), [r.id]: e.target.value }; if (!e.target.value) delete q.planFlags[r.id] })}>
                  <option value="">None</option>{Object.entries(GAPS).map(([k, g]) => <option key={k} value={k}>{g.label}</option>)}
                </select>
              </label>
            </div>
          ))}
        </div>
        <Btn tone="grey" onClick={() => upd((x) => { x.push({ id: `n${Date.now().toString(36)}`, what: '', data: '', venue: '', type: '', target: '', status: 'Planned', authors: '', writer: '' }) })}>Add a publication</Btn>
      </Panel>
    </div>
  )
}
