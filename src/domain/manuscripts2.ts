// Phase 2 manuscripts: one per study design, each with its answer key, and for missions RG7 to
// RG11 a planted version. Every derived number (rates, sensitivity and specificity, the ICER, the
// flow counts) is computed here, so the text and the checks cannot disagree. All fictional.
import { build, type P } from './manuscripts'
import type { Manuscript } from './types'

const k = (g: string) => (...ids: string[]) => ids.map((i) => `${g}:${i}`)
const ST = k('strobe'), PR = k('prisma-2020'), PS = k('prisma-s'), SD = k('stard-2015'), CA = k('care'), CH = k('cheers-2022')
const NI = k('consort-ni'), CL = k('consort-cluster'), AR = k('arrive-2'), TR = k('tripod-ai'), SQ = k('squire-2'), CQ = k('coreq')
const f1 = (x: number) => x.toFixed(1)
const fmt = (n: number) => n.toLocaleString('en-GB')

// Wilson score interval for a proportion, in percent.
export function wilson(x: number, n: number): [number, number] {
  const z = 1.959964, p = x / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d
  return [100 * (c - h), 100 * (c + h)]
}

export interface Planted { mission: string; items: string[]; edits: Record<string, string>; numbers?: { id: string; label: string; shown: string; wrong: boolean; why: string }[] }

// ------------------------------------------------------------------------------------------
// RG7 · Cohort: serious infections on lumiravostat in routine care (STROBE)
// ------------------------------------------------------------------------------------------
export const COHORT_N = { ost: { n: 1204, events: 58, py: 1871 }, cmp: { n: 2310, events: 89, py: 3708 } }
const rate = (e: number, py: number) => (100 * e) / py
const RO = rate(COHORT_N.ost.events, COHORT_N.ost.py), RC = rate(COHORT_N.cmp.events, COHORT_N.cmp.py)
const cohort: P[] = [
  { id: 'c-title', section: 'Title and abstract', text: 'Serious infections in adults starting lumiravostat or another systemic treatment for chronic hand eczema: a cohort study in the OSTREG registry', items: ST('1a') },
  { id: 'c-abstract', section: 'Title and abstract', heading: 'Abstract', text: `In a registry cohort of ${fmt(COHORT_N.ost.n)} adults starting lumiravostat and ${fmt(COHORT_N.cmp.n)} starting ciclosporin, methotrexate or alitretinoin for chronic hand eczema, serious infections occurred at ${f1(RO)} and ${f1(RC)} per 100 person-years. After adjustment, the hazard ratio was 1.21 (95% CI 0.88 to 1.66). We found no clear increase in serious infections with lumiravostat, but the estimate is imprecise.`, items: ST('1b') },
  { id: 'c-intro', section: 'Introduction', text: 'Lumiravostat (Ostrevia) was approved for chronic hand eczema on the strength of 16-week trials, in which infections were the most common adverse events. Trials of that size cannot estimate the rate of serious infections in routine use. We therefore compared serious infections in people starting lumiravostat with those starting other systemic treatments, with the prespecified hypothesis that the rate would not be more than 50% higher.', items: ST('2', '3') },
  { id: 'c-design', section: 'Methods', heading: 'Design and setting', text: 'This was a prospective cohort study within OSTREG, a dermatology registry at 31 hospital clinics in Germany, the Netherlands and Denmark. Adults were enrolled when they started a systemic treatment for chronic hand eczema between 1 March 2027 and 31 August 2029 and were followed until 28 February 2030.', items: ST('4', '5') },
  { id: 'c-part', section: 'Methods', heading: 'Participants', text: 'Eligible adults had chronic hand eczema confirmed by a dermatologist and were starting lumiravostat, ciclosporin, methotrexate or alitretinoin; people who had used any of these in the previous 12 months were excluded. Clinics invited every eligible patient. Participants were seen every 3 months by the clinic, and hospital admissions were also found through linkage to the national hospital registers.', items: ST('6a') },
  { id: 'c-vars', section: 'Methods', heading: 'Variables', text: 'The exposure was the treatment started at entry, analysed as first treatment carried forward for up to 90 days after stopping. The outcome was a serious infection, defined as an infection that led to hospital admission or death, or needed intravenous antibiotics; two dermatologists unaware of the treatment confirmed each event from the records. Confounders, chosen in advance from the literature, were age, sex, diabetes, smoking, eczema severity (HECSI) and earlier systemic corticosteroid use.', items: ST('7', '8') },
  { id: 'c-bias', section: 'Methods', text: 'To reduce confounding by indication we compared people starting a systemic treatment, not users with non-users, and used a new-user design. Outcome assessors were blinded to treatment, and register linkage captured admissions outside the study clinics.', items: ST('9') },
  { id: 'c-size', section: 'Methods', text: 'All eligible patients in the registry period were included. With the expected rates, about 140 events would estimate a hazard ratio of 1.5 with a 95% confidence interval within 0.7 of the estimate.', items: ST('10') },
  { id: 'c-quant', section: 'Methods', heading: 'Statistical analysis', text: 'Age was modelled as a restricted cubic spline and HECSI in quartiles (cut-points 18, 27 and 39). We estimated hazard ratios with Cox regression, adjusting for the confounders above with inverse probability of treatment weights. Effect modification by age (below 50 or 50 and over) and diabetes was tested with interaction terms.', items: ST('11', '12a', '12b', '16b') },
  { id: 'c-miss', section: 'Methods', text: 'Missing values of smoking and HECSI were imputed by multiple imputation (20 data sets). Participants lost to follow-up were censored at their last contact. In a sensitivity analysis we analysed exposure as treatment actually taken.', items: ST('12c', '12d', '12e') },
  { id: 'c-flow', section: 'Results', heading: 'Participants', text: `Of 3,902 people who started a systemic treatment, 3,651 were eligible and 3,514 agreed to take part (137 declined); ${fmt(COHORT_N.ost.n)} started lumiravostat and ${fmt(COHORT_N.cmp.n)} another treatment (Figure 1). Follow-up was complete for 3,402 (96.8%); 112 were lost to follow-up.`, items: ST('13a', '13b', '13c') },
  { id: 'c-base', section: 'Results', text: 'People starting lumiravostat were younger and had more severe eczema (Table 1). Smoking status was missing for 214 participants (6.1%) and HECSI for 88 (2.5%).', items: ST('14a', '14b') },
  { id: 'c-fu', section: 'Results', text: `The median follow-up was 1.6 years (interquartile range 0.9 to 2.3); the total was ${fmt(COHORT_N.ost.py)} person-years on lumiravostat and ${fmt(COHORT_N.cmp.py)} on comparators.`, items: ST('14c') },
  { id: 'c-out', section: 'Results', heading: 'Serious infections', text: `There were ${COHORT_N.ost.events} serious infections on lumiravostat (${f1(RO)} per 100 person-years) and ${COHORT_N.cmp.events} on comparators (${f1(RC)} per 100 person-years). The crude hazard ratio was ${(RO / RC).toFixed(2)} (95% CI 0.93 to 1.80) and the adjusted hazard ratio 1.21 (95% CI 0.88 to 1.66). Over one year this is about ${f1(RO - RC)} extra serious infections per 100 people treated.`, items: ST('15', '16a', '16c') },
  { id: 'c-other', section: 'Results', text: 'The hazard ratio did not differ by age group or diabetes (P for interaction 0.41 and 0.63), and the as-treated analysis gave 1.25 (95% CI 0.90 to 1.74).', items: ST('17') },
  { id: 'c-disc', section: 'Discussion', text: 'In routine care, serious infections were slightly more frequent with lumiravostat than with other systemic treatments, but the difference was compatible with no effect and with an increase of up to two thirds.', items: ST('18') },
  { id: 'c-limits', section: 'Discussion', text: 'Residual confounding by severity is likely, and would tend to exaggerate the risk with lumiravostat, which was given to people with more severe eczema. Some infections treated outside hospital may have been missed equally in both groups, which would bias the estimate towards no difference.', items: ST('19') },
  { id: 'c-interp', section: 'Discussion', text: 'Taken with the trial data, the results do not suggest a large increase in serious infections, but they cannot exclude a moderate one. The clinics are specialist centres in northern Europe, so the results may not apply to primary care or other regions.', items: ST('20', '21') },
  { id: 'c-fund', section: 'Other information', text: 'OSTREG is funded by Halcyon Ridge Pharmaceuticals as a condition of the marketing authorisation. The funder reviewed the protocol but had no role in the analysis, interpretation or the decision to publish.', items: ST('22') },
]
export const COHORT: Manuscript = build({ id: 'ostreg-cohort', study: 'OSTREG', kind: 'article', journal: 'Wexley Journal of Pharmacoepidemiology (fictional)', title: 'OSTREG cohort: serious infections on lumiravostat', guidelines: ['strobe'], na: ['strobe:6b'], note: 'A fictional post-authorisation registry study of Ostrevia. Matching (6b) does not apply.' }, cohort)
export const COHORT_PLANTED: Planted = {
  mission: 'RG7', items: ['5', '6a', '9', '10', '12c', '14b', '14c', '16a', '19', '22'],
  edits: {
    'c-design': 'This was a prospective cohort study within OSTREG, a dermatology registry.',
    'c-part': 'Eligible adults had chronic hand eczema confirmed by a dermatologist and were starting lumiravostat, ciclosporin, methotrexate or alitretinoin; people who had used any of these in the previous 12 months were excluded.',
    'c-bias': '',
    'c-size': '',
    'c-miss': 'Participants lost to follow-up were censored at their last contact. In a sensitivity analysis we analysed exposure as treatment actually taken.',
    'c-base': 'People starting lumiravostat were younger and had more severe eczema (Table 1).',
    'c-fu': 'The median follow-up was 1.6 years.',
    'c-out': `There were ${COHORT_N.ost.events} serious infections on lumiravostat (${f1(RO)} per 100 person-years) and ${COHORT_N.cmp.events} on comparators (${f1(RC)} per 100 person-years); the hazard ratio was 1.21. Over one year this is about ${f1(RO - RC)} extra serious infections per 100 people treated.`,
    'c-limits': '',
    'c-fund': 'OSTREG is funded by Halcyon Ridge Pharmaceuticals.',
  },
}

