import { useState } from "react"
import calcularMargen from "./calcular-margen"
import obtenerNombreCategoria from "./obtener-nombre-categoria"
import formatPrecio from "./format-precio"
import Edit from "../../icons/Edit"
import X from "../../icons/X"
import Save from "../../icons/Save"
import Tarjeta from "../tarjeta/tarjeta"

export default function TarjetaProducto({
    producto,
    onEliminar,
    onEditar,
    categorias,
    editando = false,
    onIniciarEdicion,
    onCerrarEdicion,
}) {
    const [draft, setDraft] = useState({})

    const costo = parseFloat(producto.costo) || 0
    const venta = parseFloat(producto.precioVenta) || 0
    const margen = calcularMargen(costo, venta)
    const categoriaNombre = obtenerNombreCategoria(producto, categorias)

    function iniciarEdicion() {
        setDraft({
            nombre: producto.nombre,
            categoriaId: producto.categoriaId || '',
            costo: producto.costo ?? '',
            precioVenta: producto.precioVenta ?? '',
        })
        onIniciarEdicion()
    }

    function cancelarEdicion() {
        setDraft({})
        onCerrarEdicion()
    }

    async function guardarEdicion() {
        if (!draft.nombre?.trim() || !draft.precioVenta) return
        await onEditar(producto.id, draft)
        setDraft({})
        onCerrarEdicion()
    }

    function handleDraftKey(e) {
        if (e.key === 'Enter') guardarEdicion()
        if (e.key === 'Escape') cancelarEdicion()
    }

    const header = (
        <>
                    {categoriaNombre && !editando && (
                        <p className="producto-categoria">{categoriaNombre}</p>
                    )}
                    {!editando && (
                        <h3 className="producto-nombre" title={producto.nombre}>{producto.nombre}</h3>
                    )}
        </>
    )

    const actions = editando ? (
        <>
            <button className="btn-icon btn-edit" onClick={guardarEdicion} title="Guardar (Enter)"><Save size={12} /></button>
            <button className="btn-icon btn-delete" onClick={cancelarEdicion} title="Cancelar (Esc)"><X size={12} /></button>
        </>
    ) : (
        <>
            <button className="btn-icon btn-edit" onClick={iniciarEdicion} title="Editar"><Edit size={12} /></button>
            <button className="btn-icon btn-delete" onClick={() => onEliminar(producto.id)} title="Eliminar"><X size={12} /></button>
        </>
    )

    const editContent = (
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
                            value={draft.categoriaId}
                            onChange={e => setDraft(d => ({ ...d, categoriaId: e.target.value }))}
                        >
                            <option value="">Sin categoría</option>
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
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
    )

    return (
        <Tarjeta
            className="card-producto"
            editando={editando}
            topClassName="card-top"
            infoClassName="card-info"
            actionsClassName="card-actions"
            header={header}
            actions={actions}
            editContent={editContent}
        >
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
                            <span className="item-margen-label" title="Margen de ganancia %">{margen}%</span>
                        )}
                    </div>
                </div>
        </Tarjeta>
    )
}
