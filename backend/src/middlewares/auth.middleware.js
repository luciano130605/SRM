const supabase = require('../supabase')

async function requiereAuth(req, res, next) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

    if (!token) {
        return res.status(401).json({ ok: false, mensaje: 'No autorizado' })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
        return res.status(401).json({ ok: false, mensaje: 'Sesion invalida' })
    }

    req.usuario = {
        id: data.user.id,
        email: data.user.email,
    }
    req.supabase = supabase.crearClienteUsuario(token)

    next()
}

module.exports = requiereAuth
