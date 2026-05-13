const { productos } = require('../data/data')
const { v4: uuidv4 } = require('uuid')

function obtenerProductos(req, res) {
    res.status(200).json({
        ok: true,
        data: productos
    })
}

function crearProducto(req, res) {
    try {
        const { nombre, categoria, costo, precioVenta } = req.body

        if (!nombre || !precioVenta) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos"
            })
        }

        const nuevoProducto = {
            id: uuidv4(),
            nombre, categoria, costo, precioVenta
        }

        productos.push(nuevoProducto)

        res.status(200).json({
            ok: true,
            nuevoProducto
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error servidor"
        })
    }
}

function eliminarProducto(req, res) {

    const { id } = req.params

    const indice = productos.findIndex(
        producto => producto.id == id
    )

    if (indice === -1) {

        return res.status(404).json({
            ok: false,
            mensaje: 'Producto no encontrado'
        })
    }

    productos.splice(indice, 1)

    res.status(200).json({
        ok: true,
        mensaje: 'Producto eliminado'
    })
}

module.exports = { obtenerProductos, crearProducto, eliminarProducto }