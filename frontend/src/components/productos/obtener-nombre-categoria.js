export default function obtenerNombreCategoria(producto, categorias) {
    if (typeof producto.categoria === 'string') return producto.categoria
    if (producto.categoria?.nombre) return producto.categoria.nombre

    const categoria = categorias.find(cat => String(cat.id) === String(producto.categoriaId))
    return categoria?.nombre || ''
}
