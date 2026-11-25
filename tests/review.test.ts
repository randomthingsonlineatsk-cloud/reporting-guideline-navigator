import { describe, expect, test } from 'vitest'
import { addComment, addVersion, blankReview, closeReview, metrics, openReview, readiness, resolveComment, setMilestone, signOff, verifyAudit, reviewers } from '../src/domain/review'
import { PLAN_SEED } from '../src/domain/phase4'

const row = { ...PLAN_SEED[0], authors: 'Anika Rao; Sunil Iyer' }
const t = (d: string) => `${d}T09:00:00.000Z`
function through() {
  const r = blankReview()
  addVersion(r, 'Lead', 'First draft from the CSR', t('2026-12-01'))
  openReview(r, 'Lead', '2026-12-10', t('2026-12-01'))
  addComment(r, 'Anika Rao', 'Add the HECSI-75 interval to the abstract.', t('2026-12-03'))
  return r
}

describe('review and approval', () => {
  test('reviewers come from the authorship cell', () => { expect(reviewers(row)).toEqual(['Anika Rao', 'Sunil Iyer']); expect(reviewers(PLAN_SEED[0])).toEqual([]) })
  test('a round cannot close with open comments, and needs a reply to resolve', () => {
    const r = through()
    expect(() => closeReview(r, 'Lead', t('2026-12-05'))).toThrow(/Resolve every comment/)
    expect(() => resolveComment(r, 'Lead', 'c1', 'ok')).toThrow(/how the comment was handled/)
    resolveComment(r, 'Lead', 'c1', 'Added the 95% CI in the abstract results.', t('2026-12-05')); closeReview(r, 'Lead', t('2026-12-06'))
    expect(() => addComment(r, 'Sunil Iyer', 'Late comment here')).toThrow(/Open a review round/)
  })
  test('submission needs every author, medical and compliance on the latest version; a new version cancels earlier approvals', () => {
    const r = through(); resolveComment(r, 'Lead', 'c1', 'Added the 95% CI in the abstract.', t('2026-12-05')); closeReview(r, 'Lead', t('2026-12-06'))
    for (const [w, role] of [['Anika Rao', 'author'], ['Sunil Iyer', 'author'], ['Medical reviewer', 'medical'], ['Compliance reviewer', 'compliance']] as const) signOff(r, w, role, t('2026-12-07'))
    expect(readiness(r, row).ok).toBe(true)
    addVersion(r, 'Lead', 'Typo fixed in Table 2', t('2026-12-08'))
    expect(readiness(r, row).missing).toContain('approval from Anika Rao')
    expect(() => setMilestone(r, row, 'Lead', 'submitted', '2026-12-09', t('2026-12-09'))).toThrow(/Not ready to submit/)
    for (const [w, role] of [['Anika Rao', 'author'], ['Sunil Iyer', 'author'], ['Medical reviewer', 'medical'], ['Compliance reviewer', 'compliance']] as const) signOff(r, w, role, t('2026-12-09'))
    expect(() => signOff(r, 'Anika Rao', 'author')).toThrow(/already approved/)
    setMilestone(r, row, 'Lead', 'dbl', '2026-11-01'); setMilestone(r, row, 'Lead', 'submitted', '2026-12-10')
    expect(() => setMilestone(r, row, 'Lead', 'published', '2027-01-10')).toThrow(/Only an accepted/)
    expect(() => setMilestone(r, row, 'Lead', 'decided', '2026-12-01')).toThrow(/cannot be before/)
    setMilestone(r, row, 'Lead', 'decided', '2027-01-20'); setMilestone(r, row, 'Lead', 'decision', 'accepted')
    const m = metrics([row, PLAN_SEED[1]], { [row.id]: r }, '2027-02-01')
    expect(m).toMatchObject({ submitted: 1, accepted: 1, acceptanceRate: 100, medianLockToSubmission: 39, medianSubmissionToDecision: 41, medianReviewRound: 5 })
    expect(m.pastTarget.length).toBe(0)
  })
  test('the audit log is a chain: editing or deleting an entry shows', () => {
    const r = through(); expect(verifyAudit(r.audit).ok).toBe(true)
    const edited = structuredClone(r.audit); edited[1].what = 'Review round 1 opened on version 2'
    expect(verifyAudit(edited)).toEqual({ ok: false, broken: 2 })
    expect(verifyAudit([r.audit[0], r.audit[2]]).ok).toBe(false)
  })
  test('submitted work is frozen except for a revision', () => {
    const r = blankReview(); addVersion(r, 'L', 'Draft one'); r.milestones.submitted = '2026-12-10'
    expect(() => addVersion(r, 'L', 'Another change')).toThrow(/submitted/)
    r.milestones.decision = 'revise'; expect(() => addVersion(r, 'L', 'Revision for reviewers')).not.toThrow()
  })
})
