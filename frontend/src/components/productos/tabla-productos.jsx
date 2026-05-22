import { useState } from "react"
import calcularMargen from "./calcular-margen"
import obtenerNombreCategoria from "./obtener-nombre-categoria"
import formatPrecio from "./format-precio"
import Paginacion from "../paginacion/paginacion"
import Edit from "../../icons/Edit"
import Save from "../../icons/Save"
import X from "../../icons/X"

const PRODUCTOS_POR_PAGINA = 10

export default function TablaProductos({ productos, onEliminar, onEditar, categorias, pagina, setPagina }) {
    const [editandoId, setEditandoId] = useState(null)
    const [draft, setDraft] = useState({})

    const totalPaginas = Math.ceil(productos.length / PRODUCTOS_POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * PRODUCTOS_POR_PAGINA
    const hasta = Math.min(desde + PRODUCTOS_POR_PAGINA, productos.length)
    const paginados = productos.slice(desde, hasta)

    function iniciarEdicion(producto) {
        setEditandoId(producto.id)
        setDraft({
            nombre: producto.nombre,
            categoriaId: producto.categoriaId || '',
            costo: producto.costo ?? '',
            precioVenta: producto.precioVenta ?? '',
        })
    }

    function cancelarEdicion() {
        setEditandoId(null)
        setDraft({})
    }

    async function guardarEdicion(id) {
        if (!draft.nombre?.trim() || !draft.precioVenta) return

        await onEditar(id, draft)
        cancelarEdicion()
    }

    function handleDraftKey(e, id) {
        if (e.key === 'Enter') guardarEdicion(id)
        if (e.key === 'Escape') cancelarEdicion()
    }

    if (productos.length === 0) {
        return <p className="empty-state sin-productos">Ningun producto encontrado.</p>
    }

    return (
        <div>
            <div className="data-table-wrap tabla-productos-wrap">
                <table className="data-table tabla-productos">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoria</th>
                            <th>Costo</th>
                            <th>Venta</th>
                            <th>Margen</th>
                            <th aria-label="Acciones" />
                        </tr>
                    </thead>

                    <tbody>
                        {paginados.map(producto => {
                            const editando = String(editandoId) === String(producto.id)
                            const costo = parseFloat(producto.costo) || 0
                            const venta = parseFloat(producto.precioVenta) || 0
                            const margen = calcularMargen(costo, venta)
                            const categoriaNombre = obtenerNombreCategoria(producto, categorias)

                            return (
                                <tr key={producto.id} className={editando ? 'editando' : ''}>
                                    <td data-label="Producto">
                                        {editando ? (
                                            <input
                                                className="table-input tabla-input"
                                                autoFocus
                                                value={draft.nombre}
                                                onChange={e => setDraft(d => ({ ...d, nombre: e.target.value }))}
                                                onKeyDown={e => handleDraftKey(e, producto.id)}
                                            />
                                        ) : (
                                            <span className="tabla-producto-nombre" title={producto.nombre}>{producto.nombre}</span>
                                        )}
                                    </td>

                                    <td data-label="Categoria">
                                        {editando ? (
                                            <select
                                                className="table-input tabla-input"
                                                value={draft.categoriaId}
                                                onChange={e => setDraft(d => ({ ...d, categoriaId: e.target.value }))}
                                                onKeyDown={e => handleDraftKey(e, producto.id)}
                                            >
                                                <option value="">Sin categoria</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            categoriaNombre || 'Sin categoria'
                                        )}
                                    </td>

                                    <td data-label="Costo">
                                        {editando ? (
                                            <input
                                                className="table-input table-input-number tabla-input tabla-input-number"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={draft.costo}
                                                onChange={e => setDraft(d => ({ ...d, costo: e.target.value }))}
                                                onKeyDown={e => handleDraftKey(e, producto.id)}
                                            />
                                        ) : (
                                            costo > 0 ? `$${formatPrecio(costo)}` : '-'
                                        )}
                                    </td>

                                    <td data-label="Venta">
                                        {editando ? (
                                            <input
                                                className="table-input table-input-number tabla-input tabla-input-number"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={draft.precioVenta}
                                                onChange={e => setDraft(d => ({ ...d, precioVenta: e.target.value }))}
                                                onKeyDown={e => handleDraftKey(e, producto.id)}
                                            />
                                        ) : (
                                            <span className="tabla-venta">${formatPrecio(venta)}</span>
                                        )}
                                    </td>

                                    <td data-label="Margen">
                                        {margen !== null ? `${margen}%` : '-'}
                                    </td>

                                    <td className="table-actions tabla-actions">
                                        {editando ? (
                                            <>
                                                <button className="btn-icon btn-save" onClick={() => guardarEdicion(producto.id)} title="Guardar">
                                                    <Save size={12} />
                                                </button>
                                                <button className="btn-cancel-card" onClick={cancelarEdicion} title="Cancelar">
                                                    <X size={12} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn-icon btn-edit" onClick={() => iniciarEdicion(producto)} title="Editar">
                                                    <Edit size={12} />
                                                </button>
                                                <button className="btn-icon btn-delete" onClick={() => onEliminar(producto.id)} title="Eliminar">
                                                    <X size={12} />
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

            <Paginacion
                pagina={paginaReal}
                total={totalPaginas}
                onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                totalItems={productos.length}
                desde={desde + 1}
                hasta={hasta}
            />
        </div>
    )
}
