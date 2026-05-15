import { useState } from 'react'
import { motion } from 'framer-motion'
import EyeIcon from '../../icons/EyeAnimate'
import EyeOffIcon from "../../icons/EyeOffAnimate"
import api from '../../../services/api'
import './auth.css'
import ForgotPassword from "./forgot-pass"

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
}



export default function Login({ onLogin, onScreenChange }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cargando, setCargando] = useState(false)
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [screen, setScreen] = useState('login')
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setCargando(true)

        try {
            const response = await api.post('/auth/login', { email, password })
            onLogin(response.data.data)
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo iniciar sesion.')
        } finally {
            setCargando(false)
        }
    }

    if (screen === 'forgot') {
        return <ForgotPassword onBack={() => {
            setScreen('login')
            onScreenChange?.(false)
        }} />
    }

    return (
        <motion.form
            key="login"
            className="auth-form"
            onSubmit={handleSubmit}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
        >


            <label className="auth-field">
                Email
                <input
                    type="email"
                    placeholder='ejemplo@gmail.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                />
            </label>


            <label className="auth-field">
                <span className="auth-label-row">
                    <span>Contraseña</span>
                    <button
                        className="auth-link auth-forgot-inline"
                        type="button"
                        onClick={() => {
                            setScreen('forgot')
                            onScreenChange?.(true)
                        }}
                    >
                        Olvide mi contraseña
                    </button>
                </span>
                <span className="auth-password">
                    <input
                        placeholder='******'
                        type={mostrarPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        className="auth-password-btn"
                        onClick={() => setMostrarPassword(valor => !valor)}
                        aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    >
                        {mostrarPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                </span>
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Entrar'}
            </button>


        </motion.form>
    )
}
