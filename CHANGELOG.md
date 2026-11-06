# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `DiffStats.unchanged` — the count of equal lines, alongside added and removed.
- `formatDiffStats()` — a compact `+a/-r` label for headers and summaries.

## [0.1.0]

### Added
- LCS line diff (`diffLines`) with `equal` / `insert` / `delete` tagging.
- Multi-run comparison (`compareRuns`) with per-file diffs and overlap detection.
- Self-contained dark-theme HTML renderer.
