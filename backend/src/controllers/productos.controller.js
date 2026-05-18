const supabase = require('../supabase')

function esErrorColumna(error, columna) {
    const mensaje = error?.message?.toLowerCase() || ''
    return error?.code === '42703' || mensaje.includes(columna.toLowerCase())
}

function mapProducto(p) {
    return {
        id: p.id,
        nombre: p.nombre,
        categoriaId: p.categoria_id,
        categoria: p.categorias,
        costo: p.costo,
        precioVenta: p.precio_venta
    }
}

function responderError(res, error) {
    if (error.code === '42501') {
        return res.status(403).json({ ok: false, mensaje: error.message })
    }

    return res.status(500).json({ ok: false, mensaje: error.message })
}

async function insertarProductoConFallback(db, payloadBase, usuarioId) {
    const intentos = [
        { ...payloadBase, user_id: usuarioId },
        { ...payloadBase, usuario_id: usuarioId },
        payloadBase,
    ]

    let ultimoError = null
    let errorConUsuario = null

    for (const intento of intentos) {
        const payload = Object.fromEntries(
            Object.entries(intento).filter(([, valor]) => valor !== null && valor !== undefined)
        )

        const { data, error } = await db
            .from('productos')
            .insert([payload])
            .select()
            .single()

        if (!error) return { data, error: null }

        ultimoError = error
        if (payload.user_id || payload.usuario_id) {
            errorConUsuario = error
        }

        const puedeReintentar =
            esErrorColumna(error, 'user_id') ||
            esErrorColumna(error, 'usuario_id') ||
            error.code === '42501' ||
            error.message?.toLowerCase().includes('schema cache')

        if (!puedeReintentar) break
    }

    return { data: null, error: errorConUsuario || ultimoError }
}

async function consultarProductos(db, usuarioId) {
    const base = () => db
        .from('productos')
        .select('*, categorias(id, nombre)')
        .order('nombre', { ascending: true })

    if (!supabase.admin || !usuarioId) return base()

    const columnasUsuario = ['user_id', 'usuario_id']
    let ultimoError = null

    for (const columna of columnasUsuario) {
        const resultado = await base().eq(columna, usuarioId)

        if (!resultado.error) return resultado
        ultimoError = resultado.error

        if (!esErrorColumna(resultado.error, columna)) return resultado
    }

    const resultadoSinFiltro = await base()
    return resultadoSinFiltro.error ? { data: null, error: ultimoError || resultadoSinFiltro.error } : resultadoSinFiltro
}

async function obtenerProductos(req, res) {
    const db = supabase.admin || req.supabase || supabase
    const { data, error } = await consultarProductos(db, req.usuario?.id)

    if (error) return responderError(res, error)

    res.status(200).json({ ok: true, data: data.map(mapProducto) })
}

async function crearProducto(req, res) {
    const db = supabase.admin || req.supabase || supabase
    const { nombre, categoriaId, costo, precioVenta } = req.body

    if (!nombre || !precioVenta) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan datos' })
    }

    const payloadBase = {
        nombre,
        categoria_id: categoriaId || null,
        costo: costo || 0,
        precio_venta: precioVenta
    }

    const { data, error } = await insertarProductoConFallback(db, payloadBase, req.usuario?.id)

    if (error) return responderError(res, error)

    res.status(201).json({ ok: true, data: mapProducto(data) })
}

async function editarProducto(req, res) {
    const db = supabase.admin || req.supabase || supabase
    const { id } = req.params
    const { nombre, categoriaId, costo, precioVenta } = req.body

    const { data, error } = await db
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

    if (error) return responderError(res, error)
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado' })

    res.status(200).json({ ok: true, data: mapProducto(data) })
}

async function eliminarProducto(req, res) {
    const db = supabase.admin || req.supabase || supabase
    const { id } = req.params

    const { error } = await db
        .from('productos')
        .delete()
        .eq('id', id)

    if (error) return responderError(res, error)

    res.status(200).json({ ok: true, mensaje: 'Producto eliminado' })
}

module.exports = { obtenerProductos, crearProducto, editarProducto, eliminarProducto }
