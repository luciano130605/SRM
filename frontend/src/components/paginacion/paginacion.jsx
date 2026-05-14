import "./paginacion.css"

export default function Paginacion({
    pagina,
    total,
    onChange,
    desde,
    hasta,
    totalItems,
    className = '',
}) {
    if (total <= 1) return null

    const paginas = []

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - pagina) <= 2) paginas.push(i)
        else if (paginas[paginas.length - 1] !== '...') paginas.push('...')
    }

    return (
        <div className={`paginacion ${className}`.trim()}>
            <button className="paginacion-btn" disabled={pagina === 1} onClick={() => onChange(pagina - 1)}>
                Ant
            </button>
            {paginas.map((p, i) => p === '...'
                ? <span key={`e${i}`} className="paginacion-info">...</span>
                : (
                    <button
                        key={p}
                        className={`paginacion-btn${p === pagina ? ' activo' : ''}`}
                        onClick={() => onChange(p)}
                    >
                        {p}
                    </button>
                )
            )}
            <button className="paginacion-btn" disabled={pagina === total} onClick={() => onChange(pagina + 1)}>
                Sig
            </button>
            <span className="paginacion-info">{desde}-{hasta} de {totalItems}</span>
        </div>
    )
}
