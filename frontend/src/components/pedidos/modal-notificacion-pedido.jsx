import { useEffect, useState } from "react"
import api from "../../../services/api"
import X from "../../icons/X"
// import Whatsapp from "../../icons/Whatsapp"       
// import Instagram from "../../icons/Instagram"
import Copy from "../../icons/Copy"
import CopySuccess from "../../icons/CopySuccess"

const MENSAJES_POR_ESTADO = {
    pendiente: (cliente, id) => `Hola ${cliente}, tu pedido #${id} fue recibido y está pendiente de preparación. Te avisamos cuando avance.`,
    'en proceso': (cliente, id) => `Hola ${cliente}, tu pedido #${id} ya está en preparación. Pronto te tenemos novedades.`,
    listo: (cliente, id) => `Hola ${cliente}, tu pedido #${id} está listo. Coordinamos la entrega cuando quieras.`,
    entregado: (cliente, id) => `Hola ${cliente}, marcamos tu pedido #${id} como entregado. Gracias por tu compra.`,
    cancelado: (cliente, id) => `Hola ${cliente}, lamentablemente tu pedido #${id} fue cancelado. Ante cualquier duda, escribinos.`,
}

function generarMensaje(estado, cliente, id) {
    const fn = MENSAJES_POR_ESTADO[estado?.toLowerCase()] || MENSAJES_POR_ESTADO['pendiente']
    return fn(cliente?.nombre || 'cliente', id)
}

function normalizarTelefono(telefono) {
    return String(telefono || '').replace(/\D/g, '')
}

function normalizarInstagram(instagram) {
    return String(instagram || '').trim().replace(/^@/, '')
}

export default function ModalNotificacionPedido({ pedido, cliente, nuevoEstado, onCerrar }) {
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [copiado, setCopiado] = useState(false)
    const [estadoWA, setEstadoWA] = useState(null)
    const [resultadoEnvio, setResultadoEnvio] = useState(null)

    const telefono = normalizarTelefono(cliente?.telefono)
    const instagram = normalizarInstagram(cliente?.instagram)
    const estadoClass = nuevoEstado
        .toLowerCase()
        .replace(/\s+/g, "-");

    useEffect(() => {
        setMensaje(generarMensaje(nuevoEstado, cliente, pedido?.id))

        api.get('/whatsapp/estado')
            .then(r => setEstadoWA(r.data?.estado === 'conectado' ? 'conectado' : 'desconectado'))
            .catch(() => setEstadoWA('desconectado'))
    }, [nuevoEstado, cliente, pedido])

    async function enviarPorWhatsapp() {
        if (!telefono) return
        setEnviando(true)
        setResultadoEnvio(null)

        try {
            await api.post('/whatsapp/enviar', { numero: telefono, mensaje })
            setResultadoEnvio('ok')
            window.setTimeout(onCerrar, 1200)
        } catch {
            setResultadoEnvio('error')
        } finally {
            setEnviando(false)
        }
    }

    function abrirWhatsappWeb() {
        if (!telefono) return
        const texto = encodeURIComponent(mensaje)
        window.open(`https://wa.me/${telefono}?text=${texto}`, '_blank', 'noopener,noreferrer')
    }

    function abrirInstagram() {
        if (!instagram) return
        window.open(`https://www.instagram.com/${instagram}`, '_blank', 'noopener,noreferrer')
    }

    async function copiar() {
        try { await navigator.clipboard.writeText(mensaje) } catch { /* fallback  */ }
        setCopiado(true)
        window.setTimeout(() => setCopiado(false), 1500)
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCerrar()}>
            <div className="modal-caja notif-modal">
                <div className="modal-header">
                    <h2 className="modal-titulo">Notificar al cliente</h2>
                    <button className="btn-icon btn-delete" onClick={onCerrar}><X /></button>
                </div>

                <p className="notif-subtitulo">
                    Estado actualizado a{" "}
                    <span className={`noti-estado-chip noti-estado-${estadoClass.toLowerCase()}`}>
                        {nuevoEstado}
                    </span>
                    . Editá el mensaje y elegí cómo enviarlo.
                </p>

                <textarea
                    className="notif-textarea"
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value)}
                    rows={5}
                />

                <div className="notif-acciones">

                    <button className="btn-notif btn-copiar" onClick={copiar}>
                        {copiado ? <CopySuccess /> : <Copy />}
                        {copiado ? 'Copiado' : 'Copiar'}
                    </button>
                </div>


            </div>
        </div>
    )
}