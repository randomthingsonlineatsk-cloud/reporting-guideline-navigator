// Phase 3: authorship and contributions, disclosures and statements, publication ethics, and the
// submission pack. Sources (checked 25 November 2026): the ICMJE Recommendations (January 2026,
// annotated edition: authorship criteria II.A.2, AI use, authors' access to data, registration
// III.L.1, data sharing III.L.2, sources of support IV.A.3.a), the ICMJE Disclosure Form, CRediT
// (ANSI/NISO Z39.104-2022), GPP 2022 and the COPE flowcharts. All in this app's own words; every
// person, journal and company is fictional.

// ---------------------------------------------------------------- authorship
export const ICMJE_CRITERIA = [
  { id: 'c1', short: 'Contribution', text: 'A substantial contribution to the conception or design of the work, or to acquiring, analysing or interpreting its data.' },
  { id: 'c2', short: 'Drafting or revising', text: 'Drafting the work or revising it critically for important intellectual content.' },
  { id: 'c3', short: 'Final approval', text: 'Approving the final version to be published.' },
  { id: 'c4', short: 'Accountability', text: 'Agreeing to be accountable for all aspects of the work, so that questions about any part are investigated and resolved.' },
] as const
export type Criterion = (typeof ICMJE_CRITERIA)[number]['id']

export const CREDIT_ROLES = [
  ['Conceptualization', 'Ideas; the overarching aims of the research.'],
  ['Data curation', 'Managing, annotating and maintaining research data.'],
  ['Formal analysis', 'Statistical or other formal analysis of the data.'],
  ['Funding acquisition', 'Obtaining the funding for the project.'],
  ['Investigation', 'Doing the research: experiments or data collection.'],
  ['Methodology', 'Developing or designing the methods.'],
  ['Project administration', 'Managing and coordinating the research.'],
  ['Resources', 'Providing materials, patients, instruments or other resources.'],
  ['Software', 'Programming and software development.'],
  ['Supervision', 'Oversight and leadership, including mentoring.'],
  ['Validation', 'Verifying that results can be reproduced.'],
  ['Visualization', 'Preparing the figures and data presentation.'],
  ['Writing – original draft', 'Writing the first draft.'],
  ['Writing – review & editing', 'Critical review, commentary or revision.'],
] as const
export type Degree = 'lead' | 'equal' | 'supporting'

/** The only iDs shown in the app are ORCID's own documentation example (0000-0002-1825-0097, a
 * fictional researcher) and a copy with a wrong check digit, so no real person's iD appears. */
/** ORCID iD: 16 characters in four groups, the last a check character (ISO 7064 MOD 11-2). */
export function orcidValid(id: string): boolean {
  const s = id.trim().replace(/^https?:\/\/orcid\.org\//, '')
  if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(s)) return false
  const d = s.replace(/-/g, '')
  let total = 0
  for (const ch of d.slice(0, 15)) total = (total + Number(ch)) * 2
  const r = (12 - (total % 11)) % 11
  return d[15] === (r === 10 ? 'X' : String(r))
}

