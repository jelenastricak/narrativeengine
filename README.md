# The Narrative Engine

Strategic narrative intelligence from text and documents: actors, arcs, conflicts, opportunities, risks, scenarios and recommended actions.

## Current product

Anonymous access. History is saved only in this browser on this device; clearing browser data removes it. Export important analyses. Sign-in, account-bound subscriptions, payments, sharing and collaboration were explicitly removed.

Supported: TXT, MD, JSON, CSV, HTML, XML, DOCX and text-based PDF. Maximum file size: 10MB. Narrative/update input: 20–100,000 characters. Old DOC and scanned/image-only/protected PDFs are unsupported.

New analyses, incremental updates, comparisons, confirmed deletion, JSON/PDF download and clipboard export are available. Demo and demo-derived models are explicitly labelled.

## Development

React 18, TypeScript, Vite, Tailwind and shadcn controls; Lovable Cloud functions parse documents and run AI analysis.

```sh
bun install
bun run dev
bun run test
bun run lint
```

The managed preview performs build/TypeScript checks automatically. Keep both lockfiles synchronized after dependency updates. Changes are saved through explicit commits; publishing the frontend is a separate action.

AI credentials remain in server-side platform secrets. Deploy `parse-file` and `analyze-narrative` when their source or shared dependencies change. Anonymous inference consumes owner credits; failures must remain honest errors, never fabricated analyses.

## Audit

See [the production audit](docs/production-audit.md) for concrete workflow evidence, fixes and operational limitations.
