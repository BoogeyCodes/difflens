export type DiffOp = 'equal' | 'insert' | 'delete'

export interface DiffLine {
  op: DiffOp
  text: string
}

/**
 * A line-level diff between two texts, using the classic longest-common-subsequence dynamic program.
 * Returns the lines of both sides interleaved, each tagged `equal`, `insert` (only in `after`) or
 * `delete` (only in `before`).
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.length === 0 ? [] : before.split('\n')
  const b = after.length === 0 ? [] : after.split('\n')

  // lcs[i][j] = length of the LCS of a[i:] and b[j:].
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  const out: DiffLine[] = []
  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push({ op: 'equal', text: a[i] })
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push({ op: 'delete', text: a[i] })
      i++
    } else {
      out.push({ op: 'insert', text: b[j] })
      j++
    }
  }
  while (i < a.length) out.push({ op: 'delete', text: a[i++] })
  while (j < b.length) out.push({ op: 'insert', text: b[j++] })
  return out
}

export interface DiffStats {
  added: number
  removed: number
  unchanged: number
}

export function diffStats(lines: DiffLine[]): DiffStats {
  return {
    added: lines.filter((l) => l.op === 'insert').length,
    removed: lines.filter((l) => l.op === 'delete').length,
    unchanged: lines.filter((l) => l.op === 'equal').length,
  }
}

/** A compact `+a/-r` label for a set of diff stats, for headers and summaries. */
export function formatDiffStats(stats: DiffStats): string {
  return `+${stats.added}/-${stats.removed}`
}
