/**
 * Tiny Markdown → HTML converter for trusted content (product descriptions
 * authored by us in content/**.md). Replaces `<MDC>` so we can drop the
 * full @nuxtjs/mdc client runtime + sqlite-wasm dependency chunk
 * (~65 KB brotli combined) from the bundle.
 *
 * Subset supported (everything our content currently uses):
 *   - **bold**       → <strong>
 *   - * list item     → <ul><li>...
 *   - ---             → <hr>
 *   - bare https URLs → <a href> (autolinked)
 *   - blank line      → paragraph break
 *
 * Source is escaped before inline syntax is applied, so even though we trust
 * our own content files there is no path for raw HTML to leak through.
 *
 * If our markdown grows beyond this subset (tables, headings, fenced code,
 * footnotes, etc.) we should swap this for `marked` or re-enable `<MDC>`.
 */
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const inlineMd = (s: string): string =>
  escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /(^|\s)(https?:\/\/[^\s<]+)/g,
      (_match, lead, url) => `${lead}<a href="${url}" target="_blank" rel="noopener">${url}</a>`,
    )

export function markdownToHtml(md: string): string {
  if (!md) return ''
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let listOpen = false
  let paraBuffer: string[] = []

  const flushParagraph = () => {
    if (paraBuffer.length === 0) return
    out.push(`<p>${paraBuffer.map(inlineMd).join('<br>')}</p>`)
    paraBuffer = []
  }
  const closeList = () => {
    if (listOpen) {
      out.push('</ul>')
      listOpen = false
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line === '') {
      flushParagraph()
      closeList()
      continue
    }
    if (line === '---') {
      flushParagraph()
      closeList()
      out.push('<hr>')
      continue
    }
    const listMatch = line.match(/^\s*\*\s+(.*)$/)
    if (listMatch) {
      flushParagraph()
      if (!listOpen) {
        out.push('<ul>')
        listOpen = true
      }
      out.push(`<li>${inlineMd(listMatch[1] ?? '')}</li>`)
      continue
    }
    closeList()
    paraBuffer.push(line)
  }
  flushParagraph()
  closeList()

  return out.join('\n')
}
