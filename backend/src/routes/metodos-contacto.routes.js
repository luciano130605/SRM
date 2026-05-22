const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

function getDb(req) {
    return req?.supabase || supabase
}

router.get('/', async (req, res) => {
    const db = getDb(req)
    const { data, error } = await db
        .from('metodos_contacto')
        .select('*')
        .order('nombre', { ascending: true })

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    res.json({ ok: true, data })
})

router.post('/', async (req, res) => {
    const db = getDb(req)
    const { nombre, icono } = req.body

    if (!nombre?.trim()) return res.status(400).json({ ok: false, mensaje: 'Falta el nombre' })

    const { data, error } = await db
        .from('metodos_contacto')
        .insert([{ nombre: nombre.trim(), icono: icono || '', fijo: false }])
        .select()
        .single()

    if (error) {
        console.log('Error Supabase:', error)
        if (error.code === '23505')
            return res.status(400).json({ ok: false, mensaje: 'Ya existe ese método' })
        return res.status(500).json({ ok: false, mensaje: error.message })
    }

    res.json({ ok: true, data })
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params

    const db = getDb(req)
    const { data: metodo, error: fetchError } = await db
        .from('metodos_contacto')
        .select('fijo')
        .eq('id', id)
        .single()

    if (fetchError || !metodo) return res.status(404).json({ ok: false, mensaje: 'No encontrado' })
    if (metodo.fijo) return res.status(400).json({ ok: false, mensaje: 'No se puede eliminar un método fijo' })

    const { error } = await db
        .from('metodos_contacto')
        .delete()
        .eq('id', id)

    if (error) return res.status(500).json({ ok: false, mensaje: error.message })
    res.json({ ok: true })
})

module.exports = router