// One place that scores a mission project, used by the mission bar and by the classroom re-score.
import type { Project } from './types'
import { scoreDesign, scoreRG2, scoreRG3, scoreRG12, type Result } from './missions'
import { scoreRG4, scoreRG5, scoreRG6 } from './phase3'
import { scoreRG13, scoreRG14, scoreRG16 } from './phase4'

export function scoreProject(p: Project): Result {
  const id = p.mission?.id ?? ''
  return id === 'RG2' ? scoreRG2(p) : id === 'RG3' ? scoreRG3(p) : id === 'RG12' ? scoreRG12(p)
    : id === 'RG4' ? scoreRG4(p.rg4 ?? { people: {}, ack: '' }) : id === 'RG5' ? scoreRG5(p.rg5 ?? {}) : id === 'RG6' ? scoreRG6(p.rg6 ?? {})
    : id === 'RG13' ? scoreRG13(p.poster) : id === 'RG14' ? scoreRG14(p.planFlags ?? {}) : id === 'RG16' ? scoreRG16(p)
    : scoreDesign(p, id)
}
