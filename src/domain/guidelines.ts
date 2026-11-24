// The reporting guidelines. Every item is written in this app's own words; the official wording
// is on the page each guideline links to. The EQUATOR Network makes no copyright claim over
// guideline content: copyright stays with each guideline's publisher, so the app paraphrases all
// of them, whatever their licence (Decision 3 of the spec).
//
// Versions checked on 24 November 2026: CONSORT 2025 (14 April 2025), SPIRIT 2025 (28 April 2025),
// CONSORT for Abstracts (2008), CONSORT Harms (2022), and the others as listed in the catalogue.
import type { Guideline, GuidelineId, Item } from './types'

const it = (section: string, list: [string, string, string?, ('new' | 'revised')?, boolean?][]): Item[] =>
  list.map(([id, text, look, change, ifApplicable]) => ({ id, section, text, look, change, ifApplicable }))

export const CONSORT_2025: Guideline = {
  id: 'consort-2025', name: 'CONSORT 2025', version: '2025', covers: 'Reports of randomised trials',
  url: 'https://www.consort-spirit.org/', licence: 'CC BY 4.0', built: true,
  note: 'Thirty items in six sections, plus a participant flow diagram. Seven items are new in 2025 and three were revised; the separate item on generalisability was folded into the limitations item.',
  items: [
    ...it('Title and abstract', [
      ['1a', 'Say in the title that the study is a randomised trial.', 'The word randomised in the title'],
      ['1b', 'Give a structured abstract of the design, methods, results and conclusions (see CONSORT for Abstracts).', 'An abstract with headings'],
    ]),
    ...it('Open science', [
      ['2', 'Name the registry, give the registration number (with a link) and the date the trial was registered.', 'Registry, number and date'],
      ['3', 'Say where the protocol and the statistical analysis plan can be read.', 'Where to find both documents', 'revised'],
      ['4', 'Say where and how the de-identified participant data, data dictionary, analysis code and other materials can be obtained, or that they cannot.', 'A data sharing statement', 'new'],
      ['5a', 'Name the funders and other support (such as donated drug), and say what part the funders played.', 'Funders and their role'],
      ['5b', 'Report the authors\' financial and other conflicts of interest.', 'Competing interests', 'new'],
    ]),
    ...it('Introduction', [
      ['6', 'Explain the scientific background and why the trial was needed.', 'Background and rationale'],
      ['7', 'State the specific objectives, for benefits and for harms.', 'Objectives naming harms as well as benefits'],
    ]),
    ...it('Methods', [
      ['8', 'Say whether and how patients or the public took part in designing, running or reporting the trial.', 'Patient and public involvement (or a statement there was none)', 'new'],
      ['9', 'Describe the design (for example parallel group), the allocation ratio and the framework (superiority, non-inferiority, equivalence).', 'Design, ratio and framework'],
      ['10', 'Report important changes after the trial started, including outcomes or analyses that were not planned, and why.', 'Changes after the start, with reasons (or none)', 'revised'],
      ['11', 'Describe the settings and where the trial took place.', 'Countries and kinds of site'],
      ['12a', 'Give the eligibility criteria for participants.', 'Inclusion and exclusion criteria'],
      ['12b', 'Give the eligibility criteria for sites and for the people delivering the intervention, where relevant.', 'Site or deliverer criteria', 'new', true],
      ['13', 'Describe the intervention and the comparator in enough detail for someone else to repeat them.', 'Dose, route, timing, duration, who gave it'],
      ['14', 'Name the prespecified primary and secondary outcomes, with how and when each was measured, the analysis metric and how it was aggregated.', 'Each outcome with its measure, metric and time point'],
      ['15', 'Explain how harms were defined and how they were collected and assessed.', 'Definition and collection of harms', 'new'],
      ['16a', 'Explain how the sample size was worked out, with every assumption.', 'Effect, variability or rates, power, significance level, dropout'],
      ['16b', 'Describe any interim analyses and the rules for stopping.', 'Interim analyses and stopping rules (or none)'],
      ['17a', 'Say who generated the random allocation sequence and how.', 'Who and the method'],
      ['17b', 'Give the type of randomisation and any restriction, such as blocking or stratification, and the factors used.', 'Blocks or strata and their factors'],
      ['18', 'Describe how the sequence was put into practice and how allocation was concealed until assignment.', 'The mechanism and the concealment'],
      ['19', 'Say whether the people who enrolled and assigned participants could see the sequence.', 'Who could and could not see the list'],
      ['20a', 'Say who was blinded after assignment (participants, care providers, assessors, analysts).', 'The blinded roles'],
      ['20b', 'Where there was blinding, explain how it was achieved and how alike the interventions were.', 'Matching appearance and how blinding was kept'],
      ['21a', 'Describe the statistical methods used to compare groups for every outcome, harms included.', 'The test or model for each outcome'],
      ['21b', 'Define the analysis populations: who was included in each analysis and in which group.', 'Analysis sets and as-randomised or as-treated', 'new'],
      ['21c', 'Explain how missing data were handled in the analyses.', 'The method for missing data', 'new'],
      ['21d', 'Describe any other analyses, saying which were planned and which were not.', 'Subgroup or sensitivity analyses, planned or post hoc'],
    ]),
    ...it('Results', [
      ['22a', 'For each group, give the numbers randomised, the numbers who received the intended treatment, and the numbers analysed for the primary outcome (a flow diagram is strongly recommended).', 'Numbers by group at each stage'],
      ['22b', 'For each group, report losses and exclusions after randomisation, with the reasons.', 'Discontinuations by reason'],
      ['23a', 'Give the dates that define the periods of recruitment and of follow-up for benefits and harms.', 'Recruitment and follow-up dates'],
      ['23b', 'If the trial ended or was stopped, say why.', 'Why it ended (where relevant)', undefined, true],
      ['24a', 'Describe the intervention and comparator as they were actually delivered, including adherence.', 'Adherence or exposure as delivered', 'new'],
      ['24b', 'Describe the concomitant care each group received.', 'Rescue and other concomitant treatment', 'new'],
      ['25', 'Give a table of baseline demographic and clinical characteristics for each group.', 'A baseline table by group'],
      ['26', 'For each outcome and group, give the numbers analysed, the result, and the estimated effect with its precision (such as a 95% confidence interval); for binary outcomes give absolute and relative effects.', 'n, result, effect and CI for every outcome', 'revised'],
      ['27', 'Report all important harms or unintended effects in each group.', 'Adverse events by group, serious events'],
      ['28', 'Report any other analyses, saying which were planned and which were not.', 'Other analyses labelled planned or post hoc'],
    ]),
    ...it('Discussion', [
      ['29', 'Interpret the results in line with what was found, weighing benefits against harms and other evidence.', 'An interpretation that matches the results'],
      ['30', 'Discuss the limitations: sources of bias, imprecision, generalisability and, where relevant, multiplicity.', 'Limitations, including how far the results apply'],
    ]),
  ],
}

