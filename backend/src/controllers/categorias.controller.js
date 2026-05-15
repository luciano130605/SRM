const supabase = require('../supabase')

async function obtenerCategorias(req, res) {
    const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data })
}

async function crearCategoria(req, res) {
    const { nombre } = req.body

    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    // Obtener el max orden actual
    const { data: todas } = await supabase
        .from('categorias')
        .select('orden')
        .order('orden', { ascending: false })
        .limit(1)

    const nuevoOrden = todas && todas.length > 0 ? todas[0].orden + 1 : 1

    const { data, error } = await supabase
        .from('categorias')
        .insert([{ nombre, orden: nuevoOrden }])
        .select()
        .single()

    if (error) {
        if (error.code === '23505') return res.status(400).json({ ok: false, mensaje: 'La categoría ya existe' })
        return res.status(500).json({ ok: false, mensaje: error.message })
    }

    res.status(201).json({ ok: true, data })
}

async function eliminarCategoria(req, res) {
    const { id } = req.params

    const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    // Reordenar las que quedan
    const { data: restantes } = await supabase
        .from('categorias')
        .select('id')
        .order('orden', { ascending: true })

    if (restantes && restantes.length > 0) {
        const updates = restantes.map((cat, index) => ({
            id: cat.id,
            orden: index + 1
        }))

        await supabase.from('categorias').upsert(updates)
    }

    res.status(200).json({ ok: true, mensaje: 'Categoría eliminada' })
}

async function reordenarCategorias(req, res) {
    const { orden } = req.body

    if (!Array.isArray(orden)) {
        return res.status(400).json({ ok: false, mensaje: 'Falta el orden' })
    }

    const updates = orden.map((id, index) => ({ id, orden: index + 1 }))

    const { error } = await supabase.from('categorias').upsert(updates)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    const { data } = await supabase
        .from('categorias')
        .select('*')
        .order('orden', { ascending: true })

    res.status(200).json({ ok: true, data })
}

module.exports = { obtenerCategorias, crearCategoria, reordenarCategorias, eliminarCategoria }