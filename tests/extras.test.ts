import { describe, expect, test } from 'vitest'
import { contrast, checkPalette, checkAlt, SAFE_PALETTE, simulate, hexRgb } from '../src/domain/a11y'
import { blankVisual, checkVisual, visualSvg, blankScript, checkScript, seconds } from '../src/domain/extras'

describe('accessibility', () => {
  test('WCAG contrast', () => { expect(contrast('#000000', '#ffffff')).toBe(21); expect(contrast('#777777', '#ffffff')).toBeLessThan(4.5) })
  test('red and green merge for deuteranopia; the safe palette does not', () => {
    expect(checkPalette(['#d62728', '#2ca02c']).problems.join(' ')).toMatch(/deuteranopia|protanopia/)
    expect(checkPalette(SAFE_PALETTE).ok).toBe(true)
    expect(simulate(hexRgb('#ffffff')!, 'deuteranopia').map(Math.round)).toEqual([255, 255, 255])
  })
  test('alt text', () => {
    expect(checkAlt('Figure of results').ok).toBe(false)
    expect(checkAlt('Bar chart of treatment success at week 16: 31.3% with lumiravostat 25 mg, 21.4% with 10 mg and 20.0% with placebo.', ['31.3%']).ok).toBe(true)
    expect(checkAlt('Image of a bar chart showing treatment success by group at week sixteen in the trial.').ok).toBe(false)
  })
})

const goodVisual = () => ({ ...blankVisual(),
  title: 'Lumiravostat in chronic hand eczema: first cohort of VERDANT-1',
  population: '45 adults with moderate to severe chronic hand eczema.', design: 'Randomised, double-blind, 16 weeks.', arms: 'Lumiravostat 10 mg, 25 mg or placebo once daily.',
  headline: 'Treatment success: 31.3% (25 mg), 21.4% (10 mg), 20.0% (placebo); differences not statistically significant.', safety: 'Adverse events: 62.5%, 57.1% and 53.3%.',
  conclusion: 'No clear benefit yet in this first cohort; the full trial continues.', funder: 'Funded by Halcyon Ridge Pharmaceuticals',
  alt: 'Visual abstract of VERDANT-1: in 45 adults, treatment success at week 16 was 31.3% with lumiravostat 25 mg, 21.4% with 10 mg and 20.0% with placebo; no difference was statistically significant.' })

describe('visual abstract', () => {
  test('a good one passes every check and renders', () => { expect(checkVisual(goodVisual()).filter((r) => !r.ok).map((r) => `${r.id} ${r.why}`)).toEqual([]); expect(visualSvg(goodVisual())).toMatch(/<svg[\s\S]*What was found/) })
  test('a claim, an invented number, low contrast and a red-green palette fail', () => {
    const v = { ...goodVisual(), conclusion: 'Lumiravostat significantly improves hand eczema, with 63.9% fewer flares.', fg: '#999999', palette: ['#d62728', '#2ca02c', '#555555'] }
    expect(checkVisual(v).filter((r) => !r.ok).map((r) => r.id)).toEqual(expect.arrayContaining(['V6', 'V7', 'V10', 'V11']))
  })
})

describe('video abstract and podcast scripts', () => {
  const words = (n: number) => Array.from({ length: n }, () => 'word').join(' ')
  test('timing at 150 words a minute', () => { const s = blankScript(); s.segments = [{ visual: 'x', narration: words(450) }]; expect(seconds(s)).toBe(180); s.segments[0].narration = words(460); expect(checkScript(s)[0].ok).toBe(false) })
  test('a complete video script passes', () => {
    const s = { ...blankScript('video'), captions: true, transcript: true, segments: [
      { visual: 'Speaker on camera, title card', narration: 'I am Anika Rao, and this is a summary of the first cohort of VERDANT-1, a trial of lumiravostat in chronic hand eczema.' },
      { visual: 'Bar chart of treatment success', narration: 'Treatment success at week 16 was 31.3% with 25 mg, 21.4% with 10 mg and 20.0% with placebo. The differences were not statistically significant.' },
      { visual: 'Text: funding and interests', narration: 'Halcyon Ridge Pharmaceuticals funded the trial. I received consulting fees from the sponsor. The full article is in the Fennick Journal of Dermatology.' } ] }
    expect(checkScript(s).filter((r) => !r.ok).map((r) => `${r.id} ${r.why ?? ''}`)).toEqual([])
    expect(checkScript({ ...s, kind: 'podcast' }).find((r) => r.id === 'S8')!.ok).toBe(false)
  })
})
