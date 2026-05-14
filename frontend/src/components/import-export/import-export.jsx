import { useRef } from "react"
import "./import-export.css"

export default function ImportExport({
    onExportar,
    onImportar,
    importando = false,
    exportDisabled = false,
    importDisabled = false,
    titulo = 'Importar o exportar',
    inputRef,
}) {
    const localInputRef = useRef(null)
    const fileInputRef = inputRef || localInputRef

    function abrirImportador() {
        fileInputRef.current?.click()
    }

    return (
        <div className="sheet-switch" aria-label={titulo}>
            <button
                onClick={onExportar}
                disabled={exportDisabled}
                type="button"
                title="Exportar en CSV"
            >
                Exportar
            </button>

            <button
                onClick={abrirImportador}
                disabled={importDisabled || importando}
                type="button"
                title="Importar en CSV"
            >
                {importando ? 'Importando...' : 'Importar'}
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
