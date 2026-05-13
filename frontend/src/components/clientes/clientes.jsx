import { useEffect, useState, useMemo } from 'react'
import api from "../../../services/api"
import "./clientes.css"

const POR_PAGINA = 18

function iniciales(nombre = '') {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?'
}

function TarjetaCliente({ cliente, onEliminar, onEditar, pedidosCount }) {
    const [editando, setEditando] = useState(false)
    const [draft, setDraft] = useState({})

    function iniciarEdicion() {
        setDraft({
            nombre: cliente.nombre || '',
            telefono: cliente.telefono || '',
            direccion: cliente.direccion || '',
            notas: cliente.notas || '',
            instagram: cliente.instagram || '',
        })
        setEditando(true)
    }

    function cancelar() { setEditando(false); setDraft({}) }

    async function guardar() {
        if (!draft.nombre?.trim()) return
        await onEditar(cliente.id, draft)
        setEditando(false)
        setDraft({})
    }

    function onKey(e) {
        if (e.key === 'Enter') guardar()
        if (e.key === 'Escape') cancelar()
    }

    const fecha = cliente.createdAt
        ? new Date(cliente.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })
        : null

    return (
        <article className={`cli-card${editando ? ' editando' : ''}`}>
            <div className="cli-card-top">
                <div className="cli-av">{iniciales(editando ? draft.nombre : cliente.nombre)}</div>
                <div className="cli-card-info">
                    {!editando && <p className="cli-card-nombre" title={cliente.nombre}>{cliente.nombre}</p>}
                    {!editando && (cliente.telefono) && (
                        <p className="cli-card-meta">{cliente.telefono}</p>
                    )}
                </div>
                <div className="cli-card-actions">
                    {editando ? (
                        <>
                            <button className="btn-icon btn-save" onClick={guardar} title="Guardar">✓</button>
                            <button className="btn-icon btn-cancel" onClick={cancelar} title="Cancelar">✕</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-icon btn-edit" onClick={iniciarEdicion} title="Editar">✎</button>
                            <button className="btn-icon btn-delete" onClick={() => onEliminar(cliente.id)} title="Eliminar">✕</button>
                        </>
                    )}
                </div>
            </div>

            {editando ? (
                <div className="cli-edit-grid" onKeyDown={onKey}>
                    <div className="cli-edit-field span-2">
                        <label className="cli-edit-label">Nombre</label>
                        <input autoFocus className="cli-edit-input" value={draft.nombre}
                            onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))} />
                    </div>
                    <div className="cli-edit-field">
                        <label className="cli-edit-label">Teléfono</label>
                        <input className="cli-edit-input" value={draft.telefono}
                            onChange={e => setDraft(d => ({ ...d, telefono: e.target.value }))} />
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
                        <label className="cli-edit-label">Dirección</label>
                        <input className="cli-edit-input" value={draft.direccion}
                            onChange={e => setDraft(d => ({ ...d, direccion: e.target.value }))} />
                    </div>
                    <div className="cli-edit-field span-2">
                        <label className="cli-edit-label">Notas</label>
                        <input className="cli-edit-input" value={draft.notas}
                            onChange={e => setDraft(d => ({ ...d, notas: e.target.value }))} />
                    </div>
                </div>
            ) : (
                <>
                    {(cliente.telefono || cliente.direccion || cliente.instagram) && (
                        <div className="cli-card-contacto">
                            {cliente.instagram && (
                                <span className="cli-contacto-row">
                                    <span className="cli-contacto-icon">📸</span>{cliente.instagram}
                                </span>
                            )}
                            {cliente.telefono && (
                                <span className="cli-contacto-row">
                                    <span className="cli-contacto-icon">📞</span>{cliente.telefono}
                                </span>
                            )}
                            {cliente.direccion && (
                                <span className="cli-contacto-row">
                                    <span className="cli-contacto-icon">📍</span>{cliente.direccion}
                                </span>
                            )}
                        </div>
                    )}
                    <div className="cli-card-bottom">
                        <span className="cli-card-pedidos">
                            {pedidosCount > 0 ? `${pedidosCount} pedido${pedidosCount !== 1 ? 's' : ''}` : 'Sin pedidos'}
                        </span>
                        {fecha && <span className="cli-card-fecha">desde {fecha}</span>}
                    </div>
                </>
            )}
        </article>
    )
}

