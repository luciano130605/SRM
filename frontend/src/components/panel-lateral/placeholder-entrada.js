
export default function placeholderEntrada(paso) {
    if (paso === "precioVenta" || paso === "costo") return "Escribi un importe..."
    if (paso === "cantidad") return "Escribi la cantidad..."
    if (paso === "fecha") return "Día/Mes/Año"
    if (paso) return "Responder..."
    return "Ej. quiero agregar producto"
}