export const CONSORT_ABSTRACTS: Guideline = {
  id: 'consort-abstracts', name: 'CONSORT for Abstracts', version: '2008', covers: 'Abstracts of randomised trials (journal and conference)',
  url: 'https://www.equator-network.org/reporting-guidelines/consort-for-abstracts/', licence: 'Open access', built: true,
  note: 'Written for CONSORT 2010; use it alongside CONSORT 2025 until its authors align it. The authors item applies to conference abstracts.',
  items: it('Abstract', [
    ['A1', 'Title: say the study is randomised.'],
    ['A2', 'Authors: give contact details for the corresponding author (conference abstracts).', undefined, undefined, true],
    ['A3', 'Trial design: describe it (for example parallel group, cluster, non-inferiority).'],
    ['A4', 'Participants: the eligibility criteria and the settings where data were collected.'],
    ['A5', 'Interventions: what each group received.'],
    ['A6', 'Objective: the specific objective or hypothesis.'],
    ['A7', 'Outcome: the primary outcome, clearly defined.'],
    ['A8', 'Randomisation: how participants were allocated.'],
    ['A9', 'Blinding: whether participants, care givers and assessors were blinded.'],
    ['A10', 'Numbers randomised: per group.'],
    ['A11', 'Recruitment: the trial status (still recruiting or closed).'],
    ['A12', 'Numbers analysed: per group.'],
    ['A13', 'Outcome: the primary outcome result for each group, the estimated effect and its precision.'],
    ['A14', 'Harms: important adverse events or side effects.'],
    ['A15', 'Conclusions: a general interpretation of the results.'],
    ['A16', 'Trial registration: the registration number and the name of the registry.'],
    ['A17', 'Funding: the source of funding.'],
  ]),
}