export interface Contributor { id: string; name: string; role: string; orcid: string; did: string; truth: Record<Criterion, boolean>; author: boolean; keyRole: string; note: string }
// Mission RG4: six contributors to the GLYDE-3 paper. "did" is what each person did; the key is
// what the ICMJE criteria make of it.
export const RG4_CONTRIBUTORS: Contributor[] = [
  { id: 'p1', name: 'Leena Varma, MD', role: 'Principal investigator, Mumbai site; steering committee chair', orcid: '0000-0002-1825-0097', did: 'Designed the trial with the sponsor, enrolled 22 participants, led the steering committee\'s interpretation of the results, revised every draft critically, approved the final version and agreed to answer for the whole paper.', truth: { c1: true, c2: true, c3: true, c4: true }, author: true, keyRole: 'Investigation', note: 'Meets all four criteria.' },
  { id: 'p2', name: 'Tomás Ferreira, MD', role: 'Investigator, São Paulo site', orcid: '', did: 'Enrolled 9 participants and collected their data. Was sent the draft but did not comment, and did not reply when asked to approve the final version. Has asked to be an author because his site enrolled patients.', truth: { c1: true, c2: false, c3: false, c4: false }, author: false, keyRole: 'Investigation', note: 'Acquiring data meets criterion 1 only. Enrolling patients is acknowledged (for example in the list of VERDANT-1 or GLYDE-3 investigators), not rewarded with authorship.' },
  { id: 'p3', name: 'Ingrid Holm, MSc', role: 'Trial statistician, Glyvant Pharmaceuticals', orcid: '0000-0002-1825-0098', did: 'Wrote the statistical analysis plan, ran the analyses, wrote the statistical methods and results, revised the discussion of the estimand, approved the final version and agreed to be accountable. The sponsor\'s communications team suggested leaving her off because she is an employee.', truth: { c1: true, c2: true, c3: true, c4: true }, author: true, keyRole: 'Formal analysis', note: 'Meets all four criteria. Leaving her off would be ghost authorship; her employment is disclosed, not hidden.' },
  { id: 'p4', name: 'Paul Gretsch, PhD', role: 'Vice President, Clinical Development, Glyvant Pharmaceuticals', orcid: '', did: 'Approved the trial budget and signed the protocol for the sponsor. Did not take part in the analysis or the writing, and has not read the manuscript. Has asked to be the last author.', truth: { c1: false, c2: false, c3: false, c4: false }, author: false, keyRole: 'Funding acquisition', note: 'Meets none of the criteria. Adding him would be guest (gift) authorship; his role can be acknowledged.' },
  { id: 'p5', name: 'Aisha Bello, PhD', role: 'Medical writer, Corran Medical Communications (fictional), paid by Glyvant', orcid: '', did: 'Wrote the first draft from the CSR and the authors\' outline, and made the revisions the authors asked for. Did not design the trial or interpret the data, and is not accountable for the work.', truth: { c1: false, c2: true, c3: false, c4: false }, author: false, keyRole: 'Writing – original draft', note: 'Drafting alone is criterion 2 only. Her support must be acknowledged with her name, qualifications, affiliation and who paid for it (GPP 2022); not acknowledging it would be ghost writing.' },
  { id: 'p6', name: 'Mei Tanaka, MD', role: 'Principal investigator, Osaka site; steering committee member', orcid: '', did: 'Enrolled 14 participants, interpreted the results with the steering committee, rewrote the discussion of hypoglycaemia, approved the final version and agreed to be accountable.', truth: { c1: true, c2: true, c3: true, c4: true }, author: true, keyRole: 'Writing – review & editing', note: 'Meets all four criteria.' },
]
export const RG4_AI_QUESTION = { q: 'One author suggests listing the AI writing assistant used to polish the English as an author. What should happen?', options: ['List it as an author, since it helped write the text', 'Do not list it; disclose its use in the acknowledgements, and the authors take responsibility for the text', 'List it in the CRediT roles as Writing – original draft', 'Say nothing, since it only edited the language'], answer: 1, why: 'ICMJE: chatbots and other AI tools are not authors. Use for writing assistance is disclosed in the acknowledgements, and humans are responsible for the text.' }

export interface Acknowledgement { ok: boolean; missing: string[] }
/** A medical writing acknowledgement to GPP 2022: name, qualifications, affiliation, funder. */
export function checkWritingAck(text: string): Acknowledgement {
  const need: [string, RegExp][] = [
    ['the writer\'s name', /Aisha Bello|[A-Z][a-z]+ [A-Z][a-z]+/],
    ['qualifications', /\b(?:PhD|MSc|MD|PharmD|MPharm|BSc|MPH|DPhil)\b/],
    ['affiliation', /\b(?:of|at)\s+[A-Z][\w &().-]{3,}/],
    ['who paid for it', /fund|paid|support(?:ed)? by|sponsored by/i],
    ['Good Publication Practice', /GPP|Good Publication Practice/i],
  ]
  const missing = need.filter(([, re]) => !re.test(text)).map(([w]) => w)
  return { ok: missing.length === 0, missing }
}

