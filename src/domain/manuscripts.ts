// The fictional manuscripts, written from the same study outputs as the TLF Programming Lab and
// the CSR & Narrative Studio (src/data/*.json, copied from the Studio), so every number in them
// can be traced to a table cell. Each paragraph lists the checklist items it reports; that is the
// answer key. The protocol for the SPIRIT check is rendered from the Protocol Builder's project.
//
// Training scale: the HRP-301 protocol plans 324 participants; the fictional dataset shared by the
// apps holds the first 45. The manuscript reports that first cohort and says so.
import hrp from '../data/hrp-301.json'
import glv from '../data/glv-12-301.json'
import hrpProtocol from '../data/protocol-hrp-301.json'
import type { GuidelineId, Manuscript, Para } from './types'

interface Display { head: string[]; rows: { label: string; cells: { text: string }[] }[] }
interface Outputs { outputs: { id: string; title: string; display?: Display | null; frame?: { columns: string[]; rows: (string | null)[][] } }[] }
const disp = (d: Outputs, id: string) => d.outputs.find((o) => o.id === id)!.display!
const cell = (d: Outputs, id: string, label: string, col: number) => {
  const r = disp(d, id).rows.find((x) => x.label === label)
  if (!r) throw new Error(`${id}: no row ${label}`)
  return r.cells[col].text
}
const nOf = (s: string) => s.split(' ')[0]

type P = Para & { items: string[] }
function build(meta: Omit<Manuscript, 'paras' | 'key'>, paras: P[]): Manuscript {
  const key: Record<string, string[]> = {}
  for (const p of paras) for (const k of p.items) (key[k] ??= []).push(p.id)
  return { ...meta, paras: paras.map(({ items: _i, ...p }) => { void _i; return p }), key }
}
const C = (...ids: string[]) => ids.map((i) => `consort-2025:${i}`)
const A = (...ids: string[]) => ids.map((i) => `consort-abstracts:${i}`)
const H = (...ids: string[]) => ids.map((i) => `consort-harms:${i}`)

// ------------------------------------------------------------------------------------------
// VERDANT-1 (HRP-301): lumiravostat in chronic hand eczema
// ------------------------------------------------------------------------------------------
const D = hrp as unknown as Outputs
const g = (label: string, col: number, id = 'T3') => cell(D, id, label, col)
const PRIMARY = { pbo: g('IGA-CHE treatment success, n (%)', 0), d10: g('IGA-CHE treatment success, n (%)', 1), d25: g('IGA-CHE treatment success, n (%)', 2), diff10: g('Difference from placebo, % (95% CI)', 1), diff25: g('Difference from placebo, % (95% CI)', 2), p10: g("p-value (Fisher's exact test)", 1), p25: g("p-value (Fisher's exact test)", 2) }
const KEY2 = { pbo: g('HECSI-75 response, n (%)', 0, 'T4'), d10: g('HECSI-75 response, n (%)', 1, 'T4'), d25: g('HECSI-75 response, n (%)', 2, 'T4'), diff10: g('Difference from placebo, % (95% CI)', 1, 'T4'), diff25: g('Difference from placebo, % (95% CI)', 2, 'T4'), p10: g("p-value (Fisher's exact test)", 1, 'T4'), p25: g("p-value (Fisher's exact test)", 2, 'T4') }
const DISP = (label: string, col: number) => cell(D, 'T5', label, col)
const AE = (label: string, col: number) => cell(D, 'T2', label, col)
const EXPO = (label: string, col: number) => cell(D, 'T6', label, col)
const DEMO = (label: string, col: number) => cell(D, 'T1', label, col)
const pct = (s: string) => Number(/\(([\d.]+)\)/.exec(s)![1])
const np = (s: string) => `${s.split(' ')[0]} (${pct(s)}%)`
const nOfN = (s: string, n: string) => `${s.split(' ')[0]} of ${n} (${pct(s)}%)`
const rr = (a: string, b: string) => (pct(a) / pct(b)).toFixed(2)
const RAND = [0, 1, 2].map((i) => DISP('Randomised', i))
const N_RAND = DISP('Randomised', 3)

export const VERDANT1_REG = { registry: 'ClinicalTrials.gov', number: 'NCT99930101', date: '2 March 2026', firstConsent: '6 April 2026', lastConsent: '25 June 2026', lastVisit: '1 December 2026' }

