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
            clienteId,
            idCliente,
            items,
            productosPedido,
            estado,
            fecha,
            fechaEntrega,
            total,
            metodoPago,
            notas,
            observaciones
        } = req.body

        const cliente = clienteId || idCliente
        const productosRecibidos = items || productosPedido || []

        if (!cliente) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Falta el cliente'
            })
        }

        let montoTotal = parseFloat(total) || 0

        const productosFinales = productosRecibidos.map(item => {
            const productoId = item.productoId || item.idProducto
            const cantidad = parseInt(item.cantidad) || 1

            const productoEncontrado = productos.find(
                producto => String(producto.id) === String(productoId)
            )

            if (!productoEncontrado) {
                throw new Error('Producto no encontrado')
            }

            const precioUnitario = parseFloat(item.precioUnitario ?? productoEncontrado.precioVenta) || 0
            const subtotal = cantidad * precioUnitario

            if (!total) montoTotal += subtotal

            return {
                productoId,
                idProducto: productoId,
                nombre: item.nombre || productoEncontrado.nombre,
                cantidad,
                precioUnitario,
                subtotal
            }
        })

        const nuevoPedido = {
            id: uuidv4(),
            clienteId: cliente,
            idCliente: cliente,
            items: productosFinales,
            productos: productosFinales,
            fecha: fecha || fechaEntrega || new Date().toISOString().slice(0, 10),
            createdAt: new Date().toISOString(),
            fechaPedido: new Date().toISOString(),
            fechaEntrega: fechaEntrega || fecha,
            total: montoTotal,
            montoTotal,
            metodoPago,
            estado: estado || 'pendiente',
            notas: notas || observaciones || '',
            observaciones: observaciones || notas || ''
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

function editarPedido(req, res) {
    const { id } = req.params
    const indice = pedidos.findIndex(pedido => String(pedido.id) === String(id))

    if (indice === -1) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Pedido no encontrado'
        })
    }

    const datos = req.body
    const cliente = datos.clienteId || datos.idCliente || pedidos[indice].clienteId
    const total = datos.total ?? datos.montoTotal ?? pedidos[indice].total
    const notas = datos.notas ?? datos.observaciones ?? pedidos[indice].notas
    const fecha = datos.fecha ?? datos.fechaEntrega ?? pedidos[indice].fecha

    pedidos[indice] = {
        ...pedidos[indice],
        ...datos,
        clienteId: cliente,
        idCliente: cliente,
        fecha,
        fechaEntrega: datos.fechaEntrega ?? fecha,
        total,
        montoTotal: total,
        notas,
        observaciones: datos.observaciones ?? notas,
        estado: datos.estado ?? pedidos[indice].estado
    }

    res.status(200).json({
        ok: true,
        data: pedidos[indice]
    })
}

function actualizarEstadoPedido(req, res) {
    const { id } = req.params
    const { estado } = req.body
    const indice = pedidos.findIndex(pedido => String(pedido.id) === String(id))

    if (indice === -1) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Pedido no encontrado'
        })
    }

    pedidos[indice] = {
        ...pedidos[indice],
        estado: estado || pedidos[indice].estado
    }

    res.status(200).json({
        ok: true,
        data: pedidos[indice]
    })
}

function eliminarPedido(req, res) {
    const { id } = req.params
    const indice = pedidos.findIndex(pedido => String(pedido.id) === String(id))

    if (indice === -1) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Pedido no encontrado'
        })
    }

    pedidos.splice(indice, 1)

    res.status(200).json({
        ok: true,
        mensaje: 'Pedido eliminado'
    })
}

module.exports = {
    obtenerPedidos,
    crearPedido,
    editarPedido,
    actualizarEstadoPedido,
    eliminarPedido
}
