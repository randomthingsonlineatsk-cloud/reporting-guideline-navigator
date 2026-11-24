import { useState } from 'react'
import { useStore } from '../state'
import { Btn, Modal, Pill } from './ui'
import { mission, record, scoreRG2, scoreRG3, scoreRG12, type Result } from '../domain/missions'

export default function MissionBar() {
  const { p, record: rec } = useStore()
  const [res, setRes] = useState<Result | null>(null)
  if (!p?.mission) return null
  const m = mission(p.mission.id)!
  const score = () => { const r = m.id === 'RG2' ? scoreRG2(p) : m.id === 'RG3' ? scoreRG3(p) : scoreRG12(p); rec((g) => record(g, m.id, r)); setRes(r) }
  return (
    <div className="mb-3 rounded-lg border border-lab-ema/50 bg-lab-ema-soft/30 p-3 flex flex-wrap gap-3 items-start">
      <div className="flex-1 min-w-64 space-y-1">
        <p className="font-mono text-xs text-lab-ema">Mission {m.id} · {m.title}</p>
        <p className="text-sm">{m.task}</p>
        <p className="text-xs text-lab-text-muted">Pass: {m.pass}. Score as often as you like; your best score is kept.</p>
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
