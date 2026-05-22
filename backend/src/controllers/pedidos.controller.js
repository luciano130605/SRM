const supabase = require('../supabase')

function mapPedido(p) {
    return {
        id: p.id,
        clienteId: p.cliente_id,
        cliente: p.clientes,
        items: p.items,
        fecha: p.fecha,
        fechaEntrega: p.fecha_entrega,
        total: p.total,
        metodoPago: p.metodo_pago,
        estado: p.estado,
        notas: p.notas,
        createdAt: p.created_at
    }
}

async function obtenerPedidos(req, res) {
    const { data, error } = await supabase
        .from('pedidos')
        .select('*, clientes(id, nombre)')
        .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data: data.map(mapPedido) })
}

async function crearPedido(req, res) {
    try {
        const {
            clienteId, idCliente,
            items, productosPedido,
            estado, fecha, fechaEntrega,
            total, metodoPago,
            notas, observaciones
        } = req.body

        const cliente = clienteId || idCliente
        const productosRecibidos = items || productosPedido || []

        if (!cliente) {
            return res.status(400).json({ ok: false, mensaje: 'Falta el cliente' })
        }

        // Obtener productos de Supabase para validar y calcular
        const ids = productosRecibidos.map(i => i.productoId || i.idProducto)
        const { data: productosDB, error: prodError } = await supabase
            .from('productos')
            .select('id, nombre, precio_venta')
            .in('id', ids)

        if (prodError) throw new Error(prodError.message)

        let montoTotal = parseFloat(total) || 0

        const productosFinales = productosRecibidos.map(item => {
            const productoId = item.productoId || item.idProducto
            const cantidad = parseInt(item.cantidad) || 1
            const productoEncontrado = productosDB.find(p => String(p.id) === String(productoId))

            if (!productoEncontrado) throw new Error(`Producto ${productoId} no encontrado`)

            const precioUnitario = parseFloat(item.precioUnitario ?? productoEncontrado.precio_venta) || 0
            const subtotal = cantidad * precioUnitario

            if (!total) montoTotal += subtotal

            return {
                productoId,
                nombre: item.nombre || productoEncontrado.nombre,
                cantidad,
                precioUnitario,
                subtotal
            }
        })

        const { data, error } = await supabase
            .from('pedidos')
            .insert([{
                cliente_id: cliente,
                items: productosFinales,
                fecha: fecha || new Date().toISOString().slice(0, 10),
                fecha_entrega: fechaEntrega || fecha || null,
                total: montoTotal,
                metodo_pago: metodoPago || null,
                estado: estado || 'pendiente',
                notas: notas || observaciones || ''
            }])
            .select('*, clientes(id, nombre)')
            .single()

        if (error) throw new Error(error.message)

        res.status(201).json({ ok: true, data: mapPedido(data) })

    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message })
    }
}

async function editarPedido(req, res) {
    const { id } = req.params
    const {
        clienteId, idCliente,
        fecha, fechaEntrega,
        total, montoTotal,
        metodoPago, estado,
        notas, observaciones,
        items
    } = req.body

    const updates = {}
    if (clienteId || idCliente) updates.cliente_id = clienteId || idCliente
    if (fecha || fechaEntrega) updates.fecha = fecha || fechaEntrega
    if (fechaEntrega) updates.fecha_entrega = fechaEntrega
    if (total !== undefined || montoTotal !== undefined) updates.total = total ?? montoTotal
    if (metodoPago !== undefined) updates.metodo_pago = metodoPago
    if (estado) updates.estado = estado
    if (notas !== undefined || observaciones !== undefined) updates.notas = notas ?? observaciones
    if (items) updates.items = items

    const { data, error } = await supabase
        .from('pedidos')
        .update(updates)
        .eq('id', id)
        .select('*, clientes(id, nombre)')
        .single()

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' })

    res.status(200).json({ ok: true, data: mapPedido(data) })
}

async function actualizarEstadoPedido(req, res) {
    const { id } = req.params
    const { estado } = req.body

    const { data, error } = await supabase
        .from('pedidos')
        .update({ estado })
        .eq('id', id)
        .select('*, clientes(id, nombre)')
        .single()

    if (error) 
        return res.status(500).json({ ok: false, mensaje: error.message })
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Pedido no encontrado' })

    res.status(200).json({ ok: true, data: mapPedido(data) })
}

async function eliminarPedido(req, res) {
    const { id } = req.params

    const { error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, mensaje: 'Pedido eliminado' })
}

module.exports = { obtenerPedidos, crearPedido, editarPedido, actualizarEstadoPedido, eliminarPedido }