const verdant: P[] = [
  { id: 'v-title', section: 'Title', text: `Lumiravostat for moderate to severe chronic hand eczema: the first ${N_RAND} participants of VERDANT-1, a randomised, double-blind, placebo-controlled phase 3 trial`, items: [...C('1a'), ...A('A1')] },
  { id: 'v-authors', section: 'Title', heading: 'Authors', text: 'Anika Rao, Sunil Iyer, Marta Keller, Daniel Okafor and Helena Brandt, for the VERDANT-1 investigators. Correspondence: Helena Brandt, Halcyon Ridge Pharmaceuticals, 1 Harbour Row, Dublin, Ireland (h.brandt@example.org).', items: A('A2') },
  { id: 'v-ab-bg', section: 'Abstract', heading: 'Background', text: 'Lumiravostat is an oral inhibitor of the STRK1 kinase. We assessed its efficacy and safety in adults with moderate to severe chronic hand eczema that topical corticosteroids had not controlled.', items: [...C('1b'), ...A('A6')] },
  { id: 'v-ab-methods', section: 'Abstract', heading: 'Methods', text: 'In this double-blind, parallel-group superiority trial at 4 sites in Canada, Germany, India and the United States, adults aged 18 to 75 years with an IGA-CHE score of 3 or 4 were randomly assigned 1:1:1, through an interactive response system, to lumiravostat 10 mg, lumiravostat 25 mg or matching placebo once daily for 16 weeks. Participants, investigators and assessors were blinded. The primary outcome was IGA-CHE treatment success (0 or 1 with at least a 2-grade improvement) at week 16.', items: [...C('1b'), ...A('A3', 'A4', 'A5', 'A7', 'A8', 'A9')] },
  { id: 'v-ab-results', section: 'Abstract', heading: 'Results', text: `Between ${VERDANT1_REG.firstConsent} and ${VERDANT1_REG.lastConsent}, ${N_RAND} participants were randomised (${RAND[1]} to 10 mg, ${RAND[2]} to 25 mg, ${RAND[0]} to placebo) and all were analysed; recruitment to the trial continues. Treatment success occurred in ${np(PRIMARY.d10)} on 10 mg, ${np(PRIMARY.d25)} on 25 mg and ${np(PRIMARY.pbo)} on placebo (difference from placebo ${PRIMARY.diff10} and ${PRIMARY.diff25} percentage points). Adverse events occurred in ${np(AE('Participants with at least one TEAE', 1))}, ${np(AE('Participants with at least one TEAE', 2))} and ${np(AE('Participants with at least one TEAE', 0))} participants; 4 had a serious adverse event and none died.`, items: [...C('1b'), ...A('A10', 'A11', 'A12', 'A13', 'A14')] },
  { id: 'v-ab-concl', section: 'Abstract', heading: 'Conclusions', text: 'In this first cohort, lumiravostat did not clearly improve treatment success over placebo, and the confidence intervals were wide; the full trial will answer the question.', items: [...C('1b'), ...A('A15')] },
  { id: 'v-ab-reg', section: 'Abstract', heading: 'Registration and funding', text: `${VERDANT1_REG.registry} ${VERDANT1_REG.number}. Funded by Halcyon Ridge Pharmaceuticals.`, items: [...C('1b'), ...A('A16', 'A17')] },
  { id: 'v-reg', section: 'Open science', heading: 'Registration', text: `The trial was registered at ${VERDANT1_REG.registry} (${VERDANT1_REG.number}, https://clinicaltrials.gov/study/${VERDANT1_REG.number}) on ${VERDANT1_REG.date}, before the first participant was enrolled, and in the EU CT register (2026-500000-00-00) and the Clinical Trials Registry – India (CTRI/2026/00/000000).`, items: C('2') },
  { id: 'v-protocol', section: 'Open science', heading: 'Protocol and analysis plan', text: 'The protocol (version 2.0, 10 August 2026) and the statistical analysis plan (version 1.0, finalised before unblinding) are available in Supplementary Appendix 1.', items: C('3') },
  { id: 'v-sharing', section: 'Open science', heading: 'Data sharing', text: 'De-identified participant data, the data dictionary and the analysis code will be shared with qualified researchers on request through the sponsor\'s data sharing portal once the product is approved or its development has stopped.', items: C('4') },
  { id: 'v-funding', section: 'Open science', heading: 'Funding', text: 'Halcyon Ridge Pharmaceuticals funded the trial and supplied lumiravostat and placebo. The sponsor designed the trial with the academic investigators, collected and analysed the data, and paid for medical writing support; the authors interpreted the data, wrote the manuscript with that support, and decided to submit it.', items: [...C('5a')] },
  { id: 'v-coi', section: 'Open science', heading: 'Competing interests', text: 'MK, DO and HB are employees of Halcyon Ridge Pharmaceuticals and hold its shares. AR and SI received fees from Halcyon Ridge Pharmaceuticals for consulting and for travel to investigator meetings. No other relationships were reported (ICMJE disclosure forms are in Supplementary Appendix 2).', items: C('5b') },
  { id: 'v-intro1', section: 'Introduction', text: 'Chronic hand eczema lasts for months or years and affects work and daily life. Many patients are not controlled with topical corticosteroids, and few oral treatments have been tested in randomised trials. Lumiravostat reversibly inhibits the STRK1 kinase, which carries cytokine signals in inflamed skin; in the phase 2 trial HRP-201 it reduced eczema severity, and upper respiratory tract infections and raised alanine aminotransferase were the main risks.', items: C('6') },
  { id: 'v-intro2', section: 'Introduction', text: 'VERDANT-1 compares two doses of lumiravostat with placebo for 16 weeks. Its objectives are to compare the proportion of participants with clear or almost clear hands, the extent and severity of eczema, and itch, and to assess the safety and tolerability of lumiravostat.', items: C('7') },
  { id: 'v-ppi', section: 'Methods', heading: 'Patient and public involvement', text: 'Six adults living with chronic hand eczema, recruited through a patient organisation, reviewed the draft protocol. Their advice made itch a key secondary outcome, replaced two clinic visits with telephone calls and simplified the consent form; the same panel will review the lay summary of the results.', items: C('8') },
  { id: 'v-design', section: 'Methods', heading: 'Design and setting', text: 'VERDANT-1 is a multicentre, randomised, double-blind, placebo-controlled, parallel-group superiority trial with a 1:1:1 allocation. This article reports the first cohort of participants, enrolled at the 4 sites that opened first (one each in Canada, Germany, India and the United States, all hospital dermatology clinics); about 60 sites will take part.', items: C('9', '11') },
  { id: 'v-changes', section: 'Methods', heading: 'Changes after the trial began', text: 'Protocol amendment 1 (10 August 2026, after this cohort had been enrolled) added a liver stopping rule (alanine aminotransferase above 5 times the upper limit of normal) and closer liver monitoring, after one participant had such a rise. No outcomes or planned analyses were changed.', items: C('10') },
  { id: 'v-elig', section: 'Methods', heading: 'Participants', text: 'Adults aged 18 to 75 years were eligible if they had had chronic hand eczema for at least 6 months that topical corticosteroids had not controlled, and an IGA-CHE score of 3 (moderate) or 4 (severe) at screening and day 1. People were excluded if they had active or reactivating hepatitis B infection, had used systemic immunosuppressants or phototherapy in the previous 4 weeks, or had alanine aminotransferase above 2 times the upper limit of normal. Participants of childbearing potential used highly effective contraception. All participants gave written informed consent; the ethics committee at each site approved the protocol.', items: C('12a') },
  { id: 'v-sites', section: 'Methods', text: 'Sites were dermatology clinics with experience of phase 3 trials; every assessor was trained and certified in IGA-CHE and HECSI scoring before the first participant.', items: C('12b') },
  { id: 'v-intervention', section: 'Methods', heading: 'Interventions', text: 'Participants took one film-coated tablet of lumiravostat 10 mg, lumiravostat 25 mg or matching placebo by mouth each morning for 16 weeks, then were followed for 4 weeks without treatment. Tablets were dispensed at each clinic visit and counted when returned. Emollients were allowed throughout; a class III topical corticosteroid could be used as rescue treatment after week 4.', items: C('13') },
  { id: 'v-outcomes', section: 'Methods', heading: 'Outcomes', text: 'The primary outcome was IGA-CHE treatment success at week 16, defined as a score of 0 (clear) or 1 (almost clear) with at least a 2-grade improvement from baseline, analysed as the proportion of participants in each group. The key secondary outcome was HECSI-75, at least a 75% improvement from baseline in the Hand Eczema Severity Index at week 16. A further secondary outcome, at least a 4-point improvement in worst itch at week 16, is reported in Supplementary Table S3.', items: C('14') },
  { id: 'v-harms', section: 'Methods', text: 'Adverse events were recorded from consent to the week 20 follow-up visit, by asking participants an open question at every visit and from laboratory tests at each visit; investigators graded each event as mild, moderate or severe, judged whether it was related to the study drug, and reported serious events within 24 hours. Events were coded with the study medical dictionary. Liver test rises above 3 times the upper limit of normal with bilirubin above 2 times, and hepatitis B reactivation, were reported as events of special interest.', items: [...C('15'), ...H('H1', 'H2', 'H3')] },
  { id: 'v-sample', section: 'Methods', heading: 'Sample size', text: 'The trial plans to randomise 324 participants (108 per group), which gives 90% power to detect a difference in treatment success of 35% against 15% for each dose against placebo, with a two-sided significance level of 0.05 and allowing for 10% without a week 16 assessment. This first cohort was not sized to test the hypothesis.', items: C('16a') },
  { id: 'v-interim', section: 'Methods', text: 'No interim efficacy analysis or stopping rule for efficacy was planned. An independent data monitoring committee of two clinicians and a statistician reviews unblinded safety data every 6 months and can recommend stopping the trial.', items: C('16b') },
  { id: 'v-random', section: 'Methods', heading: 'Randomisation and blinding', text: 'An independent statistician generated the allocation sequence by computer, in blocks of 6 stratified by baseline IGA-CHE score (3 or 4) and region.', items: C('17a', '17b') },
  { id: 'v-conceal', section: 'Methods', text: 'Investigators enrolled participants and assigned them through a web-based interactive response system on day 1; the sequence was held in the system, and the site staff who enrolled and assigned participants could not see it.', items: C('18', '19') },
  { id: 'v-blind', section: 'Methods', text: 'Participants, investigators, outcome assessors and the sponsor\'s study team were blinded to the assigned treatment. Placebo tablets were identical to the active tablets in size, colour and packaging; investigators could unblind a participant through the system in an emergency.', items: C('20a', '20b') },
  { id: 'v-stats', section: 'Methods', heading: 'Statistical analysis', text: 'Efficacy was analysed in the intention-to-treat population (all randomised participants, in the group to which they were assigned), and safety in all participants who took at least one dose, in the group of the treatment they received. For each binary outcome we estimated the difference in proportions between each dose and placebo with a 95% Wald confidence interval and compared groups with Fisher\'s exact test. Adverse events were summarised as the number and percentage of participants with at least one event, counting each participant once per term.', items: [...C('21a', '21b'), ...H('H4')] },
  { id: 'v-missing', section: 'Methods', text: 'Participants who stopped treatment, used rescue treatment or had no week 16 assessment (missing data) were counted as non-responders, a composite strategy; no values were imputed.', items: C('21c') },
  { id: 'v-other', section: 'Methods', text: 'A prespecified sensitivity analysis stratified by baseline IGA-CHE score and region (Cochran–Mantel–Haenszel) is reported in Supplementary Table S4. No post hoc analyses were done.', items: C('21d', '28') },
  { id: 'v-flow', section: 'Results', heading: 'Participants', text: `${DISP('Screened', 3)} people were screened and ${DISP('Screen failures', 3)} were not eligible; ${N_RAND} were randomised: ${RAND[1]} to lumiravostat 10 mg, ${RAND[2]} to lumiravostat 25 mg and ${RAND[0]} to placebo (Figure 1). All received their assigned treatment and all were included in the analysis of the primary outcome. ${nOf(DISP('Completed the study', 3))} completed the study; 2 participants on placebo stopped (1 because of an adverse event and 1 who withdrew), and 1 on lumiravostat 25 mg was lost to follow-up.`, items: C('22a', '22b') },
  { id: 'v-dates', section: 'Results', text: `Participants were recruited between ${VERDANT1_REG.firstConsent} and ${VERDANT1_REG.lastConsent}; the last follow-up visit of this cohort was on ${VERDANT1_REG.lastVisit}, the data cut-off for this analysis. The trial has not stopped.`, items: C('23a') },
  { id: 'v-baseline', section: 'Results', text: `Baseline characteristics were similar across groups (Table 1): the mean age was ${DEMO('Mean (SD)', 3).split(' ')[0]} years and ${nOf(DEMO('F', 3))} of ${N_RAND} participants (${DEMO('F', 3).split('(')[1].replace(')', '')}%) were women.`, items: C('25') },
  { id: 'v-adherence', section: 'Results', text: `The mean duration of treatment was ${EXPO('Mean (SD)', 1).split(' ')[0]} days on 10 mg, ${EXPO('Mean (SD)', 2).split(' ')[0]} days on 25 mg and ${EXPO('Mean (SD)', 0).split(' ')[0]} days on placebo; adherence by tablet count and use of rescue topical corticosteroid by group are shown in Supplementary Table S2.`, items: C('24a', '24b') },
  { id: 'v-primary', section: 'Results', heading: 'Outcomes', text: `Treatment success at week 16 occurred in ${nOfN(PRIMARY.d10, RAND[1])} participants on 10 mg, ${nOfN(PRIMARY.d25, RAND[2])} on 25 mg and ${nOfN(PRIMARY.pbo, RAND[0])} on placebo (Table 2). The difference from placebo was ${PRIMARY.diff10.replace(' (', ' percentage points (95% CI ')} for 10 mg (P=${PRIMARY.p10}) and ${PRIMARY.diff25.replace(' (', ' percentage points (95% CI ')} for 25 mg (P=${PRIMARY.p25}); the relative risks were ${rr(PRIMARY.d10, PRIMARY.pbo)} and ${rr(PRIMARY.d25, PRIMARY.pbo)}.`, items: C('26') },
  { id: 'v-key2', section: 'Results', text: `HECSI-75 at week 16 was reached by ${nOfN(KEY2.d10, RAND[1])} participants on 10 mg, ${nOfN(KEY2.d25, RAND[2])} on 25 mg and ${nOfN(KEY2.pbo, RAND[0])} on placebo; the differences from placebo were ${KEY2.diff10.replace(' (', ' percentage points (95% CI ')} and ${KEY2.diff25.replace(' (', ' percentage points (95% CI ')} (P=${KEY2.p10} and P=${KEY2.p25}).`, items: C('26') },
  { id: 'v-ae', section: 'Results', heading: 'Harms', text: `At least one adverse event was reported by ${nOfN(AE('Participants with at least one TEAE', 1), RAND[1])} participants on 10 mg, ${nOfN(AE('Participants with at least one TEAE', 2), RAND[2])} on 25 mg and ${nOfN(AE('Participants with at least one TEAE', 0), RAND[0])} on placebo (Table 3). The most common were upper respiratory tract infection (${np(AE('Upper respiratory tract infection', 3))} of all participants) and head pain (${np(AE('Head pain', 3))}). Nausea and acne occurred only on lumiravostat.`, items: [...C('27'), ...H('H6')] },
  { id: 'v-sae', section: 'Results', text: 'Four participants had a serious adverse event: cellulitis on 10 mg; herpes zoster (severe, judged possibly related) and a wrist fracture on 25 mg; and pneumonia on placebo. All resolved. One participant on placebo stopped the study because of an adverse event. No participant died.', items: [...C('27'), ...H('H5', 'H6', 'H7')] },
  { id: 'v-disc1', section: 'Discussion', text: 'In this first cohort of VERDANT-1, more participants reached treatment success and HECSI-75 on lumiravostat 25 mg than on placebo, but the differences were small for 10 mg and the confidence intervals for both doses included no effect, so the results do not show a benefit. The adverse events matched the phase 2 experience: infections, including one serious case of herpes zoster on the higher dose, were the main concern, and need to be watched in the full trial.', items: [...C('29'), ...H('H8')] },
  { id: 'v-limits', section: 'Discussion', text: 'This analysis has important limitations. With 45 participants it was not powered to test the hypothesis, so the estimates are imprecise and a true benefit can be neither shown nor ruled out. The 4 sites, all hospital clinics, may not represent the patients who will use the drug, and 16 weeks is too short to judge long-term safety. Two doses were each compared with placebo without adjusting for multiplicity.', items: C('30') },
  { id: 'v-ack', section: 'Back matter', heading: 'Acknowledgements', text: 'We thank the participants and the site staff. Medical writing support was provided by Priya Natarajan, PhD, of Halcyon Ridge Pharmaceuticals, and was funded by Halcyon Ridge Pharmaceuticals in accordance with Good Publication Practice (GPP 2022).', items: [] },
]

