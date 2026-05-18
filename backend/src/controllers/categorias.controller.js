const supabase = require('../supabase')

function esErrorColumnaOrden(error) {
    return error?.code === '42703' || error?.message?.toLowerCase().includes('orden')
}

function esErrorColumna(error, columna) {
    const mensaje = error?.message?.toLowerCase() || ''
    return error?.code === '42703' || mensaje.includes(columna.toLowerCase())
}

async function consultarCategorias(db = supabase) {
    const ordenadas = await db
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true })

    if (!ordenadas.error) return ordenadas
    if (!esErrorColumnaOrden(ordenadas.error)) return ordenadas

    return db
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })
}

async function insertarCategoriaConFallback(db, { nombre, orden, usuarioId }) {
    const intentos = [
        { nombre, orden, user_id: usuarioId },
        { nombre, orden, usuario_id: usuarioId },
        { nombre, user_id: usuarioId },
        { nombre, usuario_id: usuarioId },
        { nombre, orden },
        { nombre },
    ]

    let ultimoError = null

    for (const intento of intentos) {
        const payload = Object.fromEntries(
            Object.entries(intento).filter(([, valor]) => valor !== null && valor !== undefined)
        )

        const { data, error } = await db
            .from('categorias')
            .insert([payload])
            .select()
            .single()

        if (!error) return { data, error: null }

        ultimoError = error

        const puedeReintentar =
            esErrorColumna(error, 'orden') ||
            esErrorColumna(error, 'user_id') ||
            esErrorColumna(error, 'usuario_id') ||
            error.code === '42501' ||
            error.message?.toLowerCase().includes('schema cache')

        if (!puedeReintentar) break
    }

    return { data: null, error: ultimoError }
}

async function obtenerCategorias(req, res) {
    const db = req.supabase || supabase
    const { data, error } = await consultarCategorias(db)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data })
}

async function crearCategoria(req, res) {
    const db = req.supabase || supabase
    const { nombre } = req.body

    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data: todas, error: errorOrden } = await db
        .from('categorias')
        .select('orden')
        .order('orden', { ascending: false })
        .limit(1)

    const nuevoOrden = todas && todas.length > 0 ? todas[0].orden + 1 : 1

    const { data, error } = await insertarCategoriaConFallback(db, {
        nombre,
        orden: esErrorColumnaOrden(errorOrden) ? null : nuevoOrden,
        usuarioId: req.usuario?.id,
    })

    if (error) {
        if (error.code === '23505') return res.status(400).json({ ok: false, mensaje: 'La categoría ya existe' })
        return res.status(500).json({ ok: false, mensaje: error.message })
    }

    res.status(201).json({ ok: true, data })
}

async function eliminarCategoria(req, res) {
    const db = req.supabase || supabase
    const { id } = req.params

    const { error } = await db
        .from('categorias')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    const { data: restantes, error: errorRestantes } = await db
        .from('categorias')
        .select('id')
        .order('orden', { ascending: true })

    if (!errorRestantes && restantes && restantes.length > 0) {
        const updates = restantes.map((cat, index) => ({
            id: cat.id,
            orden: index + 1
        }))

        await db.from('categorias').upsert(updates)
    }

    res.status(200).json({ ok: true, mensaje: 'Categoría eliminada' })
}

async function reordenarCategorias(req, res) {
    const db = req.supabase || supabase
    const { orden } = req.body

    if (!Array.isArray(orden)) {
        return res.status(400).json({ ok: false, mensaje: 'Falta el orden' })
    }

    const updates = orden.map((id, index) => ({ id, orden: index + 1 }))

    const { error } = await db.from('categorias').upsert(updates)

    if (error && !esErrorColumnaOrden(error)) {
        if (error.code === '42501') return res.status(403).json({ ok: false, mensaje: error.message })
        return res.status(500).json({ ok: false, mensaje: error.message })
    }

    const { data, error: errorConsulta } = await consultarCategorias(db)

    if (errorConsulta) return res.status(500).json({ ok: false, mensaje: errorConsulta.message })

    res.status(200).json({ ok: true, data })
}

module.exports = { obtenerCategorias, crearCategoria, reordenarCategorias, eliminarCategoria }