export interface AuthorAnswer { criteria: Partial<Record<Criterion, boolean>>; author?: boolean; roles: Record<string, Degree> }
export interface RG4Answers { people: Record<string, AuthorAnswer>; ack: string; ai?: number }

export function scoreRG4(a: RG4Answers) {
  let crit = 0, dec = 0, role = 0
  const detail: string[] = []
  for (const c of RG4_CONTRIBUTORS) {
    const x = a.people[c.id] ?? { criteria: {}, roles: {} }
    const right = ICMJE_CRITERIA.filter((k) => !!x.criteria[k.id] === c.truth[k.id]).length
    crit += right
    const dOk = x.author === c.author; if (dOk) dec++
    const rOk = c.keyRole in (x.roles ?? {}); if (rOk) role++
    if (right < 4 || !dOk || !rOk) detail.push(`${c.name}: ${right} of 4 criteria right; ${dOk ? 'decision right' : `should be ${c.author ? 'an author' : 'acknowledged, not an author'}`}${rOk ? '' : `; CRediT should include ${c.keyRole}`}. ${c.note}`)
  }
  const ack = checkWritingAck(a.ack), ai = a.ai === RG4_AI_QUESTION.answer
  const score = Math.round((crit / 24) * 40 + (dec / 6) * 30 + (role / 6) * 15 + (ack.ok ? 10 : 0) + (ai ? 5 : 0))
  return { score, passed: score >= 80, detail: [`${crit} of 24 criteria judged right; ${dec} of 6 authorship decisions right; ${role} of 6 key CRediT roles`, ack.ok ? 'The writing acknowledgement is complete' : `The writing acknowledgement lacks: ${ack.missing.join(', ')}`, ai ? 'The AI tool is not an author: right' : `The AI question: ${RG4_AI_QUESTION.why}`, ...detail] }
}

