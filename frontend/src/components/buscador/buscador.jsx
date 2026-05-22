import { useEffect, useRef, useState } from "react"
import Search from "../../icons/Search"

export default function Buscador({
    value,
    onChange,
    placeholder,
    inputRef,
    className = '',
}) {
    const [abierto, setAbierto] = useState(false)
    const mobileInputRef = useRef(null)

    useEffect(() => {
        if (!abierto) return

        mobileInputRef.current?.focus()

        function cerrarConEscape(event) {
            if (event.key === 'Escape') {
                setAbierto(false)
            }
        }

        window.addEventListener('keydown', cerrarConEscape)
        return () => window.removeEventListener('keydown', cerrarConEscape)
    }, [abierto])

    return (
        <div className={`buscador ${className}`.trim()}>

            <div className="buscador-desktop-control">
                <span className="buscador-icon">
                    <Search />
                </span>
                <input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            </div>

            <div className="buscador-mobile-inline">
                <button
                    className="buscador-icon-btn"
                    type="button"
                    onClick={() => setAbierto(prev => !prev)}
                    aria-label="Abrir buscador"
                >
                    <Search size={16} />
                </button>

                <input
                    ref={mobileInputRef}
                    className={`buscador-mobile-input ${abierto ? "open" : ""}`}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            </div>

        </div>
    )
}