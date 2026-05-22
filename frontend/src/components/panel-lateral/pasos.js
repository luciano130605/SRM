const PASOS = {
    productos: ["nombre", "categoriaId", "costo", "precioVenta"],
    clientes: ["nombre", "contactoMetodo", "contactoValor", "masContactos", "direccion", "notas"],
    pedidos: ["clienteId", "productoId", "cantidad", "estado", "fecha", "notas"],
    categorias: ["nombre"],
    "metodos-contacto": ["nombre", "icono"],
}

export default PASOS