// ------------------------------------------------------------------------------------------
// RG8 · Systematic review and meta-analysis (PRISMA 2020 + PRISMA-S)
// ------------------------------------------------------------------------------------------
export const FLOW = { medline: 512, embase: 604, central: 132, registers: 46, duplicates: 318, excludedTA: 902, notRetrieved: 3, excludedFT: 63, studies: 6 }
const identified = FLOW.medline + FLOW.embase + FLOW.central + FLOW.registers
const screened = identified - FLOW.duplicates, sought = screened - FLOW.excludedTA, assessed = sought - FLOW.notRetrieved, included = assessed - FLOW.excludedFT
const review: P[] = [
  { id: 'r-title', section: 'Title and abstract', text: 'Oral kinase inhibitors for moderate to severe chronic hand eczema: a systematic review and meta-analysis of randomised trials', items: PR('1') },
  { id: 'r-abstract', section: 'Title and abstract', heading: 'Abstract', text: `We searched four sources to 15 January 2028 for randomised trials of oral kinase inhibitors against placebo in chronic hand eczema. Six trials (${fmt(1840)} participants) were included. Treatment success was more likely with kinase inhibitors (risk ratio 2.10, 95% CI 1.52 to 2.90; I² 38%; moderate certainty). PROSPERO CRD99990012.`, items: PR('2') },
  { id: 'r-intro', section: 'Introduction', text: 'Three oral kinase inhibitors have been tested against placebo in chronic hand eczema, but no review has pooled them. We asked whether, compared with placebo, they increase the proportion of adults who reach clear or almost clear hands, and how often they cause serious infections.', items: PR('3', '4') },
  { id: 'r-elig', section: 'Methods', heading: 'Eligibility', text: 'We included randomised trials of at least 12 weeks comparing an oral kinase inhibitor with placebo in adults with moderate to severe chronic hand eczema. Trials were grouped by drug for the subgroup analysis.', items: PR('5') },
  { id: 'r-sources', section: 'Methods', heading: 'Information sources and search', text: 'We searched MEDLINE (via Ovid), Embase (via Embase.com) and CENTRAL (via the Cochrane Library) from inception to 15 January 2028, and ClinicalTrials.gov and the WHO ICTRP portal on 16 January 2028. We checked the reference lists of included trials and asked the three manufacturers for unpublished trials.', items: [...PR('6'), ...PS('S1', 'S3', 'S5', 'S6', 'S13')] },
  { id: 'r-strategy', section: 'Methods', text: 'The full strategies for every source, exactly as run, are in Supplementary Appendix 1. We used no language or date limits, and the Cochrane highly sensitive filter for randomised trials (2023 revision) in MEDLINE and Embase. An information specialist peer reviewed the MEDLINE strategy with the PRESS checklist.', items: [...PR('7'), ...PS('S8', 'S9', 'S10', 'S14')] },
  { id: 'r-dedup', section: 'Methods', text: `The searches found ${FLOW.medline} records in MEDLINE, ${FLOW.embase} in Embase, ${FLOW.central} in CENTRAL and ${FLOW.registers} in the registers; duplicates were removed in reference management software and then checked by hand.`, items: PS('S15', 'S16') },
  { id: 'r-select', section: 'Methods', heading: 'Selection and data collection', text: 'Two reviewers independently screened titles and abstracts and then full texts, resolving disagreements by discussion; no automation tools were used. Two reviewers independently extracted data on a piloted form and contacted trial authors for missing results.', items: PR('8', '9') },
  { id: 'r-out', section: 'Methods', text: 'The primary outcome was treatment success (IGA-CHE 0 or 1 with at least 2 grades of improvement) at the end of treatment, taking the latest time point up to 16 weeks; the secondary outcome was serious infection. We also collected the drug, dose, duration, baseline severity and funding, assuming no events when a trial reported none.', items: PR('10a', '10b') },
  { id: 'r-rob', section: 'Methods', heading: 'Risk of bias and effect measures', text: 'Two reviewers independently assessed risk of bias with the Cochrane RoB 2 tool. We expressed both outcomes as risk ratios with 95% confidence intervals.', items: PR('11', '12') },
  { id: 'r-synth', section: 'Methods', heading: 'Synthesis', text: 'Every trial reporting an outcome was included in that synthesis; for multi-dose trials we combined the dose arms. Results are tabulated by trial and shown in forest plots. We pooled risk ratios in a random-effects model (restricted maximum likelihood) and measured heterogeneity with I² and tau², using R (meta package). We explored heterogeneity by drug and did a sensitivity analysis excluding trials at high risk of bias. Small-study effects were examined with a funnel plot. Certainty was rated with GRADE.', items: PR('13a', '13b', '13c', '13d', '13e', '13f', '14', '15') },
  { id: 'r-flow', section: 'Results', heading: 'Study selection', text: `The searches identified ${fmt(identified)} records; after removing ${FLOW.duplicates} duplicates, ${screened} were screened and ${FLOW.excludedTA} excluded. Of ${sought} reports sought, ${FLOW.notRetrieved} could not be retrieved; ${assessed} were assessed in full and ${FLOW.excludedFT} excluded (wrong population 21, wrong intervention 14, no placebo group 17, conference abstract only 11). ${included} reports of ${FLOW.studies} trials were included (Figure 1). Supplementary Table 2 lists the excluded reports with reasons.`, items: PR('16a', '16b') },
  { id: 'r-chars', section: 'Results', text: 'The six trials (1,840 participants) tested three drugs for 12 to 16 weeks (Table 1). Two were at high risk of bias for missing outcome data, and the others at low risk or with some concerns (Figure 2).', items: PR('17', '18', '20a') },
  { id: 'r-res', section: 'Results', heading: 'Results of syntheses', text: 'Trial-level results are in Table 2. Treatment success was more frequent with kinase inhibitors (risk ratio 2.10, 95% CI 1.52 to 2.90; I² 38%, tau² 0.05). The effect did not differ by drug (P=0.44), and excluding the two trials at high risk of bias gave 1.98 (95% CI 1.36 to 2.88). Serious infections: risk ratio 1.62 (95% CI 0.71 to 3.70; I² 0%).', items: PR('19', '20b', '20c', '20d') },
  { id: 'r-grade', section: 'Results', text: 'The funnel plot was symmetrical, though with six trials this is hard to judge. Certainty was moderate for treatment success (downgraded for risk of bias) and low for serious infection (downgraded twice for imprecision).', items: PR('21', '22') },
  { id: 'r-disc', section: 'Discussion', text: 'Oral kinase inhibitors roughly double the chance of clear or almost clear hands over 12 to 16 weeks, consistent with their effect in atopic dermatitis. The trials were short and industry-funded, and two lost many participants; our search may have missed unpublished trials outside the registers. Longer trials with active comparators are needed before these drugs are used ahead of established treatments.', items: PR('23a', '23b', '23c', '23d') },
  { id: 'r-reg', section: 'Other information', text: 'The review was registered in PROSPERO (CRD99990012) and the protocol is available there; we added the funnel plot, which the protocol had not planned, at a reviewer\'s request.', items: PR('24a', '24b', '24c') },
  { id: 'r-fund', section: 'Other information', text: 'The review had no external funding. The authors declare no competing interests. The extraction forms, extracted data and R code are in an open repository (doi to follow on acceptance).', items: PR('25', '26', '27') },
]
export const REVIEW: Manuscript = build({ id: 'kinase-review', study: 'Systematic review', kind: 'article', journal: 'Fennick Journal of Dermatology (fictional)', title: 'Kinase inhibitors in hand eczema: systematic review', guidelines: ['prisma-2020', 'prisma-s'], na: ['prisma-s:S2', 'prisma-s:S4', 'prisma-s:S7', 'prisma-s:S11', 'prisma-s:S12'], note: 'Every count in the flow of studies should add up: identified, removed, screened, sought, assessed, excluded, included.' }, review)
const plantedFlow = `The searches identified ${fmt(identified)} records; after removing ${FLOW.duplicates} duplicates, ${screened} were screened and ${FLOW.excludedTA} excluded. Of ${sought} reports sought, ${FLOW.notRetrieved} could not be retrieved; ${assessed} were assessed in full and ${FLOW.excludedFT - 2} excluded (wrong population 21, wrong intervention 14, no placebo group 15, conference abstract only 11). ${included} reports of ${FLOW.studies} trials were included (Figure 1). Supplementary Table 2 lists the excluded reports with reasons.`
export const REVIEW_PLANTED: Planted = {
  mission: 'RG8', items: ['prisma-s:S13', 'prisma-2020:6', 'prisma-2020:7', 'prisma-2020:8', 'prisma-2020:11', 'prisma-2020:13d', 'prisma-2020:15', 'prisma-2020:22', 'prisma-2020:24a', 'prisma-s:S14', 'prisma-s:S16'],
  edits: {
    'r-sources': 'We searched MEDLINE (via Ovid), Embase (via Embase.com) and CENTRAL (via the Cochrane Library), and ClinicalTrials.gov and the WHO ICTRP portal. We checked the reference lists of included trials and asked the three manufacturers for unpublished trials.',
    'r-strategy': 'We used no language or date limits, and the Cochrane highly sensitive filter for randomised trials (2023 revision) in MEDLINE and Embase.',
    'r-dedup': `The searches found ${FLOW.medline} records in MEDLINE, ${FLOW.embase} in Embase, ${FLOW.central} in CENTRAL and ${FLOW.registers} in the registers.`,
    'r-select': 'Titles, abstracts and full texts were screened against the criteria. Two reviewers independently extracted data on a piloted form and contacted trial authors for missing results.',
    'r-rob': 'We expressed both outcomes as risk ratios with 95% confidence intervals.',
    'r-synth': 'Every trial reporting an outcome was included in that synthesis; for multi-dose trials we combined the dose arms. Results are tabulated by trial and shown in forest plots. We pooled the risk ratios using R (meta package). We explored heterogeneity by drug and did a sensitivity analysis excluding trials at high risk of bias. Small-study effects were examined with a funnel plot.',
    'r-flow': plantedFlow,
    'r-grade': 'The funnel plot was symmetrical, though with six trials this is hard to judge.',
    'r-reg': 'The protocol is available from the authors; we added the funnel plot, which the protocol had not planned, at a reviewer\'s request.',
  },
  numbers: [
    { id: 'n1', label: 'Records identified', shown: fmt(identified), wrong: false, why: `${FLOW.medline} + ${FLOW.embase} + ${FLOW.central} + ${FLOW.registers} = ${fmt(identified)}.` },
    { id: 'n2', label: 'Records screened', shown: String(screened), wrong: false, why: `${fmt(identified)} − ${FLOW.duplicates} duplicates = ${screened}.` },
    { id: 'n3', label: 'Reports sought for retrieval', shown: String(sought), wrong: false, why: `${screened} − ${FLOW.excludedTA} = ${sought}.` },
    { id: 'n4', label: 'Reports assessed for eligibility', shown: String(assessed), wrong: false, why: `${sought} − ${FLOW.notRetrieved} not retrieved = ${assessed}.` },
    { id: 'n5', label: 'Reports excluded at full text', shown: String(FLOW.excludedFT - 2), wrong: true, why: `${assessed} assessed − ${included} included = ${FLOW.excludedFT}, not ${FLOW.excludedFT - 2}; and the reasons listed (21 + 14 + 15 + 11 = 61) hide the error. One reason count was changed.` },
    { id: 'n6', label: 'Reports included', shown: String(included), wrong: false, why: `${included} reports of ${FLOW.studies} trials.` },
  ],
}

