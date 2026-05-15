import { useState } from "react"
import Edit from "../../icons/Edit"
import Save from "../../icons/Save"
import X from "../../icons/X"

export default function TablaClientes({ clientes, onEliminar, onEditar, pedidosPorCliente, metodos = [] }) {
    const [editandoId, setEditandoId] = useState(null)
    const [draft, setDraft] = useState({})

    function iniciarEdicion(cliente) {
        setEditandoId(cliente.id)
        setDraft({
            nombre: cliente.nombre || '',
            direccion: cliente.direccion || '',
            notas: cliente.notas || '',
            contactos: cliente.contactos ?? {},
        })
    }

    function cancelarEdicion() {
        setEditandoId(null)
        setDraft({})
    }

    async function guardarEdicion(id) {
        if (!draft.nombre?.trim()) return
        await onEditar(id, draft)
        cancelarEdicion()
    }

    function setContactoDraft(metodId, index, valor) {
        setDraft(d => {
            const arr = [...(d.contactos?.[metodId] ?? [''])]
            arr[index] = valor
            return { ...d, contactos: { ...d.contactos, [metodId]: arr } }
        })
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
                        {metodos.map(m => <th key={m.id}>{m.icono} {m.nombre}</th>)}
                        <th>Dirección</th>
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

                                {metodos.map(metodo => {
                                    const vals = editando
                                        ? (draft.contactos?.[metodo.id] ?? [''])
                                        : (() => {
                                            const v = cliente.contactos?.[metodo.id] ?? []
                                            if (!v.length && metodo.id === 'telefono') return cliente.telefono ? [cliente.telefono] : []
                                            if (!v.length && metodo.id === 'instagram') return cliente.instagram ? [cliente.instagram] : []
                                            return v
                                        })()

                                    return (
                                        <td key={metodo.id} data-label={metodo.nombre}>
                                            {editando
                                                ? vals.map((val, i) => (
                                                    <input
                                                        key={i}
                                                        className="cli-tabla-input"
                                                        value={val}
                                                        placeholder={`${metodo.nombre}...`}
                                                        onChange={e => setContactoDraft(metodo.id, i, e.target.value)}
                                                        onKeyDown={e => handleDraftKey(e, cliente.id)}
                                                    />
                                                ))
                                                : vals.length ? vals.join(' · ') : '-'
                                            }
                                        </td>
                                    )
                                })}

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
                                <td data-label="Pedidos">{pedidosCount}</td>
                                <td className="cli-tabla-actions">
                                    {editando ? (
                                        <>
                                            <button className="btn-icon btn-save" onClick={() => guardarEdicion(cliente.id)} title="Guardar"><Save /></button>
                                            <button className="btn-cancel-card" onClick={cancelarEdicion} title="Cancelar"><X /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn-icon btn-edit" onClick={() => iniciarEdicion(cliente)} title="Editar"><Edit /></button>
                                            <button className="btn-icon btn-delete" onClick={() => onEliminar(cliente.id)} title="Eliminar"><X /></button>
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