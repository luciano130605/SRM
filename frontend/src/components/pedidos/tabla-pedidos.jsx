import { useMemo, useState } from "react"
import Edit from "../../icons/Edit"
import Save from "../../icons/Save"
import X from "../../icons/X"
import { ESTADOS_PEDIDO, chipClass } from "./estados-pedido"
import formatPrecio from "./format-precio"

export default function TablaPedidos({ pedidos, clientes, onEliminar, onEditar }) {
    const [editandoId, setEditandoId] = useState(null)
    const [draft, setDraft] = useState({})

    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(cliente => [String(cliente.id), cliente])), [clientes])

    function iniciarEdicion(pedido) {
        setEditandoId(pedido.id)
        setDraft({
            clienteId: pedido.clienteId || '',
            estado: pedido.estado || 'pendiente',
            total: pedido.total || '',
            fecha: pedido.fecha ? pedido.fecha.slice(0, 10) : '',
            notas: pedido.notas || '',
        })
    }

    function cancelarEdicion() {
        setEditandoId(null)
        setDraft({})
    }

    async function guardarEdicion(id) {
        await onEditar(id, draft)
        cancelarEdicion()
    }

    function handleDraftKey(e, id) {
        if (e.key === 'Enter') guardarEdicion(id)
        if (e.key === 'Escape') cancelarEdicion()
    }

    return (
        <div className="ped-tabla-wrap">
            <table className="ped-tabla">
                <thead>
                    <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th aria-label="Acciones" />
                    </tr>
                </thead>

                <tbody>
                    {pedidos.map(pedido => {
                        const editando = String(editandoId) === String(pedido.id)
                        const cliente = clienteMap[String(pedido.clienteId)] || {}
                        const fecha = pedido.fecha || pedido.createdAt
                            ? new Date(pedido.fecha || pedido.createdAt).toLocaleDateString('es-AR')
                            : '-'

                        return (
                            <tr key={pedido.id} className={editando ? 'editando' : ''}>
                                <td data-label="Pedido">#{pedido.id}</td>
                                <td data-label="Cliente">
                                    {editando ? (
                                        <select
                                            className="ped-tabla-input"
                                            value={draft.clienteId}
                                            onChange={e => setDraft(d => ({ ...d, clienteId: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, pedido.id)}
                                        >
                                            <option value="">Sin cliente</option>
                                            {clientes.map(clienteItem => (
                                                <option key={clienteItem.id} value={clienteItem.id}>{clienteItem.nombre}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        cliente.nombre || `Cliente #${pedido.clienteId}`
                                    )}
                                </td>
                                <td data-label="Estado">
                                    {editando ? (
                                        <select
                                            className="ped-tabla-input"
                                            value={draft.estado}
                                            onChange={e => setDraft(d => ({ ...d, estado: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, pedido.id)}
                                        >
                                            {ESTADOS_PEDIDO.map(estado => (
                                                <option key={estado} value={estado}>{estado}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={`estado-chip ${chipClass(pedido.estado)}`}>
                                            {pedido.estado || 'pendiente'}
                                        </span>
                                    )}
                                </td>
                                <td data-label="Fecha">
                                    {editando ? (
                                        <input
                                            className="ped-tabla-input"
                                            type="date"
                                            value={draft.fecha}
                                            onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, pedido.id)}
                                        />
                                    ) : fecha}
                                </td>
                                <td data-label="Total">
                                    {editando ? (
                                        <input
                                            className="ped-tabla-input ped-tabla-number"
                                            type="number"
                                            value={draft.total}
                                            onChange={e => setDraft(d => ({ ...d, total: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, pedido.id)}
                                        />
                                    ) : (
                                        <span className="ped-tabla-total">${formatPrecio(pedido.total)}</span>
                                    )}
                                </td>
                                <td className="ped-tabla-actions">
                                    {editando ? (
                                        <>
                                            <button className="btn-icon btn-save" onClick={() => guardarEdicion(pedido.id)} title="Guardar">
                                                <Save />
                                            </button>
                                            <button className="btn-icon btn-delete" onClick={cancelarEdicion} title="Cancelar">
                                                <X />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-icon btn-edit" onClick={() => iniciarEdicion(pedido)} title="Editar">
                                                <Edit />
                                            </button>
                                            <button className="btn-icon btn-delete" onClick={() => onEliminar(pedido.id)} title="Eliminar">
                                                <X />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
