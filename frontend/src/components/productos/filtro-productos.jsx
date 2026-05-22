import { useState } from "react"
import DropdownMenu from "../../dropdown-menu/dropdown-menu"

export default function FiltrosProductos({
    categorias,
    filtroCategoria,
    setFiltroCategoria,
    orden,
    setOrden,
    hayFiltros,
    totalFiltrados
}) {
    const [categoriaAbierta, setCategoriaAbierta] = useState(false)
    const [ordenAbierto, setOrdenAbierto] = useState(false)

    const categoriaActual =
        filtroCategoria || "Todas las categorías"

    const ordenes = [
        { value: "reciente", label: "Más reciente" },
        { value: "az", label: "A → Z" },
        { value: "za", label: "Z → A" },
        { value: "precio-desc", label: "Mayor precio" },
        { value: "precio-asc", label: "Menor precio" },
        { value: "margen-desc", label: "Mayor margen" },
    ]

    const ordenActual =
        ordenes.find(o => o.value === orden)?.label || "Más reciente"

    return (
        <>
            <div className="toolbar-dropdown">
                <button
                    type="button"
                    className="toolbar-select"
                    onClick={() => setCategoriaAbierta(v => !v)}
                >
                    {categoriaActual}
                </button>

                <DropdownMenu
                    abierto={categoriaAbierta}
                    onCerrar={() => setCategoriaAbierta(false)}
                    opciones={[
                        {
                            value: "",
                            label: "Todas las categorías",
                        },
                        ...categorias.map(cat => ({
                            value: cat.nombre,
                            label: cat.nombre,
                        })),
                    ]}
                    onSeleccionar={({ value }) => {
                        setFiltroCategoria(value)
                        setCategoriaAbierta(false)
                    }}
                />
            </div>


            {hayFiltros && (
                <span className="toolbar-results">
                    {totalFiltrados} resultado{totalFiltrados !== 1 ? "s" : ""}
                </span>
            )}
        </>
    )
}