# Reporting Guideline Navigator

A browser-based practice app for publication writing: choose the right reporting guideline for a
study design, check a manuscript against it item by item, and write a structured abstract. It is
the fourth medical writing app in the series, after the Protocol Builder, the Plain Language Lab
and the CSR & Narrative Studio.

**Live app:** https://randomthingsonlineatsk-cloud.github.io/reporting-guideline-navigator/

Training only. The studies, authors, journals and congresses are fictional; the reporting
guidelines are real and named for education, and every checklist item is written in the app's own
words, with a link to the official checklist.

## What is in Phase 1

1. **Guideline picker.** A short wizard (what the article reports, whether allocation was random,
   the unit randomised, the framework, harms, complex interventions, the observational design,
   AI tests, prediction model method, review type) that names the main guideline, the extensions
   that also apply, the reason for each, and the traps: a protocol is SPIRIT not CONSORT, a
   single-arm trial has no CONSORT checklist, a pooled analysis of sponsor-chosen trials is not a
   systematic review, a case series is not a case report. It covers 23 guidelines and extensions.
2. **Checklist workspace.** The manuscript on one side, numbered by paragraph; the checklist on
   the other. Select an item, click the paragraphs that report it, and mark it reported, partly
   reported, not reported, or not applicable with a reason. A written rule (a regular expression
   anyone can read) flags tagged text that looks weak, for example a registration without its
   date or a sample size without the power, and says what it looked for. Filters for items still
   to do and items flagged; `j` and `k` move between items.
3. **Checklists:** CONSORT 2025 (30 items, 42 with sub-items, published 14 April 2025), CONSORT
   for Abstracts (17 items, 2008), the harms points the CONSORT Harms 2022 extension adds beyond
   CONSORT 2025, and SPIRIT 2025 (34 items, 28 April 2025). The new and revised 2025 items are
   marked.
4. **Manuscripts**, written from the same study outputs as the TLF Programming Lab and the CSR &
   Narrative Studio, so every number can be traced to a table cell:
   - the **VERDANT-1 (HRP-301)** primary paper on lumiravostat (Ostrevia) in chronic hand eczema,
     reporting the first cohort of 45 participants (the protocol plans 324; the shared fictional
     dataset holds the first 45, and the paper says so);
   - the **GLYDE-3 (GLV-12-301)** primary paper on GLV-12 in type 2 diabetes, a shorter practice
     paper with partly reported items;
   - the **VERDANT-1 protocol, version 2.0**, rendered from the Protocol Builder's project for the
     SPIRIT 2025 check, with its genuine gaps;
   - your own text, pasted as plain text.
5. **Abstract builder.** Three fictional venues, each with its own headings, limit and way of
   counting (words in the body only; words including headings; characters with spaces). Checks
   for every CONSORT for Abstracts item, the limit, the headings, no citations, and every number
   against the study outputs and the paper: a percentage that does not follow from n and N is
   caught. The study's tables are beside the editor.
6. **Missions** scored by written rules: RG1 choose the guideline (12 studies, pass 10), RG2 find
   the 15 CONSORT items planted out of the VERDANT-1 paper (pass 12, at most 2 wrongly marked as
   reported), RG3 write the VERDANT-1 abstract (every item, within 250 words, no number outside
   the outputs), RG12 the SPIRIT check of the protocol (4 of its 5 gaps). Twelve more missions
   come with the later phases.
7. **Learn:** four lessons with eight-question quizzes (choosing a guideline, CONSORT 2025, SPIRIT
   2025, writing a trial abstract), each with its sources and the date it was checked.
8. **Export:** the completed checklist as Word, HTML (print to PDF) or CSV, with paragraph numbers
   where journals ask for page and line; abstracts as text; the project as one file to import in
   another browser.

## What Phase 2 added

