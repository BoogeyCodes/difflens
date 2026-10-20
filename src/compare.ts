import { type DiffLine, diffLines, diffStats } from './diff.js'

/** One file an agent changed, given as before/after contents. */
export interface FilePatch {
  path: string
  before: string
  after: string
}

/** One agent's run: the set of files it changed. */
export interface AgentRun {
  agent: string
  files: FilePatch[]
}

export interface FileDiff {
  added: number
  removed: number
  lines: DiffLine[]
}

export interface FileComparison {
  path: string
  /** Per agent: the diff for this file, or null if that agent did not touch it. */
  byAgent: Record<string, FileDiff | null>
  /** How many agents changed this file. */
  changedBy: number
}

export interface Comparison {
  agents: string[]
  files: FileComparison[]
  /** Files that more than one agent changed — the places the runs diverge. */
  overlap: string[]
}

/**
 * Compare several agent runs: for every file any run changed, compute each run's diff (or null),
 * and flag the files that more than one run touched.
 */
export function compareRuns(runs: readonly AgentRun[]): Comparison {
  const agents = runs.map((r) => r.agent)
  if (new Set(agents).size !== agents.length) {
    throw new Error('agent names must be unique')
  }

  // Collect files in first-seen order across all runs.
  const order: string[] = []
  const seen = new Set<string>()
  for (const run of runs) {
    for (const file of run.files) {
      if (!seen.has(file.path)) {
        seen.add(file.path)
        order.push(file.path)
      }
    }
  }

  const files: FileComparison[] = order.map((path) => {
    const byAgent: Record<string, FileDiff | null> = {}
    let changedBy = 0
    for (const run of runs) {
      const patch = run.files.find((f) => f.path === path)
      if (patch) {
        const lines = diffLines(patch.before, patch.after)
        byAgent[run.agent] = { ...diffStats(lines), lines }
        changedBy++
      } else {
        byAgent[run.agent] = null
      }
    }
    return { path, byAgent, changedBy }
  })

  return {
    agents,
    files,
    overlap: files.filter((f) => f.changedBy > 1).map((f) => f.path),
  }
}
