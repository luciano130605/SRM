export default function etiquetaTipo(tipo) {
    if (tipo === "productos") return "producto"
    if (tipo === "clientes") return "cliente"
    if (tipo === "categorias") return "categoria"
    if (tipo === "metodos-contacto") return "metodo de contacto"
    return "pedido"
}