// ------------------------------------------------------------------------------------------
// RG9 · Diagnostic accuracy (STARD 2015)
// ------------------------------------------------------------------------------------------
export const TWO = { tp: 68, fp: 14, fn: 12, tn: 106 }
const pos = TWO.tp + TWO.fn, neg = TWO.fp + TWO.tn, N2 = pos + neg
const sens = (100 * TWO.tp) / pos, spec = (100 * TWO.tn) / neg
const [sl, su] = wilson(TWO.tp, pos), [pl, pu] = wilson(TWO.tn, neg)
const diag: P[] = [
  { id: 'd-title', section: 'Title and abstract', text: 'Sensitivity and specificity of a skin swab assay (CX-7) for allergic contact dermatitis of the hands, compared with patch testing: a diagnostic accuracy study', items: SD('1') },
  { id: 'd-abstract', section: 'Title and abstract', heading: 'Abstract', text: `In ${N2} consecutive adults with suspected allergic contact dermatitis of the hands, the CX-7 swab assay had a sensitivity of ${f1(sens)}% (95% CI ${f1(sl)} to ${f1(su)}) and a specificity of ${f1(spec)}% (95% CI ${f1(pl)} to ${f1(pu)}) against patch testing. The assay could help decide who needs patch testing.`, items: SD('2') },
  { id: 'd-intro', section: 'Introduction', text: 'Patch testing is the reference standard for allergic contact dermatitis, but it needs three visits over a week and is not available in many clinics. The CX-7 assay measures a cytokine signature in a skin swab in 30 minutes; it is intended as a triage test in general dermatology clinics, to identify who should be referred for patch testing. We estimated its sensitivity and specificity, expecting both to exceed 80%.', items: SD('3', '4') },
  { id: 'd-design', section: 'Methods', heading: 'Design and participants', text: 'This was a prospective study: the protocol and the analysis plan were written before any participant had either test. Adults (18 years or older) referred with hand eczema suspected to be allergic were eligible; people using systemic immunosuppressants or with broken skin at the swab site were excluded.', items: SD('5', '6') },
  { id: 'd-recruit', section: 'Methods', text: 'Potentially eligible adults were identified by the referring dermatologist at the first visit, on the basis of symptoms and history, at two hospital dermatology clinics in Mumbai and Pune between 3 May 2027 and 28 February 2028. We approached consecutive eligible patients.', items: SD('7', '8', '9') },
  { id: 'd-tests', section: 'Methods', heading: 'Tests', text: 'A nurse took the swab from the most affected area with the CX-7 kit and the assay was run in the clinic laboratory following the manufacturer\'s instructions. Patch testing used the European baseline series plus a hand series, read on days 2 and 4 by a dermatologist following the European Society of Contact Dermatitis guideline; it was chosen because it is the accepted standard for contact allergy.', items: SD('10a', '10b', '11') },
  { id: 'd-cut', section: 'Methods', text: 'The CX-7 result was positive at a score of 0.40 or more, the cut-off the manufacturer prespecified from a development study. A patch test was positive for a reaction of + or more at day 4 that the dermatologist judged relevant to the hand eczema.', items: SD('12a', '12b') },
  { id: 'd-blind', section: 'Methods', text: 'The laboratory staff running CX-7 had no clinical information and did not know the patch test results; the dermatologists reading the patch tests did not know the CX-7 results.', items: SD('13a', '13b') },
  { id: 'd-anal', section: 'Methods', heading: 'Analysis', text: 'We estimated sensitivity and specificity with Wilson 95% confidence intervals. Indeterminate CX-7 results (an invalid control line) were repeated once; persistent indeterminate results were counted as positive in the main analysis and excluded in a sensitivity analysis. Participants without a patch test reading were excluded. A prespecified subgroup analysis compared participants with and without atopic dermatitis.', items: SD('14', '15', '16', '17') },
  { id: 'd-size', section: 'Methods', text: 'Assuming a prevalence of 40%, 200 participants would give about 80 with contact allergy and a 95% confidence interval for a sensitivity of 85% of about ±8 percentage points.', items: SD('18') },
  { id: 'd-flow', section: 'Results', heading: 'Participants', text: `Of 231 eligible patients, 214 agreed and were tested; 14 were excluded (9 without a day 4 reading, 5 with persistent indeterminate CX-7 results), leaving ${N2} for the analysis (Figure 1). Their median age was 38 years and 61% were women (Table 1). ${pos} had allergic contact dermatitis, mostly to preservatives and fragrances, and the other ${neg} had irritant dermatitis (71) or atopic hand eczema (49). Both tests were done within 7 days, with no treatment changes in between.`, items: SD('19', '20', '21a', '21b', '22') },
  { id: 'd-2x2', section: 'Results', heading: 'Test results', text: `CX-7 was positive in ${TWO.tp} of the ${pos} participants with a positive patch test (true positives) and in ${TWO.fp} of the ${neg} without (false positives); there were ${TWO.fn} false negatives and ${TWO.tn} true negatives (Table 2). Sensitivity was ${f1(sens)}% (95% CI ${f1(sl)} to ${f1(su)}) and specificity ${f1(spec)}% (95% CI ${f1(pl)} to ${f1(pu)}).`, items: SD('23', '24') },
  { id: 'd-ae', section: 'Results', text: 'No adverse events followed the swab. Three participants had irritation at a patch test site, which resolved within a week.', items: SD('25') },
  { id: 'd-disc', section: 'Discussion', text: 'Both clinics were specialist referral centres, so prevalence and severity were higher than in general practice, and the cut-off was set by the manufacturer on a small development sample. Used as a triage test, CX-7 would correctly send most people with contact allergy for patch testing while sparing most of the others; it should not replace patch testing.', items: SD('26', '27') },
  { id: 'd-other', section: 'Other information', text: 'The study was registered in the Clinical Trials Registry – India (CTRI/2027/00/000123) and the protocol is in the supplement. It was funded by a research grant from the Western Coast Medical College; the manufacturer supplied the kits free of charge and had no role in the design, analysis or report.', items: SD('28', '29', '30') },
]
export const DIAG: Manuscript = build({ id: 'cx7-diagnostic', study: 'CX-7 assay', kind: 'article', journal: 'Orrin Journal of Clinical Diagnostics (fictional)', title: 'CX-7 swab assay: diagnostic accuracy', guidelines: ['stard-2015'], na: [], note: 'The accuracy figures should follow from the 2×2 table in the results: recompute them.' }, diag)
const wrongSpec = 91.2
export const DIAG_PLANTED: Planted = {
  mission: 'RG9', items: ['5', '9', '12a', '13a', '13b', '15', '18', '22', '25', '28'],
  edits: {
    'd-design': 'Adults (18 years or older) referred with hand eczema suspected to be allergic were eligible; people using systemic immunosuppressants or with broken skin at the swab site were excluded.',
    'd-recruit': 'Potentially eligible adults were identified by the referring dermatologist at the first visit, on the basis of symptoms and history, at two hospital dermatology clinics in Mumbai and Pune between 3 May 2027 and 28 February 2028.',
    'd-cut': 'A patch test was positive for a reaction of + or more at day 4 that the dermatologist judged relevant to the hand eczema.',
    'd-blind': '',
    'd-anal': 'We estimated sensitivity and specificity with Wilson 95% confidence intervals. Participants without a patch test reading were excluded. A prespecified subgroup analysis compared participants with and without atopic dermatitis.',
    'd-size': '',
    'd-flow': `Of 231 eligible patients, 214 agreed and were tested; 14 were excluded, leaving ${N2} for the analysis (Figure 1). Their median age was 38 years and 61% were women (Table 1). ${pos} had allergic contact dermatitis, mostly to preservatives and fragrances, and the other ${neg} had irritant dermatitis (71) or atopic hand eczema (49).`,
    'd-2x2': `CX-7 was positive in ${TWO.tp} of the ${pos} participants with a positive patch test (true positives) and in ${TWO.fp} of the ${neg} without (false positives); there were ${TWO.fn} false negatives and ${TWO.tn} true negatives (Table 2). Sensitivity was ${f1(sens)}% (95% CI ${f1(sl)} to ${f1(su)}) and specificity ${wrongSpec}% (95% CI ${f1(pl)} to ${f1(pu)}).`,
    'd-ae': '',
    'd-other': 'The protocol is in the supplement. The study was funded by a research grant from the Western Coast Medical College; the manufacturer supplied the kits free of charge and had no role in the design, analysis or report.',
  },
  numbers: [
    { id: 'n1', label: 'Participants with the target condition', shown: String(pos), wrong: false, why: `${TWO.tp} true positives + ${TWO.fn} false negatives = ${pos}.` },
    { id: 'n2', label: 'Participants without it', shown: String(neg), wrong: false, why: `${TWO.fp} + ${TWO.tn} = ${neg}; 71 irritant + 49 atopic = 120.` },
    { id: 'n3', label: 'Sensitivity', shown: `${f1(sens)}%`, wrong: false, why: `${TWO.tp} ÷ ${pos} = ${f1(sens)}%.` },
    { id: 'n4', label: 'Specificity', shown: `${wrongSpec}%`, wrong: true, why: `${TWO.tn} ÷ ${neg} = ${f1(spec)}%, not ${wrongSpec}%. Its confidence interval (${f1(pl)} to ${f1(pu)}) was left unchanged, so it no longer matches.` },
    { id: 'n5', label: 'Analysed', shown: String(N2), wrong: false, why: `214 tested − 14 excluded = ${N2}.` },
  ],
}

