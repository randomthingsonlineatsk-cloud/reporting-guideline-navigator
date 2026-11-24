import { useStore } from '../state'
import { Btn, Panel, Pill, inputCls } from './ui'
import { PASSPORT_PAGE, certificate, certificateHtml, passportRecord } from '../domain/phase4'
import { download } from '../domain/store'

export default function Certificate() {
  const { progress: g, record } = useStore()
  const c = certificate(g)
  const named = g.name.trim().length > 1
  return (
    <div className="space-y-3 max-w-3xl">
      <Panel title="Certificate" sub="Pass the six core missions (RG1 to RG6) and every Learn quiz. Passing all sixteen missions adds a distinction. The verification code is checked on the Regulatory Skills Passport." right={<Pill tone={c.eligible ? 'green' : 'amber'}>{c.eligible ? (c.distinction ? 'with distinction' : 'earned') : 'not yet'}</Pill>}>
        <label className="block text-xs text-lab-text-muted">Name on the certificate<input className={inputCls} value={g.name} onChange={(e) => record((x) => { x.name = e.target.value })} placeholder="Your name" /></label>
        <ul className="text-sm space-y-0.5">{c.criteria.map((x) => <li key={x.label} className={x.met ? 'text-lab-cdsco' : 'text-lab-text-muted'}>{x.met ? '✓' : '○'} {x.label}</li>)}</ul>
        {c.eligible && named ? (
          <div className="space-y-2">
            <p className="text-sm">Verification code <code className="font-mono">{c.code}</code></p>
            <div className="flex flex-wrap gap-2">
              <Btn tone="solid" onClick={() => download('reporting-guidelines-certificate.html', certificateHtml(c, g), 'text/html')}>Certificate (HTML, print to PDF)</Btn>
              <Btn tone="grey" onClick={() => download('reporting-guideline-navigator-passport.json', JSON.stringify(passportRecord(c, g), null, 2))}>Passport record (.json)</Btn>
            </div>
            <p className="text-xs text-lab-text-muted">Add the record to the <a className="underline" href={PASSPORT_PAGE} target="_blank" rel="noreferrer">Regulatory Skills Passport</a>, which recomputes the code from the name, the scores and your user ID.</p>
          </div>
        ) : <p className="text-xs text-lab-text-muted">{c.eligible ? 'Enter your name to issue the certificate.' : 'Not earned yet: the open circles show what is left.'}</p>}
      </Panel>
    </div>
  )
}
