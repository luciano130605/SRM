import { useMemo } from "react"
import formatPrecio from "./format-precio"
import iniciales from "./iniciales"
import { chipEstadoStyle } from "../pedidos/estados-pedido"

export default function PedidosRecientes({ pedidos, clientes, estados = [] }) {
    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(c => [c.id, c])), [clientes])

    const estadoMap = useMemo(() =>
        Object.fromEntries(estados.map(e => [e.nombre, e])), [estados])

    const recientes = [...pedidos]
        .sort((a, b) => new Date(b.fecha || b.createdAt) - new Date(a.fecha || a.createdAt))
        .slice(0, 7)
    const estadoActual = estados.find(e => e.nombre === pedido.estado)
    const colorEstado = estadoActual?.color
    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Pedidos recientes</span>
                <span className="panel-head-badge">{pedidos.length} total</span>
            </div>

            {recientes.length === 0
                ? <p className="dash-empty">Sin pedidos todavía.</p>
                : recientes.map(p => {
                    const cliente = clienteMap[p.clienteId] || {}
                    const fecha = p.fecha || p.createdAt
                        ? new Date(p.fecha || p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                        : '—'
                    const color = estadoMap[p.estado]?.color

                    return (
                        <div key={p.id} className="pedido-row">
                            <div className="pedido-avatar">{iniciales(cliente.nombre || '?')}</div>
                            <div className="pedido-row-info">
                                <p className="pedido-row-cliente">{cliente.nombre || 'Cliente'}</p>
                                <p className="pedido-row-fecha">{fecha}</p>
                            </div>
                            <div className="pedido-row-right">
                                <p className="pedido-row-monto">${formatPrecio(p.total)}</p>
                                <span
                                    className="pedido-estado-chip"
                                    style={chipEstadoStyle(colorEstado)}

                                >
                                    {p.estado || 'pendiente'}
                                </span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}