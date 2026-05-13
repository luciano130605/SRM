const clientes = [
    {
        id: 1,
        nombre: "ej",
        telefono: "123",
        instagram: "@ej",
        direccion: "ejemplo 123",
        fechaPedido: "10/10/2026"
    }
]

const productos = [
    {
        id: 1,
        nombre: "torta de chocolate",
        categoria: "Tortas",
        costo: 100,
        precioVenta: 500
    },
    {
        id: 2,
        nombre: "cookies de limon",
        categoria: "Cookies",
        costo: 50,
        precioVenta: 200
    }
]

const pedidos = []

module.exports = { clientes, productos, pedidos }