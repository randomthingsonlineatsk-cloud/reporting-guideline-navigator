// The completed checklist as a Word table, the form journals ask authors to upload.
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, PageOrientation } from 'docx'
import type { Project } from './types'
import { checklistRows, manuscriptOf } from './project'
import { guideline } from './guidelines'

const cell = (t: string, bold = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: t, bold, size: 18 })] })] })
export async function checklistDocx(p: Project, name: string): Promise<Blob> {
  const m = manuscriptOf(p)
  const rows = checklistRows(p, m)
  const doc = new Document({
    sections: [{
      properties: { page: { size: { orientation: PageOrientation.LANDSCAPE } } },
      children: [
        new Paragraph({ children: [new TextRun({ text: 'Reporting checklist', bold: true, size: 32 })] }),
        new Paragraph({ children: [new TextRun({ text: `${m.title} · ${p.guidelines.filter((g) => guideline(g).built).map((g) => guideline(g).name).join(', ')}${name ? ` · completed by ${name}` : ''}`, size: 20 })] }),
        new Paragraph({ children: [new TextRun({ text: 'Paragraph numbers (¶) refer to the manuscript as numbered in the Reporting Guideline Navigator. Items are paraphrased; check the official wording on each guideline\'s site.', size: 18, italics: true })] }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [new TableRow({ tableHeader: true, children: ['Guideline', 'Item', 'Item (paraphrased)', 'Status', 'Where reported', 'Reason or note'].map((h) => cell(h, true)) }),
            ...rows.map((r) => new TableRow({ children: [r.guideline, r.item, r.text, r.status, r.where, r.reason].map((t) => cell(t)) }))],
        }),
        new Paragraph({ children: [new TextRun({ text: 'Training document made with the Reporting Guideline Navigator (built by Khan Gulrez Shagufa Fazal Ahmed). Fictional study.', size: 16 })] }),
      ],
    }],
  })
  return Packer.toBlob(doc)
}
