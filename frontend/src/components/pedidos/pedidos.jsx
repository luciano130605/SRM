import { useEffect, useState, useMemo } from 'react'
import api from "../../../services/api"
import "./pedidos.css"

const POR_PAGINA = 15
const ESTADOS = ['pendiente', 'en proceso', 'entregado', 'cancelado']

function formatPrecio(v) {
    return (parseFloat(v) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function chipClass(estado) {
    const map = {
        pendiente: 'estado-pendiente',
        entregado: 'estado-entregado',
        cancelado: 'estado-cancelado',
        'en proceso': 'estado-en-proceso',
        'en-proceso': 'estado-en-proceso',
    }
    return map[(estado || '').toLowerCase()] || 'estado-pendiente'
}

function siguienteEstado(estado) {
    const ciclo = ['pendiente', 'en proceso', 'entregado']
    const i = ciclo.indexOf((estado || '').toLowerCase())
    return i >= 0 && i < ciclo.length - 1 ? ciclo[i + 1] : estado
}


function TarjetaPedido({ pedido, clientes, onEliminar, onEditar, onCambiarEstado }) {
    const [editando, setEditando] = useState(false)
    const [draft, setDraft] = useState({})

    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(c => [String(c.id), c])), [clientes])

    const cliente = clienteMap[String(pedido.clienteId)] || {}
    const fecha = pedido.fecha || pedido.createdAt
        ? new Date(pedido.fecha || pedido.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—'

    const items = pedido.items || pedido.productos || []

    function iniciarEdicion() {
        setDraft({
            clienteId: pedido.clienteId || '',
            estado: pedido.estado || 'pendiente',
            total: pedido.total || '',
            notas: pedido.notas || '',
            fecha: pedido.fecha ? pedido.fecha.slice(0, 10) : '',
        })
        setEditando(true)
    }

    function cancelar() { setEditando(false); setDraft({}) }

    async function guardar() {
        await onEditar(pedido.id, draft)
        setEditando(false)
        setDraft({})
    }

    function onKey(e) {
        if (e.key === 'Enter') guardar()
        if (e.key === 'Escape') cancelar()
    }

    return (
        <article className={`ped-card${editando ? ' editando' : ''}`}>
            <div className="ped-card-header">
                <div className="ped-card-left">
                    <p className="ped-card-id">Pedido #{pedido.id}</p>
                    <p className="ped-card-cliente">{cliente.nombre || `Cliente #${pedido.clienteId}`}</p>
                    <p className="ped-card-fecha">{fecha}</p>
                </div>
                <div className="ped-card-right">
                    <span className="ped-card-total">${formatPrecio(pedido.total)}</span>
                    {!editando && (
                        <span
                            className={`estado-chip ${chipClass(pedido.estado)}`}
                            title="Clic para avanzar estado"
                            onClick={() => onCambiarEstado(pedido.id, siguienteEstado(pedido.estado))}
                        >
                            {pedido.estado || 'pendiente'}
                        </span>
                    )}
                    <div className="ped-card-actions">
                        {editando ? (
                            <>
                                <button className="btn-icon btn-save" onClick={guardar} title="Guardar">✓</button>
                                <button className="btn-icon" onClick={cancelar} title="Cancelar">✕</button>
                            </>
                        ) : (
                            <>
                                <button className="btn-icon btn-edit" onClick={iniciarEdicion} title="Editar">✎</button>
                                <button className="btn-icon btn-delete" onClick={() => onEliminar(pedido.id)} title="Eliminar">✕</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {editando ? (
                <div className="ped-edit-grid" onKeyDown={onKey}>
                    <div className="ped-edit-field">
                        <label className="ped-edit-label">Cliente</label>
                        <select className="ped-edit-input" value={draft.clienteId}
                            onChange={e => setDraft(d => ({ ...d, clienteId: e.target.value }))}>
                            <option value="">Sin cliente</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div className="ped-edit-field">
                        <label className="ped-edit-label">Estado</label>
                        <select className="ped-edit-input" value={draft.estado}
                            onChange={e => setDraft(d => ({ ...d, estado: e.target.value }))}>
                            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="ped-edit-field">
                        <label className="ped-edit-label">Total</label>
                        <input autoFocus type="number" className="ped-edit-input" value={draft.total}
                            onChange={e => setDraft(d => ({ ...d, total: e.target.value }))} />
                    </div>
                    <div className="ped-edit-field">
                        <label className="ped-edit-label">Fecha</label>
                        <input type="date" className="ped-edit-input" value={draft.fecha}
                            onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))} />
                    </div>
                    <div className="ped-edit-field span-2">
                        <label className="ped-edit-label">Notas</label>
                        <input className="ped-edit-input" value={draft.notas}
                            onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))} placeholder="Indicaciones especiales…" />
                    </div>
                </div>
            ) : (
                <>
                    {items.length > 0 && (
                        <div className="ped-card-items">
                            {items.map((it, i) => (
                                <span key={i} className="ped-item-chip">
                                    {it.nombre || it.productoNombre || `Producto #${it.productoId}`}
                                    {it.cantidad && it.cantidad > 1 ? ` ×${it.cantidad}` : ''}
                                </span>
                            ))}
                        </div>
                    )}
                    {pedido.notas && <p className="ped-card-notas">"{pedido.notas}"</p>}
                </>
            )}
        </article>
    )
}


