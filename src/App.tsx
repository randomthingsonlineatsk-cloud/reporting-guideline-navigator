import { useEffect, useRef, useState } from 'react'
import { StoreProvider, useStore } from './state'
import { NavCtx, type Page, type View } from './nav'
import { Btn, Modal, Pill } from './views/ui'
import Home from './views/Home'
import Picker from './views/Picker'
import Learn from './views/Learn'
import Workspace from './views/Workspace'
import AbstractView from './views/AbstractView'
import ExportView from './views/ExportView'
import Authorship from './views/Authorship'
import Disclosures from './views/Disclosures'
import Submission from './views/Submission'
import Ethics from './views/Ethics'
import MissionBar from './views/MissionBar'
import Poster from './views/Poster'
import Platform from './views/Platform'
import Extras from './views/Extras'
import Plan from './views/Plan'
import PlsHandoff from './views/PlsHandoff'
import Certificate from './views/Certificate'
import Study from './views/Study'
import Classroom from './views/Classroom'

const PAGES: { id: Page; label: string; key: string }[] = [{ id: 'home', label: 'Projects and missions', key: 'h' }, { id: 'picker', label: 'Guideline picker', key: 'g' }, { id: 'ethics', label: 'Ethics cases', key: 'e' }, { id: 'learn', label: 'Learn', key: 'l' }, { id: 'certificate', label: 'Certificate', key: 'c' }, { id: 'classroom', label: 'Classroom', key: 'r' }]
const VIEWS: { id: View; label: string; key: string }[] = [{ id: 'workspace', label: 'Checklist workspace', key: 'w' }, { id: 'abstract', label: 'Abstract', key: 'a' }, { id: 'authorship', label: 'Authorship', key: 'u' }, { id: 'disclosures', label: 'Disclosures and statements', key: 'd' }, { id: 'submission', label: 'Submission', key: 's' }, { id: 'platform', label: 'Communication platform', key: 'k' }, { id: 'poster', label: 'Poster', key: 'o' }, { id: 'extras', label: 'Visual and video', key: 'v' }, { id: 'plan', label: 'Publication plan', key: 'p' }, { id: 'pls', label: 'Plain language summary', key: 'y' }, { id: 'export', label: 'Export', key: 'x' }]
const SHORTCUTS: [string, string][] = [['?', 'Show these shortcuts'], ['g then h / g / e / l / c / r', 'Projects and missions, Guideline picker, Ethics cases, Learn, Certificate, Classroom'], ['g then w / a / u / d / s / k / o / v / p / y / x', 'In a project: Checklist workspace, Abstract, Authorship, Disclosures and statements, Submission, Communication platform, Poster, Visual and video, Publication plan, Plain language summary, Export'], ['j / k', 'In the workspace: next or previous checklist item'], ['Esc', 'Close a dialog']]
const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))