export const VERDANT1: Manuscript = build({
  id: 'verdant-1', study: 'HRP-301', kind: 'article', journal: 'Fennick Journal of Dermatology (fictional)',
  title: 'VERDANT-1 primary paper (first cohort)', guidelines: ['consort-2025', 'consort-abstracts', 'consort-harms'],
  na: ['consort-2025:23b'],
  note: 'Training scale: the protocol plans 324 participants; the fictional dataset shared by the apps holds the first 45, so the paper reports that cohort. Every number comes from the TLF Programming Lab outputs.',
}, verdant)

// The planted version for mission RG2: 15 CONSORT items removed or weakened. Each edit replaces a
// paragraph's text (or removes the paragraph when the text is empty).
export const VERDANT1_PLANTED: { items: string[]; edits: Record<string, string> } = {
  items: ['2', '3', '4', '5b', '8', '10', '15', '16a', '17a', '19', '20b', '21c', '23a', '26', '30'],
  edits: {
    'v-reg': `The trial was registered at ${VERDANT1_REG.registry}.`,
    'v-protocol': '',
    'v-sharing': '',
    'v-coi': '',
    'v-ppi': '',
    'v-changes': '',
    'v-harms': 'Investigators graded each adverse event as mild, moderate or severe and judged whether it was related to the study drug.',
    'v-sample': 'The trial plans to randomise 324 participants. This first cohort was not sized to test the hypothesis.',
    'v-random': 'Randomisation was stratified by baseline IGA-CHE score (3 or 4) and region, in blocks of 6.',
    'v-conceal': 'Investigators enrolled participants and assigned them through a web-based interactive response system on day 1.',
    'v-blind': 'Participants, investigators, outcome assessors and the sponsor\'s study team were blinded to the assigned treatment.',
    'v-missing': '',
    'v-dates': 'The trial has not stopped.',
    'v-key2': `HECSI-75 at week 16 was reached by ${nOfN(KEY2.d10, RAND[1])} participants on 10 mg, ${nOfN(KEY2.d25, RAND[2])} on 25 mg and ${nOfN(KEY2.pbo, RAND[0])} on placebo (P=${KEY2.p10} and P=${KEY2.p25}).`,
    'v-limits': 'The adverse events were as expected from phase 2, and the full trial is under way at about 60 sites.',
  },
}

