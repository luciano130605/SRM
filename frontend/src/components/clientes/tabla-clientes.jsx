import { useState } from "react"
import Edit from "../../icons/Edit"
import Save from "../../icons/Save"
import X from "../../icons/X"

export default function TablaClientes({ clientes, onEliminar, onEditar, pedidosPorCliente }) {
    const [editandoId, setEditandoId] = useState(null)
    const [draft, setDraft] = useState({})

    function iniciarEdicion(cliente) {
        setEditandoId(cliente.id)
        setDraft({
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || '',
            instagram: cliente.instagram || '',
            direccion: cliente.direccion || '',
            notas: cliente.notas || '',
        })
    }

    function cancelarEdicion() {
        setEditandoId(null)
        setDraft({})
    }

    async function guardarEdicion(id) {
        if (!draft.nombre?.trim() || (!draft.telefono?.trim() && !draft.instagram?.trim())) return
        await onEditar(id, draft)
        cancelarEdicion()
    }

    function handleDraftKey(e, id) {
        if (e.key === 'Enter') guardarEdicion(id)
        if (e.key === 'Escape') cancelarEdicion()
    }

    if (clientes.length === 0) {
        return <p className="cli-empty">Ningun cliente encontrado.</p>
    }

    return (
        <div className="cli-tabla-wrap">
            <table className="cli-tabla">
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Telefono</th>
                        <th>Instagram</th>
                        <th>Direccion</th>
                        <th>Pedidos</th>
                        <th aria-label="Acciones" />
                    </tr>
                </thead>
                <tbody>
                    {clientes.map(cliente => {
                        const editando = String(editandoId) === String(cliente.id)
                        const pedidosCount = pedidosPorCliente[cliente.id] || 0

                        return (
                            <tr key={cliente.id} className={editando ? 'editando' : ''}>
                                <td data-label="Cliente">
                                    {editando ? (
                                        <input
                                            autoFocus
                                            className="cli-tabla-input"
                                            value={draft.nombre}
                                            onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, cliente.id)}
                                        />
                                    ) : cliente.nombre}
                                </td>
                                <td data-label="Telefono">
                                    {editando ? (
                                        <input
                                            className="cli-tabla-input"
                                            value={draft.telefono}
                                            onChange={e => setDraft(d => ({ ...d, telefono: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, cliente.id)}
                                        />
                                    ) : cliente.telefono || '-'}
                                </td>
                                <td data-label="Instagram">
                                    {editando ? (
                                        <input
                                            className="cli-tabla-input"
                                            value={draft.instagram}
                                            onChange={e => setDraft(d => ({ ...d, instagram: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, cliente.id)}
                                        />
                                    ) : cliente.instagram || '-'}
                                </td>
                                <td data-label="Direccion">
                                    {editando ? (
                                        <input
                                            className="cli-tabla-input"
                                            value={draft.direccion}
                                            onChange={e => setDraft(d => ({ ...d, direccion: e.target.value }))}
                                            onKeyDown={e => handleDraftKey(e, cliente.id)}
                                        />
                                    ) : cliente.direccion || '-'}
                                </td>
                                <td data-label="Pedidos">
                                    {pedidosCount}
                                </td>
                                <td className="cli-tabla-actions">
                                    {editando ? (
                                        <>
                                            <button className="btn-icon btn-save" onClick={() => guardarEdicion(cliente.id)} title="Guardar">
                                                <Save />
                                            </button>
                                            <button className="btn-cancel-card" onClick={cancelarEdicion} title="Cancelar">
                                                <X />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-icon btn-edit" onClick={() => iniciarEdicion(cliente)} title="Editar">
                                                <Edit />
                                            </button>
                                            <button className="btn-icon btn-delete" onClick={() => onEliminar(cliente.id)} title="Eliminar">
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