// ------------------------------------------------------------------------------------------
// RG10 · Case report (CARE)
// ------------------------------------------------------------------------------------------
const caseR: P[] = [
  { id: 'k-title', section: 'Front matter', text: 'Disseminated herpes zoster during lumiravostat treatment for chronic hand eczema: a case report', items: CA('1') },
  { id: 'k-keys', section: 'Front matter', text: 'Key words: herpes zoster; kinase inhibitor; lumiravostat; hand eczema; adverse drug reaction.', items: CA('2') },
  { id: 'k-abstract', section: 'Front matter', heading: 'Abstract', text: 'Herpes zoster is a known risk with oral kinase inhibitors, but dissemination after only a few weeks has not been described with lumiravostat. A 58-year-old woman developed a painful vesicular rash on the left chest in the tenth week of lumiravostat 25 mg, which spread to distant skin within three days. Disseminated herpes zoster was confirmed by PCR; lumiravostat was stopped and she recovered with intravenous aciclovir. Clinicians should check zoster vaccination before starting lumiravostat and stop it promptly if zoster appears.', items: CA('3a', '3b', '3c', '3d') },
  { id: 'k-intro', section: 'Introduction', text: 'Lumiravostat, an oral STRK1 kinase inhibitor, was approved for chronic hand eczema in 2027. In the phase 3 trial, one of 16 participants on 25 mg had serious herpes zoster; no disseminated case was reported. We describe a disseminated case early in routine use.', items: CA('4') },
  { id: 'k-patient', section: 'Patient information', text: 'A 58-year-old woman, a retired teacher, had had chronic hand eczema for nine years. She had type 2 diabetes treated with metformin and had chickenpox in childhood; she had not been vaccinated against zoster. There was no family history of immune disease. Topical corticosteroids and two courses of alitretinoin had not controlled her eczema, and she started lumiravostat 25 mg once daily.', items: CA('5a', '5b', '5c', '5d') },
  { id: 'k-exam', section: 'Clinical course', text: 'In week 10 she presented with three days of burning pain and clustered vesicles over the left T5 dermatome; by day 3 of the rash, scattered vesicles had appeared on the back, both arms and the face. She was febrile (38.4 °C); her hands showed only mild eczema.', items: CA('6') },
  { id: 'k-timeline', section: 'Clinical course', text: 'Timeline: day 0, lumiravostat started; day 67, pain over the left chest; day 70, dermatomal rash and attendance; day 72, lesions outside the dermatome, admission; day 72, lumiravostat stopped and intravenous aciclovir started; day 79, switched to oral valaciclovir; day 86, discharged; day 130, review, lesions healed.', items: CA('7') },
  { id: 'k-dx', section: 'Clinical course', text: 'PCR of vesicle fluid from a lesion on the arm was positive for varicella zoster virus, and negative for herpes simplex. Blood counts showed lymphocytes of 0.7 × 10⁹/L. Disseminated herpes simplex and chickenpox were considered; the dermatomal onset and the PCR result excluded them. Diagnostic tests were available the same day.', items: CA('8a', '8b', '8c', '8d') },
  { id: 'k-tx', section: 'Clinical course', text: 'She received intravenous aciclovir 10 mg/kg every 8 hours for 7 days, then oral valaciclovir 1 g three times a day for 7 days, with paracetamol and gabapentin for pain. Lumiravostat was stopped permanently and her eczema was treated with topical corticosteroids.', items: CA('9a', '9b', '9c') },
  { id: 'k-out', section: 'Clinical course', text: 'The lesions crusted by day 80 and healed by day 130; she reported mild post-herpetic pain at the final review. Her lymphocyte count returned to normal by day 100. She had taken every dose of lumiravostat, by her diary, and had tolerated it well before the rash. No other adverse events occurred.', items: CA('10a', '10b', '10c', '10d') },
  { id: 'k-disc', section: 'Discussion', text: 'This case shows prompt recognition of dissemination, but zoster vaccination before treatment, now recommended for other kinase inhibitors, would probably have been better. Disseminated zoster has been reported with other oral kinase inhibitors, mostly in older people and those with lymphopenia. Using the WHO-UMC criteria, we judged the reaction probably related to lumiravostat: the timing fits, a known class effect exists, and the drug was stopped with recovery, although there was no rechallenge. Check zoster vaccination before starting lumiravostat, and stop it if zoster appears.', items: CA('11a', '11b', '11c', '11d') },
  { id: 'k-persp', section: 'Patient and consent', text: 'The patient wrote: "I thought the pain was a pulled muscle. Once the spots spread I was frightened, but the team explained everything. I wish I had known to ask about the vaccine."', items: CA('12') },
  { id: 'k-consent', section: 'Patient and consent', text: 'The patient gave written informed consent for publication of this report, which the journal has seen.', items: CA('13') },
]
export const CASE: Manuscript = build({ id: 'zoster-case', study: 'Case report', kind: 'article', journal: 'Lantern Case Reports in Dermatology (fictional)', title: 'Herpes zoster on lumiravostat: case report', guidelines: ['care'], na: [], note: 'A fictional case after authorisation. The patient and every date are invented.' }, caseR)
export const CASE_PLANTED: Planted = {
  mission: 'RG10', items: ['2', '5c', '7', '8c', '10c', '11c', '12', '13'],
  edits: {
    'k-keys': '',
    'k-patient': 'A 58-year-old woman, a retired teacher, had had chronic hand eczema for nine years. Topical corticosteroids and two courses of alitretinoin had not controlled her eczema, and she started lumiravostat 25 mg once daily.',
    'k-timeline': 'She attended with the rash, was admitted when it spread, was treated and was discharged; the lesions later healed.',
    'k-dx': 'PCR of vesicle fluid from a lesion on the arm was positive for varicella zoster virus. Blood counts showed lymphocytes of 0.7 × 10⁹/L. Diagnostic tests were available the same day.',
    'k-out': 'The lesions crusted by day 80 and healed by day 130; she reported mild post-herpetic pain at the final review. Her lymphocyte count returned to normal by day 100. No other adverse events occurred.',
    'k-disc': 'This case shows prompt recognition of dissemination, but zoster vaccination before treatment, now recommended for other kinase inhibitors, would probably have been better. Disseminated zoster has been reported with other oral kinase inhibitors, mostly in older people and those with lymphopenia. Check zoster vaccination before starting lumiravostat, and stop it if zoster appears.',
    'k-persp': '',
    'k-consent': '',
  },
}