export const CONSORT_HARMS: Guideline = {
  id: 'consort-harms', name: 'CONSORT Harms', version: '2022', covers: 'Reporting harms in randomised trials',
  url: 'https://www.equator-network.org/reporting-guidelines/consort-harms-2022/', licence: 'Open access', built: true,
  note: 'The 2022 extension added harms-specific points to CONSORT 2010. CONSORT 2025 took some into the main checklist (items 7, 15, 21a, 27); the points below are what the extension adds beyond them, in this app\'s words.',
  items: [
    ...it('Harms: methods', [
      ['H1', 'Say whether harms were collected systematically (asked for at set times, by a set method) or only when reported, and by whom.', 'Systematic or non-systematic collection'],
      ['H2', 'Give the period over which harms were collected and how severity and seriousness were graded.', 'Collection window and grading'],
      ['H3', 'Say how adverse events were coded (the dictionary and version) and how they were judged related.', 'Dictionary and causality method'],
      ['H4', 'Describe the analysis of harms: the population, how participants with several events were counted, and how events were grouped.', 'Safety set, counting per participant, grouping'],
    ]),
    ...it('Harms: results', [
      ['H5', 'For each group, report discontinuations caused by harms.', 'Withdrawals for adverse events'],
      ['H6', 'For each group, give the numbers with each harm, with denominators, separating serious events.', 'n/N per event, serious events separate'],
      ['H7', 'Report deaths, with their causes, by group.', 'Deaths (or none)'],
    ]),
    ...it('Harms: discussion', [
      ['H8', 'Weigh benefits and harms in the discussion, noting the limits of the harms data (size, duration, power).', 'Balanced discussion of harms'],
    ]),
  ],
}

