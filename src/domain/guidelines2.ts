// Phase 2 checklists: the other study designs. As in Phase 1, every item is written in this app's
// own words; the item numbers and order follow each statement, checked on 25 November 2026 against
// STROBE (PLoS Med 2007, Table 1), PRISMA 2020 (BMJ 2021;372:n71), STARD 2015 (BMJ 2015;351:h5527),
// TRIPOD+AI (BMJ 2024;385:e078378, Table 2) and the CHEERS 2022 item list (BMJ 2022;376:e067975).
import type { Guideline, Item } from './types'

const it = (section: string, list: [string, string, string?, boolean?][]): Item[] =>
  list.map(([id, text, look, ifApplicable]) => ({ id, section, text, look, ifApplicable }))

export const STROBE: Guideline = {
  id: 'strobe', name: 'STROBE', version: '2007', covers: 'Cohort, case-control and cross-sectional studies', url: 'https://www.strobe-statement.org/', licence: 'Free to use', built: true,
  note: '22 items. Items 6, 12d, 14c and 15 differ by design; some items are reported separately for exposed and unexposed groups (or cases and controls).',
  items: [
    ...it('Title and abstract', [['1a', 'Name the design with a common term in the title or abstract.', 'cohort, case-control or cross-sectional'], ['1b', 'Give an informative, balanced summary of what was done and found.']]),
    ...it('Introduction', [['2', 'Explain the background and why the study was done.'], ['3', 'State the objectives, with any prespecified hypotheses.']]),
    ...it('Methods', [
      ['4', 'Present the key elements of the design early in the paper.'],
      ['5', 'Describe the setting, the locations and the dates of recruitment, exposure, follow-up and data collection.', 'Places and dates'],
      ['6a', 'Cohort: eligibility, sources and methods of selecting participants, and methods of follow-up (case-control and cross-sectional: their equivalents).', 'Who and how selected; how followed'],
      ['6b', 'For matched studies, the matching criteria and the number matched.', undefined, true],
      ['7', 'Define every outcome, exposure, predictor, confounder and effect modifier, with diagnostic criteria where relevant.', 'Definitions'],
      ['8', 'For each variable, give the data source and how it was measured, and whether measurement was comparable between groups.', 'Data sources'],
      ['9', 'Describe what was done to address possible sources of bias.', 'Bias'],
      ['10', 'Explain how the study size was arrived at.', 'Study size'],
      ['11', 'Explain how quantitative variables were handled, and which groupings were chosen and why.'],
      ['12a', 'Describe all the statistical methods, including those used to control for confounding.', 'Model and confounders'],
      ['12b', 'Describe the methods used to examine subgroups and interactions.'],
      ['12c', 'Explain how missing data were handled.', 'Missing data'],
      ['12d', 'Cohort: how loss to follow-up was handled (case-control: matching; cross-sectional: the sampling strategy).'],
      ['12e', 'Describe any sensitivity analyses.'],
    ]),
    ...it('Results', [
      ['13a', 'Give the numbers at each stage: potentially eligible, examined, confirmed eligible, included, completing follow-up and analysed.', 'Numbers at each stage'],
      ['13b', 'Give the reasons for non-participation at each stage.'],
      ['13c', 'Consider a flow diagram.', undefined, true],
      ['14a', 'Describe the participants\' characteristics, and information on exposures and potential confounders.', 'Baseline table'],
      ['14b', 'Give the number with missing data for each variable of interest.', 'Missing data counts'],
      ['14c', 'Cohort: summarise the follow-up time (average and total).', 'Median or mean and total person-years'],
      ['15', 'Cohort: report the numbers of outcome events or summary measures over time (case-control: by exposure category).', 'Events per group'],
      ['16a', 'Give unadjusted and, where applicable, adjusted estimates with their precision, and say which confounders were adjusted for and why.', 'Crude and adjusted estimates, CIs, confounders'],
      ['16b', 'When continuous variables were categorised, report the category boundaries.', undefined, true],
      ['16c', 'Where relevant, translate relative risks into absolute risks for a meaningful period.'],
      ['17', 'Report other analyses: subgroups, interactions, sensitivity analyses.'],
    ]),
    ...it('Discussion', [
      ['18', 'Summarise the key results in relation to the objectives.'],
      ['19', 'Discuss the limitations, including sources of bias or imprecision, and the direction and size of any likely bias.', 'Limitations with direction of bias'],
      ['20', 'Give a cautious interpretation, considering the objectives, limitations, multiple analyses and other evidence.'],
      ['21', 'Discuss how far the results can be generalised.', 'External validity'],
    ]),
    ...it('Other information', [['22', 'Give the funding and the funders\' role in this study (and in any original study it builds on).', 'Funding and role']]),
  ],
}

