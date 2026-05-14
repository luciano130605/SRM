export default function obtenerNombreCategoria(producto, categorias) {
    if (producto.categoria) return producto.categoria

    const categoria = categorias.find(cat => String(cat.id) === String(producto.categoriaId))
    return categoria?.nombre || ''
}