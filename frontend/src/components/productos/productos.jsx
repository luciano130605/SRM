import { useEffect, useState, useMemo } from 'react'
import api from "../../../services/api"
import "./productos.css"

const CATEGORIAS_DEFAULT = ['Tortas', 'Cupcakes', 'Cookies', 'Postres', 'Desayunos', 'Bebidas']
const PRODUCTOS_POR_PAGINA = 18

function calcularMargen(costo, venta) {
    const c = parseFloat(costo) || 0
    const v = parseFloat(venta) || 0
    return c > 0 ? Math.round(((v - c) / c) * 100) : null
}

function formatPrecio(valor) {
    const n = parseFloat(valor) || 0
    return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}


function GestorCategorias({ categorias, setCategorias, productosPorCategoria }) {
    const [nueva, setNueva] = useState('')
    const [visible, setVisible] = useState(false)

    function agregarCategoria() {
        const nombre = nueva.trim()
        if (!nombre || categorias.includes(nombre)) return
        setCategorias(prev => [...prev, nombre])
        setNueva('')
    }

    function eliminarCategoria(cat) {
        const enUso = (productosPorCategoria[cat] || 0) > 0
        if (enUso) {
            if (!window.confirm(`La categoría "${cat}" está siendo usada por ${productosPorCategoria[cat]} producto(s). ¿Querés eliminarla de todas formas?`)) return
        }
        setCategorias(prev => prev.filter(c => c !== cat))
    }

    return (
        <div>
            <div className="panel-section-divider" />
            <div className="categorias-manager-title">
                <span>Categorías</span>
                <button onClick={() => setVisible(v => !v)}>
                    {visible ? 'Ocultar' : 'Gestionar'}
                </button>
            </div>

            {visible && (
                <>
                    <div className="categorias-list">
                        {categorias.map(cat => (
                            <div key={cat} className="categoria-item">
                                <span className="categoria-item-dot" />
                                <span className="categoria-item-name">{cat}</span>
                                {(productosPorCategoria[cat] || 0) > 0 && (
                                    <span className="categoria-item-count">
                                        {productosPorCategoria[cat]}
                                    </span>
                                )}
                                <button
                                    className="btn-cat-delete"
                                    onClick={() => eliminarCategoria(cat)}
                                    title="Eliminar categoría"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="categoria-nueva-row">
                        <input
                            className="categoria-nueva-input"
                            placeholder="Nueva categoría…"
                            value={nueva}
                            onChange={e => setNueva(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && agregarCategoria()}
                        />
                        <button
                            className="btn-cat-add"
                            onClick={agregarCategoria}
                            disabled={!nueva.trim() || categorias.includes(nueva.trim())}
                            title="Agregar"
                        >
                            +
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}


function FormularioProducto({ onCrear, creando, categorias, setCategorias, productosPorCategoria }) {
    const [nombre, setNombre] = useState('')
    const [categoria, setCategoria] = useState('')
    const [costo, setCosto] = useState('')
    const [precioVenta, setPrecioVenta] = useState('')

    function handleCrear() {
        if (!nombre.trim() || !precioVenta) return
        onCrear({ nombre, categoria, costo, precioVenta }, () => {
            setNombre('')
            setCategoria('')
            setCosto('')
            setPrecioVenta('')
        })
    }

    const valido = nombre.trim() !== '' && precioVenta !== ''

    return (
        <aside className="form-panel">
            <h2 className="panel-title">Agregar producto</h2>

            <div className="form-label-Conteiner">
                <label className="form-label">Nombre</label>
                <input
                    className="form-input"
                    type="text"
                    placeholder="Ej. Torta de chocolate"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && valido && handleCrear()}
                />
            </div>

            <div className="form-label-Conteiner">
                <label className="form-label">Categoría</label>
                <select
                    className="form-input"
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                >
                    <option value="">Sin categoría</option>
                    {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="form-label-Conteiner">
                <label className="form-label">Costo de producción</label>
                <input
                    className="form-input"
                    type="number"
                    placeholder="0.00"
                    value={costo}
                    onChange={e => setCosto(e.target.value)}
                    min="0"
                    step="0.01"
                />
            </div>

            <div className="form-label-Conteiner">
                <label className="form-label">Precio de venta</label>
                <input
                    className="form-input"
                    type="number"
                    placeholder="0.00"
                    value={precioVenta}
                    onChange={e => setPrecioVenta(e.target.value)}
                    min="0"
                    step="0.01"
                />
            </div>

            <button
                className="form-btn-create"
                onClick={handleCrear}
                disabled={!valido || creando}
            >
                {creando ? 'Guardando…' : 'Crear producto'}
            </button>

            <GestorCategorias
                categorias={categorias}
                setCategorias={setCategorias}
                productosPorCategoria={productosPorCategoria}
            />
        </aside>
    )
}


function TarjetaProducto({ producto, onEliminar, onEditar, categorias }) {
    const [editando, setEditando] = useState(false)
    const [draft, setDraft] = useState({})

    const costo = parseFloat(producto.costo) || 0
    const venta = parseFloat(producto.precioVenta) || 0
    const margen = calcularMargen(costo, venta)

    function iniciarEdicion() {
        setDraft({
            nombre: producto.nombre,
            categoria: producto.categoria || '',
            costo: producto.costo ?? '',
            precioVenta: producto.precioVenta ?? '',
        })
        setEditando(true)
    }

    function cancelarEdicion() {
        setEditando(false)
        setDraft({})
    }

    async function guardarEdicion() {
        if (!draft.nombre?.trim() || !draft.precioVenta) return
        await onEditar(producto.id, draft)
        setEditando(false)
        setDraft({})
    }

    function handleDraftKey(e) {
        if (e.key === 'Enter') guardarEdicion()
        if (e.key === 'Escape') cancelarEdicion()
    }

    return (
        <article className={`card-producto${editando ? ' editando' : ''}`}>
            <div className="card-top">
                <div className="card-info">
                    {producto.categoria && !editando && (
                        <p className="producto-categoria">{producto.categoria}</p>
                    )}
                    {!editando && (
                        <h3 className="producto-nombre" title={producto.nombre}>{producto.nombre}</h3>
                    )}
                </div>

                <div className="card-actions">
                    {editando ? (
                        <>
                            <button className="btn-icon btn-save" onClick={guardarEdicion} title="Guardar (Enter)">✓</button>
                            <button className="btn-icon btn-cancel" onClick={cancelarEdicion} title="Cancelar (Esc)">✕</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-icon btn-edit" onClick={iniciarEdicion} title="Editar">✎</button>
                            <button className="btn-icon btn-delete" onClick={() => onEliminar(producto.id)} title="Eliminar">✕</button>
                        </>
                    )}
                </div>
            </div>

            {editando ? (
                <div className="edit-grid" onKeyDown={handleDraftKey}>
                    <div className="edit-field span-2">
                        <label className="edit-label">Nombre</label>
                        <input
                            className="edit-input"
                            autoFocus
                            value={draft.nombre}
                            onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))}
                            placeholder="Nombre del producto"
                        />
                    </div>
                    <div className="edit-field span-2">
                        <label className="edit-label">Categoría</label>
                        <select
                            className="edit-input"
                            value={draft.categoria}
                            onChange={e => setDraft(d => ({ ...d, categoria: e.target.value }))}
                        >
                            <option value="">Sin categoría</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="edit-field">
                        <label className="edit-label">Costo</label>
                        <input
                            className="edit-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft.costo}
                            onChange={e => setDraft(d => ({ ...d, costo: e.target.value }))}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="edit-field">
                        <label className="edit-label">Venta</label>
                        <input
                            className="edit-input"
                            type="number"
                            min="0"
                            step="0.01"
                            value={draft.precioVenta}
                            onChange={e => setDraft(d => ({ ...d, precioVenta: e.target.value }))}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            ) : (
                <div className="card-bottom">
                    <div className="producto-precio">
                        {costo > 0 && (
                            <div className="precio-item">
                                <span className="item-precio-label">Costo</span>
                                <span className="item-precio-value">${formatPrecio(costo)}</span>
                            </div>
                        )}
                        <div className="precio-item">
                            <span className="item-precio-label">Venta</span>
                            <span className="item-precio-value venta">${formatPrecio(venta)}</span>
                        </div>
                        {margen !== null && (
                            <span className="item-margen-label">{margen}%</span>
                        )}
                    </div>
                </div>
            )}
        </article>
    )
}


function Paginacion({ paginaActual, totalPaginas, onCambiar, totalItems, desde, hasta }) {
    if (totalPaginas <= 1) return null

    const paginas = []
    const rango = 2
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || Math.abs(i - paginaActual) <= rango) {
            paginas.push(i)
        } else if (paginas[paginas.length - 1] !== '…') {
            paginas.push('…')
        }
    }

    return (
        <div className="paginacion">
            <button
                className="paginacion-btn"
                onClick={() => onCambiar(paginaActual - 1)}
                disabled={paginaActual === 1}
            >← Ant</button>

            {paginas.map((p, i) =>
                p === '…' ? (
                    <span key={`ellipsis-${i}`} className="paginacion-info">…</span>
                ) : (
                    <button
                        key={p}
                        className={`paginacion-btn${p === paginaActual ? ' activo' : ''}`}
                        onClick={() => onCambiar(p)}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                className="paginacion-btn"
                onClick={() => onCambiar(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
            >Sig →</button>

            <span className="paginacion-info">{desde}–{hasta} de {totalItems}</span>
        </div>
    )
}


function ListaProductos({ productos, onEliminar, onEditar, categorias, pagina, setPagina }) {
    const totalPaginas = Math.ceil(productos.length / PRODUCTOS_POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * PRODUCTOS_POR_PAGINA
    const hasta = Math.min(desde + PRODUCTOS_POR_PAGINA, productos.length)
    const paginados = productos.slice(desde, hasta)

    if (productos.length === 0) {
        return <p className="sin-productos">Ningún producto encontrado.</p>
    }

    return (
        <div>
            <div className="lista-productos">
                {paginados.map(p => (
                    <TarjetaProducto
                        key={p.id}
                        producto={p}
                        onEliminar={onEliminar}
                        onEditar={onEditar}
                        categorias={categorias}
                    />
                ))}
            </div>
            <Paginacion
                paginaActual={paginaReal}
                totalPaginas={totalPaginas}
                onCambiar={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                totalItems={productos.length}
                desde={desde + 1}
                hasta={hasta}
            />
        </div>
    )
}


function Productos() {
    const [productos, setProductos] = useState([])
    const [creando, setCreando] = useState(false)
    const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT)

    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [orden, setOrden] = useState('reciente')

    const [pagina, setPagina] = useState(1)

    const productosPorCategoria = useMemo(() => {
        return productos.reduce((acc, p) => {
            if (p.categoria) acc[p.categoria] = (acc[p.categoria] || 0) + 1
            return acc
        }, {})
    }, [productos])

    const productosProcesados = useMemo(() => {
        let lista = [...productos]

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            lista = lista.filter(p => p.nombre.toLowerCase().includes(q))
        }

        if (filtroCategoria) {
            lista = lista.filter(p => p.categoria === filtroCategoria)
        }

        switch (orden) {
            case 'az':
                lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                break
            case 'za':
                lista.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'))
                break
            case 'precio-asc':
                lista.sort((a, b) => (parseFloat(a.precioVenta) || 0) - (parseFloat(b.precioVenta) || 0))
                break
            case 'precio-desc':
                lista.sort((a, b) => (parseFloat(b.precioVenta) || 0) - (parseFloat(a.precioVenta) || 0))
                break
            case 'margen-desc':
                lista.sort((a, b) => {
                    const mA = calcularMargen(a.costo, a.precioVenta) ?? -Infinity
                    const mB = calcularMargen(b.costo, b.precioVenta) ?? -Infinity
                    return mB - mA
                })
                break
            default:
                break 
        }

        return lista
    }, [productos, busqueda, filtroCategoria, orden])

    useEffect(() => { setPagina(1) }, [busqueda, filtroCategoria, orden])

    async function obtenerProductos() {
        try {
            const response = await api.get('/productos')
            setProductos(response.data.data)
        } catch (error) {
            console.log(error)
        }
    }

    async function crearProducto(datos, onExito) {
        setCreando(true)
        try {
            await api.post('/productos', datos)
            await obtenerProductos()
            onExito()
        } catch (error) {
            console.log(error)
        } finally {
            setCreando(false)
        }
    }

    async function editarProducto(id, datos) {
        try {
            await api.put(`/productos/${id}`, datos)
            setProductos(prev => prev.map(p => p.id === id ? { ...p, ...datos } : p))
        } catch (error) {
            console.log(error)
        }
    }

    async function eliminarProducto(id) {
        try {
            await api.delete(`/productos/${id}`)
            setProductos(prev => prev.filter(p => p.id !== id))
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => { obtenerProductos() }, [])

    const hayFiltros = busqueda.trim() || filtroCategoria
    const totalFiltrados = productosProcesados.length

    return (
        <div className="contenedor-productos">
            <header className="contenedor-header">
                <div>
                    <p className="productos-label">Sistema de gestión</p>
                    <h1 className="productos-title">SRM <em>Pastelería</em></h1>
                </div>
                <span className="productos-header-count">
                    {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
                </span>
            </header>

            {/* Barra de herramientas */}
            <div className="toolbar">
                <div className="toolbar-search">
                    <span className="toolbar-search-icon">⌕</span>
                    <input
                        placeholder="Buscar productos…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    className="toolbar-select"
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                >
                    <option value="">Todas las categorías</option>
                    {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    className="toolbar-select"
                    value={orden}
                    onChange={e => setOrden(e.target.value)}
                >
                    <option value="reciente">Más reciente</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                    <option value="precio-desc">Mayor precio</option>
                    <option value="precio-asc">Menor precio</option>
                    <option value="margen-desc">Mayor margen</option>
                </select>

                {hayFiltros && (
                    <span className="toolbar-results">
                        {totalFiltrados} resultado{totalFiltrados !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="contenedor-form">
                <FormularioProducto
                    onCrear={crearProducto}
                    creando={creando}
                    categorias={categorias}
                    setCategorias={setCategorias}
                    productosPorCategoria={productosPorCategoria}
                />

                <section>
                    <h2 className="form-list-header">
                        Catálogo
                        {productos.length > 0 && (
                            <span className="cant-productos">
                                {hayFiltros ? `${totalFiltrados} / ${productos.length}` : productos.length}
                            </span>
                        )}
                    </h2>

                    <ListaProductos
                        productos={productosProcesados}
                        onEliminar={eliminarProducto}
                        onEditar={editarProducto}
                        categorias={categorias}
                        pagina={pagina}
                        setPagina={setPagina}
                    />
                </section>
            </div>
        </div>
    )
}

export default Productos