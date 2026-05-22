import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import Search from "../../icons/Search"

export default function Buscador({
    value,
    onChange,
    placeholder,
    inputRef,
    className = '',
}) {
    const [modalAbierto, setModalAbierto] = useState(false)
    const mobileInputRef = useRef(null)

    useEffect(() => {
        if (!modalAbierto) return

        mobileInputRef.current?.focus()

        function cerrarConEscape(event) {
            if (event.key === 'Escape') {
                setModalAbierto(false)
            }
        }

        window.addEventListener('keydown', cerrarConEscape)
        return () => window.removeEventListener('keydown', cerrarConEscape)
    }, [modalAbierto])

    return (
        <div className={`buscador ${className}`.trim()}>
            <div className="buscador-desktop-control">
                <span className="buscador-icon"><Search /></span>
                <input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={event => onChange(event.target.value)}
                />
            </div>

            <button
                className={`buscador-mobile-trigger${value ? ' activo' : ''}`}
                type="button"
                onClick={() => setModalAbierto(true)}
                aria-label="Abrir buscador"
                title="Buscar"
            >
                <Search size={16} />
            </button>

            {modalAbierto && (
                <div
                    className="buscador-mobile-overlay"
                    onClick={event => event.target === event.currentTarget && setModalAbierto(false)}
                >
                    <div className="buscador-mobile-panel">
                        <div className="buscador-mobile-control">
                            <span className="buscador-icon"><Search /></span>
                            <input
                                ref={mobileInputRef}
                                placeholder={placeholder}
                                value={value}
                                onChange={event => onChange(event.target.value)}
                            />
                            <button
                                className="buscador-mobile-close"
                                type="button"
                                onClick={() => setModalAbierto(false)}
                                aria-label="Cerrar buscador"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

