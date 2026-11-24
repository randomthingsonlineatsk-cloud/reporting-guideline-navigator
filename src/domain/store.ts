// IndexedDB persistence. Everything stays in this browser unless the user exports a file.
import type { Project, Progress } from './types'

const DB = 'reporting-guideline-navigator', VERSION = 1
function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, VERSION)
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains('projects')) r.result.createObjectStore('projects', { keyPath: 'id' })
      if (!r.result.objectStoreNames.contains('progress')) r.result.createObjectStore('progress', { keyPath: 'id' })
    }
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}
const tx = async <T,>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await open()
  return new Promise((res, rej) => {
    const t = db.transaction(store, mode)
    const req = fn(t.objectStore(store))
    req.onsuccess = () => res(req.result)
    req.onerror = () => rej(req.error)
    t.oncomplete = () => db.close()
  })
}
export const saveProject = (p: Project) => tx('projects', 'readwrite', (s) => s.put(p))
export const listProjects = () => tx<Project[]>('projects', 'readonly', (s) => s.getAll() as IDBRequest<Project[]>)
export const deleteProject = (id: string) => tx('projects', 'readwrite', (s) => s.delete(id))
export const loadProgress = () => tx<Progress | undefined>('progress', 'readonly', (s) => s.get('me') as IDBRequest<Progress | undefined>)
export const saveProgress = (p: Progress) => tx('progress', 'readwrite', (s) => s.put(p))

export function download(name: string, data: string | Blob, type = 'application/json') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(typeof data === 'string' ? new Blob([data], { type }) : data)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