// ------------------------------------------------------------------------------------------
// RG11 · Economic evaluation (CHEERS 2022)
// ------------------------------------------------------------------------------------------
export const ECON = { dCost: 6820, dQaly: 0.281, wtp: 30000, pce: 68 }
const icer = Math.round(ECON.dCost / ECON.dQaly / 10) * 10
const econ: P[] = [
  { id: 'e-title', section: 'Title and abstract', text: 'Cost-effectiveness of lumiravostat compared with alitretinoin for severe chronic hand eczema in the UK: a cost-utility analysis', items: CH('1') },
  { id: 'e-abstract', section: 'Title and abstract', heading: 'Abstract', text: `In a Markov model of adults with severe chronic hand eczema not controlled by topical corticosteroids, lumiravostat cost £${fmt(ECON.dCost)} more than alitretinoin and gave ${ECON.dQaly} more QALYs over 10 years, an incremental cost-effectiveness ratio of £${fmt(icer)} per QALY. At £30,000 per QALY, lumiravostat was cost-effective in ${ECON.pce}% of simulations; the result was most sensitive to the response rate on alitretinoin.`, items: CH('2') },
  { id: 'e-intro', section: 'Introduction', text: 'Alitretinoin is the only oral treatment recommended for severe chronic hand eczema in the UK. Lumiravostat, newly licensed, costs more. We estimated whether it is good value for the NHS, to inform the decision on its use.', items: CH('3') },
  { id: 'e-plan', section: 'Methods', text: 'A health economic analysis plan was written before the analysis and is in Supplementary Appendix 1.', items: CH('4') },
  { id: 'e-pop', section: 'Methods', heading: 'Population, setting and comparators', text: 'The population was adults with severe chronic hand eczema not controlled by potent topical corticosteroids, as in the trials; subgroups were defined by baseline severity. The setting was secondary care dermatology in the UK. Lumiravostat 25 mg daily was compared with alitretinoin 30 mg daily, the current standard, with best supportive care after either failed.', items: CH('5', '6', '7') },
  { id: 'e-persp', section: 'Methods', text: 'We took the perspective of the NHS and personal social services, as the decision body requires, over a 10-year horizon, long enough to capture relapse and treatment switching. Costs and QALYs were discounted at 3.5% a year.', items: CH('8', '9', '10') },
  { id: 'e-outcomes', section: 'Methods', heading: 'Outcomes and costs', text: 'Health benefit was measured in quality-adjusted life years. Response at week 16 came from the trials and an adjusted indirect comparison; utilities were EQ-5D-5L values collected in VERDANT-1, mapped to the UK EQ-5D-3L value set. Resource use (clinic visits, monitoring tests, rescue treatment) came from the trials and expert opinion, valued with NHS reference costs and the British National Formulary list prices, in pounds sterling at 2027 prices; no currency conversion was needed.', items: CH('11', '12', '13', '14', '15') },
  { id: 'e-model', section: 'Methods', heading: 'Model and analysis', text: 'A Markov model with four states (response, partial response, no response on treatment, best supportive care) and a 4-week cycle was chosen because chronic hand eczema relapses and remits. We assumed that response was maintained while on treatment and that non-responders stopped at week 16. We examined subgroups by baseline severity and, because the condition is more common in manual workers, the distribution of benefits by occupation. Uncertainty was explored with one-way sensitivity analyses, scenario analyses and a probabilistic analysis of 5,000 simulations.', items: CH('16', '17', '18', '19', '20') },
  { id: 'e-engage', section: 'Methods', text: 'Two people with chronic hand eczema reviewed the model structure; at their suggestion, the cost of protective gloves and time off work was added in a scenario analysis.', items: CH('21', '25') },
  { id: 'e-params', section: 'Results', text: 'Every input value, its range and its source are listed in Table 1.', items: CH('22') },
  { id: 'e-results', section: 'Results', text: `Lumiravostat cost £${fmt(ECON.dCost)} more per patient than alitretinoin and gave ${ECON.dQaly} more QALYs, an ICER of £${fmt(icer)} per QALY gained (Table 2).`, items: CH('23') },
  { id: 'e-unc', section: 'Results', text: `The ICER was most sensitive to the alitretinoin response rate (tornado diagram, Figure 2). In the probabilistic analysis, lumiravostat was cost-effective at £30,000 per QALY in ${ECON.pce}% of simulations (Figure 3).`, items: CH('24') },
  { id: 'e-disc', section: 'Discussion', text: 'Lumiravostat is probably cost-effective at the upper threshold used in the UK. The comparison with alitretinoin relies on an indirect comparison of trials lasting 16 weeks, and long-term response is assumed; the results apply to the NHS and may differ where prices are different.', items: CH('26') },
  { id: 'e-fund', section: 'Other information', text: 'The study was funded by Halcyon Ridge Pharmaceuticals, which reviewed the model but had no role in the decision to publish. EH and RM are employees of Halcyon Ridge Pharmaceuticals; the other authors declare no conflicts of interest.', items: CH('27', '28') },
]
export const ECONOMIC: Manuscript = build({ id: 'ostrevia-cua', study: 'Cost-utility analysis', kind: 'article', journal: 'Orrin Journal of Health Economics (fictional)', title: 'Ostrevia cost-utility analysis', guidelines: ['cheers-2022'], na: [], note: `ICER = £${fmt(ECON.dCost)} ÷ ${ECON.dQaly} QALYs ≈ £${fmt(icer)} per QALY. A fictional analysis.` }, econ)
export const ECON_PLANTED: Planted = {
  mission: 'RG11', items: ['4', '8', '9', '10', '13', '15', '20', '21', '24', '25', '28'],
  edits: {
    'e-plan': '',
    'e-persp': 'Costs and QALYs were included.',
    'e-outcomes': 'Health benefit was measured in quality-adjusted life years. Response at week 16 came from the trials and an adjusted indirect comparison. Resource use (clinic visits, monitoring tests, rescue treatment) came from the trials and expert opinion, valued with NHS reference costs and the British National Formulary list prices.',
    'e-model': 'A Markov model with four states (response, partial response, no response on treatment, best supportive care) and a 4-week cycle was chosen because chronic hand eczema relapses and remits. We assumed that response was maintained while on treatment and that non-responders stopped at week 16. We examined subgroups by baseline severity and, because the condition is more common in manual workers, the distribution of benefits by occupation.',
    'e-engage': '',
    'e-unc': '',
    'e-fund': 'The study was funded by Halcyon Ridge Pharmaceuticals, which reviewed the model but had no role in the decision to publish.',
  },
}

