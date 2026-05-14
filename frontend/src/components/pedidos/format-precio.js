export default function formatPrecio(valor) {
    return (parseFloat(valor) || 0).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}