1. **Twelve more checklists**, every item in the app's own words, numbered as each statement
   numbers them: STROBE (22 items), PRISMA 2020 (27, 42 with sub-items), PRISMA-S (16), STARD 2015
   (30), CARE (13), CHEERS 2022 (28), TRIPOD+AI (27), SQUIRE 2.0 (18), COREQ (32), ARRIVE 2.0 (the
   Essential 10 and the Recommended Set), and the points the CONSORT non-inferiority and cluster
   extensions add. Sixteen checklists in all; the rules flag weak reporting for the items a rule
   can judge.
2. **Five full manuscripts**, each with a planted version for a mission: the OSTREG registry
   cohort of serious infections on Ostrevia (STROBE, RG7); a systematic review of oral kinase
   inhibitors with its flow of studies (PRISMA 2020 and PRISMA-S, RG8); the CX-7 swab assay's
   diagnostic accuracy with its 2×2 table (STARD 2015, RG9); a herpes zoster case report (CARE,
   RG10); and a cost-utility analysis of Ostrevia (CHEERS 2022, RG11). Every derived number
   (rates, sensitivity and specificity with Wilson intervals, the ICER, the flow counts) is
   computed from the same inputs as the text.
3. **Six practice excerpts**: a non-inferiority trial, a cluster trial, an animal study, a
   prediction model, a quality improvement project and an interview study.
4. **Number checks** in RG8 and RG9: tick only the count in the flow of studies that does not add
   up, or only the accuracy figure that does not follow from the 2×2 table (in RG9 the wrong
   specificity is in both the abstract and the results). Ticking a correct number fails the check.
