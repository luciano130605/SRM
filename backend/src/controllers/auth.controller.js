const supabase = require('../supabase')

function mapAuthData(data) {
    return {
        user: data.user ? {
            id: data.user.id,
            email: data.user.email,
        } : null,
        session: data.session ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
        } : null,
    }
}

async function login(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan email y contrasena' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return res.status(401).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data: mapAuthData(data) })
}

async function registro(req, res) {
    const { email, password, nombre } = req.body

    if (!email || !password) {
        return res.status(400).json({ ok: false, mensaje: 'Faltan email y contrasena' })
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { nombre: nombre || '' },
        },
    })

    if (error) return res.status(400).json({ ok: false, mensaje: error.message })

    res.status(201).json({ ok: true, data: mapAuthData(data) })
}

async function recuperarContrasena(req, res) {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ ok: false, mensaje: 'Falta el email' })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) return res.status(400).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, mensaje: 'Te enviamos un email para recuperar la contrasena' })
}

async function refrescarSesion(req, res) {
    const { refreshToken } = req.body

    if (!refreshToken) {
        return res.status(400).json({ ok: false, mensaje: 'Falta refresh token' })
    }

    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
    })

    if (error) return res.status(401).json({ ok: false, mensaje: error.message })

    res.status(200).json({ ok: true, data: mapAuthData(data) })
}

module.exports = { login, registro, recuperarContrasena, refrescarSesion }
