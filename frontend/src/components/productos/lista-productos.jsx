import TarjetaProducto from "./tarjeta-producto"
import Paginacion from "../paginacion/paginacion"
import TablaProductos from "./tabla-productos"
import { useState } from "react"

const PRODUCTOS_POR_PAGINA = 10

export default function ListaProductos({ productos, onEliminar, onEditar, categorias, pagina, setPagina, vista }) {
    const [editandoId, setEditandoId] = useState(null)
    const totalPaginas = Math.ceil(productos.length / PRODUCTOS_POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * PRODUCTOS_POR_PAGINA
    const hasta = Math.min(desde + PRODUCTOS_POR_PAGINA, productos.length)
    const paginados = productos.slice(desde, hasta)

    if (productos.length === 0) {
        return <p className="empty-state sin-productos">Ningún producto encontrado.</p>
    }

    if (vista === 'tabla') {
        return (
            <TablaProductos
                productos={productos}
                onEliminar={onEliminar}
                onEditar={onEditar}
                categorias={categorias}
                pagina={pagina}
                setPagina={setPagina}
            />
        )
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
                        editando={String(editandoId) === String(p.id)}
                        onIniciarEdicion={() => setEditandoId(p.id)}
                        onCerrarEdicion={() => setEditandoId(null)}
                    />
                ))}
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