function FormularioPedido({ onCrear, creando, clientes, productos }) {
    const [clienteId, setClienteId] = useState('')
    const [estado, setEstado] = useState('pendiente')
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
    const [notas, setNotas] = useState('')
    const [items, setItems] = useState([{ productoId: '', cantidad: 1 }])

    const total = useMemo(() => {
        return items.reduce((sum, it) => {
            const prod = productos.find(p => String(p.id) === String(it.productoId))
            return sum + (parseFloat(prod?.precioVenta) || 0) * (parseInt(it.cantidad) || 1)
        }, 0)
    }, [items, productos])

    function addItem() { setItems(prev => [...prev, { productoId: '', cantidad: 1 }]) }
    function removeItem(i) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
    function updateItem(i, field, val) {
        setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it))
    }

    function handleCrear() {
        if (!clienteId) return
        const itemsConDatos = items
            .filter(it => it.productoId)
            .map(it => {
                const prod = productos.find(p => String(p.id) === String(it.productoId))
                return {
                    productoId: it.productoId,
                    nombre: prod?.nombre || '',
                    cantidad: parseInt(it.cantidad) || 1,
                    precioUnitario: parseFloat(prod?.precioVenta) || 0,
                }
            })

        onCrear({ clienteId, estado, fecha, notas, items: itemsConDatos, total }, () => {
            setClienteId(''); setEstado('pendiente')
            setFecha(new Date().toISOString().slice(0, 10))
            setNotas('')
            setItems([{ productoId: '', cantidad: 1 }])
        })
    }

    const valido = !!clienteId

    return (
        <aside className="ped-form-panel">
            <h2 className="ped-panel-title">Nuevo pedido</h2>

            <div className="ped-field">
                <label className="ped-field-label">Cliente *</label>
                <select className="ped-input" value={clienteId} onChange={e => setClienteId(e.target.value)}>
                    <option value="">Seleccionar cliente</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
            </div>

            <div className="ped-field">
                <label className="ped-field-label">Estado</label>
                <select className="ped-input" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="ped-field">
                <label className="ped-field-label">Fecha</label>
                <input className="ped-input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>

            <div className="ped-items-section">
                <div className="ped-items-label">
                    <span>Productos</span>
                    <button type="button" onClick={addItem}>+ Agregar</button>
                </div>
                {items.map((it, i) => (
                    <div key={i} className="ped-item-row">
                        <select
                            value={it.productoId}
                            onChange={e => updateItem(i, 'productoId', e.target.value)}
                        >
                            <option value="">Seleccionar…</option>
                            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={it.cantidad}
                            onChange={e => updateItem(i, 'cantidad', e.target.value)}
                            placeholder="Cant."
                        />
                        <button className="ped-item-remove" onClick={() => removeItem(i)} disabled={items.length === 1}>✕</button>
                    </div>
                ))}
            </div>

            {total > 0 && (
                <div style={{ marginBottom: '0.75rem', fontSize: '12px', fontWeight: 400, textAlign: 'right', color: 'var(--pink)' }}>
                    Total estimado: <strong>${formatPrecio(total)}</strong>
                </div>
            )}

            <div className="ped-field">
                <label className="ped-field-label">Notas</label>
                <input className="ped-input" type="text" placeholder="Indicaciones especiales…"
                    value={notas} onChange={e => setNotas(e.target.value)} />
            </div>

            <button className="ped-btn-create" onClick={handleCrear} disabled={!valido || creando}>
                {creando ? 'Guardando…' : 'Crear pedido'}
            </button>
        </aside>
    )
}


function Paginacion({ pagina, total, onChange, desde, hasta, totalItems }) {
    if (total <= 1) return null
    const paginas = []
    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || Math.abs(i - pagina) <= 2) paginas.push(i)
        else if (paginas[paginas.length - 1] !== '…') paginas.push('…')
    }
    return (
        <div className="ped-paginacion">
            <button className="ped-pag-btn" disabled={pagina === 1} onClick={() => onChange(pagina - 1)}>← Ant</button>
            {paginas.map((p, i) => p === '…'
                ? <span key={`e${i}`} className="ped-pag-info">…</span>
                : <button key={p} className={`ped-pag-btn${p === pagina ? ' activo' : ''}`} onClick={() => onChange(p)}>{p}</button>
            )}
            <button className="ped-pag-btn" disabled={pagina === total} onClick={() => onChange(pagina + 1)}>Sig →</button>
            <span className="ped-pag-info">{desde}–{hasta} de {totalItems}</span>
        </div>
    )
}


