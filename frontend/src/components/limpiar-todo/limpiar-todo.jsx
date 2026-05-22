import { useRef } from "react"
import ClearMovimiento from "../../icons/clearMovimiento"

export default function LimpiarTodo({ onLimpiar, disabled, titulo = 'Eliminar todos' }) {
    const clearRef = useRef(null)

    return (
        <div className="danger-switch" aria-label={titulo}>
            <button
                onClick={onLimpiar}
                disabled={disabled}
                type="button"
                title={titulo}
                onMouseEnter={() => clearRef.current?.startAnimation()}
                onMouseLeave={() => clearRef.current?.stopAnimation()}
            >
                <ClearMovimiento ref={clearRef} />
                <span className="button-label">Eliminar</span>
            </button>
        </div>
    )
}

