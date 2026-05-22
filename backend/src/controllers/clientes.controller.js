const supabase = require('../supabase')

function getDb(req) {
    return req?.supabase || supabase
}

async function obtenerClientes(req, res) {
    const db = getDb(req)
    const { data, error } = await db
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data })
}

async function crearCliente(req, res) {
    const db = getDb(req)
    const { nombre, contactos, direccion, notas } = req.body

    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data, error } = await db
        .from('clientes')
        .insert([{ nombre, contactos: contactos || {}, direccion, notas }])
        .select()
        .single()
    if (error) {
        console.log('Error Supabase:', error)
        return res.status(500).json({ ok: false, mensaje: error.message })
    }
    
    res.status(201).json({ ok: true, data })
}

async function editarCliente(req, res) {
    const db = getDb(req)
    const { id } = req.params
    const { nombre, contactos, direccion, notas } = req.body

    if (!nombre) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data, error } = await db
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
    const db = getDb(req)
    const { id } = req.params

    const { error } = await db
        .from('clientes')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, mensaje: 'Cliente eliminado' })
}

module.exports = { obtenerClientes, crearCliente, editarCliente, eliminarCliente }