// ---------------------------------------------------------------- disclosures and statements
export const DISCLOSURE_ITEMS = [
  'All support for the present manuscript (funding, study materials, medical writing, article processing charges); no time limit',
  'Grants or contracts from any entity',
  'Royalties or licences',
  'Consulting fees',
  'Payment or honoraria for lectures, presentations, speakers bureaus, manuscript writing or educational events',
  'Payment for expert testimony',
  'Support for attending meetings or travel',
  'Patents planned, issued or pending',
  'Participation on a data safety monitoring board or advisory board',
  'Leadership or fiduciary role in another board, society, committee or advocacy group, paid or unpaid',
  'Stock or stock options',
  'Receipt of equipment, materials, drugs, medical writing, gifts or other services',
  'Other financial or non-financial interests',
]
/** What each GLYDE-3 author disclosed on the ICMJE form (items 2–13 cover the past 36 months). */
export const RG5_FORMS: { who: string; entries: Record<number, string> }[] = [
  { who: 'Leena Varma', entries: { 1: 'Glyvant Pharmaceuticals paid her institution per participant enrolled.', 4: 'Consulting fees from Glyvant Pharmaceuticals (2025).', 7: 'Travel to the investigator meeting paid by Glyvant.' } },
  { who: 'Ingrid Holm', entries: { 1: 'Employee of Glyvant Pharmaceuticals.', 11: 'Holds Glyvant Pharmaceuticals shares.' } },
  { who: 'Mei Tanaka', entries: { 1: 'Glyvant Pharmaceuticals paid her institution per participant enrolled.', 9: 'Advisory board for another diabetes drug maker (2024).' } },
]
export const RG5_SOURCES = {
  manuscript: 'Manuscript, Open science: "Glyvant Pharmaceuticals funded the trial and took part in its design, data collection and analysis; the authors had full access to the data and decided to publish."',
  registry: 'ClinicalTrials.gov record NCT99912301: first posted 1 December 2025; first participant enrolled 14 January 2026; the data sharing plan says individual participant data will be shared on request after publication.',
  cover: 'Cover letter: "…The English was edited with a general-purpose AI writing assistant, and the authors checked every change. The trial is registered as NCT99912301…"',
  protocol: 'Protocol Builder, GLV-12-301 version 2.0: NCT Number NCT99912301 (fictional).',
}
export interface Statement { id: string; label: string; text: string; inconsistent: boolean; why: string }
export const RG5_STATEMENTS: Statement[] = [
  { id: 's1', label: 'Funding and the funder\'s role', text: 'This trial was funded by Glyvant Pharmaceuticals. The funder had no role in the design, conduct or analysis of the trial.', inconsistent: true, why: 'The manuscript says the funder took part in the design, data collection and analysis. The statement must say what the funder actually did (ICMJE IV.A.3.a).' },
  { id: 's2', label: 'Competing interests', text: 'The authors declare no competing interests.', inconsistent: true, why: 'The disclosure forms list consulting fees, travel support, employment, shares and an advisory board. The statement must summarise them.' },
  { id: 's3', label: 'Trial registration', text: 'The trial was registered at ClinicalTrials.gov (NCT99912301) on 1 February 2026.', inconsistent: true, why: 'The registry shows registration on 1 December 2025, before the first enrolment on 14 January 2026. A date of 1 February 2026 would make the registration retrospective, which ICMJE journals do not accept; the statement is wrong.' },
  { id: 's4', label: 'Data sharing', text: 'Decisions about sharing individual participant data have not yet been made.', inconsistent: true, why: '"Undecided" is not acceptable under the ICMJE Recommendations, and the registry already states a plan (shared on request after publication).' },
  { id: 's5', label: 'Authors\' access to the data', text: 'All authors had full access to all the data in the trial and take responsibility for its integrity and the accuracy of the analysis.', inconsistent: false, why: 'Matches the manuscript.' },
  { id: 's6', label: 'Use of AI', text: 'No artificial intelligence tools were used in preparing this manuscript.', inconsistent: true, why: 'The cover letter says an AI writing assistant edited the English. Writing assistance by AI is disclosed in the acknowledgements.' },
  { id: 's7', label: 'Ethics and consent', text: 'The protocol was approved by the ethics committee at each site, and every participant gave written informed consent.', inconsistent: false, why: 'Nothing contradicts it.' },
  { id: 's8', label: 'Title page: registration number', text: 'Trial registration: NCT99912310.', inconsistent: true, why: 'The protocol, registry and cover letter give NCT99912301: the digits are transposed.' },
  { id: 's9', label: 'Medical writing support', text: 'Medical writing support was provided by Aisha Bello, PhD, of Corran Medical Communications, and was funded by Glyvant Pharmaceuticals in accordance with Good Publication Practice (GPP 2022).', inconsistent: false, why: 'Complete under GPP 2022.' },
  { id: 's10', label: 'Contributors', text: 'LV, IH and MT designed the trial or analysed and interpreted the data, revised the manuscript critically, approved the final version and are accountable for the work. LV is the guarantor.', inconsistent: false, why: 'Matches the authorship decision.' },
]
export function scoreRG5(flags: Record<string, boolean>) {
  const planted = RG5_STATEMENTS.filter((s) => s.inconsistent), clean = RG5_STATEMENTS.filter((s) => !s.inconsistent)
  const found = planted.filter((s) => flags[s.id]).length, falseAlarms = clean.filter((s) => flags[s.id]).length
  return { score: Math.max(0, Math.round((found / planted.length) * 100) - 10 * falseAlarms), passed: found === planted.length && falseAlarms <= 1, detail: [`${found} of ${planted.length} inconsistencies found; ${falseAlarms} consistent statements flagged`, ...RG5_STATEMENTS.filter((s) => !!flags[s.id] !== s.inconsistent).map((s) => `${s.label}: ${s.inconsistent ? 'inconsistent' : 'consistent'}. ${s.why}`)] }
}

