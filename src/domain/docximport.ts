// Reading a learner's own .docx: the paragraphs of word/document.xml, in order, with headings
// (paragraph styles named Heading or Title) kept as short lines so the workspace can group by them.
// Nothing leaves the browser.
import { unzipSync, strFromU8 } from 'fflate'

const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

export function docxToText(bytes: Uint8Array): string {
  let files: Record<string, Uint8Array>
  try { files = unzipSync(bytes) } catch { throw new Error('This file is not a Word document (.docx).') }
  const doc = files['word/document.xml']
  if (!doc) throw new Error('This .docx has no main document part (word/document.xml).')
  const xml = strFromU8(doc)
  const out: string[] = []
  for (const m of xml.matchAll(/<w:p[ >][\s\S]*?<\/w:p>/g)) {
    const p = m[0]
    const style = /<w:pStyle w:val="([^"]+)"/.exec(p)?.[1] ?? ''
    const text = decode([...p.matchAll(/<w:t(?: [^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>/g)].map((t) => t[1] ?? ' ').join('')).replace(/\s+/g, ' ').trim()
    if (!text) continue
    out.push(/^(?:Heading|Title|heading)/.test(style) ? text.replace(/[.:;]$/, '') : text)
  }
  return out.join('\n\n')
}