function Shell() {
  const { p, close, error, setError, saved } = useStore()
  const [page, setPage_] = useState<Page>(() => (/^#\/study\//.test(window.location.hash) ? 'study' : 'home'))
  const [arg, setArg] = useState<string | undefined>()
  const setPage = (pg: Page, a?: string) => { setPage_(pg); setArg(a); window.scrollTo(0, 0) }
  const [view, setView] = useState<View>('workspace')
  const [keys, setKeys] = useState(false)
  const gAt = useRef(0)
  const go = (v: View) => { setView(v); window.scrollTo(0, 0) }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return
      if (e.key === '?') { e.preventDefault(); setKeys(true); return }
      if (e.key === 'g' && Date.now() - gAt.current > 1200) { gAt.current = Date.now(); return }
      if (Date.now() - gAt.current < 1200) {
        gAt.current = 0
        const v = VIEWS.find((x) => x.key === e.key), pg = PAGES.find((x) => x.key === e.key)
        if (p && v) { e.preventDefault(); go(v.id) } else if (pg) { e.preventDefault(); if (p) close(); setPage(pg.id) }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
  const tab = (active: boolean) => `px-3 py-1.5 font-mono text-xs border-b-2 ${active ? 'border-lab-fda text-lab-fda' : 'border-transparent text-lab-text-muted hover:text-lab-text'}`
  return (
    <NavCtx.Provider value={{ view, go, page, setPage, arg }}>
      <div className="min-h-screen bg-lab-bg text-lab-text flex flex-col">
        <header className="border-b border-lab-line bg-lab-panel/90 sticky top-0 z-40 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="mr-auto min-w-0">
              <button className="font-mono text-sm text-lab-fda text-left" onClick={() => { close(); setPage('home') }}>Reporting Guideline Navigator</button>
              <p className="text-[11px] text-lab-text-muted truncate">{p ? p.name : 'Check manuscripts against reporting guidelines · training only'}</p>
            </div>
            {p ? <div className="flex flex-wrap items-center gap-2">{p.mission && <Pill tone="purple">{`Mission ${p.mission.id}`}</Pill>}<Btn tone="grey" onClick={() => { close(); setPage('home') }}>All projects</Btn><button className="text-xs text-lab-text-muted underline" onClick={() => setKeys(true)}>Shortcuts</button></div>
              : <nav className="flex flex-wrap gap-1" aria-label="Main">{PAGES.map((x) => <button key={x.id} onClick={() => setPage(x.id)} aria-current={page === x.id ? 'page' : undefined} className={tab(page === x.id)}>{x.label}</button>)}<button className="px-2 text-xs text-lab-text-muted underline" onClick={() => setKeys(true)}>Shortcuts</button></nav>}
          </div>
          {p && <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto" aria-label="Project">{VIEWS.map((v) => <button key={v.id} onClick={() => go(v.id)} aria-current={view === v.id ? 'page' : undefined} className={`${tab(view === v.id)} whitespace-nowrap shrink-0`}>{v.label}</button>)}</nav>}
        </header>
        {error && <div role="alert" className="max-w-7xl mx-auto w-full px-4 pt-3"><div className="rounded border border-lab-red/60 bg-lab-red-soft px-3 py-2 text-sm text-lab-red flex justify-between gap-2"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss">✕</button></div></div>}
        <main className="max-w-7xl mx-auto w-full px-4 py-4 flex-1">
          {p ? <><MissionBar />{view === 'workspace' ? <Workspace key={p.id} /> : view === 'abstract' ? <AbstractView key={p.id} /> : view === 'authorship' ? <Authorship key={p.id} /> : view === 'disclosures' ? <Disclosures key={p.id} /> : view === 'submission' ? <Submission key={p.id} /> : view === 'platform' ? <Platform key={p.id} /> : view === 'poster' ? <Poster key={p.id} /> : view === 'extras' ? <Extras key={p.id} /> : view === 'plan' ? <Plan key={p.id} /> : view === 'pls' ? <PlsHandoff key={p.id} /> : <ExportView />}</>
            : page === 'picker' ? <Picker key={arg ?? 'w'} /> : page === 'ethics' ? <Ethics /> : page === 'learn' ? <Learn /> : page === 'certificate' ? <Certificate /> : page === 'classroom' ? <Classroom /> : page === 'study' ? <Study /> : <Home onOpen={() => go('workspace')} />}
        </main>
        {keys && <Modal title="Keyboard shortcuts" onClose={() => setKeys(false)}><table className="text-sm w-full"><tbody>{SHORTCUTS.map(([k, w]) => <tr key={k} className="border-t border-lab-line/60"><td className="py-1 pr-4 font-mono whitespace-nowrap">{k}</td><td>{w}</td></tr>)}</tbody></table></Modal>}
        <footer className="border-t border-lab-line text-[11px] text-lab-text-muted">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between gap-2">
            <span>Built by Khan Gulrez Shagufa Fazal Ahmed · Apache-2.0</span>
            <span>Training only. Fictional studies, authors, journals and congresses; checklist items paraphrased. Saved in this browser{saved ? ` · saved ${saved}` : ''}.</span>
          </div>
        </footer>
      </div>
    </NavCtx.Provider>
  )
}

export default function App() { return <StoreProvider><Shell /></StoreProvider> }