export const SPIRIT_2025: Guideline = {
  id: 'spirit-2025', name: 'SPIRIT 2025', version: '2025', covers: 'Protocols of randomised trials',
  url: 'https://www.consort-spirit.org/', licence: 'Open access', built: true,
  note: 'Thirty-four items, plus a schedule of enrolment, interventions and assessments. New in 2025: an open science section and patient and public involvement; monitoring replaces auditing.',
  items: [
    ...it('Administrative information', [
      ['1a', 'A title that names the design, population and interventions, and says it is a protocol.', 'Design, population, interventions in the title'],
      ['1b', 'A structured summary of the design and methods, including the items of the WHO Trial Registration Data Set.', 'Summary or synopsis'],
      ['2', 'The protocol version number and date.', 'Version and date'],
      ['3a', 'The names, affiliations and roles of the people who wrote the protocol.', 'Named contributors and roles'],
      ['3b', 'The sponsor\'s name and contact details.', 'Sponsor and address'],
      ['3c', 'What the sponsor and funders do, and their authority over design, conduct, analysis and publication.', 'Sponsor and funder roles'],
      ['3d', 'The roles of the coordinating centre, committees, adjudicators and data management team.', 'Committees and their roles'],
    ]),
    ...it('Open science', [
      ['4', 'The registry name, number, link and date of registration (or the registry planned).', 'Registry, number and date'],
      ['5', 'Where the protocol and statistical analysis plan can be read.', 'Access to the protocol and SAP'],
      ['6', 'Where and how de-identified participant data, data dictionary and code will be shared.', 'Data sharing plan'],
      ['7a', 'Sources of funding and other support, such as drug supply.', 'Funding'],
      ['7b', 'The financial and other conflicts of interest of the principal investigators and steering committee.', 'Declared conflicts (or none)'],
      ['8', 'Plans to tell participants, professionals and the public about the results.', 'Dissemination plan'],
    ]),
    ...it('Introduction', [
      ['9a', 'Background and rationale, with the relevant studies of benefits and harms.', 'Why the trial is needed'],
      ['9b', 'Why this comparator was chosen.', 'Justification of the comparator'],
      ['10', 'Specific objectives for benefits and harms.', 'Objectives'],
    ]),
    ...it('Methods: involvement and design', [
      ['11', 'How patients or the public are involved in design, conduct and reporting.', 'Patient and public involvement', 'new'],
      ['12', 'The design, allocation ratio and framework.', 'Design, ratio, superiority or non-inferiority'],
    ]),
    ...it('Methods: participants, interventions and outcomes', [
      ['13', 'The settings and the countries where data will be collected.', 'Settings and countries'],
      ['14a', 'Participant eligibility criteria.', 'Inclusion and exclusion criteria'],
      ['14b', 'Eligibility criteria for sites and for the people delivering the intervention, where relevant.', 'Site and deliverer criteria', 'new', true],
      ['15a', 'The interventions in enough detail to repeat them, including who gives them and where materials are found.', 'Dose, route, schedule, who'],
      ['15b', 'Criteria for stopping or changing a participant\'s allocated intervention.', 'Stopping and modification criteria'],
      ['15c', 'How adherence is encouraged and checked.', 'Adherence monitoring'],
      ['15d', 'Concomitant care that is allowed and not allowed.', 'Permitted and prohibited medicines'],
      ['16', 'The primary and secondary outcomes, each with its measure, analysis metric, aggregation and time point.', 'Defined outcomes'],
      ['17', 'How harms are defined and collected.', 'Harms definitions and collection'],
      ['18', 'The participant timeline: enrolment, interventions, assessments and visits (a schedule diagram is recommended).', 'Schedule of activities'],
      ['19', 'The planned sample size and how it was worked out.', 'Sample size with assumptions'],
      ['20', 'How participants will be recruited to reach the sample size.', 'Recruitment strategy'],
    ]),
    ...it('Methods: assignment of interventions', [
      ['21a', 'Who generates the allocation sequence and how.', 'Who and the method'],
      ['21b', 'The type of randomisation, the factors and restrictions, kept in a separate document from enrolling staff.', 'Blocks, strata'],
      ['22', 'How the sequence is implemented and allocation concealed until assignment.', 'Concealment mechanism'],
      ['23', 'Whether those who enrol and assign participants can see the sequence.', 'Access to the sequence'],
      ['24a', 'Who is blinded after assignment.', 'Blinded roles'],
      ['24b', 'How blinding is achieved and how the interventions are made alike.', 'Matching'],
      ['24c', 'When unblinding is allowed and how it is done.', 'Emergency unblinding'],
    ]),
    ...it('Methods: data collection, management and analysis', [
      ['25a', 'How outcome and other data are collected, with quality steps and the reliability and validity of instruments.', 'Data collection and assessor training'],
      ['25b', 'How retention is encouraged, and what data are collected from participants who stop or deviate.', 'Retention and follow-up after stopping'],
      ['26', 'Data entry, coding, security and storage.', 'Data management'],
      ['27a', 'Statistical methods for comparing groups on each outcome, harms included.', 'Methods per outcome'],
      ['27b', 'The analysis populations and the group each participant is analysed in.', 'Analysis sets'],
      ['27c', 'How missing data will be handled.', 'Missing data method'],
      ['27d', 'Any other analyses, such as subgroup and sensitivity analyses.', 'Additional analyses'],
    ]),
    ...it('Methods: monitoring', [
      ['28a', 'The data monitoring committee: membership, role, independence and conflicts, or why there is none.', 'DMC'],
      ['28b', 'Interim analyses and stopping rules, and who decides to stop.', 'Interim analyses and stopping'],
      ['29', 'How often and how the trial is monitored, or why it is not.', 'Trial monitoring', 'revised'],
    ]),
    ...it('Ethics and dissemination', [
      ['30', 'Plans for approval by research ethics committees or institutional review boards.', 'Ethics approval'],
      ['31', 'How important protocol changes will be communicated to investigators, committees, registries and others.', 'Communicating amendments'],
      ['32a', 'Who obtains consent or assent, and how.', 'Consent process'],
      ['32b', 'Consent for other uses of data and samples, where relevant.', 'Ancillary use of samples', undefined, true],
      ['33', 'How personal information is protected.', 'Confidentiality'],
      ['34', 'Care after the trial, ancillary care, and compensation for harm.', 'Post-trial care and insurance'],
    ]),
  ],
}

