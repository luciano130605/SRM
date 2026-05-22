import { useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../../services/api'
import EyeIcon from '../../icons/EyeAnimate'
import EyeOffIcon from "../../icons/EyeOffAnimate"

function ReqCheck({ met, label }) {
    const circumference = 2 * Math.PI * 10
    const progress = met ? 1 : 0

    return (
        <motion.span className={met ? 'req-ok' : 'req-no'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                    d="M21.801 10A10 10 0 1 1 17 3.335"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: circumference * (1 - progress) }}
                    initial={{ strokeDashoffset: circumference }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                <motion.path
                    d="m9 11 3 3L22 4"
                    strokeDasharray={20}
                    animate={{ strokeDashoffset: met ? 0 : 20 }}
                    initial={{ strokeDashoffset: 20 }}
                    transition={{ duration: 0.3, delay: met ? 0.2 : 0, ease: 'easeOut' }}
                />
            </svg>
            {label}
        </motion.span>
    )
}

export default function Registro({ onRegistro }) {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')
    const [cargando, setCargando] = useState(false)
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [error, setError] = useState('')
    const tieneMinimo = password.length >= 6
    const coinciden = password.length > 0 && password === confirmarPassword
    const puedeCrear = tieneMinimo && coinciden

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setMensaje('')

        if (!puedeCrear) {
            setError('Revisa los requisitos de la contrasena.')
            return
        }

        setCargando(true)

        try {
            const response = await api.post('/auth/registro', { nombre, email, password })
            const data = response.data.data

            if (data.session) {
                onRegistro(data)
                return
            }

            setMensaje('Cuenta creada. Revisa tu email para confirmar el acceso.')
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo crear la cuenta.')
        } finally {
            setCargando(false)
        }
    }

    return (
        <form className="auth-form" onSubmit={handleSubmit}>


            <label className="auth-field">
                Nombre
                <input
                    type="text"
                    placeholder='Juan perez'
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    autoComplete="name"
                />
            </label>

            <label className="auth-field">
                Email
                <input
                    placeholder='ejemplo@gmail.com'
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />
            </label>

            <label className="auth-field">
                Contraseña
                <span className="auth-password">
                    <input
                        type={mostrarPassword ? 'text' : 'password'}
                        value={password}
                        placeholder='******'
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        minLength={6}
                        required
                    />
                    <button
                        type="button"
                        className="auth-password-btn"
                        onClick={() => setMostrarPassword(valor => !valor)}
                        aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {mostrarPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                </span>
            </label>

            <label className="auth-field">
                Repetir contraseña
                <span className="auth-password">
                    <input
                        placeholder='******'
                        type={mostrarPassword ? 'text' : 'password'}
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        autoComplete="new-password"
                        minLength={6}
                        required
                    />
                    <button
                        type="button"
                        className="auth-password-btn"
                        onClick={() => setMostrarPassword(valor => !valor)}
                        aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {mostrarPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                </span>
            </label>

            <div className="auth-reqs">
                <ReqCheck met={tieneMinimo} label="Minimo 6 caracteres" />
                <ReqCheck met={coinciden} label="Las contrasenas coinciden" />
            </div>

            {error && <p className="auth-error">{error}</p>}
            {mensaje && <p className="auth-success">{mensaje}</p>}

            <button className="auth-submit" type="submit" disabled={cargando || !puedeCrear}>
                {cargando ? 'Creando...' : 'Crear cuenta'}
            </button>
        </form>
    )
}

