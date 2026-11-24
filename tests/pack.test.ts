import { describe, expect, test } from 'vitest'
import { blankByline, bylineText, checkByline, orderedAuthors, readProtocolBuilder, blankStatements, checkStatements, statementsText, checkTitlePage, blankTitlePage, titlePageHtml, revisionsFrom, checkRevision, checkRevisions, revisionHtml, wordCounts } from '../src/domain/manuscriptpack'
import { createProject } from '../src/domain/project'

const people = [{ id: 'a', name: 'Anika Rao' }, { id: 'b', name: 'Sunil Iyer' }, { id: 'c', name: 'Marta Keller' }]
const isAuthor = (id: string) => id !== 'c'

describe('byline', () => {
  test('order, group modes and the text', () => {
    const b = { ...blankByline(), order: ['b', 'a'] }
    const au = orderedAuthors(people, isAuthor, b); expect(au.map((x) => x.id)).toEqual(['b', 'a'])
    expect(bylineText(au, b)).toBe('Sunil Iyer and Anika Rao')
    expect(bylineText(au, { ...b, groupMode: 'for', group: 'VERDANT-1 Investigators' })).toBe('Sunil Iyer, Anika Rao, for the VERDANT-1 Investigators')
    expect(bylineText(au, { ...b, groupMode: 'only', group: 'the VERDANT-1 Investigators' })).toBe('The VERDANT-1 Investigators')
  })
  test('checks: corresponding author must be an author; a group needs its collaborators', () => {
    const au = orderedAuthors(people, isAuthor, blankByline())
    const good = { ...blankByline(), corresponding: 'a', email: 'a.rao@example.org', address: 'Western Coast Medical College, Mumbai, India', affiliations: { a: 'Western Coast Medical College, Mumbai', b: 'Halcyon Ridge Pharmaceuticals, Dublin' }, groupMode: 'and' as const, group: 'VERDANT-1 Investigators', collaborators: 'Marta Keller, Hamburg: site investigator\nLi Wen, Toronto: site investigator' }
    expect(checkByline(au, good).filter((r) => !r.ok).map((r) => r.id)).toEqual([])
    expect(checkByline(au, { ...good, corresponding: 'c' }).find((r) => r.id === 'B3')!.ok).toBe(false)
    expect(checkByline(au, { ...good, collaborators: '' }).find((r) => r.id === 'B6')!.ok).toBe(false)
    expect(checkByline(au, { ...good, collaborators: good.collaborators + '\nAnika Rao, Mumbai: investigator' }).find((r) => r.id === 'B8')!.ok).toBe(false)
    expect(checkByline(au, { ...good, groupMode: 'only' }).find((r) => r.id === 'B7')!.ok).toBe(false)
  })
})

describe('registration from the Protocol Builder', () => {
  const bundle = { format: 'protocol-builder-application-bundle', protocol: { id: 'HRP-301', acronym: 'VERDANT-1', title: 'VERDANT-1 …', nctNumber: 'NCT99930101 (fictional)', euCtNumber: '2026-500000-00-00 (fictional)' } }
  test('reads the bundle and the project file, without "(fictional)"', () => {
    expect(readProtocolBuilder(bundle).numbers.nct).toBe('NCT99930101')
    const proj = { format: 'protocol-builder-project', project: { versions: [{ data: { title: { 'Sponsor Protocol Identifier': 'HRP-301', 'NCT Number': 'NCT99930101 (fictional)' } } }] } }
    expect(readProtocolBuilder(proj).protocolId).toBe('HRP-301')
    expect(() => readProtocolBuilder({ format: 'x' })).toThrow(/not a Protocol Builder/)
    expect(() => readProtocolBuilder({ format: 'protocol-builder-application-bundle', protocol: { id: 'X' } })).toThrow(/no registration number/)
  })
  test('a mismatch with the statements and the abstract is caught', () => {
    const s = { ...blankStatements(), number: 'NCT99930110', registered: '2026-03-02', firstEnrolment: '2026-04-06' }
    const r = checkStatements(s, readProtocolBuilder(bundle), 'Trial registration: ClinicalTrials.gov NCT99930101.')
    expect(r.find((x) => x.id === 'S4')!.ok).toBe(false); expect(r.find((x) => x.id === 'S5')!.ok).toBe(false)
    const ok = checkStatements({ ...s, number: 'NCT99930101' }, readProtocolBuilder(bundle), 'ClinicalTrials.gov NCT99930101')
    expect(ok.find((x) => x.id === 'S4')!.ok).toBe(true); expect(ok.find((x) => x.id === 'S5')!.ok).toBe(true)
  })
})

