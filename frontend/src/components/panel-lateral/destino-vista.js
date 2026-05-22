
export default function destinoVista(tipo) {
    if (tipo === "categorias") return "productos"
    if (tipo === "metodos-contacto") return "clientes"
    return tipo
}