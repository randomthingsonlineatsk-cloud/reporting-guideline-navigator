// Lessons and quizzes for Phase 1. Each lesson names the source it teaches and the date it was
// checked; the quizzes are multiple choice, 6 of 8 to pass.
export interface Question { q: string; options: string[]; answer: number; why: string }
export interface Lesson { id: string; title: string; checked: string; sources: { label: string; url: string }[]; body: string[]; quiz: Question[] }

export const LESSONS: Lesson[] = [
  {
    id: 'choose', title: 'Choosing a reporting guideline', checked: '24 November 2026',
    sources: [{ label: 'EQUATOR Network library', url: 'https://www.equator-network.org/library/' }, { label: 'CONSORT and its extensions', url: 'https://www.equator-network.org/reporting-guidelines/consort/' }],
    body: [
      'A reporting guideline is a checklist of what a reader needs to judge a study: not how to do the study, but what to say about how it was done. Journals ask authors to send the completed checklist with the manuscript, with the page or line where each item is reported.',
      'The guideline follows the design. A randomised trial report uses CONSORT; its protocol uses SPIRIT; observational studies use STROBE; systematic reviews use PRISMA; diagnostic accuracy studies STARD; case reports CARE; prediction models TRIPOD+AI; economic evaluations CHEERS; quality improvement SQUIRE; interviews and focus groups COREQ; animal research ARRIVE.',
      'Extensions add what a particular design needs. A cluster trial adds the cluster extension, because the unit randomised is a group; a non-inferiority trial adds the margin and its justification; every trial abstract follows CONSORT for Abstracts. An extension is used with its main guideline, never instead of it.',
      'The traps: a protocol is not a results report (SPIRIT, not CONSORT); a single-arm trial is not randomised (no CONSORT checklist fits it); a pooled analysis of trials the sponsor chose is not a systematic review; a case series is not a case report. When nothing fits, the EQUATOR Network library is searched by design and field rather than forcing the nearest checklist.',
      'Versions matter. CONSORT 2025 replaced CONSORT 2010 in April 2025, and SPIRIT 2025 replaced SPIRIT 2013 at the same time; TRIPOD+AI replaced TRIPOD 2015 in 2024. Several CONSORT extensions were written for CONSORT 2010 and are used alongside CONSORT 2025 until their authors align them.',
    ],
    quiz: [
      { q: 'A paper reports the results of a trial that randomised 30 schools. Which checklists apply?', options: ['CONSORT 2025 alone', 'CONSORT 2025 with the cluster extension and CONSORT for Abstracts', 'STROBE', 'SPIRIT 2025'], answer: 1, why: 'Schools were randomised, so the cluster extension is added to CONSORT 2025; every trial abstract follows CONSORT for Abstracts.' },
      { q: 'Which guideline covers a trial protocol?', options: ['CONSORT 2025', 'SPIRIT 2025', 'PRISMA 2020', 'TIDieR'], answer: 1, why: 'SPIRIT is for protocols; CONSORT is for the results.' },
      { q: 'A single-arm phase 2 trial of a new medicine. What is the right advice?', options: ['Use CONSORT 2025', 'Use STROBE', 'No main checklist fits: search the EQUATOR library and report what applies', 'Use CARE'], answer: 2, why: 'CONSORT is for randomised trials; a single-arm trial has no CONSORT checklist.' },
      { q: 'A model that predicts eczema flares, built with machine learning. Which guideline?', options: ['STARD 2015', 'TRIPOD+AI', 'TRIPOD 2015', 'CONSORT 2025'], answer: 1, why: 'TRIPOD+AI (2024) covers regression and machine learning prediction models and replaced TRIPOD 2015.' },
      { q: 'A sponsor pools the individual data of its three phase 3 trials. Is this a systematic review?', options: ['Yes: use PRISMA 2020', 'No: the trials were not found by a systematic search', 'Yes, if there is a forest plot', 'Only if it is published'], answer: 1, why: 'A systematic review starts from a systematic search; trials chosen by the sponsor are a pooled analysis.' },
      { q: 'What does a reporting guideline tell authors?', options: ['How to design the study', 'What to report so readers can judge the study', 'Which statistical test to use', 'Which journal to choose'], answer: 1, why: 'Reporting guidelines are about what is reported, not how the study is done.' },
      { q: 'An extension is used…', options: ['instead of the main guideline', 'with the main guideline', 'only for abstracts', 'only by journals'], answer: 1, why: 'An extension adds items for a design; the main checklist still applies.' },
      { q: 'A review that maps which outcome measures trials have used, without appraising them. Which guideline?', options: ['PRISMA 2020', 'PRISMA-ScR', 'CARE', 'COREQ'], answer: 1, why: 'Mapping the evidence is a scoping review: PRISMA-ScR (its update is in progress).' },
    ],
  },
  {
    id: 'consort', title: 'CONSORT 2025', checked: '24 November 2026',
    sources: [{ label: 'CONSORT 2025 statement (PLOS Medicine, CC BY 4.0)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11996237/' }, { label: 'CONSORT and SPIRIT website', url: 'https://www.consort-spirit.org/' }],
    body: [
      'CONSORT 2025 was published on 14 April 2025 in five journals at once. It has 30 items in six sections (title and abstract, open science, introduction, methods, results, discussion) and recommends a diagram of the flow of participants.',
      'The open science section is new: the registry, number and date of registration (item 2); where the protocol and statistical analysis plan can be read (3); how the data, data dictionary and code can be obtained (4); funding and the funder\'s role (5a); and the authors\' conflicts of interest (5b).',
      'Seven items are new, among them patient and public involvement (8), site and deliverer eligibility (12b), how harms were defined and assessed (15), who was analysed (21b), how missing data were handled (21c), and the intervention as actually delivered and the concomitant care (24a, 24b). Items 3, 10 and 26 were revised; the separate generalisability item was folded into the limitations (30).',
      'Many items are commonly reported too weakly rather than left out. A sample size without the assumed effect and power, randomisation without the method of concealment, "double-blind" without saying who was blinded, results without confidence intervals: each is a partial report. When you check a manuscript, ask whether a reader could repeat the trial and judge its risk of bias from the text alone.',
      'Journals ask for the completed checklist with the location of each item. A careful checklist marks an item as not applicable only with a reason (for example item 23b, why the trial stopped, when it did not stop).',
    ],
    quiz: [
      { q: 'How many items does CONSORT 2025 have?', options: ['25', '30', '34', '37'], answer: 1, why: 'Thirty items in six sections.' },
      { q: 'Which section is new in CONSORT 2025?', options: ['Discussion', 'Open science', 'Ethics', 'Recruitment'], answer: 1, why: 'Registration, protocol access, data sharing, funding and conflicts sit in the new open science section.' },
      { q: 'A paper says "the trial was double-blind". Which item is only partly reported?', options: ['20a: it does not say who was blinded', '9: the design', '2: registration', 'None'], answer: 0, why: 'Item 20a asks who was blinded after assignment; "double-blind" alone does not say.' },
      { q: 'Item 2 needs the registry, the number and…', options: ['the funder', 'the date of registration', 'the sample size', 'the ethics committee'], answer: 1, why: 'The date shows whether the trial was registered before enrolment.' },
      { q: 'Which is new in 2025?', options: ['Patient and public involvement (item 8)', 'Eligibility criteria (12a)', 'Baseline table (25)', 'Background (6)'], answer: 0, why: 'Item 8 asks how patients or the public were involved.' },
      { q: 'A results section gives percentages and P values but no confidence intervals. Which item is weak?', options: ['22a', '26', '28', '5a'], answer: 1, why: 'Item 26 asks for the effect estimate with its precision.' },
      { q: 'How should "not applicable" be marked on a checklist?', options: ['Leave the item blank', 'With the reason it does not apply', 'Mark it reported', 'Delete the item'], answer: 1, why: 'Not applicable needs a reason a reviewer can check.' },
      { q: 'Which item covers how missing data were handled?', options: ['21c', '16a', '10', '27'], answer: 0, why: 'Item 21c is new in 2025.' },
    ],
  },
  {
    id: 'spirit', title: 'SPIRIT 2025 and the protocol', checked: '24 November 2026',
    sources: [{ label: 'SPIRIT 2025 statement (JAMA, 28 April 2025)', url: 'https://jamanetwork.com/journals/jama/fullarticle/2833408' }, { label: 'CONSORT and SPIRIT website', url: 'https://www.consort-spirit.org/' }],
    body: [
      'SPIRIT 2025 lists the minimum content of a trial protocol in 34 items, with a schedule of enrolment, interventions and assessments. It was updated with CONSORT 2025 so that the two match: what the protocol plans, the report says was done.',
      'Like CONSORT 2025, it has an open science section: registration, access to the protocol and analysis plan, data sharing, funding, conflicts of interest and dissemination. Patient and public involvement is a new item, and trial monitoring replaced auditing.',
      'A protocol written to ICH M11, as in the Protocol Builder, covers most SPIRIT items, but not all by structure alone. The names and roles of the protocol\'s authors, the recruitment strategy, the declared conflicts of interest and the date of registration are easy to leave out because no data field holds them.',
      'Checking a protocol against SPIRIT works like checking a paper against CONSORT: find where each item is, judge whether it is complete, and list what is missing so the next version can add it. Journals that publish protocols ask for the SPIRIT checklist with the submission.',
    ],
    quiz: [
      { q: 'How many items does SPIRIT 2025 have?', options: ['25', '30', '34', '51'], answer: 2, why: 'Thirty-four items, plus a schedule diagram.' },
      { q: 'SPIRIT is for…', options: ['trial results', 'trial protocols', 'systematic reviews', 'case reports'], answer: 1, why: 'SPIRIT covers protocols.' },
      { q: 'Which item asks how participants will be recruited?', options: ['14a', '18', '20', '25b'], answer: 2, why: 'Item 20 asks for the recruitment strategy to reach the sample size.' },
      { q: 'A protocol gives the registry numbers but no date. Item 4 is…', options: ['reported', 'partly reported', 'not applicable', 'not a SPIRIT item'], answer: 1, why: 'Item 4 asks for the date of registration too.' },
      { q: 'What replaced auditing in SPIRIT 2025?', options: ['Trial monitoring', 'Data sharing', 'Ethics approval', 'Nothing'], answer: 0, why: 'Item 29 is about trial monitoring.' },
      { q: 'Why were SPIRIT and CONSORT updated together?', options: ['To save time', 'So the protocol and the report match item for item', 'Because journals asked', 'They were not'], answer: 1, why: 'The two checklists are aligned so the report follows what the protocol planned.' },
      { q: 'Which item covers emergency unblinding?', options: ['24c', '22', '15b', '33'], answer: 0, why: 'Item 24c: when unblinding is allowed and how.' },
      { q: 'A protocol says committee members declare conflicts, but not what they are. Item 7b is…', options: ['reported', 'partly reported', 'not applicable', 'an ethics item'], answer: 1, why: 'Item 7b asks for the conflicts themselves (or that there are none).' },
    ],
  },
  {
    id: 'abstracts', title: 'Writing a trial abstract', checked: '24 November 2026',
    sources: [{ label: 'CONSORT for Abstracts', url: 'https://www.equator-network.org/reporting-guidelines/consort-for-abstracts/' }, { label: 'ICMJE Recommendations (January 2026)', url: 'https://www.icmje.org/recommendations/' }],
    body: [
      'Many readers see only the abstract, so CONSORT for Abstracts asks for 17 items: the design, participants, interventions, objective, primary outcome, randomisation and blinding; the numbers randomised and analysed, the recruitment status, the primary result with its effect and precision, and harms; the conclusions, the registration and the funder.',
      'Each venue sets its own structure and limit, and counts it its own way: some count words in the body only, some include the headings, congresses often count characters including spaces. Read the rule before writing, and count the way the venue counts.',
      'Every number in an abstract must match the paper and the tables. The commonest errors are a percentage that does not follow from n and N, a difference reported without its confidence interval, and a conclusion stronger than the result.',
      'Conference abstracts carry an embargo: the results may not be made public before the presentation time the congress sets. An abstract shown before at another meeting is an encore and must say so. The ICMJE does not count a meeting abstract as prior publication of a full paper.',
    ],
    quiz: [
      { q: 'How many items does CONSORT for Abstracts have?', options: ['10', '17', '25', '30'], answer: 1, why: 'Seventeen items, one of them (authors) for conference abstracts.' },
      { q: 'A venue counts "words in the four sections; headings not counted". Your abstract has 240 body words and 6 heading words. The count is…', options: ['246', '240', '234', '250'], answer: 1, why: 'Only body words count under that rule.' },
      { q: 'Which belongs in a trial abstract?', options: ['Citations to earlier trials', 'The registration number', 'A table', 'The full eligibility list'], answer: 1, why: 'Item A16: the registry and number.' },
      { q: 'The primary result in an abstract should give…', options: ['the P value only', 'the result per group, the effect and its precision', 'the conclusion only', 'the sample size calculation'], answer: 1, why: 'Item A13.' },
      { q: 'An abstract says 5 of 16 participants (35.0%). What is wrong?', options: ['Nothing', '5 of 16 is 31.3%', 'Percentages are not allowed', '16 is the wrong denominator'], answer: 1, why: 'Check that every percentage follows from n and N.' },
      { q: 'An abstract presented at one congress is shown again at another. It must be…', options: ['rewritten', 'labelled an encore', 'withdrawn', 'published first'], answer: 1, why: 'Encore presentations are labelled as such.' },
      { q: 'Does a meeting abstract count as prior publication under the ICMJE Recommendations?', options: ['Yes', 'No', 'Only for posters', 'Only in Europe'], answer: 1, why: 'Presentation at a meeting does not prevent full publication.' },
      { q: 'Which conclusion fits a result whose confidence interval includes no effect?', options: ['The drug was effective', 'No clear difference was shown; the trial was too small to rule a benefit in or out', 'The drug is harmful', 'Equivalent to placebo'], answer: 1, why: 'A wide interval including no effect shows neither benefit nor equivalence.' },
    ],
  },
]
export const QUIZ_PASS = 6