export const PRISMA_2020: Guideline = {
  id: 'prisma-2020', name: 'PRISMA 2020', version: '2020', covers: 'Systematic reviews, with or without meta-analysis', url: 'https://www.prisma-statement.org/', licence: 'CC BY', built: true,
  note: '27 items (42 with sub-items) and a flow diagram from records identified to studies included. Abstracts follow PRISMA 2020 for Abstracts.',
  items: [
    ...it('Title and abstract', [['1', 'Say in the title that the report is a systematic review.', 'Systematic review in the title'], ['2', 'Give an abstract that follows PRISMA 2020 for Abstracts.']]),
    ...it('Introduction', [['3', 'Explain why the review was needed, given what is already known.'], ['4', 'State the objectives or questions the review addresses.']]),
    ...it('Methods', [
      ['5', 'Give the inclusion and exclusion criteria, and how studies were grouped for the syntheses.', 'Eligibility'],
      ['6', 'Name every database, register, website, organisation and reference list searched, with the date each was last searched.', 'Sources and dates'],
      ['7', 'Give the full search strategies for every source, with any filters and limits.', 'Full strategies'],
      ['8', 'Explain how studies were selected: how many reviewers screened each record, independently or not, and any automation.', 'Screening process'],
      ['9', 'Explain how data were collected: reviewers per report, independence, contact with authors, automation.', 'Data collection'],
      ['10a', 'List the outcomes sought, and whether all results compatible with each were collected or only some (and how they were chosen).'],
      ['10b', 'List the other variables sought, and the assumptions made about missing or unclear information.'],
      ['11', 'Name the risk of bias tools, with reviewers per study, independence and automation.', 'Risk of bias tool'],
      ['12', 'Name the effect measure for each outcome.', 'Risk ratio, mean difference…'],
      ['13a', 'Explain how studies were chosen for each synthesis.'],
      ['13b', 'Describe how data were prepared: missing statistics, conversions.'],
      ['13c', 'Describe how results were tabulated or displayed.'],
      ['13d', 'Describe and justify the synthesis methods; for a meta-analysis, the model, the heterogeneity measures and the software.', 'Model, heterogeneity, software'],
      ['13e', 'Describe how causes of heterogeneity were explored.'],
      ['13f', 'Describe the sensitivity analyses.'],
      ['14', 'Describe how the risk of bias due to missing results (reporting bias) was assessed.', 'Funnel plot or other method'],
      ['15', 'Describe how the certainty of the evidence for each outcome was assessed.', 'GRADE or similar'],
    ]),
    ...it('Results', [
      ['16a', 'Report the search and selection, from records identified to studies included, ideally with a flow diagram.', 'Numbers at each stage'],
      ['16b', 'Cite studies that seemed to meet the criteria but were excluded, and say why.'],
      ['17', 'Cite each included study and give its characteristics.'],
      ['18', 'Give the risk of bias assessment for each included study.'],
      ['19', 'For each study and outcome, give the summary data per group and the effect estimate with its precision.'],
      ['20a', 'For each synthesis, summarise the contributing studies\' characteristics and risk of bias.'],
      ['20b', 'Give every statistical synthesis: the summary estimate and its precision, and the heterogeneity.', 'Pooled estimate, CI, I²'],
      ['20c', 'Report the investigations of heterogeneity.'],
      ['20d', 'Report the sensitivity analyses.'],
      ['21', 'Give the assessment of risk of bias due to missing results for each synthesis.'],
      ['22', 'Give the certainty of the evidence for each outcome.', 'GRADE rating'],
    ]),
    ...it('Discussion', [['23a', 'Interpret the results in the context of other evidence.'], ['23b', 'Discuss the limitations of the evidence included.'], ['23c', 'Discuss the limitations of the review process.'], ['23d', 'Discuss the implications for practice, policy and research.']]),
    ...it('Other information', [
      ['24a', 'Give the registration (register and number), or say the review was not registered.', 'PROSPERO or other number'],
      ['24b', 'Say where the protocol can be read, or that there was none.'],
      ['24c', 'Describe and explain any changes from the registration or protocol.'],
      ['25', 'Describe the financial and non-financial support, and the funders\' role.'],
      ['26', 'Declare the authors\' competing interests.'],
      ['27', 'Say which materials are publicly available and where: forms, extracted data, analysis data, code.', 'Data availability'],
    ]),
  ],
}