// ---------------------------------------------------------------- ethics cases (RG15)
export interface Case { id: string; title: string; text: string; options: string[]; answer: number; why: string }
export const ETHICS_CASES: Case[] = [
  { id: 'e1', title: 'A preprint after acceptance', text: 'The VERDANT-1 paper is accepted. An author wants to post the accepted manuscript on a preprint server the day before publication.', options: ['Post it: preprints are always allowed', 'Check the journal\'s policy; most allow a preprint of the submitted version, and some restrict posting the accepted version', 'Post it under a different title', 'Ask the reviewers'], answer: 1, why: 'Preprint policies differ by journal and by version; tell the journal about any preprint and follow its policy.' },
  { id: 'e2', title: 'An embargo broken', text: 'A congress abstract is embargoed until the presentation at 08:00. The sponsor\'s press office plans a press release the evening before.', options: ['Go ahead: the abstract is already online for delegates', 'Hold the release until the embargo lifts', 'Release a summary without numbers', 'Ask a journalist to wait'], answer: 1, why: 'An embargo binds everyone who has the abstract; breaking it can lead the congress to withdraw the presentation.' },
  { id: 'e3', title: 'An invitation from a journal', text: 'An author receives an email inviting a paper to the "International Journal of Advanced Clinical Science", promising peer review in 72 hours and asking for the fee before review. The journal is not indexed and its editors cannot be traced.', options: ['Submit: fast review is good', 'Do not submit: these are warning signs of a predatory journal', 'Submit a different paper', 'Pay the fee and ask questions later'], answer: 1, why: 'Peer review promised in days, fees before review, no indexing and untraceable editors are classic warning signs.' },
  { id: 'e4', title: 'The same results twice', text: 'The GLYDE-3 primary results are published. The sponsor proposes a second paper to another journal with the same results "for a different audience", without citing the first.', options: ['Acceptable for a different audience', 'Duplicate publication: not acceptable unless it is a declared secondary publication with both editors\' agreement and a citation', 'Acceptable if the title changes', 'Acceptable in another language without telling anyone'], answer: 1, why: 'ICMJE allows secondary publication only with the editors\' agreement and a clear citation of the primary paper.' },
  { id: 'e5', title: 'An error after publication', text: 'After publication, the authors find that one table swapped the 5 mg and 10 mg columns. The conclusions do not change.', options: ['Retract the paper', 'Ask the journal to publish a correction', 'Ignore it', 'Fix it in the next paper'], answer: 1, why: 'An honest error that does not change the conclusions is corrected; retraction is for unreliable findings or misconduct.' },
  { id: 'e6', title: 'Dropping a result', text: 'The sponsor asks the writer to leave the itch outcome out of the paper because it was not significant.', options: ['Leave it out: space is limited', 'Report it: prespecified outcomes are reported whatever the result (CONSORT 2025 item 26; GPP 2022)', 'Move it to the discussion as a trend', 'Report only the 25 mg result'], answer: 1, why: 'Selective outcome reporting misleads; prespecified outcomes are reported, in the paper or a supplement.' },
  { id: 'e7', title: 'An author added late', text: 'During revision, the corresponding author wants to add a colleague who helped with the reviewers\' statistical questions.', options: ['Add the colleague without telling anyone', 'Ask the journal; all authors must agree in writing, and the colleague must meet all four ICMJE criteria', 'Refuse: authors cannot change', 'List the colleague in the acknowledgements only, without asking'], answer: 1, why: 'COPE: changes to authorship after submission need the agreement of every author and an explanation to the editor.' },
  { id: 'e8', title: 'A reviewer and AI', text: 'A reviewer wants to paste the confidential manuscript into a public AI chatbot to summarise it.', options: ['Fine, if the review is still the reviewer\'s own', 'Ask the journal for permission first: uploading a manuscript may breach confidentiality', 'Fine, if the chatbot is paid for', 'Fine for the methods section only'], answer: 1, why: 'ICMJE 2026: reviewers must ask the journal before using AI, because uploading a manuscript can break confidentiality.' },
]
export function scoreRG15(ans: Record<string, number>) {
  const right = ETHICS_CASES.filter((c) => ans[c.id] === c.answer).length
  return { score: Math.round((right / ETHICS_CASES.length) * 100), passed: right >= 6, detail: [`${right} of 8 right`, ...ETHICS_CASES.filter((c) => ans[c.id] !== c.answer).map((c) => `${c.title}: ${c.why}`)] }
}