function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
    const [productos, setProductos] = useState([])
    const [creando, setCreando] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [orden, setOrden] = useState('reciente')
    const [pagina, setPagina] = useState(1)

    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(c => [String(c.id), c])), [clientes])

    const procesados = useMemo(() => {
        let lista = [...pedidos]

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            lista = lista.filter(p => {
                const cliente = clienteMap[String(p.clienteId)] || {}
                return (cliente.nombre || '').toLowerCase().includes(q) ||
                    String(p.id).includes(q) ||
                    (p.notas || '').toLowerCase().includes(q)
            })
        }

        if (filtroEstado) {
            lista = lista.filter(p => (p.estado || 'pendiente').toLowerCase() === filtroEstado)
        }

        switch (orden) {
            case 'reciente': lista.sort((a, b) => new Date(b.fecha || b.createdAt || 0) - new Date(a.fecha || a.createdAt || 0)); break
            case 'antiguo': lista.sort((a, b) => new Date(a.fecha || a.createdAt || 0) - new Date(b.fecha || b.createdAt || 0)); break
            case 'mayor-total': lista.sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0)); break
            case 'menor-total': lista.sort((a, b) => (parseFloat(a.total) || 0) - (parseFloat(b.total) || 0)); break
            default: break
        }

        return lista
    }, [pedidos, busqueda, filtroEstado, orden, clienteMap])

    useEffect(() => { setPagina(1) }, [busqueda, filtroEstado, orden])

    const totalPaginas = Math.ceil(procesados.length / POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * POR_PAGINA
    const hasta = Math.min(desde + POR_PAGINA, procesados.length)
    const paginados = procesados.slice(desde, hasta)

    async function obtener() {
        try {
            const [rPed, rCli, rProd] = await Promise.all([
                api.get('/pedidos'),
                api.get('/clientes'),
                api.get('/productos'),
            ])
            setPedidos(rPed.data.data || rPed.data || [])
            setClientes(rCli.data.data || rCli.data || [])
            setProductos(rProd.data.data || rProd.data || [])
        } catch (e) { console.log(e) }
    }

    async function crearPedido(datos, onExito) {
        setCreando(true)
        try {
            await api.post('/pedidos', datos)
            await obtener()
            onExito()
        } catch (e) { console.log(e) }
        finally { setCreando(false) }
    }

    async function editarPedido(id, datos) {
        try {
            await api.put(`/pedidos/${id}`, datos)
            setPedidos(prev => prev.map(p => p.id === id ? { ...p, ...datos } : p))
        } catch (e) { console.log(e) }
    }

    async function cambiarEstado(id, nuevoEstado) {
        try {
            await api.patch(`/pedidos/${id}`, { estado: nuevoEstado })
            setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p))
        } catch (e) {
            try {
                const pedido = pedidos.find(p => p.id === id)
                if (pedido) await editarPedido(id, { ...pedido, estado: nuevoEstado })
            } catch (_) { console.log(e) }
        }
    }

    async function eliminarPedido(id) {
        try {
            await api.delete(`/pedidos/${id}`)
            setPedidos(prev => prev.filter(p => p.id !== id))
        } catch (e) { console.log(e) }
    }

    useEffect(() => { obtener() }, [])

    const hayFiltros = busqueda.trim() || filtroEstado

    return (
        <div className="ped-contenedor">
            <header className="ped-header">
                <div>
                    <p className="ped-label">Sistema de gestión</p>
                    <h1 className="ped-title">SRM <em>Pedidos</em></h1>
                </div>
                <span className="ped-header-count">
                    {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                </span>
            </header>

            <div className="ped-toolbar">
                <div className="ped-search-wrap">
                    <span className="ped-search-icon">⌕</span>
                    <input
                        placeholder="Buscar por cliente, notas o ID…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <select className="ped-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {ESTADOS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <select className="ped-select" value={orden} onChange={e => setOrden(e.target.value)}>
                    <option value="reciente">Más reciente</option>
                    <option value="antiguo">Más antiguo</option>
                    <option value="mayor-total">Mayor total</option>
                    <option value="menor-total">Menor total</option>
                </select>
                {hayFiltros && (
                    <span className="ped-results-label">{procesados.length} resultado{procesados.length !== 1 ? 's' : ''}</span>
                )}
            </div>

            <div className="ped-layout">
                <FormularioPedido
                    onCrear={crearPedido}
                    creando={creando}
                    clientes={clientes}
                    productos={productos}
                />

                <section>
                    <h2 className="ped-list-header">
                        Registro
                        {pedidos.length > 0 && (
                            <span className="ped-badge">
                                {hayFiltros ? `${procesados.length} / ${pedidos.length}` : pedidos.length}
                            </span>
                        )}
                    </h2>

                    {procesados.length === 0
                        ? <p className="ped-empty">Ningún pedido encontrado.</p>
                        : <>
                            <div className="ped-grid">
                                {paginados.map(p => (
                                    <TarjetaPedido
                                        key={p.id}
                                        pedido={p}
                                        clientes={clientes}
                                        onEliminar={eliminarPedido}
                                        onEditar={editarPedido}
                                        onCambiarEstado={cambiarEstado}
                                    />
                                ))}
                            </div>
                            <Paginacion
                                pagina={paginaReal}
                                total={totalPaginas}
                                onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                desde={desde + 1}
                                hasta={hasta}
                                totalItems={procesados.length}
                            />
                        </>
                    }
                </section>
            </div>
        </div>
    )
}

export default Pedidos