export const PRISMA_S: Guideline = {
  id: 'prisma-s', name: 'PRISMA-S', version: '2021', covers: 'The literature search of a systematic review', url: 'https://www.prisma-statement.org/', licence: 'CC BY', built: true,
  note: '16 items on what a search report needs so another searcher could repeat it.',
  items: [
    ...it('Information sources and methods', [
      ['S1', 'Name each database searched, with the platform used.', 'Database and platform'],
      ['S2', 'If several databases were searched at once on one platform, say so and name them.', undefined, true],
      ['S3', 'Name the study registries searched.', 'Registers'],
      ['S4', 'Describe any online resources searched or browsed, and how.', undefined, true],
      ['S5', 'Say whether reference lists were checked or citations tracked.'],
      ['S6', 'Say whether authors, manufacturers or others were contacted for studies or data.'],
      ['S7', 'Describe any other methods used to find studies.', undefined, true],
    ]),
    ...it('Search strategies', [
      ['S8', 'Give every search strategy exactly as run, for each source.', 'Full strategies'],
      ['S9', 'State any limits or restrictions (dates, language, publication type) and why.', 'Limits'],
      ['S10', 'Name any published search filters used and say whether they were adapted.', undefined, true],
      ['S11', 'Say whether a previous search was reused or adapted.', undefined, true],
      ['S12', 'Describe how the search was updated, if it was.', undefined, true],
      ['S13', 'Give the date each search was run.', 'Dates'],
    ]),
    ...it('Peer review and managing records', [
      ['S14', 'Describe any peer review of the search strategies.', 'PRESS or similar'],
      ['S15', 'Give the total number of records found by each search before deduplication.', 'Records per source'],
      ['S16', 'Describe how duplicates were removed.', 'Deduplication method'],
    ]),
  ],
}