// ------------------------------------------------------------------------------------------
// Practice excerpts for the extensions and the other guidelines (no missions)
// ------------------------------------------------------------------------------------------
const niTrial: P[] = [
  { id: 'n-title', section: 'Title and abstract', text: 'Once-weekly versus once-daily GLV-12 in type 2 diabetes (GLYDE-W): a randomised, open-label, non-inferiority trial', items: NI('N1') },
  { id: 'n-why', section: 'Introduction', text: 'A weekly tablet could help people who forget daily doses, but it would be used only if it lowers HbA1c almost as well as the daily tablet; a non-inferiority design answers that question, and a placebo group would be unethical.', items: NI('N2') },
  { id: 'n-margin', section: 'Methods', text: 'We tested whether weekly GLV-12 was non-inferior to daily GLV-12 with a margin of 0.3 percentage points in HbA1c change at week 26. The margin is half the lower bound of the daily tablet\'s effect against placebo in GLYDE-3 (0.60) and matches the margin regulators accept for glucose-lowering drugs.', items: NI('N3', 'N4') },
  { id: 'n-pop', section: 'Methods', text: 'Participants, eligibility and the daily dose (10 mg) were the same as in GLYDE-3, which established the daily tablet\'s effect.', items: NI('N5') },
  { id: 'n-size', section: 'Methods', text: 'With a standard deviation of 1.0, no true difference and a one-sided alpha of 0.025, 235 participants per group give 90% power to show non-inferiority at the 0.3 margin.', items: NI('N6') },
  { id: 'n-anal', section: 'Methods', text: 'Non-inferiority was shown if the upper limit of the two-sided 95% confidence interval for the difference (weekly minus daily) was below 0.3, in both the per-protocol and the intention-to-treat populations.', items: NI('N7') },
  { id: 'n-res', section: 'Results', text: 'The difference was 0.08 percentage points (95% CI −0.06 to 0.22) per protocol and 0.06 (95% CI −0.07 to 0.19) by intention to treat; both upper limits lie below the 0.3 margin (Figure 2), so weekly GLV-12 was non-inferior. Superiority was not tested.', items: NI('N8') },
]
export const NI_TRIAL: Manuscript = build({ id: 'glyde-w-ni', study: 'GLYDE-W', kind: 'article', journal: 'Orrin Journal of Metabolic Medicine (fictional)', title: 'GLYDE-W non-inferiority trial (excerpt)', guidelines: ['consort-ni'], na: [], note: 'An excerpt for practising the non-inferiority points. Check it with CONSORT 2025 too if you like: the excerpt leaves most of CONSORT out.' }, niTrial)

