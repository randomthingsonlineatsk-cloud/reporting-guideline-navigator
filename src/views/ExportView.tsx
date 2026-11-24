import { useStore } from '../state'
import { Btn, Panel, Table } from './ui'
import { checklistCsv, checklistHtml, checklistRows, exportProject, manuscriptOf } from '../domain/project'
import { checklistDocx } from '../domain/docx'
import { download } from '../domain/store'
import { journeyHandoff } from '../domain/phase4'

export default function ExportView() {
  const { p, progress, setError } = useStore()
  const m = manuscriptOf(p!)
  const rows = checklistRows(p!, m)
  const base = p!.name.replace(/[^\w-]+/g, '_')
  return (
    <div className="space-y-3">
      <Panel title="Export" sub="The completed checklist in the forms journals ask for, and the project file to keep a copy or move it to another browser.">
        <div className="flex flex-wrap gap-2">
          <Btn tone="solid" onClick={() => checklistDocx(p!, progress.name).then((b) => download(`${base}-checklist.docx`, b)).catch((e) => setError((e as Error).message))}>Checklist (Word)</Btn>
          <Btn onClick={() => download(`${base}-checklist.html`, checklistHtml(p!, m), 'text/html')}>Checklist (HTML, print to PDF)</Btn>
          <Btn onClick={() => download(`${base}-checklist.csv`, checklistCsv(p!, m), 'text/csv')}>Checklist (CSV)</Btn>
          <Btn tone="grey" onClick={() => download(`${base}.rgn.json`, exportProject(p!))}>Project file</Btn>
          {p!.abstracts.filter((a) => a.text.trim()).map((a) => <Btn key={a.venue} tone="grey" onClick={() => download(`${base}-abstract-${a.venue}.txt`, a.text, 'text/plain')}>{`Abstract (${a.venue})`}</Btn>)}
        </div>
      </Panel>
      {p!.manuscriptId === 'verdant-1' && (
        <Panel title="Ostrevia journey, step 13: publish the primary results" sub="For the Ostrevia journey on the pharmolecule hub. Outside a mission, tag every CONSORT 2025 item with none missing, write the Fennick abstract with every check passing and the registration number, list the authors on the Authorship page (each meeting all four ICMJE criteria) and acknowledge the writing support. Then upload this file on the journey page.">
          {p!.mission && <p className="text-xs text-lab-amber">This is a mission project. The journey needs your own VERDANT-1 project: open the VERDANT-1 article from the library.</p>}
          <Btn onClick={() => download('verdant-1-publication-handoff.json', JSON.stringify(journeyHandoff(p!), null, 2))}>Journey hand-off (.json)</Btn>
        </Panel>
      )}
      <Panel title="Preview">
        <Table head={['Guideline', 'Item', 'Item (paraphrased)', 'Status', 'Where', 'Reason or note']} rows={rows.map((r) => [r.guideline, r.item, r.text, r.status || '—', r.where, r.reason])} />
      </Panel>
    </div>
  )
}