// Guidelines the picker names; their checklists come in Phase 2 (and PRISMA-ScR when its update
// is published: Decision 5).
const later = (id: GuidelineId, name: string, version: string, covers: string, url: string, licence: string, note?: string): Guideline => ({ id, name, version, covers, url, licence, built: false, items: [], note })
export const CATALOGUE: Guideline[] = [
  CONSORT_2025, CONSORT_ABSTRACTS, CONSORT_HARMS, SPIRIT_2025,
  later('consort-ni', 'CONSORT Non-inferiority and equivalence', '2012', 'Non-inferiority and equivalence trials', 'https://www.equator-network.org/reporting-guidelines/consort-non-inferiority/', 'Open access', 'Built on CONSORT 2010; the checklist comes in Phase 2.'),
  later('consort-cluster', 'CONSORT Cluster', '2012', 'Cluster randomised trials', 'https://www.equator-network.org/reporting-guidelines/consort-cluster/', 'Open access', 'Built on CONSORT 2010; the checklist comes in Phase 2.'),
  later('strobe', 'STROBE', '2007', 'Cohort, case-control and cross-sectional studies', 'https://www.strobe-statement.org/', 'Free to use'),
  later('prisma-2020', 'PRISMA 2020', '2020', 'Systematic reviews (with PRISMA 2020 for Abstracts)', 'https://www.prisma-statement.org/', 'CC BY'),
  later('prisma-s', 'PRISMA-S', '2021', 'The literature search of a systematic review', 'https://www.prisma-statement.org/', 'CC BY'),
  later('prisma-scr', 'PRISMA-ScR', '2018 (update in progress)', 'Scoping reviews', 'https://resources.equator-network.org/reporting-guidelines/prisma-scr/', 'Open access', 'Its update is in progress; the app adds the new version when it is published.'),
  later('stard-2015', 'STARD 2015', '2015', 'Diagnostic accuracy studies', 'https://resources.equator-network.org/guidelines/stard/', 'Open access'),
  later('stard-ai', 'STARD-AI', '2025', 'Diagnostic accuracy studies of AI tests', 'https://www.equator-network.org/reporting-guidelines/the-stard-ai-reporting-guideline-for-diagnostic-accuracy-studies-using-artificial-intelligence/', 'Open access'),
  later('care', 'CARE', '2013', 'Case reports', 'https://resources.equator-network.org/reporting-guidelines/care/', 'Not stated'),
  later('arrive-2', 'ARRIVE 2.0', '2020', 'Animal research', 'https://arriveguidelines.org/', 'CC BY'),
  later('tripod-ai', 'TRIPOD+AI', '2024', 'Prediction models, by regression or machine learning', 'https://resources.equator-network.org/reporting-guidelines/tripod-statement/', 'CC BY'),
  later('tripod-llm', 'TRIPOD-LLM', '2025', 'Studies of large language models in health care', 'https://resources.equator-network.org/reporting-guidelines/tripod-statement/', 'Open access'),
  later('tripod-cluster', 'TRIPOD-Cluster', '2023', 'Prediction models from clustered data', 'https://resources.equator-network.org/reporting-guidelines/tripod-statement/', 'Open access'),
  later('tripod-srma', 'TRIPOD-SRMA', '2023', 'Systematic reviews of prediction models', 'https://resources.equator-network.org/reporting-guidelines/tripod-statement/', 'Open access'),
  later('cheers-2022', 'CHEERS 2022', '2022', 'Health economic evaluations', 'https://www.equator-network.org/reporting-guidelines/cheers/', 'CC BY'),
  later('squire-2', 'SQUIRE 2.0', '2015', 'Quality improvement studies', 'https://resources.equator-network.org/reporting-guidelines/squire/', 'Open access'),
  later('coreq', 'COREQ', '2007', 'Qualitative interviews and focus groups', 'https://www.equator-network.org/reporting-guidelines/coreq/', 'Publisher copyright'),
  later('tidier', 'TIDieR', '2014', 'Describing interventions (alongside CONSORT or SPIRIT)', 'https://www.equator-network.org/reporting-guidelines/tidier/', 'Open access', 'Parts of TIDieR were folded into CONSORT 2025 item 13; still useful for complex interventions.'),
  later('trend', 'TREND', '2004', 'Non-randomised evaluations of behavioural and public health interventions', 'https://www.equator-network.org/reporting-guidelines/trend/', 'Open access'),
]

export const guideline = (id: GuidelineId) => CATALOGUE.find((g) => g.id === id)!
export const itemKey = (g: GuidelineId, item: string) => `${g}:${item}`
export const allItems = (ids: GuidelineId[]) => ids.flatMap((g) => guideline(g).items.map((i) => ({ g, i, key: itemKey(g, i.id) })))