5. **Rule checks hidden in missions** until the first score, so the flags cannot point at the
   planted gaps; after scoring they explain the result. Of the 50 items planted across RG7 to RG11,
   the rules can flag 48; the other two (whether reviewers screened independently in RG8, and the
   patient's history in RG10) need a reader's judgement.
6. **Your own .docx**: read in the browser (paragraphs and headings), as well as pasted text.
7. **Four more lessons** with quizzes: observational studies and case reports; systematic reviews
   and searches; diagnostic accuracy and prediction models; economic evaluations, quality
   improvement, qualitative and animal studies.

## What Phase 3 added

1. **Authorship** (RG4): six contributors to the GLYDE-3 paper, each judged against the four ICMJE
   criteria; author or acknowledged; the 14 CRediT roles with lead, equal or supporting; a
   GPP 2022 medical writing acknowledgement checked for name, qualifications, affiliation, funder
   and GPP; ORCID check digits (ISO 7064 MOD 11-2; the only iDs shown are ORCID's own documentation
   example and a copy with a wrong digit); an AI tool proposed as an author. The cases are guest,
   ghost and gift authorship as the COPE guidance describes them.
2. **Disclosures and statements** (RG5): the 13 items of the ICMJE Disclosure Form for each author
   (item 1 with no time limit, items 2 to 13 for the past 36 months), a competing interests summary
   from the forms, and ten drafted statements for GLYDE-3 to check against the manuscript, the
   forms, the registry record, the protocol and the cover letter. Six are inconsistent: the
   funder's role, competing interests, a registration date after the first enrolment, an
   "undecided" data sharing statement, an AI statement that contradicts the cover letter, and a
   mistyped registration number.
3. **Submission pack**: journal fit against eight fictional journals (two with the warning signs of
   predatory publishing), a cover letter checked for what editors need, and suggested reviewers
   checked for conflicts.
4. **Response to reviewers** (RG6): twelve comments on the VERDANT-1 paper. Each response is checked
   for the point it must address, where the change is and the quoted new text (or a reason for
   not changing), courtesy, and claiming no more than the data show; each comment has a model
   answer shown after scoring.
5. **Publication ethics cases** (RG15): a preprint, an embargo, a predatory journal, duplicate
   publication, a correction, a dropped outcome, an author added late, and a reviewer using AI.
6. **Four more lessons** (twelve in all): authorship and CRediT; disclosures, statements and AI use;
   publication ethics; submitting and answering reviewers.

In every mission, the checks that would point at the answers stay hidden until the first score.

## What Phase 4 added

1. **Congress poster** (RG13): an A0 poster for the (fictional) Lantern Dermatology Congress 2027,
   with the congress's word and text-size rules, three key messages, the HECSI figure drawn from
   the TLF Lab's data frame, a QR code to the app's own VERDANT-1 study page (`#/study/HRP-301`),
   the disclosures, the GPP 2022 writing acknowledgement and the encore label. Twelve checks;
   every number must be in the study outputs. Downloads as HTML to print to PDF at A0.
2. **Publication plan** (RG14): a GPP 2022 plan for Ostrevia across congresses and journals, with
   five planted gaps to name (secondary results before the primary, authors chosen after drafting,
   an unlabelled encore, a stopped trial left unpublished, undisclosed writing support). Downloads
   as an HTML plan and a CSV tracker.
3. **Plain language summary** (RG16): the VERDANT-1 article goes to the Plain Language Lab as a file,
   the summary is written there against its checks, and the finished summary comes back here,
   where it is accepted only if it was written from this article and every check passed.
4. **Certificate**: the six core missions and the thirteen quizzes, with a distinction for all
   sixteen missions. The code (prefix `RG-`) is verified on the pharmolecule Regulatory Skills
   Passport.
5. **Ostrevia journey, step 13** (Publish the primary results): the Export page of a VERDANT-1
   project gives the hand-off the pharmolecule journey page checks.
6. **Classroom mode**: on the shared classroom server (`/rg/v1`, `rg_` tables). Instructors set
   missions as assignments; students send their latest run; instructors re-score it in their own
   browser with this app's scoring.
7. **A thirteenth lesson**: posters, publication plans and plain language summaries.

The QR code is drawn with qrcode-generator (MIT).

## Phase 5: how publication teams work now

1. **Review and approval** (Publication plan page): each publication has versions, author review
   rounds with comments that must be resolved before a round closes, and sign-off by every author,
   a medical reviewer and a compliance reviewer. A new version cancels earlier sign-offs. The audit
   log is a hash chain, so an edited or deleted entry shows. Milestones (database lock, submission,
   decision, publication) feed a metrics panel: acceptance rate, median days from lock to submission
   and from submission to decision, and publications past their target.
2. **Scientific communication platform**: five core statements, each tied to the study outputs
   that support it, and a lexicon of agreed terms. Claim rules flag superlatives, "safe", a
   "significant" the p-values do not back, overstated effects and numbers that are not in the
   source. The poster messages, abstract conclusions, visual abstract and talk are each matched to
   the closest core statement.
3. **Visual and video**: a visual abstract drawn as SVG, a video abstract (3 minutes) or podcast
   (10 minutes) script timed at 150 words a minute, and accessibility checks: alt text that gives
   the main result, WCAG text contrast, 3:1 for lines and shapes, and colours that stay apart for
   protanopia, deuteranopia and tritanopia (simulated with the Machado 2009 matrices).
4. **AI use log** (Disclosures page): every use of an AI tool with its version, task, what went in,
   and the named person who checked the output. Images of data, peer review, personal data and
   confidential material in an unapproved tool are refused. The disclosure is written from the log
   (writing help in the acknowledgements, research use in the methods) and fills the statements.
5. **Congress talk**: slides with the disclosure slide second, a slide limit for the slot, spoken
   notes timed at 130 words a minute, a rehearsal timer and a 16:9 export; an embargo checker for
   press releases, posts and online publication against two fictional congresses' rules; and an
   encore tracker built from the publication plan.
6. **Claim sources**: every claim in the abstract, introduction, results and discussion tied to a
   study output (its numbers checked), a document section or a reference with its page; the
   reference list checked against fictional retraction notices.

## Your own manuscript pack (added after Phase 4)

In any project that is not a mission:

1. **Author order and group** (Authorship page): put the authors in order with their affiliations,
   choose the corresponding author (email and postal address), and name a study group in the byline
   (authors and the group, authors for the group, or the group alone) with its non-author
   collaborators listed by name, place and role.
2. **Statements** (Disclosures page): registration, funding, ethics, data sharing and AI use, with
   live rules. Registration after the first enrolment is flagged until it is explained; an
   "undecided" data sharing statement is refused; an AI tool listed as an author is refused.
3. **Registration from the Protocol Builder**: open its project file or application bundle and the
   NCT, EU CT or CTRI number is read from the protocol, so a mistyped number in the statements or
   the abstract is caught.
4. **Title page** (Submission page): title, running title, byline with numbered affiliations, the
   corresponding author, word counts taken from the manuscript, tables, figures, keywords and the
   registration, downloaded as HTML.
5. **Revision record** (Submission page): paste the reviewers' comments and each becomes a numbered
   row; every row says whether the paper changed, where, and quotes the new text, or gives the
   reason. Downloads as a table for the resubmission.

## Sources (checked 24 and 25 November 2026)

- CONSORT 2025 statement, PLOS Medicine 2025 (CC BY 4.0): https://pmc.ncbi.nlm.nih.gov/articles/PMC11996237/
- SPIRIT 2025 statement, JAMA 2025: https://jamanetwork.com/journals/jama/fullarticle/2833408
- CONSORT and its extensions on the EQUATOR Network: https://www.equator-network.org/reporting-guidelines/consort/
- The EQUATOR Network's note that it makes no copyright claim over guideline content (copyright
  stays with each publisher): https://resources.equator-network.org/reporting-guidelines/care/faqs.html
