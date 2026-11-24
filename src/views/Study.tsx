import { Panel } from './ui'
import { VERDANT1_CITATION, plsSource } from '../domain/phase4'
import { VERDANT1_REG } from '../domain/manuscripts'
import { figureSvg } from './Poster'

/** The page the poster's QR code points to (#/study/HRP-301): the key results and where to read more. */
export default function Study() {
  const src = plsSource()
  return (
    <div className="space-y-3 max-w-3xl">
      <Panel title="VERDANT-1 (HRP-301): key results" sub="The page a congress poster's QR code opens. A fictional trial of a fictional medicine, for training only.">
        <p className="text-sm">{VERDANT1_CITATION}</p>
        <p className="text-xs text-lab-text-muted">Registered at {VERDANT1_REG.registry}, {VERDANT1_REG.number}, on {VERDANT1_REG.date} (fictional). Funded by Halcyon Ridge Pharmaceuticals (fictional).</p>
        <div className="space-y-1.5 text-sm">{src.abstract.split('\n').map((l) => <p key={l}>{l}</p>)}</div>
        <figure className="rounded border border-lab-line bg-white p-2"><div dangerouslySetInnerHTML={{ __html: figureSvg('F1') }} /><figcaption className="text-xs text-gray-700">Figure 14.2.3: mean percent change from baseline in HECSI by visit</figcaption></figure>
      </Panel>
    </div>
  )
}