const cluster: P[] = [
  { id: 'q-title', section: 'Title and abstract', text: 'Electronic reminders for annual diabetes reviews in general practice: a cluster randomised trial in 40 practices', items: CL('K1') },
  { id: 'q-why', section: 'Methods', text: 'The reminder works through the practice\'s records system, so it cannot be given to some patients of a practice and not others; we therefore randomised practices.', items: CL('K2') },
  { id: 'q-elig', section: 'Methods', text: 'Practices were eligible if they had at least 200 registered adults with type 2 diabetes and used the regional records system; all their adults with type 2 diabetes were included.', items: CL('K3') },
  { id: 'q-level', section: 'Methods', text: 'The primary outcome, completion of all eight care processes within 12 months, was measured for each patient; the practice-level completion rate was a secondary outcome.', items: CL('K4') },
  { id: 'q-size', section: 'Methods', text: 'Assuming 250 patients per practice and an intracluster correlation of 0.04 (design effect 10.96), 20 practices per group give 85% power to detect an increase from 50% to 60%.', items: CL('K5') },
  { id: 'q-consent', section: 'Methods', text: 'The research team recruited practices, and the practice manager consented for the practice; patients were not asked individually, because the reminder is a change to the practice system, and the ethics committee approved this waiver.', items: CL('K6') },
  { id: 'q-anal', section: 'Methods', text: 'We analysed the primary outcome with a mixed-effects logistic regression with practice as a random effect.', items: CL('K7') },
  { id: 'q-flow', section: 'Results', text: '40 practices (10,212 patients) were randomised; one intervention practice withdrew (238 patients). The observed intracluster correlation was 0.05.', items: CL('K8') },
]
export const CLUSTER_TRIAL: Manuscript = build({ id: 'reminder-cluster', study: 'Reminder trial', kind: 'article', journal: 'Wexley Journal of Primary Care (fictional)', title: 'Diabetes review reminders: cluster trial (excerpt)', guidelines: ['consort-cluster'], na: [], note: 'An excerpt for practising the cluster points.' }, cluster)

const animal: P[] = [
  { id: 'a-design', section: 'Methods', text: 'Two groups of mice, treated or vehicle control, were compared; the experimental unit was the single mouse, housed one per cage after sensitisation.', items: AR('1') },
  { id: 'a-size', section: 'Methods', text: 'Twelve mice per group were needed to detect a 40% reduction in ear swelling (standard deviation 30%, 80% power, two-sided alpha 0.05).', items: AR('2') },
  { id: 'a-excl', section: 'Methods', text: 'Mice that lost more than 15% of body weight were to be excluded; none were.', items: AR('3') },
  { id: 'a-rand', section: 'Methods', text: 'Mice were allocated by a computer-generated random sequence, and the person measuring ear thickness did not know the allocation.', items: AR('4', '5') },
  { id: 'a-out', section: 'Methods', text: 'The primary outcome was ear swelling 48 hours after challenge, measured with a micrometer; groups were compared with a two-sample t test after checking normality.', items: AR('6', '7') },
  { id: 'a-animals', section: 'Methods', text: 'Female C57BL/6 mice aged 8 to 10 weeks (18 to 22 g) came from an accredited breeder. Mice were sensitised with 0.5% oxazolone on the shaved abdomen on day 0, challenged on the ear on day 7, and given the STRK1 inhibitor HRP-4417 (10 mg/kg by gavage) or vehicle daily from day 6.', items: AR('8', '9') },
  { id: 'a-res', section: 'Results', text: 'Ear swelling was 0.11 mm (SD 0.03) with HRP-4417 and 0.19 mm (SD 0.04) with vehicle (difference 0.08 mm, 95% CI 0.05 to 0.11).', items: AR('10') },
]
export const ANIMAL: Manuscript = build({ id: 'arrive-excerpt', study: 'Mouse study', kind: 'article', journal: 'Excerpt', title: 'Contact dermatitis in mice: ARRIVE Essential 10 (excerpt)', guidelines: ['arrive-2'], na: [], note: 'An excerpt of the methods and results only: check the Essential 10 (items 1–10). The Recommended Set is left out on purpose.' }, animal)

