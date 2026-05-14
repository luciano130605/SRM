
export default function FiltrosProductos({
    categorias,
    filtroCategoria,
    setFiltroCategoria,
    orden,
    setOrden,
    hayFiltros,
    totalFiltrados
}) {
    return (
        <>
            <select
                className="toolbar-select"
                value={filtroCategoria}
                onChange={e => setFiltroCategoria(e.target.value)}
            >
                <option value="">Todas las categorías</option>

                {categorias.map(cat => (
                    <option
                        key={cat.id}
                        value={cat.nombre}
                    >
                        {cat.nombre}
                    </option>
                ))}
            </select>

            <div className="toolbar-order">

                <select
                    className="toolbar-select toolbar-select-order"
                    value={orden}
                    onChange={e => setOrden(e.target.value)}
                >
                    <option value="reciente">Más reciente</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                    <option value="precio-desc">Mayor precio</option>
                    <option value="precio-asc">Menor precio</option>
                    <option value="margen-desc">Mayor margen</option>
                </select>
            </div>

            {hayFiltros && (
                <span className="toolbar-results">
                    {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''}
                </span>
            )}
        </>
    )
}