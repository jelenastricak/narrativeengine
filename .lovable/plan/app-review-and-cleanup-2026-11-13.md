# App review and cleanup

Current state: the app builds cleanly and shows no runtime errors. The work below hardens what exists without changing features (analysis, demo, file upload, local history, compare, incremental update, export/copy, onboarding).

## 1. Make the analysis reliable
- AI replies are currently parsed loosely; a malformed or partial reply can crash the results page.
- Ask the AI for strict JSON output and lower randomness so results are consistent.
- Validate and normalise every reply on the server (missing lists become empty, unknown labels fall back to safe values) and return a clear error if the reply is unusable.
- Add the same defensive normalisation on the page, so old saved history items still open safely.
- Reject empty or extremely long input with a clear message before calling the AI.

## 2. Protect the public functions
- Both server functions are open to anyone now that sign-in is gone. Add input size limits, method checks, and tidy error messages so failures never leak internal details.

## 3. Saved history safety
- Handle a full browser storage gracefully (show a message instead of failing silently) and cap history size.
- Remove the unused database tables' leftover code references (tables themselves stay untouched).

## 4. Code cleanup
- Split the 380-line main page into smaller pieces (controls bar, empty state, results area) with identical look and behaviour.
- Turn on stricter type checking and fix what it reveals.
- Remove dead code, unused files (old mock pieces not used, unused UI parts only if clearly unused), and stray logs.
- Set a proper page title and description.

## 5. Verify
- Run the real flow in the browser: demo data, a real text analysis, file upload (text, Word, PDF), save, reopen, compare, delete, export, on desktop and mobile.
- Add small tests for the reply normalisation rules.

## Technical details
- `analyze-narrative`: `response_format: json_object`, temperature 0.2, schema normaliser shared shape with `src/types/narrative.ts`, 100k char input cap.
- `parse-file`: enforce 10MB server-side, POST only.
- `src/lib/normalizeModel.ts` + vitest tests.
- `tsconfig.app.json`: enable `strict` incrementally (strictNullChecks, noImplicitAny).
- Index.tsx split into `AnalysisToolbar`, `EmptyState`, `ResultsView`.
- No design, colour or layout changes.
