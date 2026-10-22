import type { Comparison, FileComparison } from './compare.js'
import type { DiffLine } from './diff.js'

const SIGN: Record<DiffLine['op'], string> = { equal: ' ', insert: '+', delete: '-' }

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
}

function renderDiff(diff: DiffLine[]): string {
  if (diff.length === 0) return '<div class="empty">no change</div>'
  const rows = diff
    .map((line) => `<div class="ln ln--${line.op}">${SIGN[line.op]} ${escapeHtml(line.text)}</div>`)
    .join('')
  return `<pre class="diff">${rows}</pre>`
}

function renderFile(file: FileComparison, agents: string[]): string {
  const cells = agents
    .map((agent) => {
      const diff = file.byAgent[agent]
      if (!diff) return '<td class="col col--untouched"><div class="empty">not changed</div></td>'
      return `<td class="col"><div class="stat"><span class="add">+${diff.added}</span> <span class="rem">-${diff.removed}</span></div>${renderDiff(diff.lines)}</td>`
    })
    .join('')
  const flag = file.changedBy > 1 ? ' <span class="badge">changed by ' + file.changedBy + '</span>' : ''
  return `<section class="file"><h3>${escapeHtml(file.path)}${flag}</h3><table class="grid"><tr>${cells}</tr></table></section>`
}

/**
 * Render a comparison as a self-contained HTML page: one section per file, with a column per agent
 * showing that agent's diff side by side. Inline CSS, dark theme, no dependencies.
 */
export function renderHtml(comparison: Comparison, title = 'Run comparison'): string {
  const header = `<tr>${comparison.agents.map((a) => `<th>${escapeHtml(a)}</th>`).join('')}</tr>`
  const files = comparison.files.map((f) => renderFile(f, comparison.agents)).join('\n')
  const overlapNote =
    comparison.overlap.length > 0
      ? `<p class="note">${comparison.overlap.length} file(s) changed by more than one agent: ${comparison.overlap.map(escapeHtml).join(', ')}.</p>`
      : '<p class="note">No file was changed by more than one agent.</p>'

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;background:#0f1419;color:#e6edf3;font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;padding:24px}
  h1{font-size:20px;margin:0 0 4px}
  .note{color:#8b98a9;margin:0 0 20px}
  .file{background:#161c24;border:1px solid #2a3441;border-radius:10px;padding:14px 16px;margin-bottom:16px}
  .file h3{margin:0 0 10px;font-size:14px;font-family:ui-monospace,monospace}
  .badge{background:#f59e0b;color:#000;border-radius:999px;padding:1px 8px;font-size:11px;margin-left:8px}
  .grid{width:100%;border-collapse:collapse;table-layout:fixed}
  .col{vertical-align:top;border:1px solid #2a3441;padding:0;width:1%}
  .col--untouched{opacity:.5}
  .stat{padding:6px 10px;border-bottom:1px solid #2a3441;font-size:12px}
  .add{color:#22c55e}.rem{color:#ef4444}
  .diff{margin:0;padding:8px 10px;overflow-x:auto;font-family:ui-monospace,monospace;font-size:12.5px;line-height:1.5}
  .ln{white-space:pre;border-radius:3px;padding:0 4px}
  .ln--insert{background:rgba(34,197,94,.14);color:#86efac}
  .ln--delete{background:rgba(239,68,68,.14);color:#fca5a5}
  .empty{padding:10px;color:#8b98a9;font-style:italic;font-size:12px}
  th{text-align:left;padding:6px 10px;color:#8b98a9;font-size:12px;text-transform:uppercase;letter-spacing:.03em}
</style></head>
<body>
<h1>${escapeHtml(title)}</h1>
${overlapNote}
<table class="grid">${header}</table>
${files}
</body></html>`
}
