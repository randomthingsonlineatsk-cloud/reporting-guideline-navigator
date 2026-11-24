import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { upgrade, learner } from './domain/project'
import type { Project, Progress } from './domain/types'
import { listProjects, saveProject, deleteProject, loadProgress, saveProgress } from './domain/store'

interface Store {
  p: Project | null; projects: Project[]; tick: number
  act: (fn: (p: Project) => void) => boolean
  open: (p: Project) => void; close: () => void; remove: (id: string) => Promise<void>
  error: string; setError: (s: string) => void; saved: string
  progress: Progress; record: (fn: (g: Progress) => void) => void
}
const Ctx = createContext<Store | null>(null)
export const useStore = () => useContext(Ctx)!

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tick, setTick] = useState(0)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [progress, setProgress] = useState<Progress>(() => ({ id: 'me', ...learner(), quizzes: {}, missions: {}, rg1: {} }))
  useEffect(() => { loadProgress().then((g) => { if (g) setProgress({ ...g, rg1: g.rg1 ?? {}, quizzes: g.quizzes ?? {}, missions: g.missions ?? {} }) }).catch(() => {}) }, [])
  const record = useCallback((fn: (g: Progress) => void) => setProgress((g) => { const n = structuredClone(g); fn(n); saveProgress(n).catch(() => {}); return n }), [])
  const timer = useRef<number | undefined>(undefined)
  const refresh = useCallback(() => listProjects().then((all) => setProjects(all.map(upgrade).sort((a, b) => b.updatedUtc.localeCompare(a.updatedUtc)))).catch(() => {}), [])
  useEffect(() => { refresh().finally(() => setReady(true)) }, [refresh])

  const persist = useCallback(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (!ref.current) return
      saveProject(ref.current).then(() => { setSaved(new Date().toLocaleTimeString()); refresh() }).catch((e) => setError(`Could not save to this browser: ${(e as Error).message}`))
    }, 400)
  }, [refresh])
  const act = useCallback((fn: (p: Project) => void) => {
    if (!ref.current) return false
    // A refused action leaves the project exactly as it was.
    const before = structuredClone(ref.current)
    try { fn(ref.current); ref.current.updatedUtc = new Date().toISOString(); setError(''); return true } catch (e) { ref.current = before; setError((e as Error).message); return false } finally { setTick((t) => t + 1); persist() }
  }, [persist])
  const open = useCallback((np: Project) => { ref.current = upgrade(np); setTick((t) => t + 1); persist() }, [persist])
  const close = useCallback(() => { ref.current = null; setTick((t) => t + 1); refresh() }, [refresh])
  const remove = useCallback(async (id: string) => { await deleteProject(id); if (ref.current?.id === id) ref.current = null; await refresh(); setTick((t) => t + 1) }, [refresh])

  if (!ready) return <div className="min-h-screen bg-lab-bg text-lab-text-muted grid place-items-center font-mono text-sm">Loading…</div>
  return <Ctx.Provider value={{ p: ref.current, projects, tick, act, open, close, remove, error, setError, saved, progress, record }}>{children}</Ctx.Provider>
}
