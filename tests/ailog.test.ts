import { describe, expect, test } from 'vitest'
import { blankEntry, checkEntry, checkLog, disclosure } from '../src/domain/ailog'
import { blankStatements, checkStatements } from '../src/domain/manuscriptpack'

const people = ['Anika Rao', 'Sunil Iyer']
const lang = { ...blankEntry(1), date: '2026-12-02', tool: 'A general AI writing assistant', version: 'v4', task: 'language' as const, section: 'the Discussion', purpose: 'Suggested clearer wording for long sentences', checkedBy: 'Anika Rao', checkedDate: '2026-12-03', verification: 'Read every suggestion against the original meaning and kept 6 of 20.' }
const refs = { ...lang, id: 'b', task: 'references' as const, section: 'the reference list', purpose: 'Put the references into the journal style', verification: 'Checked each reference against its source on the journal site.' }
const search = { ...lang, id: 'c', task: 'search' as const, tool: 'An AI search assistant', version: '2026.1', section: 'the Introduction', purpose: 'Found trials of oral treatments for hand eczema', verification: 'Sunil screened all 40 results and read the 6 papers cited.', checkedBy: 'Sunil Iyer' }

describe('AI use log', () => {
  test('a complete entry passes', () => { expect(checkEntry(lang, people).every((r) => r.ok)).toBe(true); expect(checkLog([lang, refs, search], people).ok).toBe(true) })
  test('checker must be on the team and check after use', () => {
    expect(checkEntry({ ...lang, checkedBy: 'The tool' }, people).find((r) => r.id === 'L3')!.ok).toBe(false)
    expect(checkEntry({ ...lang, checkedDate: '2026-12-01' }, people).find((r) => r.id === 'L3')!.ok).toBe(false)
  })
  test('references must be checked one by one; search results screened by a person', () => {
    expect(checkEntry({ ...refs, verification: 'Looked fine overall to the team.' }, people).find((r) => r.id === 'L4')!.ok).toBe(false)
    expect(checkEntry({ ...search, verification: 'The tool found good papers for us.' }, people).find((r) => r.id === 'L4')!.ok).toBe(false)
  })
  test('images of data, peer review, confidential and personal data are refused', () => {
    expect(checkEntry({ ...lang, task: 'figure' }, people).some((r) => r.id === 'L5' && !r.ok)).toBe(true)
    expect(checkEntry({ ...lang, task: 'review' }, people).some((r) => r.id === 'L6' && !r.ok)).toBe(true)
    expect(checkEntry({ ...lang, input: 'confidential' }, people).find((r) => r.id === 'L7')!.ok).toBe(false)
    expect(checkEntry({ ...lang, input: 'confidential', approved: true }, people).find((r) => r.id === 'L7')!.ok).toBe(true)
    expect(checkEntry({ ...lang, input: 'personal', approved: true }, people).find((r) => r.id === 'L8')!.ok).toBe(false)
  })
  test('the disclosure is split into acknowledgements and methods', () => {
    const d = disclosure([lang, refs, search])
    expect(d.acknowledgements).toBe('A general AI writing assistant (v4) was used to edit the language of the Discussion and format the references in the reference list. Anika Rao checked the output; the authors take full responsibility for the content.')
    expect(d.methods).toMatch(/^An AI search assistant \(2026.1\) was used to search the literature for the Introduction\. Sunil Iyer checked the output against the source data/)
  })
  test('the statements must disclose what the log holds', () => {
    expect(checkStatements(blankStatements(), undefined, undefined, 2).find((r) => r.id === 'S7b')!.ok).toBe(false)
    expect(checkStatements({ ...blankStatements(), aiUsed: true }, undefined, undefined, 2).find((r) => r.id === 'S7b')!.ok).toBe(true)
  })
})