export const STARD: Guideline = {
  id: 'stard-2015', name: 'STARD 2015', version: '2015', covers: 'Diagnostic accuracy studies', url: 'https://www.equator-network.org/reporting-guidelines/stard/', licence: 'Creative Commons (use with acknowledgement)', built: true,
  note: '30 items (34 with sub-items), with a flow diagram and the 2×2 cross-tabulation of the index test against the reference standard.',
  items: [
    ...it('Title and abstract', [['1', 'Identify the study as a diagnostic accuracy study, naming at least one accuracy measure.', 'Sensitivity, specificity or AUC in the title or abstract'], ['2', 'Give a structured abstract of design, methods, results and conclusions.']]),
    ...it('Introduction', [['3', 'Give the scientific and clinical background, with the intended use and clinical role of the index test.', 'Intended use and role'], ['4', 'State the objectives and hypotheses.']]),
    ...it('Methods', [
      ['5', 'Say whether data were collected before the index test and reference standard were done (prospective) or after (retrospective).', 'Prospective or retrospective'],
      ['6', 'Give the eligibility criteria.'],
      ['7', 'Say on what basis potentially eligible people were identified (symptoms, earlier tests, a registry).'],
      ['8', 'Say where and when potentially eligible people were identified (setting, location, dates).', 'Setting and dates'],
      ['9', 'Say whether participants formed a consecutive, random or convenience series.', 'Consecutive, random or convenience'],
      ['10a', 'Describe the index test in enough detail to repeat it.'],
      ['10b', 'Describe the reference standard in enough detail to repeat it.'],
      ['11', 'Explain why this reference standard was chosen, if there are alternatives.'],
      ['12a', 'Define and justify the positivity cut-offs or categories of the index test, saying which were prespecified.', 'Cut-off, prespecified'],
      ['12b', 'Define and justify the positivity cut-offs or categories of the reference standard, saying which were prespecified.'],
      ['13a', 'Say whether those performing or reading the index test knew the clinical information and the reference standard result.', 'Blinding of index test readers'],
      ['13b', 'Say whether those assessing the reference standard knew the clinical information and the index test result.', 'Blinding of reference assessors'],
      ['14', 'Describe the methods for estimating or comparing diagnostic accuracy.'],
      ['15', 'Say how indeterminate results of either test were handled.', 'Indeterminate results'],
      ['16', 'Say how missing results of either test were handled.'],
      ['17', 'Report any analyses of variability in accuracy, saying which were prespecified.', undefined, true],
      ['18', 'Give the intended sample size and how it was determined.', 'Sample size'],
    ]),
    ...it('Results', [
      ['19', 'Show the flow of participants, with a diagram.', 'Flow from eligible to analysed'],
      ['20', 'Report the participants\' baseline demographic and clinical characteristics.'],
      ['21a', 'Report the distribution of severity of disease in those with the target condition.'],
      ['21b', 'Report the distribution of alternative diagnoses in those without it.'],
      ['22', 'Report the time between the index test and the reference standard, and any treatment in between.', 'Interval'],
      ['23', 'Cross-tabulate the index test results against the reference standard results.', 'The 2×2 table'],
      ['24', 'Report the estimates of accuracy with their precision.', 'Sensitivity and specificity with 95% CIs'],
      ['25', 'Report any adverse events from performing either test.', 'Harms of testing'],
    ]),
    ...it('Discussion', [['26', 'Discuss the limitations: sources of bias, statistical uncertainty, generalisability.'], ['27', 'Discuss the implications for practice, with the intended use and clinical role of the index test.']]),
    ...it('Other information', [['28', 'Give the registration number and registry.', 'Registry and number'], ['29', 'Say where the full protocol can be read.'], ['30', 'Give the funding and the funders\' role.']]),
  ],
}

export const CARE: Guideline = {
  id: 'care', name: 'CARE', version: '2013', covers: 'Case reports', url: 'https://www.care-statement.org/', licence: 'Not stated', built: true,
  note: '13 items, several with sub-items, and a timeline of the case.',
  items: [
    ...it('Front matter', [['1', 'Put "case report" in the title with the area of focus.', 'Case report in the title'], ['2', 'Give two to five key words.'], ['3a', 'Abstract: what is unique about the case and what it adds.'], ['3b', 'Abstract: the main symptoms and clinical findings.'], ['3c', 'Abstract: the main diagnoses, interventions and outcomes.'], ['3d', 'Abstract: the main take-away lesson.']]),
    ...it('Introduction', [['4', 'Briefly summarise the background and why this case matters, with references.']]),
    ...it('Patient information', [['5a', 'De-identified demographic information.', 'Age, sex, occupation'], ['5b', 'The main concerns and symptoms.'], ['5c', 'Medical, family and psychosocial history, with relevant genetic information.'], ['5d', 'Relevant past interventions and their outcomes.']]),
    ...it('Clinical course', [
      ['6', 'Describe the physical examination and the important clinical findings.'],
      ['7', 'Give the history of the care as a timeline.', 'Dated sequence'],
      ['8a', 'Diagnostic methods: examination, laboratory tests, imaging, questionnaires.'],
      ['8b', 'Diagnostic challenges (access, cost, cultural).', undefined, true],
      ['8c', 'Diagnostic reasoning, including the other diagnoses considered.', 'Differential diagnosis'],
      ['8d', 'Prognostic characteristics, where applicable.', undefined, true],
      ['9a', 'The types of intervention (drug, surgery, other).'],
      ['9b', 'How they were given: dose, strength, duration.', 'Doses and durations'],
      ['9c', 'Any changes to the interventions, with the reasons.'],
      ['10a', 'The outcomes as the clinician and the patient assessed them.'],
      ['10b', 'Important follow-up test results.'],
      ['10c', 'Adherence and tolerability, and how they were assessed.'],
      ['10d', 'Adverse and unexpected events.'],
    ]),
    ...it('Discussion', [['11a', 'The strengths and limitations of the management of the case.'], ['11b', 'The relevant medical literature.'], ['11c', 'The rationale for the conclusions, including an assessment of causality.', 'Causality assessment'], ['11d', 'The main take-away lessons.']]),
    ...it('Patient and consent', [['12', 'The patient\'s own perspective, where possible.', 'Patient perspective'], ['13', 'Say that the patient gave informed consent (and provide it if asked).', 'Consent for publication']]),
  ],
}

