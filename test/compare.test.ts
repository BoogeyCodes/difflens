import { describe, expect, it } from 'vitest'
import { type AgentRun, compareRuns } from '../src/compare.js'
import { renderHtml } from '../src/render.js'

const runs: AgentRun[] = [
  {
    agent: 'agent-a',
    files: [
      { path: 'src/auth.ts', before: 'const ok = false', after: 'const ok = true' },
      { path: 'src/new.ts', before: '', after: 'export const x = 1' },
    ],
  },
  {
    agent: 'agent-b',
    files: [{ path: 'src/auth.ts', before: 'const ok = false', after: 'const ok = maybe' }],
  },
]

describe('compareRuns', () => {
  it('lists every changed file in first-seen order', () => {
    const c = compareRuns(runs)
    expect(c.files.map((f) => f.path)).toEqual(['src/auth.ts', 'src/new.ts'])
    expect(c.agents).toEqual(['agent-a', 'agent-b'])
  })

  it('records a diff per agent, or null when untouched', () => {
    const c = compareRuns(runs)
    const auth = c.files[0]
    expect(auth.changedBy).toBe(2)
    expect(auth.byAgent['agent-a']).not.toBeNull()
    const newFile = c.files[1]
    expect(newFile.byAgent['agent-b']).toBeNull()
    expect(newFile.byAgent['agent-a']?.added).toBe(1)
  })

  it('flags files changed by more than one agent', () => {
    expect(compareRuns(runs).overlap).toEqual(['src/auth.ts'])
  })

  it('reports no overlap when runs touch different files', () => {
    const c = compareRuns([
      { agent: 'a', files: [{ path: 'a.ts', before: '1', after: '2' }] },
      { agent: 'b', files: [{ path: 'b.ts', before: '1', after: '2' }] },
    ])
    expect(c.overlap).toEqual([])
  })

  it('rejects duplicate agent names', () => {
    expect(() => compareRuns([{ agent: 'x', files: [] }, { agent: 'x', files: [] }])).toThrow()
  })
})

describe('renderHtml', () => {
  it('produces a self-contained page with the agents, files and diffs', () => {
    const html = renderHtml(compareRuns(runs), 'Auth fix comparison')
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('Auth fix comparison')
    expect(html).toContain('agent-a')
    expect(html).toContain('src/auth.ts')
    expect(html).toContain('changed by more than one agent')
    expect(html).toContain('const ok = true')
  })

  it('escapes HTML in content and paths', () => {
    const html = renderHtml(
      compareRuns([{ agent: 'a', files: [{ path: '<x>.ts', before: 'a', after: 'b & <c>' }] }]),
    )
    expect(html).toContain('&lt;x&gt;.ts')
    expect(html).toContain('b &amp; &lt;c&gt;')
    expect(html).not.toContain('<x>.ts')
  })
})
