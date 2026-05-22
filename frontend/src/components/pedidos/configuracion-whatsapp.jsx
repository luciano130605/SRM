import { useEffect, useRef, useState } from "react"
import api from "../../../services/api"
import X from "../../icons/X"

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3011'

const LABELS_ESTADO = {
    conectado: 'Conectado',
    conectando: 'Conectando — escaneá el QR con tu celu',
    desconectado: 'Desconectado',
    error: 'Error de conexión',
}

export default function ConfiguracionWhatsapp({ abierto, onCerrar }) {
    const [estadoWA, setEstadoWA] = useState('desconectado')
    const [qr, setQr] = useState(null)
    const [numero, setNumero] = useState('')
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')
    const sseRef = useRef(null)

    useEffect(() => {
        if (!abierto) {
            sseRef.current?.close()
            return
        }

        const sse = new EventSource(`${BASE_URL}/whatsapp/eventos`)
        sseRef.current = sse

        sse.addEventListener('estado', e => {
            const datos = JSON.parse(e.data)
            setEstadoWA(datos.estado)
            if (datos.estado !== 'conectando') setQr(null)
        })

        sse.addEventListener('qr', e => {
            const datos = JSON.parse(e.data)
            setQr(datos.qr)
        })

        sse.onerror = () => setEstadoWA(prev => prev === 'conectado' ? 'error' : prev)

        return () => sse.close()
    }, [abierto])

    async function conectar() {
        const num = numero.trim().replace(/\D/g, '')
        if (!num || num.length < 8) {
            setError('Ingresá un número de WhatsApp válido (solo dígitos, con código de país).')
            return
        }

        setError('')
        setCargando(true)

        try {
            await api.post('/whatsapp/conectar', { numero: num })
        } catch {
            setError('No se pudo iniciar la sesión. Revisá que el servidor esté corriendo.')
        } finally {
            setCargando(false)
        }
    }

    async function desconectar() {
        setCargando(true)
        try {
            await api.post('/whatsapp/desconectar')
        } catch { /* */ }
        finally { setCargando(false) }
    }

    if (!abierto) return null

    const conectando = estadoWA === 'conectando'
    const conectado = estadoWA === 'conectado'

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
            <div className="modal-caja wa-config-modal">

                <div className="modal-header">
                    <h2 className="modal-titulo">WhatsApp</h2>
                    <button className="btn-icon btn-delete" onClick={onCerrar}><X /></button>
                </div>

                <div className="wa-estado-row">
                    <span className={`wa-estado-dot wa-dot-${estadoWA}`} />
                    <span className="wa-estado-label">
                        {LABELS_ESTADO[estadoWA] || estadoWA}
                    </span>
                </div>

                {!conectado && !conectando && (
                    <div className="wa-numero-wrap">
                        <label className="wa-numero-label">
                            Tu número de WhatsApp
                        </label>
                        <div className="wa-numero-row">
                            <input
                                className="wa-numero-input"
                                type="tel"
                                placeholder="5491112345678"
                                value={numero}
                                onChange={e => { setNumero(e.target.value); setError('') }}
                                onKeyDown={e => e.key === 'Enter' && conectar()}
                            />
                            <button
                                className="btn-primary"
                                onClick={conectar}
                                disabled={cargando}
                            >
                                {cargando ? 'Iniciando...' : 'Conectar'}
                            </button>
                        </div>
                        <p className="wa-numero-hint">
                            Con código de país, sin + ni espacios. Ej: 5491112345678
                        </p>
                        {error && <p className="wa-error">{error}</p>}
                    </div>
                )}

                {conectando && !qr && (
                    <p className="wa-qr-instruccion">Iniciando sesión, esperá unos segundos...</p>
                )}

                {conectando && qr && (
                    <div className="wa-qr-wrap">
                        <p className="wa-qr-instruccion">
                            En tu celu: <strong>WhatsApp → Dispositivos vinculados → Vincular dispositivo</strong>
                        </p>
                        <img src={qr} alt="QR WhatsApp" className="wa-qr-img" />
                        <p className="wa-qr-hint">El QR se renueva cada 15 segundos.</p>
                    </div>
                )}

                {conectado && (
                    <p className="wa-conectado-info">
                        WhatsApp activo. Los clientes pueden mandarte el número de pedido
                        y recibirán el estado y la fecha estimada automáticamente.
                    </p>
                )}

                <div className="wa-config-acciones">
                    {conectado && (
                        <button className="btn-danger" onClick={desconectar} disabled={cargando}>
                            {cargando ? 'Desconectando...' : 'Desconectar'}
                        </button>
                    )}
                    {conectando && (
                        <button className="btn-secondary" onClick={desconectar} disabled={cargando}>
                            Cancelar
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}