export const CHEERS: Guideline = {
  id: 'cheers-2022', name: 'CHEERS 2022', version: '2022', covers: 'Health economic evaluations', url: 'https://www.equator-network.org/reporting-guidelines/cheers/', licence: 'CC BY', built: true,
  note: '28 items. Some do not apply to every study: outcome valuation to cost analyses, model items to non-modelling studies.',
  items: [
    ...it('Title and abstract', [['1', 'Identify the study as an economic evaluation and name the interventions compared.', 'Economic evaluation in the title'], ['2', 'Summarise the context, methods, results and alternative analyses.']]),
    ...it('Introduction', [['3', 'Give the context, the question and its relevance to policy or practice.']]),
    ...it('Methods', [
      ['4', 'Say whether a health economic analysis plan was written and where it can be found.', 'Analysis plan'],
      ['5', 'Describe the population, including its subgroups.'],
      ['6', 'Describe the setting and location that matter for the decision.'],
      ['7', 'Describe the interventions or strategies compared and why they were chosen.', 'Comparators'],
      ['8', 'State the perspective(s) and why.', 'Health system or societal perspective'],
      ['9', 'State the time horizon and why it is appropriate.', 'Time horizon'],
      ['10', 'State the discount rate(s) and why.', 'Discount rate'],
      ['11', 'Say which outcomes measure benefits and harms, and why.'],
      ['12', 'Say how the outcomes were measured.'],
      ['13', 'Describe the population and methods used to value the outcomes.', 'Utility source'],
      ['14', 'Describe how costs were measured and valued.', 'Resource use and unit costs'],
      ['15', 'Give the currency, the price year and any conversion.', 'Currency and price year'],
      ['16', 'If a model was used, describe it and why it was chosen.', 'Model structure', true],
      ['17', 'Describe the analyses, the assumptions and how data were integrated.'],
      ['18', 'Describe how differences between subgroups were examined.'],
      ['19', 'Describe how the distribution of effects across groups (equity) was examined.', undefined, true],
      ['20', 'Describe how uncertainty was analysed.', 'Deterministic and probabilistic analyses'],
      ['21', 'Describe how patients, the public and others affected were engaged in the design.', 'Engagement (or none)'],
    ]),
    ...it('Results', [
      ['22', 'Report every input parameter with its value, range and source.', 'Parameter table', true],
      ['23', 'Report the mean costs and outcomes and the main results (for example the ICER).', 'Costs, QALYs, ICER'],
      ['24', 'Describe how uncertainty affected the results.', 'Sensitivity results, acceptability curve'],
      ['25', 'Report what changed because of the engagement with patients and others.', undefined, true],
    ]),
    ...it('Discussion and other information', [['26', 'Discuss the findings, limitations, generalisability and how they fit current knowledge.'], ['27', 'Give the funding and the funder\'s role.'], ['28', 'Report the authors\' conflicts of interest.']]),
  ],
}

