import { describe, expect, test } from 'vitest'
import { blankTalk, checkTalk, checkComm, congress, encores, talkHtml, talkSeconds } from '../src/domain/congress'
import { PLAN_SEED } from '../src/domain/phase4'

const words = (n: number, w = 'eczema') => Array.from({ length: n }, () => w).join(' ')
function goodTalk() {
  const t = blankTalk(); t.presenter = 'Anika Rao, Western Coast Medical College, Mumbai'
  const set = (i: number, title: string, body: string, notes: string) => Object.assign(t.slides[i], { title, body, notes })
  set(0, 'Lumiravostat in chronic hand eczema: first cohort of VERDANT-1', 'ClinicalTrials.gov NCT99930101', words(40))
  set(1, 'Disclosures', 'Funded by Halcyon Ridge Pharmaceuticals. A. Rao received consulting fees from the sponsor.', words(30))
  set(2, 'Background', 'Chronic hand eczema not controlled by topical corticosteroids', words(120))
  set(3, 'Methods', 'Randomised 1:1:1, double-blind, 16 weeks\n45 participants in this first cohort', words(150))
  set(4, 'Results', 'Treatment success: 31.3% (25 mg), 21.4% (10 mg), 20.0% (placebo)\nNot statistically significant', words(200))
  set(5, 'Safety', 'Adverse events: 62.5%, 57.1%, 53.3%', words(150))
  set(6, 'Conclusions', 'No clear difference from placebo in the first cohort; the full trial continues.', words(150))
  set(7, 'Acknowledgements', 'We thank the participants and investigators. Medical writing support by P. Natarajan, PhD, funded by Halcyon Ridge Pharmaceuticals.', words(20))
  return t
}

describe('congress talk', () => {
  test('a good talk passes and exports', () => {
    const t = goodTalk(); expect(talkSeconds(t)).toBeLessThanOrEqual(600)
    expect(checkTalk(t).filter((r) => !r.ok).map((r) => `${r.id} ${r.why ?? ''}`)).toEqual([])
    expect(talkHtml(t)).toMatch(/Disclosures[\s\S]*Notes:/)
  })
  test('disclosures moved to the end, too long, a claim and too many slides all fail', () => {
    const t = goodTalk(); const d = t.slides.splice(1, 1)[0]; t.slides.push(d)
    t.slides[3].notes = words(800); t.slides[5].body = 'Lumiravostat significantly improves eczema'
    const bad = checkTalk(t).filter((r) => !r.ok).map((r) => r.id)
    expect(bad).toEqual(expect.arrayContaining(['C2', 'C4', 'C7']))
    const many = goodTalk(); for (let i = 0; i < 6; i++) many.slides.splice(4, 0, { ...many.slides[4], id: `x${i}` })
    expect(checkTalk(many).find((r) => r.id === 'C3')!.ok).toBe(false)
  })
  test('an encore names the first congress on the title slide', () => {
    const t = goodTalk(); t.encore = 'Nordbay Dermatology Meeting 2027'
    expect(checkTalk(t).find((r) => r.id === 'C11')!.ok).toBe(false)
    t.slides[0].body += '\nEncore of Nordbay Dermatology Meeting 2027'
    expect(checkTalk(t).find((r) => r.id === 'C11')!.ok).toBe(true)
  })
})

describe('embargo', () => {
  const nb = congress('nordbay'), lb = congress('lantern')
  test('abstract data after release; talk data after the talk starts; late-breaking waits for the session', () => {
    expect(checkComm(nb, { id: '1', channel: 'press release', when: '2027-03-08T08:59+01:00', what: 'abstract data', note: '' }).ok).toBe(false)
    expect(checkComm(nb, { id: '2', channel: 'press release', when: '2027-03-08T09:00+01:00', what: 'abstract data', note: '' }).ok).toBe(true)
    expect(checkComm(nb, { id: '3', channel: 'social media post', when: '2027-03-12T10:00+01:00', what: 'new data from the talk', note: '' }).ok).toBe(false)
    expect(checkComm(nb, { id: '4', channel: 'journal online publication', when: '2027-03-10T09:00+01:00', what: 'abstract data', note: '' }).ok).toBe(false)
    expect(checkComm(nb, { id: '5', channel: 'journal online publication', when: '2027-03-12T10:30+01:00', what: 'new data from the talk', note: '' }).ok).toBe(true)
    expect(checkComm(lb, { id: '6', channel: 'investor news', when: '2027-06-14T08:00Z', what: 'abstract data', note: '' }).ok).toBe(false)
    expect(checkComm(lb, { id: '7', channel: 'investor news', when: '2027-06-14T08:30Z', what: 'abstract data', note: '' }).ok).toBe(true)
    expect(checkComm(nb, { id: '8', channel: 'slide photo on social media', when: '2027-03-12T11:00+01:00', what: 'new data from the talk', note: '' }).ok).toBe(false)
  })
})

describe('encore tracker', () => {
  test('finds the encore that comes before the first presentation', () => {
    const e = encores(PLAN_SEED)
    expect(e.filter((x) => !x.ok).map((x) => x.id)).toEqual(['a7'])
    expect(e.find((x) => x.id === 'a3')!.ok).toBe(true)
  })
})