const pred: P[] = [
  { id: 't-title', section: 'Title', text: 'Development and external validation of a machine learning model to predict a flare of chronic hand eczema within 6 months', items: TR('1') },
  { id: 't-context', section: 'Introduction', text: 'Flares are common after treatment stops, and existing tools use only severity. The model is prognostic, intended for dermatologists deciding how closely to follow a patient after stopping systemic treatment. Women and manual workers have more flares, so performance by sex and occupation matters.', items: TR('3a', '3b', '3c', '4') },
  { id: 't-data', section: 'Methods', text: 'The model was developed in the OSTREG registry (2027 to 2029, 31 clinics) and validated in a separate Danish cohort (2028 to 2030, 6 clinics), in adults who stopped a systemic treatment; treatment before stopping was a predictor.', items: TR('5a', '5b', '6a', '6b', '6c') },
  { id: 't-outcome', section: 'Methods', text: 'The outcome was a flare (an increase of HECSI by 50% or more, or restarting systemic treatment) within 6 months, assessed by dermatologists unaware of the predictions. Twelve candidate predictors were chosen from the literature.', items: TR('8a', '8c', '9a') },
  { id: 't-size', section: 'Methods', text: 'With an expected 30% flare rate and 12 predictors, the minimum sample size for development was 1,060; 3,102 were available. Missing predictor values were imputed by multiple imputation.', items: TR('10', '11') },
  { id: 't-model', section: 'Methods', text: 'We trained a gradient-boosted tree model with 5-fold cross-validation for tuning, and compared it with logistic regression. Performance was measured by discrimination (C statistic) and calibration (calibration plot, slope), overall and by sex and occupation to examine fairness.', items: TR('12a', '12c', '12e', '14') },
  { id: 't-open', section: 'Methods', text: 'The study was approved by the registry\'s ethics committee with a waiver of consent. Funding came from a public research council. The code is in a public repository; the data cannot be shared under the registry\'s rules. Two patient partners helped choose the outcome.', items: TR('17', '18a', '18e', '18f', '19') },
  { id: 't-res', section: 'Results', text: 'In validation (1,412 patients, 398 flares), the C statistic was 0.74 (95% CI 0.71 to 0.77) and the calibration slope 0.92; it was similar for women and men (0.73 and 0.75).', items: TR('20a', '21', '23a') },
]
export const PREDICTION: Manuscript = build({ id: 'tripod-excerpt', study: 'Flare model', kind: 'article', journal: 'Excerpt', title: 'Flare prediction model: TRIPOD+AI (excerpt)', guidelines: ['tripod-ai'], na: [], note: 'An excerpt. Several TRIPOD+AI items are left out on purpose: find which.' }, pred)

const qi: P[] = [
  { id: 's-title', section: 'Title and abstract', text: 'Reducing the wait for patch testing in a hospital dermatology department: a quality improvement project', items: SQ('1') },
  { id: 's-problem', section: 'Introduction', text: 'In 2027 the median wait from referral to patch testing was 19 weeks, against a target of 8. Long waits are common nationally, and the delay causes days off work. Using the Model for Improvement, we aimed to cut the median wait to 8 weeks within a year.', items: SQ('3', '4', '5', '6') },
  { id: 's-ctx', section: 'Methods', text: 'The department has two consultants and one patch test nurse and serves about 600,000 people.', items: SQ('7') },
  { id: 's-int', section: 'Methods', text: 'A team of a consultant, the nurse and a manager tested three changes in Plan-Do-Study-Act cycles: nurse-led triage of referrals, a third weekly patch test clinic, and text reminders to cut missed appointments.', items: SQ('8', '9') },
  { id: 's-meas', section: 'Methods', text: 'The outcome measure was the weekly median wait; process measures were the clinics run and the missed appointment rate. Data were plotted on run charts and interpreted with the standard run chart rules. The trust\'s audit committee judged the project to be service improvement not needing ethics review.', items: SQ('10', '11', '12') },
  { id: 's-res', section: 'Results', text: 'The median wait fell from 19 weeks to 9 by the end of the year, with a shift on the run chart after the third clinic began in week 18; missed appointments fell from 14% to 6%. A nurse\'s absence in weeks 30 to 34 lengthened waits again.', items: SQ('13') },
  { id: 's-disc', section: 'Discussion', text: 'The extra clinic had the largest effect. The project was in one department, and the gains depend on keeping the extra nurse time. The changes are being spread to the neighbouring hospital.', items: SQ('14', '15', '16', '17') },
]
export const QI: Manuscript = build({ id: 'squire-excerpt', study: 'QI project', kind: 'article', journal: 'Excerpt', title: 'Patch test waiting times: SQUIRE 2.0 (excerpt)', guidelines: ['squire-2'], na: [], note: 'An excerpt. The abstract and the funding are left out.' }, qi)

const qual: P[] = [
  { id: 'q2-team', section: 'Methods', heading: 'Research team', text: 'Interviews were done by a female dermatology nurse (MSc), trained in qualitative interviewing, who had not treated any participant; participants knew she was a nurse researcher studying the experience of hand eczema.', items: CQ('1', '2', '3', '4', '5', '6', '7') },
  { id: 'q2-design', section: 'Methods', heading: 'Design', text: 'We used reflexive thematic analysis. Twenty adults were sampled purposively by age, sex and occupation from two clinics and invited by letter; three declined (no time). Interviews took place at home or by video, with no one else present, using a piloted guide, and lasted 35 to 70 minutes. They were audio-recorded and transcribed, and field notes were kept. We stopped when no new codes appeared in three interviews.', items: CQ('9', '10', '11', '12', '13', '14', '15', '17', '19', '20', '21', '22') },
  { id: 'q2-anal', section: 'Methods', heading: 'Analysis', text: 'Two researchers coded the transcripts independently in NVivo, developing themes from the data.', items: CQ('24', '26', '27') },
  { id: 'q2-find', section: 'Results', text: 'Three themes emerged: hiding the hands, losing work, and wary hope in new treatments. "I keep my hands in my pockets at parties" (participant 7, woman, 34, hairdresser). "Every flare costs me a week\'s wages" (participant 12, man, 51, builder).', items: CQ('16', '29', '30', '31') },
]
export const QUALITATIVE: Manuscript = build({ id: 'coreq-excerpt', study: 'Interview study', kind: 'article', journal: 'Excerpt', title: 'Living with hand eczema: COREQ (excerpt)', guidelines: ['coreq'], na: [], note: 'An excerpt. Several COREQ items are not reported: find them.' }, qual)

export const PHASE2_MANUSCRIPTS: Manuscript[] = [COHORT, REVIEW, DIAG, CASE, ECONOMIC, NI_TRIAL, CLUSTER_TRIAL, ANIMAL, PREDICTION, QI, QUALITATIVE]
export const PLANTED_BY_MISSION: Record<string, { manuscript: string; planted: Planted; guidelines: string[] }> = {
  RG7: { manuscript: 'ostreg-cohort', planted: COHORT_PLANTED, guidelines: ['strobe'] },
  RG8: { manuscript: 'kinase-review', planted: REVIEW_PLANTED, guidelines: ['prisma-2020', 'prisma-s'] },
  RG9: { manuscript: 'cx7-diagnostic', planted: DIAG_PLANTED, guidelines: ['stard-2015'] },
  RG10: { manuscript: 'zoster-case', planted: CASE_PLANTED, guidelines: ['care'] },
  RG11: { manuscript: 'ostrevia-cua', planted: ECON_PLANTED, guidelines: ['cheers-2022'] },
}
/** Planted item keys in full (`guideline:item`). */
export const plantedKeys = (m: string) => { const x = PLANTED_BY_MISSION[m]; return x.planted.items.map((i) => (i.includes(':') ? i : `${x.guidelines[0]}:${i}`)) }
