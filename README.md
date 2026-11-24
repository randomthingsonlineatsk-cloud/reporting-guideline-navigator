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

The later phases add authorship and CRediT, the ICMJE disclosures and statements, publication
ethics cases, the submission pack, the poster builder, the GPP publication plan, the plain
language summary hand-off to the Plain Language Lab, the certificate in the Regulatory Skills
Passport and a step in the pharmolecule Ostrevia lifecycle journey.

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

The full list, with the authorship, disclosure and ethics sources for the later phases, is in the
app spec.

## Data, privacy and checks

Everything stays in the browser (IndexedDB). There is no AI service: every check and score is a
written rule. Each saved object carries a user ID and a class ID for the classroom mode that comes
later. The app works offline after the first visit.

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
