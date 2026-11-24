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

The later phases add the other study designs (STROBE, PRISMA 2020 and PRISMA-S, STARD, CARE,
CHEERS, and short exercises for ARRIVE, TRIPOD+AI, SQUIRE and COREQ), authorship and CRediT,
the ICMJE disclosures and statements, publication ethics cases, the submission pack, the poster
builder, the GPP publication plan, the plain language summary hand-off to the Plain Language Lab,
the certificate in the Regulatory Skills Passport and a step in the pharmolecule Ostrevia
lifecycle journey.

## Sources (checked 24 November 2026)

- CONSORT 2025 statement, PLOS Medicine 2025 (CC BY 4.0): https://pmc.ncbi.nlm.nih.gov/articles/PMC11996237/
- SPIRIT 2025 statement, JAMA 2025: https://jamanetwork.com/journals/jama/fullarticle/2833408
- CONSORT and its extensions on the EQUATOR Network: https://www.equator-network.org/reporting-guidelines/consort/
- The EQUATOR Network's note that it makes no copyright claim over guideline content (copyright
  stays with each publisher): https://resources.equator-network.org/reporting-guidelines/care/faqs.html
- ICMJE Recommendations, January 2026 update: https://www.icmje.org/recommendations/

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
the picker against the RG1 key, and the abstract checks against a model abstract.

## Licence

Apache License 2.0. See LICENSE and NOTICE.

Built by Khan Gulrez Shagufa Fazal Ahmed.
