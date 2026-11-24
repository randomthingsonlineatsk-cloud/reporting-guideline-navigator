// Every manuscript in the app, Phase 1 and Phase 2, and the planted versions the missions use.
import { MANUSCRIPTS as PHASE1, VERDANT1_PLANTED, planted } from './manuscripts'
import { PHASE2_MANUSCRIPTS, PLANTED_BY_MISSION } from './manuscripts2'
import type { Manuscript } from './types'

export const LIBRARY: Manuscript[] = [...PHASE1, ...PHASE2_MANUSCRIPTS]
export const byId = (id: string) => LIBRARY.find((m) => m.id === id)

/** The manuscript as a mission shows it: with the mission's planted edits, if it has any. */
export function forMission(m: Manuscript, mission?: string): Manuscript {
  if (mission === 'RG2') return planted(m, VERDANT1_PLANTED.edits)
  const x = mission ? PLANTED_BY_MISSION[mission] : undefined
  return x && x.manuscript === m.id ? planted(m, x.planted.edits) : m
}