- ICMJE Recommendations, January 2026 update: https://www.icmje.org/recommendations/
- STROBE (PLoS Medicine 2007): https://pmc.ncbi.nlm.nih.gov/articles/PMC2636253
- PRISMA 2020 (BMJ 2021;372:n71): https://eprints.whiterose.ac.uk/173303/1/bmj.n71.full.pdf
- STARD 2015 (BMJ 2015;351:h5527): https://ora.ox.ac.uk/objects/uuid:9e2399a5-f7c3-4fb1-a522-4ecb50c16ce4/files/mb388597d9127cf9810a97fd3d6208b5b
- TRIPOD+AI (BMJ 2024, CC BY 4.0): https://epub.ub.uni-muenchen.de/116670/1/bmj-2023-078378.full.pdf
- ICMJE Recommendations, January 2026 annotated edition: https://www.icmje.org/news-and-editorials/icmje-recommendations_annotated_jan26.pdf
- CRediT (ANSI/NISO Z39.104-2022): https://casrai.org/credit.html
- COPE: https://publicationethics.org/
- GPP 2022 (Annals of Internal Medicine 2022), PubMed 36037471: https://pubmed.ncbi.nlm.nih.gov/36037471/
- ISMPP, GPP 2022 guidelines: https://www.ismpp.org/gpp-2022
- ISMPP, Artificial Intelligence (2023 position statement, September 2025 enhanced guidance): https://www.ismpp.org/artificial-intelligence-ai-
- ISMPP, Enhanced Communications (publication extenders and accessibility): https://www.ismpp.org/enhanced-communications-digital-visual-and-accessibility-innovations
- WCAG 2.2 contrast (1.4.3, 1.4.11): https://www.w3.org/TR/WCAG22/

The full list, with the authorship, disclosure and ethics sources for the later phases, is in the
app spec.

## Data, privacy and checks

Everything stays in the browser (IndexedDB). There is no AI service: every check and score is a
written rule. Each saved object carries a user ID and a class ID. Only the optional classroom mode talks to a
server, and only when you join or create a class. The app works offline after the first visit.

## Develop

```
npm install
npm run dev
npm test
npm run build
```

React, Vite, Tailwind CSS, TypeScript; tests with Vitest. The tests check the answer keys against
the rules (the clean manuscripts pass every rule; the planted one fails exactly the planted items),
the picker against the RG1 key, the abstract checks against a model abstract, every planted version against its mission's key, and the .docx reader.

## Licence

Apache License 2.0. See LICENSE and NOTICE.

Built by Khan Gulrez Shagufa Fazal Ahmed.