describe('statements with live rules', () => {
  const good = { ...blankStatements(), number: 'NCT99930101', registered: '2026-03-02', firstEnrolment: '2026-04-06', dataSharing: 'Deidentified participant data and the protocol will be available from 12 months after publication to researchers with an approved proposal, through a controlled-access repository.', aiUsed: true, aiTool: 'A general AI writing assistant', aiHow: 'check the grammar of the Discussion', funding: 'Halcyon Ridge Pharmaceuticals funded the trial and was involved in its design, analysis and the decision to publish.', ethics: 'Approved by the ethics committee at each site; every participant gave written informed consent.' }
  test('a complete set passes', () => { expect(checkStatements(good).filter((r) => !r.ok).map((r) => r.id)).toEqual([]) })
  test('retrospective registration is flagged until it is explained', () => {
    const late = { ...good, registered: '2026-05-01' }
    const r = checkStatements(late).find((x) => x.id === 'S3')!; expect(r.ok).toBe(false); expect(r.level).toBe('warn')
    expect(checkStatements({ ...late, retroReason: 'The registry record was delayed by a sponsor error; it was corrected before any analysis.' }).find((x) => x.id === 'S3')!.ok).toBe(true)
  })
  test('"undecided" data sharing and AI as author are refused', () => {
    expect(checkStatements({ ...good, dataSharing: 'Data sharing plans are undecided at this stage and will be considered later by the sponsor.' }).find((x) => x.id === 'S6')!.ok).toBe(false)
    expect(checkStatements({ ...good, aiAuthor: true }).find((x) => x.id === 'S8')!.ok).toBe(false)
    expect(checkStatements({ ...good, number: 'NCT9993010' }).find((x) => x.id === 'S1')!.ok).toBe(false)
  })
  test('the text', () => { expect(statementsText(good, 'None.')).toMatch(/Data sharing: Deidentified/) })
})

describe('title page', () => {
  test('word counts from the manuscript; checks and HTML', () => {
    const p = createProject('verdant-1', { userId: 'u', classId: '' })
    const w = wordCounts(p); expect(w.main).toBeGreaterThan(500); expect(w.abstract).toBeGreaterThan(100)
    const au = orderedAuthors(people, isAuthor, blankByline())
    const b = { ...blankByline(), corresponding: 'a', email: 'a.rao@example.org', address: 'Western Coast Medical College, Mumbai, India', affiliations: { a: 'Western Coast Medical College, Mumbai', b: 'Halcyon Ridge Pharmaceuticals, Dublin' } }
    const t = { running: 'Lumiravostat in hand eczema', keywords: 'hand eczema; lumiravostat; randomised trial', tables: 3, figures: 2 }
    const s = { ...blankStatements(), number: 'NCT99930101' }
    expect(checkTitlePage(p, au, b, t, s).filter((r) => !r.ok).map((r) => r.id)).toEqual([])
    expect(checkTitlePage(p, au, b, blankTitlePage(), s).filter((r) => !r.ok).map((r) => r.id)).toEqual(['T2', 'T6', 'T7'])
    expect(titlePageHtml(p, au, b, t, s)).toMatch(/Anika Rao<sup>1<\/sup>/)
  })
})

describe('revision record', () => {
  test('comments pasted become numbered rows', () => {
    const rows = revisionsFrom('R1.1: Give the randomisation method.\nR1.2: Report the dropouts.\nReviewer 2, comment 1: Shorten the discussion.\nAnd the title.')
    expect(rows.map((r) => r.ref)).toEqual(['R1.1', 'R1.2', 'R2.1', 'R2.2'])
  })
  test('each change is tied to a comment, with where and the new text, or a reason', () => {
    const [r] = revisionsFrom('R1.1: Give the randomisation method.')
    expect(checkRevision(r).filter((c) => !c.ok).map((c) => c.id)).toEqual(['V2'])
    const done = { ...r, action: 'changed' as const, where: 'Methods, paragraph 3', newText: 'Randomisation used permuted blocks of six, stratified by site.' }
    expect(checkRevision(done).every((c) => c.ok)).toBe(true)
    expect(checkRevision({ ...r, action: 'not changed' as const, reason: 'short' }).find((c) => c.id === 'V4')!.ok).toBe(false)
    expect(checkRevisions([done, { ...done, id: 'x' }]).dup).toEqual(['R1.1'])
    expect(checkRevisions([done]).ok).toBe(true)
    expect(revisionHtml([done], 'VERDANT-1')).toMatch(/Methods, paragraph 3/)
  })
})
