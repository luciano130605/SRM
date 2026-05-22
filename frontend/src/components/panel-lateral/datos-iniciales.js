export default function datosIniciales(tipo) {
    if (tipo === "productos") {
        return { nombre: "", categoriaId: "", costo: "", precioVenta: "" }
    }

    if (tipo === "clientes") {
        return {
            nombre: "",
            contactoMetodo: "",
            contactoValor: "",
            contactos: {},
            direccion: "",
            notas: "",
        }
    }

    if (tipo === "categorias") {
        return { nombre: "" }
    }

    if (tipo === "metodos-contacto") {
        return { nombre: "", icono: "" }
    }

    return {
        clienteId: "",
        productoId: "",
        cantidad: "1",
        estado: "pendiente",
        fecha: new Date().toISOString().slice(0, 10),
        notas: "",
    }
}