// ---------------------------------------------------------------- submission pack
export interface Journal { id: string; name: string; scope: string; types: string[]; words: number; fee: string; indexed: boolean; review: string; flags: string[] }
export const JOURNALS: Journal[] = [
  { id: 'j1', name: 'Fennick Journal of Dermatology', scope: 'Skin disease: trials, observational studies, reviews', types: ['Randomised trial', 'Systematic review', 'Cohort'], words: 3500, fee: 'Optional open access, £2,900', indexed: true, review: 'Single-anonymous, about 6 weeks', flags: [] },
  { id: 'j2', name: 'Lantern Clinical Dermatology', scope: 'Clinical dermatology and case reports', types: ['Case report', 'Cohort', 'Randomised trial'], words: 2500, fee: 'Open access, £1,800', indexed: true, review: 'Double-anonymous, about 8 weeks', flags: [] },
  { id: 'j3', name: 'Orrin Journal of Metabolic Medicine', scope: 'Diabetes and metabolism', types: ['Randomised trial', 'Cohort'], words: 3500, fee: 'Subscription; open access optional', indexed: true, review: 'Single-anonymous', flags: [] },
  { id: 'j4', name: 'Wexley General Medicine', scope: 'General medicine, all specialties', types: ['Randomised trial', 'Systematic review'], words: 3000, fee: 'Open access, £4,200', indexed: true, review: 'Open review, about 10 weeks', flags: [] },
  { id: 'j5', name: 'International Journal of Advanced Clinical Science', scope: '"All areas of science and medicine"', types: ['Any'], words: 99999, fee: '$1,450, payable before review', indexed: false, review: '"Peer review in 72 hours"', flags: ['Fee asked before review', 'Review promised in 72 hours', 'Scope covers everything', 'Not indexed; editorial board cannot be traced'] },
  { id: 'j6', name: 'Global Open Medical Research Letters', scope: 'Medicine and allied sciences', types: ['Any'], words: 6000, fee: '$990', indexed: false, review: 'Not described', flags: ['Invitation by unsolicited email', 'Impact factor quoted from an unknown "index"', 'No retraction or ethics policy'] },
  { id: 'j7', name: 'Pell Pharmacoepidemiology', scope: 'Drug safety and pharmacoepidemiology', types: ['Cohort', 'Case-control'], words: 3500, fee: 'Subscription', indexed: true, review: 'Single-anonymous', flags: [] },
  { id: 'j8', name: 'Fennick Dermatology Letters', scope: 'Short reports in dermatology', types: ['Research letter', 'Case report'], words: 800, fee: 'Free', indexed: true, review: 'Editor review', flags: [] },
]
export function journalFit(j: Journal, article: { type: string; words: number; field: string }) {
  const out: { ok: boolean; why: string }[] = []
  out.push({ ok: j.flags.length === 0, why: j.flags.length ? `Warning signs of a predatory journal: ${j.flags.join('; ')}.` : 'No predatory warning signs.' })
  out.push({ ok: j.types.includes(article.type) || j.types.includes('Any'), why: `Article types: ${j.types.join(', ')}.` })
  out.push({ ok: article.words <= j.words, why: `Word limit ${j.words === 99999 ? 'none stated' : j.words}; the article has about ${article.words}.` })
  out.push({ ok: new RegExp(article.field, 'i').test(j.scope) || /general medicine/i.test(j.scope), why: `Scope: ${j.scope}.` })
  return out
}

export const COVER_NEEDS: [string, RegExp][] = [
  ['Names the article type and the journal', /randomi[sz]ed|trial|article|paper/i],
  ['Says the work is not published or under consideration elsewhere', /not (?:been )?(?:published|under consideration|submitted)|has not been published|original/i],
  ['Declares earlier presentation or a preprint (or none)', /presented|abstract|preprint|congress|meeting|no preprint/i],
  ['Gives the trial registration number', /NCT\d{8}/],
  ['Summarises competing interests (or says there are none)', /compet|conflict|interest|disclos/i],
  ['Says all authors approved the submission', /all authors (?:have )?(?:read|approved|agree)/i],
  ['Discloses any AI use (or says there was none)', /\bAI\b|artificial intelligence|no (?:AI|generative)/i],
]
export const checkCover = (t: string) => COVER_NEEDS.map(([label, re]) => ({ label, ok: re.test(t) }))