// Extension points, in the same style as the CONSORT Harms points: what the extension adds to the
// main checklist, in this app's words. Both extensions were written for CONSORT 2010.
export const CONSORT_NI: Guideline = {
  id: 'consort-ni', name: 'CONSORT Non-inferiority and equivalence', version: '2012', covers: 'Non-inferiority and equivalence trials', url: 'https://www.equator-network.org/reporting-guidelines/consort-non-inferiority/', licence: 'Open access', built: true,
  note: 'The points the 2012 extension adds to the main checklist, in this app\'s words. Written for CONSORT 2010; use it with CONSORT 2025 until it is aligned.',
  items: it('Non-inferiority points', [
    ['N1', 'Say in the title or abstract that the trial is a non-inferiority (or equivalence) trial.'],
    ['N2', 'Explain why a non-inferiority design was used.'],
    ['N3', 'State the hypothesis with the margin.', 'The margin'],
    ['N4', 'Justify the margin (from the reference treatment\'s known effect, clinical judgement).', 'Margin justification'],
    ['N5', 'Say whether the participants and the reference treatment are like those in the trials that showed the reference treatment works.'],
    ['N6', 'Base the sample size on the margin.', 'Sample size with the margin'],
    ['N7', 'Say whether a one- or two-sided confidence interval was used, and report both the intention-to-treat and the per-protocol analyses.', 'Both populations'],
    ['N8', 'Show the confidence interval against the margin, and interpret the result in relation to it.', 'Interval against the margin'],
  ]),
}
export const CONSORT_CLUSTER: Guideline = {
  id: 'consort-cluster', name: 'CONSORT Cluster', version: '2012', covers: 'Cluster randomised trials', url: 'https://www.equator-network.org/reporting-guidelines/consort-cluster/', licence: 'Open access', built: true,
  note: 'The points the 2012 extension adds to the main checklist, in this app\'s words. Written for CONSORT 2010; use it with CONSORT 2025 until it is aligned.',
  items: it('Cluster points', [
    ['K1', 'Say in the title or abstract that allocation was by cluster.'],
    ['K2', 'Explain why a cluster design was used.'],
    ['K3', 'Give the eligibility criteria for clusters as well as for individuals.'],
    ['K4', 'Say whether objectives and outcomes are at the cluster level, the individual level or both.'],
    ['K5', 'Base the sample size on the clustering: the cluster size and the intracluster correlation (ICC) assumed.', 'ICC and cluster size'],
    ['K6', 'Say who enrolled the clusters and the individuals, and when and from whom consent was sought.', 'Consent at cluster and individual level'],
    ['K7', 'Use analyses that account for the clustering.', 'Mixed model, GEE or cluster-level analysis'],
    ['K8', 'Report the flow of clusters and of individuals, and the ICC found.', 'Flow at both levels, ICC'],
  ]),
}

export const ARRIVE: Guideline = {
  id: 'arrive-2', name: 'ARRIVE 2.0', version: '2020', covers: 'Animal research', url: 'https://arriveguidelines.org/', licence: 'CC BY', built: true,
  note: 'The Essential 10 are the minimum; the Recommended Set (11–21) adds context.',
  items: [
    ...it('Essential 10', [
      ['1', 'Study design: the groups compared, the control group, and the experimental unit (one animal, a litter, a cage).', 'Experimental unit'],
      ['2', 'Sample size: the number of units per group and how it was decided.', 'Sample size calculation'],
      ['3', 'Inclusion and exclusion criteria, and any animals or data excluded, with reasons.'],
      ['4', 'Randomisation: whether and how allocation was randomised.', 'Method of randomisation'],
      ['5', 'Blinding: who knew the allocation at each stage.', 'Blinded roles'],
      ['6', 'Outcome measures: definitions, and which was primary.'],
      ['7', 'Statistical methods for each analysis, including checks of assumptions.'],
      ['8', 'Experimental animals: species, strain, sex, age, weight, source.', 'Species, strain, sex'],
      ['9', 'Experimental procedures: what was done, how, when, where and why, for each group.'],
      ['10', 'Results: summary statistics with variability for each group, and the effect size with a confidence interval.'],
    ]),
    ...it('Recommended Set', [
      ['11', 'Abstract summarising objectives, species, methods and results.'], ['12', 'Background and the relevance to human biology.'], ['13', 'Objectives and hypotheses.'], ['14', 'Ethical approval: the committee and the licence.', 'Ethics committee'],
      ['15', 'Housing and husbandry.'], ['16', 'Animal care and monitoring, with humane end points.'], ['17', 'Interpretation and implications.'], ['18', 'Generalisability and translation.'], ['19', 'Protocol registration.'], ['20', 'Data access.'], ['21', 'Declaration of interests.'],
    ]),
  ],
}

