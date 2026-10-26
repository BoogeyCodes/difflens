# difflens

[![CI](https://github.com/BoogeyCodes/difflens/actions/workflows/ci.yml/badge.svg)](https://github.com/BoogeyCodes/difflens/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-success)
![ESM + CJS](https://img.shields.io/badge/module-ESM%20%2B%20CJS-blue)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

Build **side-by-side, multi-run diff views** for comparing what several AI coding-agent runs changed.
Give it each agent's file changes and difflens computes a line diff per file, lines them up in a
column per agent, flags the files more than one agent touched, and can render the whole thing as a
self-contained HTML page. No dependencies.

```ts
import { compareRuns, renderHtml } from 'difflens'

const comparison = compareRuns([
  { agent: 'agent-a', files: [{ path: 'src/auth.ts', before: oldAuth, after: aFix }] },
  { agent: 'agent-b', files: [{ path: 'src/auth.ts', before: oldAuth, after: bFix }] },
])

comparison.overlap          // ['src/auth.ts'] — where the runs diverge
const html = renderHtml(comparison, 'Auth fix comparison')  // a complete HTML page
```

## Why

When several AI coding agents tackle the same task, judging which did best means looking at *what each
one actually changed* — the files, the lines, and especially the places where their solutions differ.
difflens is the view layer for that: a clean line diff per file, arranged side by side per agent, with
the overlapping files called out, so the comparison is something you can read at a glance or drop into
a report.

## What it does

- **`diffLines(before, after)`** — a line-level diff using the longest-common-subsequence algorithm,
  returning each line tagged `equal`, `insert` or `delete`. `diffStats(lines)` gives `{ added, removed }`.
- **`compareRuns(runs)`** — for every file any run changed, compute each run's diff (or `null` when it
  didn't touch that file), count how many runs changed it, and list the files more than one run
  touched (`overlap`).
- **`renderHtml(comparison, title?)`** — a self-contained dark-theme HTML page: one section per file,
  a column per agent, with added/removed lines highlighted and overlapping files badged. Everything is
  escaped; no scripts, no external assets.

## Types

```ts
interface FilePatch { path: string; before: string; after: string }
interface AgentRun  { agent: string; files: FilePatch[] }

interface Comparison {
  agents: string[]
  files: Array<{ path: string; byAgent: Record<string, FileDiff | null>; changedBy: number }>
  overlap: string[]
}
```

## Install

```bash
npm install difflens
```

Node 18+. Ships as ESM and CommonJS with type definitions. No runtime dependencies.

## Testing

```bash
npm install
npm test            # 13 tests across the diff, the comparison and the HTML renderer
npm run build       # ESM + CJS + .d.ts via tsup
```

Tests cover the LCS diff (equal/insert/delete, changed lines, empty inputs, stats), the comparison
(first-seen file order, per-agent diff or null, overlap detection, duplicate-agent rejection) and the
renderer (self-contained output, agents/files/diffs present, HTML escaping).

## Where it fits

difflens is the "see what each run changed" view in an agent-evaluation workflow — pair it with a
run normaliser and a rubric scorer to review which of several runs did the job best.

## License

MIT
