// Writes the pharmolecule hub's fixtures from this app's own engine when HUB is set:
//   HUB=/home/claude/pharmolecule/tests/fixtures npx vitest run tests/hubfixtures.test.ts
import { expect, test } from 'vitest'
import { writeFileSync } from 'node:fs'
import { GOOD } from './good-abstract'
import { createProject } from '../src/domain/project'
import { VERDANT1 } from '../src/domain/manuscripts'
import { guideline } from '../src/domain/guidelines'
import { certificate, journeyHandoff, passportRecord } from '../src/domain/phase4'
import { MISSIONS } from '../src/domain/missions'
import { LESSONS, QUIZ_PASS } from '../src/domain/learn'
import type { Progress } from '../src/domain/types'

const who = { userId: 'U-test-0001', classId: '' }
export function finishedProject() {
  const p = createProject('verdant-1', who, { name: 'VERDANT-1 primary paper' })
  for (const it of guideline('consort-2025').items) {
    const k = `consort-2025:${it.id}`, paras = VERDANT1.key[k] ?? []
    p.tags[k] = VERDANT1.na.includes(k) ? { paras: [], status: 'na', reason: 'Not applicable to this trial.' } : { paras: paras.length ? paras : ['v-title'], status: paras.length ? 'reported' : 'partly' }
  }
  p.abstracts.push({ venue: 'fennick', text: GOOD, updatedUtc: '' })
  p.people = [{ id: 'a1', name: 'Anika Rao', did: 'Designed the trial, enrolled participants, drafted the paper' }, { id: 'a2', name: 'Sunil Iyer', did: 'Analysed the data and revised the paper' }]
  p.rg4 = { people: Object.fromEntries(p.people.map((x) => [x.id, { criteria: { c1: true, c2: true, c3: true, c4: true }, author: true, roles: {} }])), ack: 'Medical writing support was provided by Priya Natarajan, PhD, of Halcyon Ridge Pharmaceuticals, funded by Halcyon Ridge Pharmaceuticals in accordance with GPP 2022.' }
  return p
}
const g = (all: boolean): Progress => ({ id: 'me', name: 'Asha Rao', userId: who.userId, classId: '', rg1: {}, quizzes: Object.fromEntries(LESSONS.map((l) => [l.id, { score: QUIZ_PASS + 1, utc: '' }])), missions: Object.fromEntries(MISSIONS.filter((m) => all || ['RG1', 'RG2', 'RG3'].includes(m.id)).map((m) => [m.id, { score: 100, passed: true, utc: '', detail: [] }])) })

test('hub fixtures', () => {
  const done = journeyHandoff(finishedProject())
  expect(done.consort.untagged).toEqual([]); expect(done.consort.missing).toEqual([]); expect(done.abstract?.failed).toEqual([]); expect(done.acknowledgement.ok).toBe(true)
  const start = journeyHandoff(createProject('verdant-1', who))
  const out = process.env.HUB
  if (!out) return
  writeFileSync(`${out}/rgn-handoff.json`, JSON.stringify({ ...done, exportedUtc: '2026-11-24T12:00:00.000Z' }, null, 2))
  writeFileSync(`${out}/rgn-handoff-start.json`, JSON.stringify({ ...start, exportedUtc: '2026-11-24T12:00:00.000Z' }, null, 2))
  writeFileSync(`${out}/rgn.json`, JSON.stringify(passportRecord(certificate(g(true)), g(true), '2026-11-24'), null, 2))
  writeFileSync(`${out}/rgn-partial.json`, JSON.stringify(passportRecord(certificate(g(false)), g(false), '2026-11-24'), null, 2))
})
