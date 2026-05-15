const supabase = require('../supabase')

async function obtenerProductos(req, res) {
    const { data, error } = await supabase
        .from('productos')
        .select('*, categorias(id, nombre)')
        .order('nombre', { ascending: true })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    // Mapear snake_case → camelCase
    const mapped = data.map(p => ({
        id: p.id,
        nombre: p.nombre,
        categoriaId: p.categoria_id,
        categoria: p.categorias,
        costo: p.costo,
        precioVenta: p.precio_venta
    }))

    res.status(200).json({ ok: true, data: mapped })
}

async function crearProducto(req, res) {
    const { nombre, categoriaId, costo, precioVenta } = req.body

    if (!nombre || !precioVenta) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos' })
    }

    const { data, error } = await supabase
        .from('productos')
        .insert([{
            nombre,
            categoria_id: categoriaId || null,
            costo: costo || 0,
            precio_venta: precioVenta
        }])
        .select()
        .single()

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(201).json({
        ok: true,
        data: {
            id: data.id,
            nombre: data.nombre,
            categoriaId: data.categoria_id,
            costo: data.costo,
            precioVenta: data.precio_venta
        }
    })
}

async function editarProducto(req, res) {
    const { id } = req.params
    const { nombre, categoriaId, costo, precioVenta } = req.body

    const { data, error } = await supabase
        .from('productos')
        .update({
            nombre,
            categoria_id: categoriaId || null,
            costo: costo || 0,
            precio_venta: precioVenta
        })
        .eq('id', id)
        .select()
        .single()

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' })

    res.status(200).json({
        ok: true,
        data: {
            id: data.id,
            nombre: data.nombre,
            categoriaId: data.categoria_id,
            costo: data.costo,
            precioVenta: data.precio_venta
        }
    })
}

async function eliminarProducto(req, res) {
    const { id } = req.params

    const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, mensaje: 'Producto eliminado' })
}

module.exports = { obtenerProductos, crearProducto, editarProducto, eliminarProducto }