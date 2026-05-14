export default function calcularMargen(costo, venta) {
    const c = parseFloat(costo) || 0
    const v = parseFloat(venta) || 0
    return c > 0 ? Math.round(((v - c) / c) * 100) : null
}