export default function formatPrecio(v) {
    return (parseFloat(v) || 0).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
}