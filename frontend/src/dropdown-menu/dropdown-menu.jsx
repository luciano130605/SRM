import { useEffect, useRef } from "react"

export default function DropdownMenu({
    abierto,
    opciones = [],
    onSeleccionar,
    onCerrar,
    className = "",
}) {
    const ref = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                onCerrar?.()
            }
        }

        if (abierto) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [abierto, onCerrar])

    if (!abierto) return null

    return (
        <div ref={ref} className={`dropdown-menu ${className}`}>
            {opciones.map(opcion => (
                <button
                    key={opcion.value}
                    type="button"
                    className="dropdown-menu-item"
                    onClick={() => onSeleccionar(opcion)}
                >
                    {opcion.label}
                </button>
            ))}
        </div>
    )
}