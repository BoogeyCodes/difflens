import { describe, expect, it } from 'vitest'
import { diffLines, diffStats } from '../src/diff.js'

describe('diffLines', () => {
  it('marks every line equal for identical text', () => {
    const d = diffLines('a\nb\nc', 'a\nb\nc')
    expect(d.every((l) => l.op === 'equal')).toBe(true)
    expect(d).toHaveLength(3)
  })

  it('detects an inserted line', () => {
    const d = diffLines('a\nc', 'a\nb\nc')
    expect(d).toEqual([
      { op: 'equal', text: 'a' },
      { op: 'insert', text: 'b' },
      { op: 'equal', text: 'c' },
    ])
  })

  it('detects a deleted line', () => {
    const d = diffLines('a\nb\nc', 'a\nc')
    expect(d.find((l) => l.op === 'delete')).toEqual({ op: 'delete', text: 'b' })
  })

  it('detects a changed line as a delete + insert', () => {
    const d = diffLines('hello', 'world')
    expect(d).toEqual([
      { op: 'delete', text: 'hello' },
      { op: 'insert', text: 'world' },
    ])
  })

  it('handles empty before/after', () => {
    expect(diffLines('', 'a\nb')).toEqual([
      { op: 'insert', text: 'a' },
      { op: 'insert', text: 'b' },
    ])
    expect(diffLines('a\nb', '').every((l) => l.op === 'delete')).toBe(true)
    expect(diffLines('', '')).toEqual([])
  })

  it('counts added and removed lines', () => {
    const d = diffLines('a\nb\nc', 'a\nx\nc\nd')
    expect(diffStats(d)).toEqual({ added: 2, removed: 1 })
  })
})
