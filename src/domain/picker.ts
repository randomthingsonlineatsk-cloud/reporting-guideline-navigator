// The guideline picker: a few questions about the study, and the guidelines that apply, each with
// the reason. The questions follow the EQUATOR Network's own decision points (what was studied,
// whether the investigators assigned the intervention, the design), and the traps are the ones
// editors see most often.
import type { GuidelineId } from './types'

export interface Q { id: string; ask: string; options: { value: string; label: string }[]; when?: (a: Record<string, string>) => boolean }
const isTrial = (a: Record<string, string>) => a.kind === 'trial-results' || a.kind === 'trial-protocol'

export const QUESTIONS: Q[] = [
  { id: 'kind', ask: 'What does the article report?', options: [
    { value: 'trial-results', label: 'The results of a trial in which the investigators assigned the intervention' },
    { value: 'trial-protocol', label: 'The protocol of such a trial' },
    { value: 'observational', label: 'An observational study: people followed or compared, with no assigned intervention' },
    { value: 'diagnostic', label: 'How accurately a test identifies a condition' },
    { value: 'prediction', label: 'A model that predicts a diagnosis or a future outcome' },
    { value: 'review', label: 'A review of other studies' },
    { value: 'case', label: 'One patient (a case report)' },
    { value: 'series', label: 'A series of patients, described together' },
    { value: 'pooled', label: 'A pooled analysis of the participant data from several trials' },
    { value: 'economic', label: 'An economic evaluation (costs and consequences)' },
    { value: 'qi', label: 'A quality improvement project' },
    { value: 'qualitative', label: 'Interviews or focus groups' },
    { value: 'animal', label: 'Research in animals' },
  ] },
  { id: 'randomised', ask: 'Was the allocation random?', when: isTrial, options: [{ value: 'yes', label: 'Yes, participants (or groups) were randomised' }, { value: 'no', label: 'No: a single arm, or allocation by another method' }] },
  { id: 'unit', ask: 'What was randomised?', when: (a) => isTrial(a) && a.randomised === 'yes', options: [{ value: 'individual', label: 'Individual participants, each in one group' }, { value: 'cluster', label: 'Groups of people (practices, schools, villages)' }, { value: 'crossover', label: 'The order of treatments, each participant receiving all of them' }] },
  { id: 'framework', ask: 'What did the trial set out to show?', when: (a) => isTrial(a) && a.randomised === 'yes', options: [{ value: 'superiority', label: 'That one treatment is better' }, { value: 'ni', label: 'That a treatment is not unacceptably worse (non-inferiority)' }, { value: 'equivalence', label: 'That treatments are equivalent' }] },
  { id: 'harms', ask: 'Are harms a main outcome of the report?', when: (a) => a.kind === 'trial-results' && a.randomised === 'yes', options: [{ value: 'yes', label: 'Yes, or the report is about safety' }, { value: 'no', label: 'No, harms are reported as usual' }] },
  { id: 'complex', ask: 'Is the intervention complex (behavioural, surgical, a service)?', when: isTrial, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No, a medicine or a simple procedure' }] },
  { id: 'design', ask: 'Which observational design?', when: (a) => a.kind === 'observational', options: [{ value: 'cohort', label: 'Cohort: people followed over time' }, { value: 'case-control', label: 'Case-control: people with and without the outcome compared' }, { value: 'cross-sectional', label: 'Cross-sectional: one point in time' }] },
  { id: 'ai', ask: 'Is the test an artificial intelligence system?', when: (a) => a.kind === 'diagnostic', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'method', ask: 'How was the model built?', when: (a) => a.kind === 'prediction', options: [{ value: 'regression', label: 'Regression' }, { value: 'ml', label: 'Machine learning' }, { value: 'llm', label: 'A large language model' }] },
  { id: 'clustered', ask: 'Were the data clustered (several centres or datasets modelled together)?', when: (a) => a.kind === 'prediction' && a.method !== 'llm', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
  { id: 'review', ask: 'What kind of review?', when: (a) => a.kind === 'review', options: [{ value: 'systematic', label: 'A systematic review, with or without meta-analysis' }, { value: 'scoping', label: 'A scoping review (mapping what is known)' }, { value: 'prediction', label: 'A systematic review of prediction models' }, { value: 'narrative', label: 'A narrative review' }] },
]

export interface Rec { main: GuidelineId | null; also: { id: GuidelineId; why: string }[]; why: string; traps: string[] }

export function nextQuestion(a: Record<string, string>): Q | null {
  return QUESTIONS.find((q) => !(q.id in a) && (!q.when || q.when(a))) ?? null
}

export function recommend(a: Record<string, string>): Rec | null {
  if (nextQuestion(a)) return null
  const also: Rec['also'] = [], traps: string[] = []
  const add = (id: GuidelineId, why: string) => also.push({ id, why })
  switch (a.kind) {
    case 'trial-results':
    case 'trial-protocol': {
      const protocol = a.kind === 'trial-protocol'
      if (a.randomised === 'no') {
        traps.push('CONSORT is for randomised trials. A single-arm or non-randomised trial has no CONSORT checklist; report what CONSORT asks where it applies, and search the EQUATOR library for the design (TREND covers non-randomised evaluations of behavioural and public health interventions).')
        if (protocol) return { main: 'spirit-2025', also, why: 'SPIRIT 2025 covers protocols of all clinical trials, randomised or not.', traps }
        if (a.complex === 'yes') add('trend', 'For a non-randomised evaluation of a behavioural or public health intervention.')
        return { main: null, also, why: 'No main guideline fits a non-randomised trial of a medicine; use the EQUATOR library.', traps }
      }
      if (protocol) {
        traps.push('A protocol is reported with SPIRIT, not CONSORT: CONSORT is for the results.')
        if (a.complex === 'yes') add('tidier', 'To describe a complex intervention so others can repeat it.')
        return { main: 'spirit-2025', also, why: 'SPIRIT 2025 is the guideline for trial protocols; CONSORT 2025 and SPIRIT 2025 were updated together.', traps }
      }
      add('consort-abstracts', 'Every trial report has an abstract; this extension lists what it must contain.')
      if (a.unit === 'cluster') add('consort-cluster', 'Groups were randomised, so the clustering must be reported and analysed.')
      if (a.unit === 'crossover') traps.push('For a crossover trial, also look up the CONSORT extension for crossover trials in the EQUATOR library.')
      if (a.framework === 'ni' || a.framework === 'equivalence') add('consort-ni', 'The margin, its justification and both analysis populations must be reported.')
      if (a.harms === 'yes') add('consort-harms', 'Harms are a main outcome, so report how they were collected, graded and analysed in full.')
      if (a.complex === 'yes') add('tidier', 'To describe a complex intervention so others can repeat it.')
      return { main: 'consort-2025', also, why: 'CONSORT 2025 is the guideline for reports of randomised trials (it replaced CONSORT 2010 in April 2025).', traps }
    }
    case 'observational':
      if (a.design) traps.push('Cohort, case-control and cross-sectional studies all use STROBE, with the design-specific parts of some items.')
      return { main: 'strobe', also, why: 'STROBE covers the three main observational designs.', traps }
    case 'diagnostic':
      if (a.ai === 'yes') return { main: 'stard-ai', also: [{ id: 'stard-2015', why: 'STARD-AI builds on STARD 2015.' }], why: 'STARD-AI is for diagnostic accuracy studies of AI tests.', traps }
      return { main: 'stard-2015', also, why: 'STARD 2015 is the guideline for diagnostic accuracy studies.', traps }
    case 'prediction':
      if (a.method === 'llm') return { main: 'tripod-llm', also, why: 'TRIPOD-LLM covers studies of large language models in health care.', traps }
      if (a.clustered === 'yes') add('tripod-cluster', 'The model was developed or validated on clustered data.')
      return { main: 'tripod-ai', also, why: 'TRIPOD+AI (2024) covers prediction models built by regression or machine learning; it replaced TRIPOD 2015.', traps }
    case 'review':
      if (a.review === 'scoping') return { main: 'prisma-scr', also, why: 'PRISMA-ScR is for scoping reviews (an update is in progress).', traps }
      if (a.review === 'prediction') return { main: 'tripod-srma', also, why: 'TRIPOD-SRMA is for systematic reviews of prediction models.', traps }
      if (a.review === 'narrative') { traps.push('A narrative review has no EQUATOR reporting guideline; journals may still ask how the literature was searched.'); return { main: null, also, why: 'No reporting guideline covers narrative reviews.', traps } }
      add('prisma-s', 'To report the literature search so it can be repeated.')
      return { main: 'prisma-2020', also, why: 'PRISMA 2020 is the guideline for systematic reviews, with or without meta-analysis.', traps }
    case 'case':
      return { main: 'care', also, why: 'CARE is the guideline for case reports.', traps: ['CARE is for a single patient (or a very small number described one by one).'] }
    case 'series':
      return { main: null, also, why: 'There is no main EQUATOR guideline for case series; search the library for your field.', traps: ['A case series is not a case report: CARE does not cover it.'] }
    case 'pooled':
      return { main: null, also, why: 'A pooled analysis of trials is neither a trial report nor a systematic review: search the EQUATOR library (for example the PRISMA extension for individual participant data, when the trials were found by a systematic search).', traps: ['Pooling trials chosen by the sponsor is not a systematic review; PRISMA applies only if the trials were found by a systematic search.'] }
    case 'economic':
      return { main: 'cheers-2022', also, why: 'CHEERS 2022 is the guideline for health economic evaluations.', traps }
    case 'qi':
      return { main: 'squire-2', also, why: 'SQUIRE 2.0 is the guideline for quality improvement studies.', traps }
    case 'qualitative':
      return { main: 'coreq', also, why: 'COREQ is the guideline for interviews and focus groups.', traps }
    case 'animal':
      return { main: 'arrive-2', also, why: 'ARRIVE 2.0 is the guideline for animal research; the Essential 10 are the minimum.', traps }
  }
  return null
}

// Mission RG1: twelve studies, each with the guideline and the extensions that must be chosen.
export interface Case { id: string; text: string; main: GuidelineId | null; also: GuidelineId[]; why: string }
export const RG1_CASES: Case[] = [
  { id: 'c1', text: 'The primary results of VERDANT-1: adults randomised to two doses of lumiravostat or placebo, testing superiority.', main: 'consort-2025', also: ['consort-abstracts'], why: 'A randomised trial report: CONSORT 2025, with CONSORT for Abstracts.' },
  { id: 'c2', text: 'Forty general practices randomised to an electronic reminder for diabetes reviews or usual care; outcomes measured in their patients.', main: 'consort-2025', also: ['consort-abstracts', 'consort-cluster'], why: 'Practices were randomised, not patients: add the cluster extension.' },
  { id: 'c3', text: 'A trial randomising patients to a once-weekly or a once-daily tablet, to show the weekly tablet is not unacceptably worse.', main: 'consort-2025', also: ['consort-abstracts', 'consort-ni'], why: 'A non-inferiority framework: add the non-inferiority extension.' },
  { id: 'c4', text: 'The protocol of GLYDE-3, before the first participant is enrolled.', main: 'spirit-2025', also: [], why: 'A protocol: SPIRIT 2025.' },
  { id: 'c5', text: 'A single-arm phase 2 trial: 30 patients all given a new drug, with no control group.', main: null, also: [], why: 'Not randomised, so not CONSORT; search the EQUATOR library.' },
  { id: 'c6', text: 'People starting Ostrevia in routine care, followed for two years in a registry to compare infection rates with those on other treatments.', main: 'strobe', also: [], why: 'An observational cohort: STROBE.' },
  { id: 'c7', text: 'A systematic review and meta-analysis of kinase inhibitors in hand eczema, with a full database search.', main: 'prisma-2020', also: ['prisma-s'], why: 'A systematic review: PRISMA 2020, with PRISMA-S for the search.' },
  { id: 'c8', text: 'A review mapping which outcome measures hand eczema trials have used, without judging the evidence.', main: 'prisma-scr', also: [], why: 'Mapping the evidence is a scoping review: PRISMA-ScR.' },
  { id: 'c9', text: 'A skin swab test compared with biopsy, the reference standard, in 200 patients with suspected contact dermatitis.', main: 'stard-2015', also: [], why: 'Diagnostic accuracy: STARD 2015.' },
  { id: 'c10', text: 'An image-analysis algorithm that classifies eczema severity from photographs, compared with a panel of dermatologists.', main: 'stard-ai', also: ['stard-2015'], why: 'An AI test\'s accuracy: STARD-AI, built on STARD 2015.' },
  { id: 'c11', text: 'One patient who developed herpes zoster in the third month of lumiravostat.', main: 'care', also: [], why: 'One patient: CARE.' },
  { id: 'c12', text: 'The cost per quality-adjusted life year of Ostrevia compared with standard care, from a health system perspective.', main: 'cheers-2022', also: [], why: 'An economic evaluation: CHEERS 2022.' },
]

export interface CaseAnswer { main: string; also: string[] }
export function scoreRG1(answers: Record<string, CaseAnswer>) {
  const detail = RG1_CASES.map((c) => {
    const a = answers[c.id]
    const chosen = !a || !a.main ? undefined : a.main === 'none' ? null : a.main
    const mainOk = chosen === c.main
    const alsoOk = !!a && c.also.every((x) => a.also.includes(x)) && a.also.every((x) => c.also.includes(x as GuidelineId))
    return { id: c.id, ok: mainOk && alsoOk, why: c.why, mainOk, alsoOk }
  })
  const right = detail.filter((d) => d.ok).length
  return { right, score: Math.round((right / RG1_CASES.length) * 100), passed: right >= 10, detail }
}
