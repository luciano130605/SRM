const {
    pedidos,
    productos
} = require('../data/data')

const { v4: uuidv4 } = require('uuid')

function obtenerPedidos(req, res) {

    res.status(200).json({
        ok: true,
        data: pedidos
    })
}

function crearPedido(req, res) {

    try {

        const {
            idCliente,
            productosPedido,
            metodoPago,
            fechaEntrega,
            observaciones
        } = req.body

        if (!idCliente || !productosPedido) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Faltan datos'
            })
        }

        let montoTotal = 0

        const productosFinales = productosPedido.map(item => {

            const productoEncontrado = productos.find(
                producto => producto.id == item.idProducto
            )

            if (!productoEncontrado) {
                throw new Error('Producto no encontrado')
            }

            const subtotal =
                item.cantidad * productoEncontrado.precioVenta

            montoTotal += subtotal

            return {
                idProducto: item.idProducto,
                cantidad: item.cantidad,
                subtotal
            }
        })

        const nuevoPedido = {
            id: uuidv4(),

            idCliente,

            productos: productosFinales,

            fechaPedido: new Date().toISOString(),

            fechaEntrega,

            montoTotal,

            metodoPago,

            estado: 'Pendiente',

            observaciones
        }

        pedidos.push(nuevoPedido)

        res.status(201).json({
            ok: true,
            data: nuevoPedido
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            mensaje: error.message
        })
    }
}

module.exports = {
    obtenerPedidos,
    crearPedido
}