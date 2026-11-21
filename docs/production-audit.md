# Production audit — 2026-11-21

## 1. Verdict

The current anonymous product is a functionally verified release candidate: real core workflows passed, the managed build/TypeScript checks passed, lint passed, and 19 regression tests passed. No known vulnerable production dependencies remained in the final lockfile scan.

This is not a guarantee of perfection, unlimited capacity, or coverage of every browser. Frontend changes have not been republished; both changed Cloud functions were deployed and exercised live from the preview.

## 2. Critical repairs

The dependency check initially reported critical PDF-library vulnerabilities. Updated jsPDF, routing, validation, connection libraries and ws/lodash/fflate transitive dependencies. Both lockfiles now resolve patched versions. The final dependency scan reported no known vulnerabilities across 56 production dependencies.

## 3. High-priority repairs

- `src/pages/Index.tsx`: preserved initial/update drafts through navigation and failed requests; restored failed merge input; removed stale saved-analysis identity after failed persistence.
- `src/lib/historyStorage.ts`, `src/hooks/useAnalysisHistory.ts`: reject damaged timestamps, models and duplicate IDs; synchronize hook instances and tabs; evict only on actual quota errors; preserve data on blocked storage.
- `src/lib/compareModels.ts`, `src/components/narrative/ModelComparison.tsx`: detect attribute and stage changes rather than treating matching names as unchanged; compare all model collections.
- `src/hooks/useFileUpload.ts`: bounded request duration, reject malformed results, prevent overlapping requests, cancel uploads on unmount, preserve drafts after errors.
- `supabase/functions/analyze-narrative/index.ts`: schema-validate request shapes before inference, use supported Gateway SDK with the authenticated catalog's current Gemini Flash ID, retain shared server/browser normalization.

## 4. Medium/low repairs

Confirmed history deletion; safe final-entry deletion; explicitly labelled demo-derived models; wrapped phone update and comparison layouts; accessible tutorial with Escape/focus management and reopen reset; route lazy/Suspense and bounded failed-chunk recovery; one notification system; complete entity/PDF fields; visible input validation; shared file policy; pre-decompression DOCX archive limits; removal of script/style text from HTML extraction.

## 5. Integrations and real persistence

| Workflow | Observed result |
| --- | --- |
| Upload | TXT, MD, JSON, CSV, HTML, XML, DOCX and text-based PDF sent through browser UI to deployed parser; extracted text read back. |
| Analysis | Real narrative sent to deployed AI function; structured entities and sections rendered; saved model read back from browser history. |
| Updates | Real new information merged with existing real model; second version saved and compared. |
| History | Save/load, comparison selection, cancel/confirm deletion, final-entry deletion and reload persistence passed. |
| Exports | Clipboard and downloaded JSON matched saved model; real PDF downloaded, parsed and verified to contain input actors. |
| Accounts/payments/sharing | Intentionally removed by the earlier explicit request to remove sign-in; not restored. |

## 6. Data classification

- Observed: parser responses, saved/read-back history, clipboard/download contents and browser behavior.
- AI-derived: strategic interpretations, recommendations, hypothetical scenarios and qualitative likelihood; not independently verified external facts.
- Hardcoded: `src/data/mockNarrative.ts`, loaded only through explicit demo action and visibly labelled; updates from demo retain sample provenance.
- Simulated failure tests: server 503, malformed upload response, offline network, full/blocked storage and overlapping upload. These were test injections, not live incidents or fake successes.

## 7. Edge states verified

Unsupported DOC and empty files rejected locally. Real invalid/empty/protected PDFs rejected with 400; oversized extracted text rejected with 413. Invalid analysis body shapes, short/oversized text and invalid existing models rejected with 400. Failed initial/merge requests preserved input and current model. Malformed/offline upload recovered, concurrent input produced one request, and navigation safely cancelled upload. Full storage left results downloadable without stale delete identity. Empty history, final deletion, tutorial reset/Escape, and 404 home navigation passed.

## 8. Security and reliability

Basic database checks and deep code scan completed with no reported findings. The deep scan examined the saved pre-edit snapshot; the final dependency scan separately checked updated packages. Automated scans are not penetration testing. Legacy account data protections were not loosened. No credentials were added to frontend code.

Operational limitations:
- Anonymous inference spends owner AI credits; the platform has no standard backend rate-limiting primitive. No ad-hoc enforcement was fabricated.
- History is browser/device-local, not cloud backup or guaranteed conflict-free concurrent storage.
- Old DOC, scanned/image-only PDFs and protected PDFs remain unsupported; no fake OCR fallback was added.
- Chromium verified at 320, 375, 768, 932, 1280 and 1920px widths. Safari/Firefox, sustained capacity/load, independent penetration testing and real exhausted-credit/rate-limit events were not verified.
- PDF uses its standard font; exhaustive arbitrary Unicode coverage remains unverified.

## 9. Completed repair sequence

Audit existing product and error signals → protect drafts/history → validate uploads and AI boundary → correct comparison/deletion/exports → fix mobile/keyboard states → patch dependencies → run real end-to-end and injected-failure tests → record limitations.

## 10. Release checklist

- [x] Real upload → analysis → dashboard → save/readback.
- [x] Real update → second version → comparison.
- [x] JSON/PDF/clipboard export and confirmed deletion.
- [x] Invalid input, unsupported files, offline and storage recovery.
- [x] Desktop/tablet/phone, keyboard tutorial, 404 recovery.
- [x] Regression tests, lint, managed build/TypeScript, final dependency scan.
- [ ] Publish frontend changes when explicitly requested.
- [ ] Broader load and browser assurance before claiming operational guarantees.
