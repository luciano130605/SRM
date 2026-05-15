import { useRef } from "react"
import "./import-export.css"
import Export from "../../icons/Export"
import Import from "../../icons/Import"

export default function ImportExport({
    onExportar,
    onImportar,
    importando = false,
    exportDisabled = false,
    importDisabled = false,
    titulo = 'Importar o exportar',
    inputRef,
    vista
}) {
    const localInputRef = useRef(null)
    const fileInputRef = inputRef || localInputRef

    function abrirImportador() {
        fileInputRef.current?.click()
    }

    if (vista !== 'tabla') return null

    return (
        <div className="sheet-switch" aria-label={titulo}>
            <button
                onClick={onExportar}
                disabled={exportDisabled}
                type="button"
                title="Exportar en CSV"
            >
                <Export />
            </button>

            <button
                onClick={abrirImportador}
                disabled={importDisabled || importando}
                type="button"
                title="Importar en CSV"
            >
               <Import />
            </button>

            <input
                ref={fileInputRef}
                className="input-import-sheet"
                type="file"
                accept=".csv,text/csv"
                onChange={onImportar}
            />
        </div>
    )
}
