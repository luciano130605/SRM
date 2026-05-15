import { useEffect, useState } from 'react'
import Productos from "../src/components/productos/productos"
import Clientes from "./components/clientes/clientes"
import Dashboard from "./components/dashboard/dashboard"
import Pedidos from "./components/pedidos/pedidos"
import Header from "./components/header/header"
import Login from "./components/auth/login"
import Registro from "./components/auth/registro"
import VistaSwitch from "./components/vista-switch/vista-switch"
import "./components/vista-switch/vista-switch.css"
import "./App.css"
import "./components/auth/auth.css"

const opcionesAuth = [
    { id: 'login', label: 'Iniciar sesion' },
    { id: 'registro', label: 'Crear cuenta' },
]

export default function App() {
    const [vista, setVista] = useState('dashboard')
    const [usuario, setUsuario] = useState(null)
    const [authVista, setAuthVista] = useState('login')
    const [authRecuperando, setAuthRecuperando] = useState(false)

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('srm_token')
        const usuarioGuardado = localStorage.getItem('srm_user')

        if (tokenGuardado && usuarioGuardado) {
            try {
                setUsuario(JSON.parse(usuarioGuardado))
            } catch {
                localStorage.removeItem('srm_token')
                localStorage.removeItem('srm_refresh_token')
                localStorage.removeItem('srm_user')
            }
        }
    }, [])

    function guardarSesion(authData) {
        if (authData.session?.accessToken) {
            localStorage.setItem('srm_token', authData.session.accessToken)
            localStorage.setItem('srm_refresh_token', authData.session.refreshToken || '')
        }

        if (authData.user) {
            localStorage.setItem('srm_user', JSON.stringify(authData.user))
            setUsuario(authData.user)
        }
    }

    function cerrarSesion() {
        localStorage.removeItem('srm_token')
        localStorage.removeItem('srm_refresh_token')
        localStorage.removeItem('srm_user')
        setUsuario(null)
    }

    const renderVista = () => {
        switch (vista) {
            case 'dashboard':
                return <Dashboard usuario={usuario} onIrA={setVista} />
            case 'productos':
                return <Productos />
            case 'clientes':
                return <Clientes />
            case 'pedidos':
                return <Pedidos />
            default:
                return <Dashboard />
        }
    }

    if (!usuario) {
        return (
            <main className="auth-screen">
                <section className="auth-panel">
                    <div className="auth-brand">
                        <span>SRM</span>
                        <p>Sistema de gestion</p>
                    </div>

                    {!authRecuperando && (
                        <div className="auth-switch">
                            <VistaSwitch
                                vista={authVista}
                                setVista={(nuevaVista) => {
                                    setAuthRecuperando(false)
                                    setAuthVista(nuevaVista)
                                }}
                                opciones={opcionesAuth}
                                ariaLabel="Cambiar formulario de acceso"
                            />
                        </div>
                    )}

                    {authVista === 'login' ? (
                        <Login
                            onLogin={guardarSesion}
                            onScreenChange={setAuthRecuperando}
                        />
                    ) : (
                        <Registro
                            onRegistro={guardarSesion}
                        />
                    )}
                </section>
            </main>
        )
    }

    return (
        <div className="app-shell">
            <Header
                vista={vista}
                setVista={setVista}
                usuario={usuario}
                onLogout={cerrarSesion}
            />

            <main className="app-main">
                {renderVista()}
            </main>
        </div>
    )
}
