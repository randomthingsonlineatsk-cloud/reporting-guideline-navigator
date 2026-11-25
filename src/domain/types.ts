// Shared types. Every saved object carries userId and classId so that the classroom mode can be
// added later without a migration.

export type GuidelineId =
  | 'consort-2025' | 'consort-abstracts' | 'consort-harms' | 'consort-ni' | 'consort-cluster'
  | 'spirit-2025' | 'strobe' | 'prisma-2020' | 'prisma-s' | 'prisma-scr' | 'stard-2015' | 'stard-ai'
  | 'care' | 'arrive-2' | 'tripod-ai' | 'tripod-llm' | 'tripod-cluster' | 'tripod-srma' | 'cheers-2022'
  | 'squire-2' | 'coreq' | 'tidier' | 'trend'

export interface Item {
  /** The item number as the guideline numbers it (1a, 17b, H3…). */
  id: string
  section: string
  /** The item in this app's own words (never the guideline's wording). */
  text: string
  /** What a reader looks for, in one line. */
  look?: string
  /** Only when it applies (for example site eligibility). Not applicable is accepted with a reason. */
  ifApplicable?: boolean
  /** New or revised in this version. */
  change?: 'new' | 'revised'
}

export interface Guideline {
  id: GuidelineId
  name: string
  /** Version label and year. */
  version: string
  /** What it covers. */
  covers: string
  /** The official checklist page (items are paraphrased here, so the learner checks the wording there). */
  url: string
  /** Whether the app has a full checklist for it yet (Phase 1: CONSORT 2025 and its abstract and harms items, SPIRIT 2025). */
  built: boolean
  items: Item[]
  note?: string
  /** Licence of the official wording, for the record (the app paraphrases every item whatever the licence). */
  licence: string
}

export interface Para { id: string; section: string; heading?: string; text: string }
export interface Manuscript {
  id: string
  study: string
  kind: 'article' | 'protocol'
  title: string
  journal: string
  /** Guidelines the answer key covers. */
  guidelines: GuidelineId[]
  paras: Para[]
  /** Clean answer key: for each `${guideline}:${item}`, the paragraphs that report it (empty = not reported). */
  key: Record<string, string[]>
  /** Items accepted as not applicable in this manuscript. */
  na: string[]
  note?: string
}

export type Status = 'reported' | 'partly' | 'missing' | 'na'
export interface Tag { paras: string[]; status: Status | ''; reason?: string; note?: string }

export interface Abstract { venue: string; text: string; updatedUtc: string }

export interface Project {
  id: string
  name: string
  userId: string
  classId: string
  createdUtc: string
  updatedUtc: string
  manuscriptId: string
  /** The learner's own text (when manuscriptId is 'own'). */
  ownText?: string
  guidelines: GuidelineId[]
  picker?: Record<string, string>
  tags: Record<string, Tag>
  abstracts: Abstract[]
  mission?: { id: string; startedUtc: string; variant: number; scoredUtc?: string }
  /** Missions RG8 and RG9: the numbers the learner marks as wrong (box id → true). */
  numbers?: Record<string, boolean>
  /** Phase 3: authorship decisions (RG4), statement flags (RG5), reviewer responses (RG6). */
  rg4?: { people: Record<string, { criteria: Partial<Record<'c1' | 'c2' | 'c3' | 'c4', boolean>>; author?: boolean; roles: Record<string, 'lead' | 'equal' | 'supporting'> }>; ack: string; ai?: number }
  rg5?: Record<string, boolean>
  rg6?: Record<string, string>
  /** The learner's own contributors, for manuscripts without a mission cast. */
  people?: { id: string; name: string; did: string }[]
  /** ICMJE disclosure form entries: author → item number → text. */
  forms?: Record<string, Record<number, string>>
  submission?: { journal?: string; cover?: string; reviewers?: string[] }
  /** Phase 4: the congress poster (RG13), the publication plan and its gap flags (RG14), and the
   *  summary brought back from the Plain Language Lab (RG16). */
  poster?: import('./phase4').Poster
  plan?: import('./phase4').PlanRow[]
  planFlags?: Record<string, string>
  plsReturn?: Record<string, unknown>
  /** The learner's own manuscript pack: byline, registration from the Protocol Builder, statements,
   *  title page and the revision record. */
  byline?: import('./manuscriptpack').Byline
  registration?: import('./manuscriptpack').Registration
  statements?: import('./manuscriptpack').Statements
  titlePage?: import('./manuscriptpack').TitlePageInfo
  revisions?: import('./manuscriptpack').Revision[]
  /** Phase 5: review and approval for each publication in the plan (plan row id → review). */
  reviews?: Record<string, import('./review').PubReview>
  platform?: import('./platform').Platform
  extras?: { visual?: import('./extras').Visual; script?: import('./extras').Script }
  history: { utc: string; what: string }[]
}

export interface MissionRun { score: number; passed: boolean; utc: string; detail: string[] }
export interface Progress {
  id: 'me'
  name: string
  userId: string
  classId: string
  quizzes: Record<string, { score: number; utc: string }>
  missions: Record<string, MissionRun>
  /** Mission RG1's answers: the guideline and extensions chosen for each case. */
  rg1: Record<string, { main: string; also: string[] }>
  /** Mission RG15's answers. */
  ethics?: Record<string, number>
}
