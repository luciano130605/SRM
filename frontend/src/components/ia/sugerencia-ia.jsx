import { useRef, useState } from "react"
import api from "../../../services/api"
import BrainMovimiento from "../../icons/BrainMovimiento"
import SparklesIcon from "../../icons/IaMovimiento"
export default function SugerenciaIA({
    endpoint = '/ia/precio-venta',
    payload,
    disabled,
    label = 'Sugerir con IA',
    onSugerencia,
    renderResultado,
}) {
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const [sugerencia, setSugerencia] = useState(null)
    const brainRef = useRef(null)

    async function consultar() {
        if (disabled || cargando) return

        setCargando(true)
        setError('')
        setSugerencia(null)

        try {
            const response = await api.post(endpoint, payload)
            const data = response.data.data
            setSugerencia(data)
            onSugerencia?.(data)
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo obtener sugerencia de IA.')
        } finally {
            setCargando(false)
        }
    } 
    const sparkleRef = useRef(null);

    return (
        <div className="ia-sugerencia">
            <button
                type="button"
                className="ia-sugerencia-trigger"
                onClick={consultar}
                disabled={disabled || cargando}
                onMouseEnter={() => sparkleRef.current?.startAnimation()}
                onMouseLeave={() => sparkleRef.current?.stopAnimation()}
            >
                {cargando
                    ? <><span className="ia-sugerencia-spinner" /> Consultando...</>
                    : <><SparklesIcon ref={sparkleRef} size={14}/> {label}</>
                }
            </button>

            {sugerencia && (
                renderResultado
                    ? renderResultado(sugerencia)
                    : (
                        <div className="ia-sugerencia-card">
                            <div className="ia-sugerencia-card-top">
                                <span className="ia-sugerencia-badge">IA</span>
                                <span>{sugerencia.razon}</span>
                            </div>
                        </div>
                    )
            )}

            {error && <p className="ia-sugerencia-error">{error}</p>}
        </div>
    )
}

