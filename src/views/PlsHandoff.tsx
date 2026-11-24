import { useRef } from 'react'
import { useStore } from '../state'
import { Btn, Panel, Pill } from './ui'
import { checkPlsReturn, plsSource, type PlsReturn } from '../domain/phase4'
import { download } from '../domain/store'

export default function PlsHandoff() {
  const { p, act, setError } = useStore()
  const file = useRef<HTMLInputElement>(null)
  const r = p!.plsReturn as Partial<PlsReturn> | undefined
  const chk = r ? checkPlsReturn(r) : null
  const src = plsSource()
  return (
    <div className="space-y-3">
      <Panel title="Plain language summary of the article" sub="The journal asks for a plain language summary (300 words, six headings) to sit with the article. Write it in the Plain Language Lab, which has the readability and plain-language checks, then bring it back here for the submission pack.">
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>Download the article for the Plain Language Lab. <Btn onClick={() => download('verdant-1-article-for-pls.json', JSON.stringify(src, null, 2))}>Article for the Plain Language Lab (.json)</Btn></li>
          <li>In the <a className="underline" href="https://randomthingsonlineatsk-cloud.github.io/plain-language-lab/" target="_blank" rel="noreferrer">Plain Language Lab</a>, open a study, go to <b>Publication summary</b> and choose <b>Open an article</b> with that file. Write the summary until every check passes.</li>
          <li>There, download <b>Publication summary for the Reporting Guideline Navigator</b>, and open it here. <input ref={file} type="file" accept=".json,application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { const j = JSON.parse(await f.text()); act((q) => { q.plsReturn = j }) } catch { setError('This file is not JSON.') } }} /><Btn tone="grey" onClick={() => file.current?.click()}>Open the summary</Btn></li>
        </ol>
        <details className="text-xs text-lab-text-muted"><summary className="cursor-pointer">What the file contains</summary><p className="whitespace-pre-wrap mt-1">{src.citation}{'\n\n'}{src.abstract}</p></details>
      </Panel>
      {r && (
        <Panel title={r.title || 'The summary'} right={<Pill tone={chk!.ok ? 'green' : 'amber'}>{chk!.ok ? 'accepted' : 'not yet'}</Pill>}>
          {!chk!.ok && <ul className="text-xs text-lab-amber list-disc pl-5">{chk!.problems.map((x) => <li key={x}>{x}</li>)}</ul>}
          {r.sections && Object.entries(r.sections).map(([k, v]) => <p key={k} className="text-sm">{v}</p>)}
          <p className="text-xs text-lab-text-muted">{r.words} words · grade {r.grade} · {r.checks ? `${(r.checks.total ?? 0) - (r.checks.failed?.length ?? 0)} of ${r.checks.total} Plain Language Lab checks passed` : ''}</p>
        </Panel>
      )}
    </div>
  )
}