export const TRIPOD_AI: Guideline = {
  id: 'tripod-ai', name: 'TRIPOD+AI', version: '2024', covers: 'Prediction models, by regression or machine learning', url: 'https://www.tripod-statement.org/', licence: 'CC BY 4.0', built: true,
  note: '27 items (52 with sub-items). Some apply to model development only, some to evaluation only. The abstract follows TRIPOD+AI for Abstracts.',
  items: [
    ...it('Title and abstract', [['1', 'Say that the study develops or evaluates a multivariable prediction model, with the population and the outcome.'], ['2', 'Follow TRIPOD+AI for Abstracts.']]),
    ...it('Introduction', [['3a', 'The healthcare context, whether the model is diagnostic or prognostic, and existing models.'], ['3b', 'The target population, where the model sits in the care pathway, and its intended users.'], ['3c', 'Known health inequalities between sociodemographic groups.'], ['4', 'The objectives: development, evaluation or both.']]),
    ...it('Methods', [
      ['5a', 'The data sources for development and evaluation, and how representative they are.'], ['5b', 'The dates of data collection and follow-up.', 'Dates'],
      ['6a', 'The setting, number and location of centres.'], ['6b', 'Eligibility criteria.'], ['6c', 'Treatments received and how they were handled.'],
      ['7', 'Data pre-processing and quality checking, and whether they were the same across groups.'],
      ['8a', 'The outcome: definition, time horizon, how assessed and why.', 'Outcome and horizon'], ['8b', 'Qualifications of assessors where the outcome is subjective.', undefined, true], ['8c', 'Blinding of outcome assessment.'],
      ['9a', 'How candidate predictors were chosen.'], ['9b', 'Each predictor\'s definition, measurement and timing.'], ['9c', 'Qualifications of assessors where a predictor is subjective.', undefined, true],
      ['10', 'How the study size was arrived at, for each stage.', 'Sample size'],
      ['11', 'How missing data were handled.', 'Missing data'],
      ['12a', 'How the data were used and split for development and evaluation.'], ['12b', 'How predictors were handled (functional form, scaling).'], ['12c', 'The model type, every step of building it, tuning and internal validation.', 'Model and validation'], ['12d', 'How heterogeneity across clusters was handled.', undefined, true], ['12e', 'The performance measures and plots, and why.', 'Discrimination and calibration'], ['12f', 'Any model updating.', undefined, true], ['12g', 'How predictions were made for evaluation.', undefined, true],
      ['13', 'Methods for class imbalance, if used, and any recalibration.', undefined, true],
      ['14', 'The approach to fairness and why.', 'Fairness'],
      ['15', 'The output of the model and how any threshold was set.'],
      ['16', 'Differences between the development and evaluation data.', undefined, true],
      ['17', 'The ethics committee and consent or its waiver.'],
      ['18a', 'Funding and funders\' role.'], ['18b', 'Conflicts of interest.'], ['18c', 'Where the protocol is, or that there is none.'], ['18d', 'Registration, or that there was none.'], ['18e', 'Data availability.', 'Data sharing'], ['18f', 'Code availability.', 'Code sharing'],
      ['19', 'Patient and public involvement, or that there was none.'],
    ]),
    ...it('Results', [
      ['20a', 'The flow of participants, the numbers with the outcome, and follow-up.'], ['20b', 'Participant characteristics overall and by source, including by demographic group.'], ['20c', 'For evaluation, how the data compare with the development data.', undefined, true],
      ['21', 'The numbers of participants and outcome events in each analysis.', 'Events per analysis'],
      ['22', 'Enough of the model to make predictions or evaluate it, or how to obtain it.'],
      ['23a', 'Model performance with confidence intervals, including in key subgroups.', 'AUC and calibration with CIs'], ['23b', 'Heterogeneity of performance across clusters.', undefined, true],
      ['24', 'Results of any model updating.', undefined, true],
    ]),
    ...it('Discussion', [['25', 'An interpretation of the main results, including fairness.'], ['26', 'Limitations: bias, uncertainty and generalisability.'], ['27a', 'How poor or missing input data should be handled in use.'], ['27b', 'Whether users must handle the inputs, and the expertise needed.'], ['27c', 'The next steps for research.']]),
  ],
}

