import { useState } from "react"
import { ESTADOS_PEDIDO, estadoLabel } from "./estados-pedido"
import DropdownMenu from "../dropdown-menu/dropdown-menu"

export default function FiltrosPedidos({
    filtroEstado,
    setFiltroEstado,
    orden,
    setOrden,
    hayFiltros,
    totalFiltrados,
}) {
    const [estadoAbierto, setEstadoAbierto] = useState(false)
    const [ordenAbierto, setOrdenAbierto] = useState(false)

    const ordenes = [
        { value: "reciente", label: "Más reciente" },
        { value: "antiguo", label: "Más antiguo" },
        { value: "mayor-total", label: "Mayor total" },
        { value: "menor-total", label: "Menor total" },
    ]

    const estadoActual =
        filtroEstado
            ? estadoLabel(filtroEstado)
            : "Todos los estados"

    const ordenActual =
        ordenes.find(o => o.value === orden)?.label || "Más reciente"

    return (
        <>
            <div className="toolbar-dropdown">
                <button
                    type="button"
                    className="toolbar-select"
                    onClick={() => setEstadoAbierto(v => !v)}
                >
                    {estadoActual}
                </button>

                <DropdownMenu
                    abierto={estadoAbierto}
                    onCerrar={() => setEstadoAbierto(false)}
                    opciones={[
                        { value: "", label: "Todos los estados" },
                        ...ESTADOS_PEDIDO.map(estado => ({
                            value: estado,
                            label: estadoLabel(estado),
                        })),
                    ]}
                    onSeleccionar={({ value }) => {
                        setFiltroEstado(value)
                        setEstadoAbierto(false)
                    }}
                />
            </div>

            <div className="toolbar-dropdown">
                <button
                    type="button"
                    className="toolbar-select"
                    onClick={() => setOrdenAbierto(v => !v)}
                >
                    {ordenActual}
                </button>

                <DropdownMenu
                    abierto={ordenAbierto}
                    onCerrar={() => setOrdenAbierto(false)}
                    opciones={ordenes}
                    onSeleccionar={({ value }) => {
                        setOrden(value)
                        setOrdenAbierto(false)
                    }}
                />
            </div>

            {hayFiltros && (
                <span className="ped-results-label">
                    {totalFiltrados} resultado{totalFiltrados !== 1 ? "s" : ""}
                </span>
            )}
        </>
    )
}