export interface Reviewer { id: string; name: string; where: string; conflict: string }
export const REVIEWERS: Reviewer[] = [
  { id: 'r1', name: 'Dr H. Lindqvist', where: 'University Hospital, Uppsala (fictional)', conflict: '' },
  { id: 'r2', name: 'Prof. A. Mehta', where: 'Western Coast Medical College, Mumbai (fictional)', conflict: 'Same institution as an author (A. Rao).' },
  { id: 'r3', name: 'Dr C. Duarte', where: 'Hospital das Clínicas research unit, Recife (fictional)', conflict: '' },
  { id: 'r4', name: 'Dr J. Okonkwo', where: 'Halcyon Ridge Pharmaceuticals', conflict: 'Employee of the sponsor.' },
  { id: 'r5', name: 'Prof. S. Whitcombe', where: 'Northbridge University (fictional)', conflict: 'Co-authored a paper with M. Keller in 2025.' },
  { id: 'r6', name: 'Dr P. Anand', where: 'Lakeview Skin Centre, Chennai (fictional)', conflict: '' },
]

// ---------------------------------------------------------------- responding to reviewers (RG6)
export interface Comment { id: string; reviewer: 1 | 2; text: string; kind: 'change' | 'rebut' | 'either'; needs: [string, RegExp][]; model: string }
const LOC = /¶\s?\d+|paragraph \d+|line[s]? \d+|page \d+|table \d+|figure \d+|supplementary/i
export const RG6_COMMENTS: Comment[] = [
  { id: 'q1', reviewer: 1, kind: 'change', text: 'The HECSI-75 results are given without confidence intervals.', needs: [['the confidence intervals', /confidence interval|95% CI/i]], model: 'We have added the 95% confidence intervals to ¶36: "differences from placebo were 9.0 percentage points (95% CI -24.6, 42.7) and 23.3 (95% CI -9.8, 56.5)".' },
  { id: 'q2', reviewer: 1, kind: 'change', text: 'Was the trial registered before the first participant was enrolled? Please give the date.', needs: [['the registration date', /2 March 2026/]], model: 'Yes. ¶8 now reads "registered … on 2 March 2026, before the first participant was enrolled" (first consent 6 April 2026).' },
  { id: 'q3', reviewer: 1, kind: 'either', text: 'Why are only 45 participants reported when the protocol plans 324?', needs: [['the first cohort and the planned size', /first cohort|324/i]], model: 'This article reports the first cohort of 45 participants, as ¶16 states; the trial continues to its planned 324. The limitations in ¶40 already say so: "it was not powered to test the hypothesis".' },
  { id: 'q4', reviewer: 2, kind: 'rebut', text: 'The conclusion is too cautious. With 31% success on 25 mg against 20% on placebo, the authors should say that lumiravostat is effective.', needs: [['why the data do not support it', /confidence interval|included no effect|not powered|imprecise|could not show|cannot show/i]], model: 'We respectfully keep the conclusion as it is. The 95% confidence interval for the difference (-19.2 to 41.7) includes no effect, and this cohort was not powered to test the hypothesis, so the data cannot show that the drug is effective.' },
  { id: 'q5', reviewer: 2, kind: 'change', text: 'The itch outcome is only in the supplement. It should be in the main text.', needs: [['the itch outcome', /itch/i]], model: 'We have moved the itch results into the main text, in a new paragraph after ¶36: "At least a 4-point improvement in worst itch …".' },
  { id: 'q6', reviewer: 2, kind: 'change', text: 'Two doses were each compared with placebo. How was multiplicity handled?', needs: [['multiplicity or the testing order', /multiplicity|fixed-sequence|testing order|familywise/i]], model: 'The protocol controls the familywise error with a fixed-sequence procedure; we have described it in ¶28: "…tested in a fixed sequence, 25 mg first…".' },
  { id: 'q7', reviewer: 1, kind: 'either', text: 'Who was blinded? "Double-blind" is not enough.', needs: [['the blinded roles', /participants|investigators|assessors|study team/i]], model: 'The blinded roles are listed in ¶27: participants, investigators, outcome assessors and the sponsor\'s study team. We have added "and the trial statisticians until database lock".' },
  { id: 'q8', reviewer: 2, kind: 'either', text: 'Please add an analysis by sex.', needs: [['that it would be post hoc', /post hoc|not prespecified|exploratory|was not planned/i]], model: 'An analysis by sex was not prespecified; with 45 participants it would be uninformative. If the editor wishes, we will add it to the supplement, labelled as post hoc and exploratory.' },
  { id: 'q9', reviewer: 1, kind: 'either', text: 'Will the data be shared?', needs: [['the data sharing arrangements', /data sharing|on request|shared|portal/i]], model: 'Yes: the data sharing statement in ¶10 says de-identified participant data will be shared on request through the sponsor\'s portal once the product is approved or development stops.' },
  { id: 'q10', reviewer: 2, kind: 'change', text: 'The serious herpes zoster case needs more detail.', needs: [['herpes zoster', /herpes zoster|zoster/i]], model: 'We have added the details to ¶38: "the herpes zoster (severe, judged possibly related) began on study day 47 and resolved 12 days later".' },
  { id: 'q11', reviewer: 1, kind: 'change', text: 'The funder\'s role is unclear: did the sponsor analyse the data?', needs: [['the funder\'s role', /sponsor|funder/i]], model: 'Yes. ¶11 now says: "The sponsor … collected and analysed the data; the authors had full access to the data and interpreted it".' },
  { id: 'q12', reviewer: 2, kind: 'rebut', text: 'The per-protocol population should be the primary analysis.', needs: [['why intention to treat is primary', /intention-to-treat|intent-to-treat|ITT|prespecified|randomi[sz]ation/i]], model: 'We have kept the intention-to-treat analysis as primary, as prespecified in the protocol and SAP: it preserves the randomisation. With no exclusions after randomisation in this cohort, the per-protocol result is the same.' },
]
const RUDE = /\bobviously\b|\bclearly (?:wrong|mistaken)|irrelevant|nonsense|the reviewer (?:has )?misunderstood|does not understand/i
const OVERCLAIM = /\bproves?\b|confirms? (?:the )?efficacy|definitive|clearly effective|is effective\b|will show/i
export interface ResponseCheck { ok: boolean; checks: { label: string; ok: boolean }[] }
export function checkResponse(c: Comment, text: string): ResponseCheck {
  const t = text.trim()
  const checks = [
    { label: 'Answers the point', ok: t.length >= 40 },
    ...c.needs.map(([label, re]) => ({ label: `Mentions ${label}`, ok: re.test(t) })),
    ...(c.kind === 'change' ? [{ label: 'Says where the change is (paragraph, line, table or supplement)', ok: LOC.test(t) }, { label: 'Quotes the new text', ok: /["“][^"”]{8,}["”]/.test(t) }] : []),
    ...(c.kind === 'rebut' ? [{ label: 'Gives a reason for not changing it', ok: /because|since|as (?:the|this|we)|so the|prespecified|cannot|could not|not powered|includes no effect|preserves/i.test(t) }] : []),
    { label: 'Courteous (no dismissive words)', ok: !RUDE.test(t) },
    { label: 'Claims no more than the data show', ok: !t.split(/(?<=[.!?])\s+/).some((x) => OVERCLAIM.test(x) && !/\bnot\b|cannot|n't|no evidence|neither/i.test(x)) },
  ]
  return { ok: checks.every((x) => x.ok), checks }
}
export function scoreRG6(res: Record<string, string>) {
  const ok = RG6_COMMENTS.filter((c) => checkResponse(c, res[c.id] ?? '').ok).length
  return { score: Math.round((ok / RG6_COMMENTS.length) * 100), passed: ok >= 10, detail: [`${ok} of 12 responses meet every check`, ...RG6_COMMENTS.filter((c) => !checkResponse(c, res[c.id] ?? '').ok).map((c) => `Comment ${c.id.slice(1)}: ${checkResponse(c, res[c.id] ?? '').checks.filter((x) => !x.ok).map((x) => x.label.toLowerCase()).join('; ')}. A model answer: ${c.model}`)] }
}
