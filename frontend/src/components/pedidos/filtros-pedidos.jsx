import { ESTADOS_PEDIDO, estadoLabel } from "./estados-pedido"

export default function FiltrosPedidos({
    filtroEstado,
    setFiltroEstado,
    orden,
    setOrden,
    hayFiltros,
    totalFiltrados,
}) {
    return (
        <>
            <select className="ped-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                {ESTADOS_PEDIDO.map(estado => (
                    <option key={estado} value={estado}>{estadoLabel(estado)}</option>
                ))}
            </select>

            <select className="ped-select" value={orden} onChange={e => setOrden(e.target.value)}>
                <option value="reciente">Mas reciente</option>
                <option value="antiguo">Mas antiguo</option>
                <option value="mayor-total">Mayor total</option>
                <option value="menor-total">Menor total</option>
            </select>

            {hayFiltros && (
                <span className="ped-results-label">
                    {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''}
                </span>
            )}
        </>
    )
}