// ------------------------------------------------------------------------------------------
// GLYDE-3 (GLV-12-301): GLV-12 in type 2 diabetes
// ------------------------------------------------------------------------------------------
const G = glv as unknown as Outputs
const gd = (label: string, col: number) => cell(G, 'T4', label, col)
const gp = (label: string, col: number) => cell(G, 'T3', label, col)
const gae = (label: string, col: number) => cell(G, 'T2', label, col)
const GR = [0, 1, 2].map((i) => gd('Randomised', i))
export const GLYDE3_REG = { registry: 'ClinicalTrials.gov', number: 'NCT99912301', date: '1 December 2025', firstConsent: '14 January 2026', lastConsent: '9 May 2026', lastVisit: '22 December 2026' }
const glyde: P[] = [
  { id: 'g-title', section: 'Title', text: 'Glyvantra (GLV-12) 5 mg and 10 mg added to metformin in type 2 diabetes (GLYDE-3): a randomised, double-blind, placebo-controlled phase 3 trial', items: [...C('1a'), ...A('A1')] },
  { id: 'g-ab', section: 'Abstract', heading: 'Abstract', text: `In this double-blind, parallel-group trial at 5 sites in Brazil, Germany, India, Japan and the United States, ${gd('Randomised', 3)} adults with type 2 diabetes inadequately controlled on metformin were randomly assigned 1:1:1 to GLV-12 5 mg, GLV-12 10 mg or placebo for 26 weeks. The primary outcome was the change in HbA1c at week 26. The least-squares mean difference from placebo was ${gp('Difference from placebo (95% CI)', 1)} percentage points for 5 mg and ${gp('Difference from placebo (95% CI)', 2)} for 10 mg (both P<0.001). ${GLYDE3_REG.registry} ${GLYDE3_REG.number}; funded by Glyvant Pharmaceuticals.`, items: [...C('1b'), ...A('A3', 'A4', 'A5', 'A7', 'A8', 'A9', 'A10', 'A13', 'A16', 'A17')] },
  { id: 'g-reg', section: 'Open science', text: `Registered at ${GLYDE3_REG.registry} (${GLYDE3_REG.number}) on ${GLYDE3_REG.date}. The protocol (version 2.0, 2 March 2026) and statistical analysis plan are in the Supplementary Appendix. Individual participant data will be available on request after publication.`, items: C('2', '3', '4') },
  { id: 'g-fund', section: 'Open science', text: 'Glyvant Pharmaceuticals funded the trial and took part in its design, data collection and analysis; the authors had full access to the data and decided to publish. Competing interests are listed in the ICMJE forms.', items: C('5a', '5b') },
  { id: 'g-intro', section: 'Introduction', text: 'Many people with type 2 diabetes do not reach their HbA1c target on metformin alone. GLYDE-3 tested whether adding GLV-12 lowers HbA1c over 26 weeks, and assessed its safety.', items: C('6', '7') },
  { id: 'g-ppi', section: 'Methods', text: 'Patients were not involved in the design or conduct of the trial.', items: C('8') },
  { id: 'g-design', section: 'Methods', text: 'This was a double-blind, placebo-controlled, parallel-group superiority trial with 1:1:1 allocation, at 5 sites in Brazil, Germany, India, Japan and the United States. Amendment 1 (2 March 2026) lowered the kidney function exclusion from an eGFR below 45 to below 30 mL/min/1.73 m²; no outcomes changed.', items: C('9', '10', '11') },
  { id: 'g-elig', section: 'Methods', text: 'Adults aged 18 to 75 years who had had type 2 diabetes for at least 6 months, with HbA1c 7.0% to 10.5% on at least 1500 mg of metformin a day for 12 weeks, were included. People with an eGFR below 30 mL/min/1.73 m², another glucose-lowering drug in the previous 12 weeks or a history of diabetic ketoacidosis were excluded.', items: C('12a') },
  { id: 'g-int', section: 'Methods', text: 'Participants took GLV-12 5 mg, 10 mg or matching placebo as one oral tablet once daily for 26 weeks, with their usual metformin.', items: C('13') },
  { id: 'g-out', section: 'Methods', text: 'The primary outcome was the change from baseline in HbA1c at week 26. Adverse events were collected at every visit until 4 weeks after the last dose.', items: C('14', '15') },
  { id: 'g-ss', section: 'Methods', text: 'A sample of 90 participants (30 per group) gave 80% power to detect a difference of 0.8 percentage points in HbA1c change (standard deviation 1.0, two-sided alpha 0.05), allowing for 15% without a week 26 value. There were no interim analyses.', items: C('16a', '16b') },
  { id: 'g-rand', section: 'Methods', text: 'An interactive response system assigned participants using a computer-generated sequence in blocks; the site staff could not see the sequence. Participants, investigators and assessors were blinded, and placebo tablets matched the active tablets.', items: C('17a', '17b', '18', '19', '20a', '20b') },
  { id: 'g-stats', section: 'Methods', text: 'The primary outcome was analysed in the intention-to-treat population (all randomised participants, as randomised) by analysis of covariance with treatment as a factor and baseline HbA1c as a covariate, on observed values, excluding values after rescue treatment or discontinuation. A mixed model for repeated measures over all visits was supplementary, and placebo-based multiple imputation for missing values was a prespecified sensitivity analysis; subgroups are shown in a forest plot.', items: C('21a', '21b', '21c', '21d') },
  { id: 'g-flow', section: 'Results', text: `Of ${gd('Screened', 3)} people screened, ${gd('Randomised', 3)} were randomised (${GR[1]} to 5 mg, ${GR[2]} to 10 mg and ${GR[0]} to placebo) between ${GLYDE3_REG.firstConsent} and ${GLYDE3_REG.lastConsent}; ${nOf(gd('Completed the study', 3))} completed the study. Discontinuations by reason are shown in Figure 1.`, items: C('22a', '22b', '23a') },
  { id: 'g-base', section: 'Results', text: 'Baseline characteristics were balanced (Table 1).', items: C('25') },
  { id: 'g-prim', section: 'Results', text: `Mean HbA1c fell by ${gp('Mean (SD)', 1).split(' ')[0].replace('-', '')} and ${gp('Mean (SD)', 2).split(' ')[0].replace('-', '')} percentage points on 5 mg and 10 mg and by ${gp('Mean (SD)', 0).split(' ')[0].replace('-', '')} on placebo (n=${gp('n', 1)}, ${gp('n', 2)} and ${gp('n', 0)}). The least-squares mean differences from placebo were ${gp('Difference from placebo (95% CI)', 1).replace(' (', ' (95% CI ')} and ${gp('Difference from placebo (95% CI)', 2).replace(' (', ' (95% CI ')}.`, items: C('26') },
  { id: 'g-ae', section: 'Results', text: `Adverse events occurred in ${np(gae('Participants with at least one TEAE', 1))}, ${np(gae('Participants with at least one TEAE', 2))} and ${np(gae('Participants with at least one TEAE', 0))} participants on 5 mg, 10 mg and placebo; one participant on 10 mg died.`, items: C('27') },
  { id: 'g-disc', section: 'Discussion', text: 'GLV-12 lowered HbA1c more than placebo at both doses. The trial was small and short, so rare harms and durability could not be assessed.', items: C('29', '30') },
]
export const GLYDE3: Manuscript = build({
  id: 'glyde-3', study: 'GLV-12-301', kind: 'article', journal: 'Orrin Journal of Metabolic Medicine (fictional)',
  title: 'GLYDE-3 primary paper', guidelines: ['consort-2025', 'consort-abstracts'],
  na: ['consort-2025:12b', 'consort-2025:23b'],
  note: 'Practice paper: shorter than VERDANT-1, and some items are only partly reported (try it before reading the answer key).',
}, glyde)

