import { useState } from "react"
import TarjetaPedido from "./tarjeta-pedido"
import TablaPedidos from "./tabla-pedidos"

export default function ListaPedidos({
    pedidos,
    clientes,
    vista,
    onEliminar,
    onEditar,
    onCambiarEstado,
}) {
    const [editandoId, setEditandoId] = useState(null)

    if (vista === 'tabla') {
        return (
            <TablaPedidos
                pedidos={pedidos}
                clientes={clientes}
                onEliminar={onEliminar}
                onEditar={onEditar}
            />
        )
    }

    return (
        <div className="ped-grid">
            {pedidos.map(pedido => (
                <TarjetaPedido
                    key={pedido.id}
                    pedido={pedido}
                    clientes={clientes}
                    onEliminar={onEliminar}
                    onEditar={onEditar}
                    onCambiarEstado={onCambiarEstado}
                    editando={String(editandoId) === String(pedido.id)}
                    onIniciarEdicion={() => setEditandoId(pedido.id)}
                    onCerrarEdicion={() => setEditandoId(null)}
                />
            ))}
        </div>
    )
}
