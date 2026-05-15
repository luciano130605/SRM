const supabase = require('../supabase')

async function obtenerClientes(req, res) {
    const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data })
}

async function crearCliente(req, res) {
    const { nombre, contactos, direccion, notas } = req.body

    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data, error } = await supabase
        .from('clientes')
        .insert([{ nombre, contactos: contactos || {}, direccion, notas }])
        .select()
        .single()

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(201).json({ ok: true, data })
}

async function editarCliente(req, res) {
    const { id } = req.params
    const { nombre, contactos, direccion, notas } = req.body

    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data, error } = await supabase
        .from('clientes')
        .update({ nombre, contactos: contactos || {}, direccion, notas })
        .eq('id', id)
        .select()
        .single()

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    if (!data) return res.status(404).json({ ok: false, mensaje: 'Cliente no encontrado' })

    res.status(200).json({ ok: true, data })
}

async function eliminarCliente(req, res) {
    const { id } = req.params

    const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, mensaje: 'Cliente eliminado' })
}

module.exports = { obtenerClientes, crearCliente, editarCliente, eliminarCliente }