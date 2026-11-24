import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Modal, Pill } from './ui'
import { PLANTED_BY_MISSION } from '../domain/manuscripts2'
import { mission, record, scoreDesign, scoreRG2, scoreRG3, scoreRG12, type Result } from '../domain/missions'

export default function MissionBar() {
  const { p, record: rec, act } = useStore()
  const [res, setRes] = useState<Result | null>(null)
  if (!p?.mission) return null
  const m = mission(p.mission.id)!
  const nums = PLANTED_BY_MISSION[m.id]?.planted.numbers ?? []
  const score = () => { const r = m.id === 'RG2' ? scoreRG2(p) : m.id === 'RG3' ? scoreRG3(p) : m.id === 'RG12' ? scoreRG12(p) : scoreDesign(p, m.id); rec((g) => record(g, m.id, r)); setRes(r) }
  return (
    <div className="mb-3 rounded-lg border border-lab-ema/50 bg-lab-ema-soft/30 p-3 flex flex-wrap gap-3 items-start">
      <div className="flex-1 min-w-64 space-y-1">
        <p className="font-mono text-xs text-lab-ema">Mission {m.id} · {m.title}</p>
        <p className="text-sm">{m.task}</p>
        <p className="text-xs text-lab-text-muted">Pass: {m.pass}. Score as often as you like; your best score is kept.</p>
        {nums.length > 0 && (
          <fieldset className="mt-2 rounded border border-lab-line p-2">
            <legend className="px-1 text-xs text-lab-text-muted">{m.id === 'RG8' ? 'The flow of studies: tick the number that does not add up' : 'The accuracy figures: recompute each from the 2×2 table and tick the one that is wrong'}</legend>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {nums.map((n) => <label key={n.id} className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!p.numbers?.[n.id]} onChange={(e) => act((q) => { q.numbers = { ...(q.numbers ?? {}), [n.id]: e.target.checked } })} /><span>{n.label}: <b className="font-mono">{n.shown}</b></span></label>)}
            </div>
          </fieldset>
        )}
      </div>
      <Btn tone="purple" onClick={score}>Score this attempt</Btn>
      {res && (
        <Modal title={`Mission ${m.id}: ${res.passed ? 'passed' : 'not yet'}`} onClose={() => setRes(null)}>
          <p className="text-sm">Score <b>{res.score}</b> <Pill tone={res.passed ? 'green' : 'amber'}>{res.passed ? 'passed' : 'not yet'}</Pill></p>
          <ul className="list-disc pl-5 text-sm space-y-1">{res.detail.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </Modal>
      )}
    </div>
  )
}
