const supabase = require('../supabase')

async function obtenerEstados(req, res) {
    const { data, error } = await supabase
        .from('estados_pedido')
        .select('*')
        .order('orden', { ascending: true })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    res.status(200).json({ ok: true, data })
}

async function crearEstado(req, res) {
    const { nombre, color } = req.body
    if (!nombre?.trim())
        return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data: existentes } = await supabase
        .from('estados_pedido')
        .select('orden')
        .order('orden', { ascending: false })
        .limit(1)

    const orden = (existentes?.[0]?.orden ?? -1) + 1

    const { data, error } = await supabase
        .from('estados_pedido')
        .insert([{ nombre: nombre.trim(), color: color || null, orden, fijo: false }])
        .select()
        .single()


    if (error) {
        console.error('Error al crear estado:', error)
        return res.status(500).json({ ok: false, mensaje: error.message })
    }
    res.status(201).json({ ok: true, data })
}

async function eliminarEstado(req, res) {
    const { id } = req.params

    const { error } = await supabase
        .from('estados_pedido')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    res.status(200).json({ ok: true, mensaje: 'Estado eliminado' })
}

module.exports = { obtenerEstados, crearEstado, eliminarEstado }