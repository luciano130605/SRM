export default function formatPrecio(valor) {
    const n = parseFloat(valor) || 0
    return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}