function FormularioCliente({ onCrear, creando }) {
    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [direccion, setDireccion] = useState('')
    const [notas, setNotas] = useState('')
    const [instagram, setInstagram] = useState('')

    function handleCrear() {
        if (!nombre.trim()) return
        onCrear({ nombre, telefono, direccion, notas, instagram }, () => {
            setNombre('')
            setTelefono('')
            setDireccion('')
            setNotas('')
            setInstagram('')
        })
    }

    return (
        <aside className="cli-form-panel">
            <h2 className="cli-panel-title">Agregar cliente</h2>

            {[
                { label: 'Nombre *', val: nombre, set: setNombre, ph: 'Nombre completo', type: 'text' },
                {
                    label: 'Instagram',
                    val: instagram,
                    set: setInstagram,
                    ph: '@usuario',
                    type: 'text'
                },
                { label: 'Teléfono', val: telefono, set: setTelefono, ph: 'Ej. 11 1234-5678', type: 'tel' },
                { label: 'Dirección', val: direccion, set: setDireccion, ph: 'Calle y número', type: 'text' },
                { label: 'Notas', val: notas, set: setNotas, ph: 'Preferencias, alergias…', type: 'text' },
            ].map(({ label, val, set, ph, type }) => (
                <div key={label} className="cli-field">
                    <label className="cli-label-field">{label}</label>
                    <input
                        className="cli-input"
                        type={type}
                        placeholder={ph}
                        value={val}
                        onChange={e => set(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && nombre.trim() && handleCrear()}
                    />
                </div>
            ))}

            <button
                className="cli-btn-create"
                onClick={handleCrear}
                disabled={!nombre.trim() || creando}
            >
                {creando ? 'Guardando…' : 'Crear cliente'}
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
        <div className="cli-paginacion">
            <button className="cli-pag-btn" disabled={pagina === 1} onClick={() => onChange(pagina - 1)}>← Ant</button>
            {paginas.map((p, i) => p === '…'
                ? <span key={`e${i}`} className="cli-pag-info">…</span>
                : <button key={p} className={`cli-pag-btn${p === pagina ? ' activo' : ''}`} onClick={() => onChange(p)}>{p}</button>
            )}
            <button className="cli-pag-btn" disabled={pagina === total} onClick={() => onChange(pagina + 1)}>Sig →</button>
            <span className="cli-pag-info">{desde}–{hasta} de {totalItems}</span>
        </div>
    )
}

function Clientes() {
    const [clientes, setClientes] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [creando, setCreando] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState('reciente')
    const [pagina, setPagina] = useState(1)

    const pedidosPorCliente = useMemo(() =>
        pedidos.reduce((acc, p) => {
            if (p.clienteId) acc[p.clienteId] = (acc[p.clienteId] || 0) + 1
            return acc
        }, {}), [pedidos])

    const procesados = useMemo(() => {
        let lista = [...clientes]
        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            lista = lista.filter(c =>
                (c.nombre || '').toLowerCase().includes(q) ||
                (c.telefono || '').includes(q)
            )
        }
        switch (orden) {
            case 'az': lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es')); break
            case 'za': lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || '', 'es')); break
            case 'mas-pedidos': lista.sort((a, b) => (pedidosPorCliente[b.id] || 0) - (pedidosPorCliente[a.id] || 0)); break
            default: break
        }
        return lista
    }, [clientes, busqueda, orden, pedidosPorCliente])

    useEffect(() => { setPagina(1) }, [busqueda, orden])

    const totalPaginas = Math.ceil(procesados.length / POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * POR_PAGINA
    const hasta = Math.min(desde + POR_PAGINA, procesados.length)
    const paginados = procesados.slice(desde, hasta)

    async function obtener() {
        try {
            const [rCli, rPed] = await Promise.all([api.get('/clientes'), api.get('/pedidos')])
            setClientes(rCli.data?.data ?? rCli.data ?? [])
            setPedidos(rPed.data?.data ?? rPed.data ?? [])
        } catch (e) { console.log(e) }
    }

    async function crearCliente(datos, onExito) {
        setCreando(true)
        try {
            await api.post('/clientes', datos)
            await obtener()
            onExito()
        } catch (e) { console.log(e) }
        finally { setCreando(false) }
    }

    async function editarCliente(id, datos) {
        try {
            await api.put(`/clientes/${id}`, datos)
            setClientes(prev => prev.map(c => c.id === id ? { ...c, ...datos } : c))
        } catch (e) { console.log(e) }
    }

    async function eliminarCliente(id) {
        try {
            await api.delete(`/clientes/${id}`)
            setClientes(prev => prev.filter(c => c.id !== id))
        } catch (e) { console.log(e) }
    }

    useEffect(() => { obtener() }, [])

    const hayFiltros = busqueda.trim()

    return (
        <div className="cli-contenedor">
            <header className="cli-header">
                <div>
                    <p className="cli-label">Sistema de gestión</p>
                    <h1 className="cli-title">SRM <em>Clientes</em></h1>
                </div>
                <span className="cli-header-count">
                    {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
                </span>
            </header>

            <div className="cli-toolbar">
                <div className="cli-search-wrap">
                    <span className="cli-search-icon">⌕</span>
                    <input
                        placeholder="Buscar por nombre o teléfono…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>
                <select className="cli-select" value={orden} onChange={e => setOrden(e.target.value)}>
                    <option value="reciente">Más reciente</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                    <option value="mas-pedidos">Más pedidos</option>
                </select>
                {hayFiltros && (
                    <span className="cli-results-label">{procesados.length} resultado{procesados.length !== 1 ? 's' : ''}</span>
                )}
            </div>

            <div className="cli-layout">
                <FormularioCliente onCrear={crearCliente} creando={creando} />

                <section>
                    <h2 className="cli-list-header">
                        Directorio
                        {clientes.length > 0 && (
                            <span className="cli-badge">
                                {hayFiltros ? `${procesados.length} / ${clientes.length}` : clientes.length}
                            </span>
                        )}
                    </h2>

                    {procesados.length === 0
                        ? <p className="cli-empty">Ningún cliente encontrado.</p>
                        : <>
                            <div className="cli-grid">
                                {paginados.map(c => (
                                    <TarjetaCliente
                                        key={c.id}
                                        cliente={c}
                                        onEliminar={eliminarCliente}
                                        onEditar={editarCliente}
                                        pedidosCount={pedidosPorCliente[c.id] || 0}
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

export default Clientes