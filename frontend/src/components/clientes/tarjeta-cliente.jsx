import { useState } from "react"
import iniciales from "./inicales"
import Edit from "../../icons/Edit"
import X from "../../icons/X"
import Save from "../../icons/Save"
import Tarjeta from "../tarjeta/tarjeta"
import Instagram from "../../icons/Instagram"
import Telefono from "../../icons/Telefono"
import Pin from "../../icons/Pin"
import Notas from "../../icons/Notas"

export default function TarjetaCliente({
    cliente,
    onEliminar,
    onEditar,
    pedidosCount,
    editando = false,
    onIniciarEdicion,
    onCerrarEdicion,
}) {
    const [draft, setDraft] = useState({})
    const [notasAbiertas, setNotasAbiertas] = useState(false)
    const [copiado, setCopiado] = useState('')

    function iniciarEdicion() {
        setDraft({
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            notas: cliente.notas || '',
            instagram: cliente.instagram || '',
        })
        onIniciarEdicion()
    }

    function cancelar() {
        setDraft({})
        onCerrarEdicion()
    }

    async function guardar() {
        if (!draft.nombre?.trim() || (!draft.telefono?.trim() && !draft.instagram?.trim())) return
        await onEditar(cliente.id, draft)
        setDraft({})
        onCerrarEdicion()
    }

    function onKey(e) {
        if (e.key === 'Enter') guardar()
        if (e.key === 'Escape') cancelar()
    }

    async function copiarTexto(texto, tipo) {
        if (!texto) return

        try {
            await navigator.clipboard.writeText(texto)
        } catch {
            const input = document.createElement('textarea')
            input.value = texto
            document.body.appendChild(input)
            input.select()
            document.execCommand('copy')
            document.body.removeChild(input)
        }

        setCopiado(tipo)
        window.setTimeout(() => setCopiado(''), 1200)
    }

    function normalizarTelefono(telefono) {
        return String(telefono || '').replace(/\D/g, '')
    }

    function abrirWhatsapp() {
        const telefono = normalizarTelefono(cliente.telefono)
        if (!telefono) return
        window.open(`https://wa.me/${telefono}`, '_blank', 'noopener,noreferrer')
    }

    function normalizarInstagram(instagram) {
        return String(instagram || '').trim().replace(/^@/, '')
    }

    function abrirInstagram() {
        const usuario = normalizarInstagram(cliente.instagram)
        if (!usuario) return
        window.open(`https://www.instagram.com/${usuario}`, '_blank', 'noopener,noreferrer')
    }

    const fecha = cliente.createdAt
        ? new Date(cliente.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })
        : null

    const header = (
        <>
            <div className="cli-av">{iniciales(editando ? draft.nombre : cliente.nombre)}</div>
            <div>
                {!editando && <p className="cli-card-nombre" title={cliente.nombre}>{cliente.nombre}</p>}
                {!editando && cliente.telefono && (
                    <p className="cli-card-meta">{cliente.telefono}</p>
                )}
            </div>
        </>
    )

    const actions = editando ? (
        <>
            <button className="btn-icon btn-edit" onClick={guardar} title="Guardar"><Save /></button>
            <button className="btn-icon btn-delete" onClick={cancelar} title="Cancelar"><X /></button>
        </>
    ) : (
        <>
            {cliente.notas && (
                <button
                    className={`btn-icon btn-note${notasAbiertas ? ' activo' : ''}`}
                    onClick={() => setNotasAbiertas(v => !v)}
                    title="Ver notas"
                    type="button"
                >
                    <Notas />
                </button>
            )}
            <button className="btn-icon btn-edit" onClick={iniciarEdicion} title="Editar"><Edit /></button>
            <button className="btn-icon btn-delete" onClick={() => onEliminar(cliente.id)} title="Eliminar"><X /></button>
        </>
    )

    const editContent = (
        <div className="cli-edit-grid" onKeyDown={onKey}>
            <div className="cli-edit-field span-2">
                <label className="cli-edit-label">Nombre</label>
                <input
                    autoFocus
                    className="cli-edit-input"
                    value={draft.nombre}
                    onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))}
                />
            </div>
            <div className="cli-edit-field">
                <label className="cli-edit-label">Telefono</label>
                <input
                    className="cli-edit-input"
                    value={draft.telefono}
                    onChange={e => setDraft(d => ({ ...d, telefono: e.target.value }))}
                />
            </div>
            <div className="cli-edit-field span-2">
                <label className="cli-edit-label">Instagram</label>
                <input
                    className="cli-edit-input"
                    value={draft.instagram}
                    placeholder="@usuario"
                    onChange={e => setDraft(d => ({ ...d, instagram: e.target.value }))}
                />
            </div>
            <div className="cli-edit-field span-2">
                <label className="cli-edit-label">Direccion</label>
                <input
                    className="cli-edit-input"
                    value={draft.direccion}
                    onChange={e => setDraft(d => ({ ...d, direccion: e.target.value }))}
                />
            </div>
            <div className="cli-edit-field span-2">
                <label className="cli-edit-label">Notas</label>
                <input
                    className="cli-edit-input"
                    value={draft.notas}
                    onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))}
                />
            </div>
        </div>
    )

    return (
        <Tarjeta
            className="cli-card"
            editando={editando}
            topClassName="cli-card-top"
            infoClassName="cli-card-info"
            actionsClassName="cli-card-actions"
            header={header}
            actions={actions}
            editContent={editContent}
        >
            {(cliente.telefono || cliente.direccion || cliente.instagram) && (
                <div className="cli-card-contacto">
                    {cliente.instagram && (
                        <span className="cli-contacto-row">
                            <span className="cli-contacto-main">
                                <span className="cli-contacto-icon"><Instagram /></span>{cliente.instagram}
                            </span>

                        </span>
                    )}
                    {cliente.telefono && (
                        <span className="cli-contacto-row">
                            <span className="cli-contacto-main">
                                <span className="cli-contacto-icon"><Telefono /></span>{cliente.telefono}
                            </span>

                        </span>
                    )}
                    {cliente.direccion && (
                        <span className="cli-contacto-row">
                            <span className="cli-contacto-main">
                                <span className="cli-contacto-icon"><Pin /></span>{cliente.direccion}
                            </span>
                        </span>
                    )}
                </div>
            )}
            {copiado && (
                <p className="cli-copy-feedback">
                    {copiado === 'telefono' ? 'Telefono copiado' : 'Instagram copiado'}
                </p>
            )}
            {notasAbiertas && cliente.notas && (
                <div className="cli-notas">
                    <span>Notas</span>
                    <p>{cliente.notas}</p>
                </div>
            )}
            <div className="cli-card-bottom">
                <span className="cli-card-pedidos">
                    {pedidosCount > 0 ? `${pedidosCount} pedido${pedidosCount !== 1 ? 's' : ''}` : 'Sin pedidos'}
                </span>
                {fecha && <span className="cli-card-fecha">desde {fecha}</span>}
            </div>
        </Tarjeta>
    )
}