// ------------------------------------------------------------------------------------------
// The HRP-301 protocol (version 2.0) from the Protocol Builder, for the SPIRIT 2025 check
// ------------------------------------------------------------------------------------------
type ProtoData = { title: Record<string, string>; design: Record<string, string>; criteria: { code: string; text: string }[]; objectives: { level: string; text: string }[]; endpoints: { level: string; text: string }[]; visits: { name: string; day: number }[]; narrative: Record<string, string>; statements: Record<string, string> }
const PD = (hrpProtocol as unknown as { project: { versions: { number: string; date: string; data: ProtoData }[] } }).project.versions.at(-1)!.data
const S = (...ids: string[]) => ids.map((i) => `spirit-2025:${i}`)
const N = (sec: string) => PD.narrative[sec]
const proto: P[] = [
  { id: 'pr-title', section: 'Title page', heading: 'Clinical trial protocol', text: `Protocol ${PD.title['Sponsor Protocol Identifier']}: ${PD.title['Full Title']}.`, items: S('1a') },
  { id: 'pr-version', section: 'Title page', text: `Version ${PD.title['Version Number']}, ${PD.title['Version Date']} (amendment ${PD.title['Amendment Identifier']}, ${PD.title['Amendment Scope'].toLowerCase()}). Sponsor: ${PD.title['Sponsor Name and Address']}. Sponsor approval: ${PD.title['Sponsor Signatory']}, ${PD.title['Sponsor Approval']}.`, items: S('2', '3b') },
  { id: 'pr-ids', section: 'Title page', text: `Registry numbers: ${PD.title['NCT Number']}; EU CT ${PD.title['EU CT Number']}; CTRI ${PD.title['CTRI Number']}. IND ${PD.title['FDA IND Number']}.`, items: S('4') },
  { id: 'pr-synopsis', section: '1 Protocol summary', heading: '1.1 Synopsis', text: `${PD.design['Number of Arms']}-arm, ${PD.design['Trial Blind Schema'].toLowerCase()}, ${PD.design['Intervention Model'].toLowerCase()} trial in ${PD.design['Population Diagnosis or Condition'].toLowerCase()}, aged ${PD.design['Population Age (Minimum and Maximum)']} years; ${PD.design['Target/Maximum Number of Participants']} participants at ${PD.design['Site Distribution'].toLowerCase()} in ${PD.design['Site Geographic Scope']}. Control: ${PD.design['Control Description'].toLowerCase()}. Duration: ${PD.design['Total Planned Duration of Trial Participation'].toLowerCase()}.`, items: S('1b', '13') },
  { id: 'pr-soa', section: '1 Protocol summary', heading: '1.3 Schedule of activities', text: `Visits: ${PD.visits.map((v) => `${v.name} (day ${v.day})`).join('; ')}. Procedures at each visit are shown in the schedule of activities table.`, items: S('18') },
  { id: 'pr-2.1', section: '2 Introduction', heading: '2.1 Purpose of the trial', text: N('2.1'), items: S('9a') },
  { id: 'pr-2.2', section: '2 Introduction', heading: '2.2 Benefit and risk', text: `${N('2.2.1')} ${N('2.2.2')} ${N('2.2.3')}`, items: S('9a') },
  { id: 'pr-3', section: '3 Objectives and endpoints', text: PD.objectives.map((o, i) => `${o.level}: ${o.text}. Endpoint: ${PD.endpoints[i]?.text ?? ''}.`).join(' '), items: S('10', '16') },
  { id: 'pr-4.1', section: '4 Trial design', heading: '4.1 Description', text: N('4.1'), items: S('12') },
  { id: 'pr-4.1.1', section: '4 Trial design', heading: '4.1.1 Patient involvement', text: N('4.1.1'), items: S('11') },
  { id: 'pr-4.2.3', section: '4 Trial design', heading: '4.2.3 Choice of control', text: N('4.2.3'), items: S('9b') },
  { id: 'pr-4.3', section: '4 Trial design', heading: '4.3 Stopping the trial', text: N('4.3'), items: [] },
  { id: 'pr-4.5', section: '4 Trial design', heading: '4.5 Access after the trial', text: N('4.5'), items: S('34') },
  { id: 'pr-5', section: '5 Trial population', heading: '5.2–5.3 Criteria', text: PD.criteria.map((c) => `${c.code}: ${c.text}.`).join(' '), items: S('14a') },
  { id: 'pr-6.1', section: '6 Trial intervention', heading: '6.1 Description', text: N('6.1'), items: S('15a', '24b') },
  { id: 'pr-6.3', section: '6 Trial intervention', heading: '6.3 Administration', text: `${N('6.3')} ${N('6.4')}`, items: S('15a', '15b') },
  { id: 'pr-6.7', section: '6 Trial intervention', heading: '6.7 Allocation and blinding', text: N('6.7'), items: S('21a', '21b', '22', '23', '24a', '24c') },
  { id: 'pr-6.8', section: '6 Trial intervention', heading: '6.8 Adherence', text: N('6.8'), items: S('15c') },
  { id: 'pr-6.10', section: '6 Trial intervention', heading: '6.9–6.10 Rescue and concomitant therapy', text: `${N('6.10')} ${N('6.9').replace(/^6\.9\.2 /, '')}`, items: S('15d') },
  { id: 'pr-7', section: '7 Discontinuation', heading: '7.1–7.3', text: `${N('7.1')} ${N('7.2')} ${N('7.3')}`, items: S('15b', '25b') },
  { id: 'pr-8', section: '8 Assessments', heading: '8.1 Conduct of assessments', text: N('8.1'), items: S('25a') },
  { id: 'pr-9', section: '9 Adverse events', heading: '9.1–9.2', text: `${N('9.1')} ${N('9.2')}`, items: S('17') },
  { id: 'pr-10.2', section: '10 Statistics', heading: '10.2 Analysis sets', text: N('10.2'), items: S('27b') },
  { id: 'pr-10.4', section: '10 Statistics', heading: '10.4–10.7 Analyses', text: `${N('10.4')} ${N('10.5')} ${N('10.7')}`, items: S('27a', '27c', '27d') },
  { id: 'pr-10.10', section: '10 Statistics', heading: '10.10 Multiplicity', text: N('10.10'), items: [] },
  { id: 'pr-10.11', section: '10 Statistics', heading: '10.11 Sample size', text: N('10.11'), items: S('19') },
  { id: 'pr-11.1', section: '11 Trial oversight', heading: '11.1 Regulatory and ethical conduct', text: N('11.1'), items: S('30', '31') },
  { id: 'pr-11.2', section: '11 Trial oversight', heading: '11.2 Responsibilities', text: N('11.2'), items: S('3c', '7a', '7b') },
  { id: 'pr-11.3', section: '11 Trial oversight', heading: '11.3 Informed consent', text: N('11.3'), items: S('32a') },
  { id: 'pr-11.4', section: '11 Trial oversight', heading: '11.4 Committees', text: N('11.4'), items: S('3d', '28a', '28b') },
  { id: 'pr-11.5', section: '11 Trial oversight', heading: '11.5 Insurance', text: N('11.5'), items: S('34') },
  { id: 'pr-11.6', section: '11 Trial oversight', heading: '11.6 Quality and monitoring', text: N('11.6'), items: S('29') },
  { id: 'pr-11.7', section: '11 Trial oversight', heading: '11.7 Data management', text: N('11.7'), items: S('26') },
  { id: 'pr-11.8', section: '11 Trial oversight', heading: '11.8 Data protection', text: N('11.8'), items: S('33') },
  { id: 'pr-11.12', section: '11 Trial oversight', heading: '11.12 Publication and data sharing', text: N('11.12'), items: S('5', '6', '8') },
  { id: 'pr-12.1', section: '12 Appendices', heading: '12.1 Laboratory tests and samples', text: N('12.1'), items: S('32b') },
]
export const HRP301_PROTOCOL: Manuscript = build({
  id: 'hrp-301-protocol', study: 'HRP-301', kind: 'protocol', journal: 'Protocol Builder export (version 2.0)',
  title: 'VERDANT-1 protocol, version 2.0', guidelines: ['spirit-2025'],
  na: ['spirit-2025:14b'],
  note: 'Rendered from the Protocol Builder\'s HRP-301 project, version 2.0 (10 August 2026). Some SPIRIT 2025 items are genuinely missing or only partly reported: mission RG12 asks you to find them.',
}, proto)
// What the protocol leaves out, as the RG12 answer key: missing outright, or only partly reported.
export const PROTOCOL_GAPS: Record<string, string> = {
  '3a': 'No protocol contributors are named, and no roles are given; only the approving signatory\'s role.',
  '4': 'The registry numbers are given, but not the date of registration.',
  '7b': 'Section 11.2 says conflicts are declared, but not what they are (or that there are none).',
  '20': 'There is no recruitment strategy: how 324 participants will be found at about 60 sites.',
  '28b': 'The committee can recommend stopping, but no interim analyses or stopping guidelines are described.',
}
// Remove the planted items from the clean key, partly-reported gaps stay in the key with a note.
for (const id of ['3a', '20']) delete HRP301_PROTOCOL.key[`spirit-2025:${id}`]

export const MANUSCRIPTS: Manuscript[] = [VERDANT1, GLYDE3, HRP301_PROTOCOL]
export const manuscript = (id: string) => MANUSCRIPTS.find((m) => m.id === id)

/** A manuscript with a mission's planted edits applied. */
export function planted(m: Manuscript, edits: Record<string, string>): Manuscript {
  return { ...m, paras: m.paras.flatMap((p) => (p.id in edits ? (edits[p.id] ? [{ ...p, text: edits[p.id] }] : []) : [p])) }
}

/** The learner's own text, split into paragraphs (blank lines; a short line ending without a full stop is a heading). */
export function fromText(text: string, guidelines: GuidelineId[]): Manuscript {
  const blocks = text.replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
  const paras: Para[] = []
  let section = 'Text', heading: string | undefined
  for (const b of blocks) {
    if (b.length < 80 && !/[.:;?!]$/.test(b) && !b.includes('\n')) { section = b; heading = b; continue }
    paras.push({ id: `u${paras.length + 1}`, section, heading, text: b.replace(/\s*\n\s*/g, ' ') }); heading = undefined
  }
  return { id: 'own', study: '', kind: 'article', title: 'Your manuscript', journal: '', guidelines, paras, key: {}, na: [] }
}
