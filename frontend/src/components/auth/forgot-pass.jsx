import { useState } from "react"
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Loader } from 'lucide-react'
import ArrowLeft from "../../icons/ArrowLeft"
import api from '../../../services/api'

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
}

export default function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        if (!email.trim()) return

        setError('')
        setLoading(true)

        try {
            await api.post('/auth/recuperar-contrasena', { email: email.trim() })
            setSent(true)
        } catch (err) {
            setError(err.response?.data?.mensaje || 'No se pudo enviar el email de recuperacion.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            key="forgot"
            className="auth-forgot"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <button className="auth-back-btn" type="button" onClick={onBack} aria-label="Volver al login">
                <ArrowLeft size={14} />
            </button>

            <div className="auth-heading">
                <p>Recuperar acceso</p>
            </div>

            <p className="auth-hint">
                Ingresa tu email y te mandamos un link para resetear tu contraseña.
            </p>

            <AnimatePresence mode="wait">
                {sent ? (
                    <motion.div
                        key="sent"
                        className="auth-forgot-sent"
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <p>
                            Si <strong>{email}</strong> esta registrado, vas a recibir un email con instrucciones en los proximos minutos.
                        </p>
                        <p className="auth-hint">Revisa tambien la carpeta de spam.</p>
                    </motion.div>
                ) : (
                    <motion.form
                        key="forgot-form"
                        className="auth-form auth-form-inner"
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                autoFocus
                                required
                                placeholder="ejemplo@gmail.com"
                            />
                        </label>

                        {error && <p className="auth-error">{error}</p>}

                        <button className="auth-submit" type="submit" disabled={loading || !email.trim()}>
                            {loading ? (
                                <span className="auth-loading">
                                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                                        <Loader size={14} />
                                    </motion.span>
                                    Enviando...
                                </span>
                            ) : 'Enviar link'}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
