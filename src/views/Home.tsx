import { useRef, useState } from 'react'
import { useStore } from '../state'
import { useNav } from '../nav'
import { Btn, Modal, Panel, Pill, TextArea, inputCls } from './ui'
import { LIBRARY } from '../domain/library'
import { PLANTED_BY_MISSION } from '../domain/manuscripts2'
import { createProject, exportProject, importProject } from '../domain/project'
import { MISSIONS, available, passedMission } from '../domain/missions'
import { download } from '../domain/store'
import { docxToText } from '../domain/docximport'
import { CATALOGUE, guideline } from '../domain/guidelines'
import type { GuidelineId } from '../domain/types'

export default function Home({ onOpen }: { onOpen: () => void }) {
  const { projects, open, remove, progress, record, setError } = useStore()
  const { setPage, go } = useNav()
  const [own, setOwn] = useState(false)
  const [text, setText] = useState(''), [gl, setGl] = useState<GuidelineId>('consort-2025')
  const file = useRef<HTMLInputElement>(null)
  const who = { userId: progress.userId, classId: progress.classId }
  const start = (id: string) => {
    const m = MISSIONS.find((x) => x.id === id)!
    if (id === 'RG1') { setPage('picker', 'rg1'); return }
    const p = createProject(m.manuscript!, who, { name: `Mission ${id}: ${m.title}`, mission: { id, startedUtc: new Date().toISOString(), variant: 0 } })
    if (id === 'RG3') p.guidelines = ['consort-2025', 'consort-abstracts']
    if (id === 'RG2') p.guidelines = ['consort-2025']
    if (PLANTED_BY_MISSION[id]) p.guidelines = PLANTED_BY_MISSION[id].guidelines as GuidelineId[]
    open(p); go(id === 'RG3' ? 'abstract' : 'workspace')
  }
  return (
    <div className="space-y-4">
      <Panel title="Report a study so readers can judge it" sub="Choose the reporting guideline for a design, check a manuscript against it item by item, and write the abstract. The manuscripts are fictional and their numbers come from the same study outputs as the TLF Programming Lab and the CSR & Narrative Studio.">
        <div className="flex flex-wrap gap-2"><Btn tone="solid" onClick={() => setPage('picker')}>Which guideline? Open the picker</Btn><Btn tone="grey" onClick={() => setPage('learn')}>Learn the guidelines</Btn></div>
      </Panel>

      <Panel title="Missions" sub="Scored by written rules against an answer key. Nine are open now; the rest arrive with the later phases of the build.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {MISSIONS.map((m) => {
            const run = progress.missions[m.id], ok = available(m)
            return (
              <div key={m.id} className={`rounded border p-3 space-y-1.5 ${ok ? 'border-lab-line bg-lab-panel-strong/50' : 'border-lab-line/50 opacity-60'}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-xs text-lab-fda">{m.id}</span>{m.core && <Pill tone="purple">core</Pill>}</div>
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs text-lab-text-muted">{m.task}</p>
                <p className="text-[11px] text-lab-text-muted">Pass: {m.pass}</p>
                {ok ? <div className="flex items-center gap-2">{run && <Pill tone={passedMission(progress, m.id) ? 'green' : 'amber'}>{`best ${run.score}${passedMission(progress, m.id) ? ' · passed' : ''}`}</Pill>}<Btn onClick={() => start(m.id)}>{run ? 'Try again' : 'Start'}</Btn></div> : <Pill>{`Phase ${m.phase}`}</Pill>}
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel title="Check a manuscript" sub="Open a manuscript from the library, or paste your own text and check it against a guideline.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
          {LIBRARY.map((m) => (
            <div key={m.id} className="rounded border border-lab-line bg-lab-panel-strong/50 p-3 space-y-1.5">
              <p className="text-sm font-medium">{m.title}</p>
              <p className="text-xs text-lab-text-muted">{m.study} · {m.kind === 'protocol' ? 'protocol' : m.journal}</p>
              <p className="text-xs">{m.guidelines.map((g) => guideline(g).name).join(', ')}</p>
              <Btn onClick={() => { open(createProject(m.id, who)); onOpen() }}>Open</Btn>
            </div>
          ))}
          <div className="rounded border border-dashed border-lab-line p-3 space-y-1.5">
            <p className="text-sm font-medium">Your own text</p>
            <p className="text-xs text-lab-text-muted">Paste a manuscript or read a .docx (a short line on its own is read as a heading). It stays in this browser.</p>
            <Btn tone="grey" onClick={() => setOwn(true)}>Paste text</Btn>
          </div>
        </div>
      </Panel>

      <Panel title="Your projects" right={<><input ref={file} type="file" accept=".json,application/json" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { open(importProject(await f.text(), who)); onOpen() } catch (err) { setError((err as Error).message) } }} /><Btn tone="grey" onClick={() => file.current?.click()}>Import a project file</Btn></>}>
        {projects.length === 0 ? <p className="text-sm text-lab-text-muted">No projects yet. Open a manuscript or start a mission.</p> : (
          <ul className="divide-y divide-lab-line/60">
            {projects.map((p) => (
              <li key={p.id} className="py-2 flex flex-wrap items-center gap-2">
                <span className="text-sm mr-auto">{p.name} <span className="text-xs text-lab-text-muted">· {Object.values(p.tags).filter((t) => t.status).length} items checked · {p.updatedUtc.slice(0, 10)}</span></span>
                <Btn onClick={() => { open(p); onOpen() }}>Open</Btn>
                <Btn tone="grey" onClick={() => download(`${p.name.replace(/[^\w-]+/g, '_')}.rgn.json`, exportProject(p))}>Export</Btn>
                <Btn tone="red" onClick={() => { if (confirm(`Delete “${p.name}” from this browser?`)) remove(p.id) }}>Delete</Btn>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="You" sub="Your name appears on exported checklists. The IDs are for the classroom mode that comes later.">
        <div className="grid sm:grid-cols-3 gap-2 text-xs text-lab-text-muted">
          <label>Name<input className={inputCls} value={progress.name} onChange={(e) => record((g) => { g.name = e.target.value })} /></label>
          <label>Class ID (optional)<input className={inputCls} value={progress.classId} onChange={(e) => record((g) => { g.classId = e.target.value.trim() })} /></label>
          <p className="self-end">Learner ID: <span className="font-mono">{progress.userId}</span></p>
        </div>
      </Panel>

      {own && (
        <Modal title="Check your own text" onClose={() => setOwn(false)} wide>
          <label className="text-xs text-lab-text-muted block">Guideline<select className={inputCls} value={gl} onChange={(e) => setGl(e.target.value as GuidelineId)}>{CATALOGUE.filter((g) => g.built).map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <TextArea className="min-h-64" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the manuscript here. Separate paragraphs with a blank line." />
          <label className="text-xs text-lab-text-muted block">Or read a file (.docx or .txt): <input type="file" accept=".docx,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { setText(f.name.toLowerCase().endsWith('.docx') ? docxToText(new Uint8Array(await f.arrayBuffer())) : await f.text()) } catch (err) { setError((err as Error).message) } }} /></label>
          <Btn tone="solid" disabled={!text.trim()} onClick={() => { const guidelines: GuidelineId[] = gl === 'consort-2025' ? ['consort-2025', 'consort-abstracts'] : [gl]; open(createProject('own', who, { name: 'Your manuscript', ownText: text, guidelines })); setOwn(false); onOpen() }}>Check it</Btn>
        </Modal>
      )}
    </div>
  )
}
