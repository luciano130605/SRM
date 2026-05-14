import { useMemo } from "react"
import iniciales from "./iniciales"

export default function ClientesActivos({ clientes, pedidos }) {
    const top = useMemo(() => {
        const conteo = {}
        pedidos.forEach(p => {
            if (p.clienteId) conteo[p.clienteId] = (conteo[p.clienteId] || 0) + 1
        })
        return clientes
            .map(c => ({ ...c, pedidosCount: conteo[c.id] || 0 }))
            .filter(c => c.pedidosCount > 0)
            .sort((a, b) => b.pedidosCount - a.pedidosCount)
            .slice(0, 6)
    }, [clientes, pedidos])

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Clientes frecuentes</span>
                <span className="panel-head-badge">{clientes.length} total</span>
            </div>

            {top.length === 0
                ? <p className="dash-empty">Sin clientes con pedidos.</p>
                : <div className="cliente-chip-grid">
                    {top.map(c => (
                        <div key={c.id} className="cliente-chip">
                            <div className="cliente-chip-av">{iniciales(c.nombre)}</div>
                            <span className="cliente-chip-nombre">{c.nombre}</span>
                            <span className="cliente-chip-pedidos">{c.pedidosCount} pedido{c.pedidosCount !== 1 ? 's' : ''}</span>
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}