export const SQUIRE: Guideline = {
  id: 'squire-2', name: 'SQUIRE 2.0', version: '2015', covers: 'Quality improvement studies', url: 'https://www.squire-statement.org/', licence: 'Open access', built: true,
  note: '18 items.',
  items: [
    ...it('Title and abstract', [['1', 'Say the report is about improving the quality of care (safety, effectiveness, timeliness, equity…).'], ['2', 'A structured summary.']]),
    ...it('Introduction', [['3', 'The nature and size of the local problem.', 'The problem with numbers'], ['4', 'What is known about it already.'], ['5', 'The rationale: the theory or framework behind the intervention.'], ['6', 'The purpose of the project and of the report.']]),
    ...it('Methods', [['7', 'The context thought to matter.'], ['8', 'The intervention(s) in enough detail to repeat, and the team that delivered them.', 'What was changed'], ['9', 'How the impact of the intervention was studied, and how its effects were linked to it.', 'Design: PDSA, run charts'], ['10', 'The measures chosen, with process and outcome measures.', 'Measures'], ['11', 'The qualitative and quantitative methods used to draw conclusions.'], ['12', 'Ethical considerations and approval.']]),
    ...it('Results', [['13', 'The steps of the intervention over time, the measures, contextual factors and unexpected results.', 'Run chart or before and after with dates']]),
    ...it('Discussion', [['14', 'Summary of the key findings.'], ['15', 'Interpretation: the effect, costs, trade-offs, comparison with other work.'], ['16', 'Limitations.', 'Limitations'], ['17', 'Conclusions: usefulness, sustainability, spread.']]),
    ...it('Other information', [['18', 'Funding and the funder\'s role.']]),
  ],
}

export const COREQ: Guideline = {
  id: 'coreq', name: 'COREQ', version: '2007', covers: 'Qualitative interviews and focus groups', url: 'https://www.equator-network.org/reporting-guidelines/coreq/', licence: 'Publisher copyright', built: true,
  note: '32 items in three domains.',
  items: [
    ...it('Research team and reflexivity', [['1', 'Who conducted the interviews or focus groups.'], ['2', 'Their credentials.'], ['3', 'Their occupation.'], ['4', 'Their gender.'], ['5', 'Their experience and training.'], ['6', 'Whether a relationship existed with participants before the study.', 'Prior relationship'], ['7', 'What participants knew about the researcher.'], ['8', 'The interviewer\'s characteristics that may matter (bias, interests).']]),
    ...it('Study design', [
      ['9', 'The methodological orientation (grounded theory, thematic analysis…).', 'Approach'], ['10', 'How participants were sampled.', 'Purposive, convenience…'], ['11', 'How participants were approached.'], ['12', 'The number of participants.'], ['13', 'How many refused or dropped out, and why.'],
      ['14', 'Where data were collected.'], ['15', 'Whether anyone else was present.'], ['16', 'The important characteristics of the sample.'], ['17', 'Whether an interview guide was used and piloted.', 'Interview guide'], ['18', 'Whether repeat interviews were done.'],
      ['19', 'Whether audio or video recording was used.'], ['20', 'Whether field notes were made.'], ['21', 'How long the interviews lasted.'], ['22', 'Whether data saturation was discussed.', 'Saturation'], ['23', 'Whether transcripts were returned to participants.'],
    ]),
    ...it('Analysis and findings', [['24', 'How many coders coded the data.'], ['25', 'Whether a coding tree was described.'], ['26', 'Whether themes were identified in advance or from the data.'], ['27', 'The software used.'], ['28', 'Whether participants gave feedback on the findings.'], ['29', 'Whether quotations illustrate the themes, each identified.', 'Identified quotations'], ['30', 'Whether the data and findings are consistent.'], ['31', 'Whether the major themes are clearly presented.'], ['32', 'Whether minor themes are described.']]),
  ],
}

export const PHASE2: Guideline[] = [CONSORT_NI, CONSORT_CLUSTER, STROBE, PRISMA_2020, PRISMA_S, STARD, CARE, ARRIVE, TRIPOD_AI, CHEERS, SQUIRE, COREQ]
