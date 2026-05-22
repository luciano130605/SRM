import { useMemo, useState } from "react"
import Edit from "../../icons/Edit"
import Instagram from "../../icons/Instagram"
import Pin from "../../icons/Pin"
import Save from "../../icons/Save"
import Telefono from "../../icons/Telefono"
import X from "../../icons/X"
import Tarjeta from "../tarjeta/tarjeta"
import { ESTADOS_PEDIDO, chipClass, siguienteEstado } from "./estados-pedido"
import formatPrecio from "./format-precio"
import ExternalLinkIcon from "../../icons/ExternalLink"
import Copy from "../../icons/Copy"
import CopySuccess from "../../icons/CopySuccess"
import ModalNotificacionPedido from "./modal-notificacion-pedido"
import DropdownMenu from "../dropdown-menu/dropdown-menu"

export default function TarjetaPedido({
    pedido,
    clientes,
    onEliminar,
    onEditar,
    onCambiarEstado,
    editando = false,
    onIniciarEdicion,
    onCerrarEdicion,
}) {
    const [draft, setDraft] = useState({})
    const [copiado, setCopiado] = useState('')
    const [modalNotif, setModalNotif] = useState(null)
    const [selectorEstado, setSelectorEstado] = useState(false)

    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(cliente => [String(cliente.id), cliente])), [clientes])

    const clienteId = pedido.clienteId || pedido.idCliente
    const cliente = clienteMap[String(clienteId)] || {}
    const fecha = pedido.fecha || pedido.createdAt
        ? new Date(pedido.fecha || pedido.createdAt).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        : '-'

    const items = pedido.items || pedido.productos || []

    function iniciarEdicion() {
        setDraft({
            clienteId: clienteId || '',
            estado: pedido.estado || 'pendiente',
            total: pedido.total || '',
            notas: pedido.notas || '',
            fecha: pedido.fecha ? pedido.fecha.slice(0, 10) : '',
        })
        onIniciarEdicion()
    }

    function cancelar() {
        setDraft({})
        onCerrarEdicion()
    }

    async function guardar() {
        await onEditar(pedido.id, draft)
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

    function abrirMaps() {
        if (!cliente.direccion) return
        const query = encodeURIComponent(cliente.direccion)
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
    }

    const header = (
        <>
            <p className="ped-card-id">Pedido #{pedido.id}</p>
            {!editando && <p className="ped-card-cliente">{cliente.nombre || `Cliente #${clienteId}`}</p>}
            {!editando && <p className="ped-card-fecha">{fecha}</p>}
        </>
    )

    const botones = editando ? (
        <>
            <button className="btn-icon btn-save" onClick={guardar} title="Guardar"><Save /></button>
            <button className="btn-icon btn-delete" onClick={cancelar} title="Cancelar"><X /></button>
        </>
    ) : (
        <>
            <button className="btn-icon btn-edit" onClick={iniciarEdicion} title="Editar"><Edit /></button>
            <button className="btn-icon btn-delete" onClick={() => onEliminar(pedido.id)} title="Eliminar"><X /></button>
        </>
    )

    const actions = (
        <>
            <span className="ped-card-total">${formatPrecio(pedido.total)}</span>
            {!editando && (
                <div className="pedido-estado-wrapper">
                    <span
                        className={`pedido-estado-chip ${chipClass(pedido.estado)}`}
                        onClick={() => setSelectorEstado(v => !v)}
                        style={{ cursor: 'pointer' }}
                    >
                        {pedido.estado}
                    </span>

                    <DropdownMenu
                    className="drop-pedido"
                        abierto={selectorEstado}
                        onCerrar={() => setSelectorEstado(false)}
                        opciones={ESTADOS_PEDIDO
                            .filter(e => e !== pedido.estado)
                            .map(e => ({
                                value: e,
                                label: e,
                            }))
                        }
                        onSeleccionar={({ value }) => {
                            onCambiarEstado(pedido.id, value)
                            setModalNotif({ nuevoEstado: value })
                            setSelectorEstado(false)
                        }}
                    />
                </div>
            )}
            <div className="ped-card-actions">{botones}</div>
        </>
    )

    const editContent = (
        <div className="ped-edit-grid" onKeyDown={onKey}>
            <div className="ped-edit-field">
                <label className="ped-edit-label">Cliente</label>
                <select
                    className="ped-edit-input"
                    value={draft.clienteId}
                    onChange={e => setDraft(d => ({ ...d, clienteId: e.target.value }))}
                >
                    <option value="">Sin cliente</option>
                    {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                    ))}
                </select>
            </div>
            <div className="ped-edit-field">
                <label className="ped-edit-label">Estado</label>
                <select
                    className="ped-edit-input"
                    value={draft.estado}
                    onChange={e => setDraft(d => ({ ...d, estado: e.target.value }))}
                >
                    {ESTADOS_PEDIDO.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                    ))}
                </select>
            </div>
            <div className="ped-edit-field">
                <label className="ped-edit-label">Total</label>
                <input
                    autoFocus
                    type="number"
                    className="ped-edit-input"
                    value={draft.total}
                    onChange={e => setDraft(d => ({ ...d, total: e.target.value }))}
                />
            </div>
            <div className="ped-edit-field">
                <label className="ped-edit-label">Fecha</label>
                <input
                    type="date"
                    className="ped-edit-input"
                    value={draft.fecha}
                    onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))}
                />
            </div>
            <div className="ped-edit-field span-2">
                <label className="ped-edit-label">Notas</label>
                <input
                    className="ped-edit-input"
                    value={draft.notas}
                    onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))}
                    placeholder="Indicaciones especiales..."
                />
            </div>
        </div>
    )

    return (
        <Tarjeta
            className="ped-card"
            editando={editando}
            topClassName="ped-card-header"
            infoClassName="ped-card-left"
            actionsClassName="ped-card-right"
            header={header}
            actions={actions}
            editContent={editContent}
        >
            {(cliente.telefono || cliente.instagram || cliente.direccion) && (
                <div className="ped-card-contacto">
                    {cliente.telefono && (
                        <div className="ped-contacto-row">
                            <span className="ped-contacto-main" title={cliente.telefono}>
                                <span className="ped-contacto-icon"><Telefono /></span>
                                {cliente.telefono}
                            </span>
                            <span className="ped-contacto-actions">
                                <button type="button" onClick={() => copiarTexto(cliente.telefono, 'telefono')}>
                                    {copiado === 'telefono' ? <CopySuccess /> : <Copy />}
                                </button>
                                <button type="button" title="Abrir en Whatsapp" onClick={abrirWhatsapp}><ExternalLinkIcon /></button>
                            </span>
                        </div>
                    )}

                    {cliente.instagram && (
                        <div className="ped-contacto-row">
                            <span className="ped-contacto-main" title={cliente.instagram}>
                                <span className="ped-contacto-icon"><Instagram /></span>
                                {cliente.instagram}
                            </span>
                            <span className="ped-contacto-actions">
                                <button type="button" onClick={() => copiarTexto(cliente.instagram, 'instagram')}>{copiado === 'instagram' ? <CopySuccess /> : <Copy />}</button>
                                <button type="button" title="Abrir en Instagram" onClick={abrirInstagram}><ExternalLinkIcon /></button>
                            </span>
                        </div>
                    )}

                    {cliente.direccion && (
                        <div className="ped-contacto-row">
                            <span className="ped-contacto-main" title={cliente.direccion}>
                                <span className="ped-contacto-icon"><Pin /></span>
                                {cliente.direccion}
                            </span>
                            <span className="ped-contacto-actions">
                                <button type="button" onClick={() => copiarTexto(cliente.direccion, 'direccion')}>{copiado === 'direccion' ? <CopySuccess /> : <Copy />}</button>
                                <button type="button" title="Abrir en google Maps" onClick={abrirMaps}><ExternalLinkIcon /></button>
                            </span>
                        </div>
                    )}
                </div>
            )}

            {items.length > 0 && (
                <div className="ped-card-items">
                    {items.map((item, index) => (
                        <span key={index} className="ped-item-chip">
                            {item.nombre || item.productoNombre || `Producto #${item.productoId}`}
                            {item.cantidad && item.cantidad > 1 ? ` x${item.cantidad}` : ''}
                        </span>
                    ))}
                </div>
            )}

            {modalNotif && (
                <ModalNotificacionPedido
                    pedido={pedido}
                    cliente={cliente}
                    nuevoEstado={modalNotif.nuevoEstado}
                    onCerrar={() => setModalNotif(null)}
                />
            )}


            {pedido.notas && <p className="ped-card-notas">"{pedido.notas}"</p>}
        </Tarjeta>
    )
}
