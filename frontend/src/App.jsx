import { useEffect, useState } from 'react'
import Productos from "../src/components/productos/productos"
import Clientes from "./components/clientes/clientes"
import Dashboard from "./components/dashboard/dashboard"
import Pedidos from "./components/pedidos/pedidos"
import Header from "./components/header/header"
import Login from "./components/auth/login"
import Registro from "./components/auth/registro"
import VistaSwitch from "./components/vista-switch/vista-switch"
import PanelLateral from "./components/panel-lateral/panel-lateral"
import "./App.css"
import { useTheme } from "./hooks/use-theme"

const opcionesAuth = [
    { id: 'login', label: 'Iniciar sesion' },
    { id: 'registro', label: 'Crear cuenta' },
]

export default function App() {
    const [vista, setVista] = useState('dashboard')
    const [usuario, setUsuario] = useState(null)
    const [authVista, setAuthVista] = useState('login')
    const [authRecuperando, setAuthRecuperando] = useState(false)
    const { tema, toggleTema } = useTheme()
    const [refreshKey, setRefreshKey] = useState({
        productos: 0,
        clientes: 0,
        pedidos: 0,
    })
    const [datosInicialesFormulario, setDatosInicialesFormulario] = useState(null)

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

        const cerrarPorSesionInvalida = () => setUsuario(null)
        window.addEventListener('srm:logout', cerrarPorSesionInvalida)

        return () => window.removeEventListener('srm:logout', cerrarPorSesionInvalida)
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

    function actualizarUsuario(usuarioActualizado) {
        localStorage.setItem('srm_user', JSON.stringify(usuarioActualizado))
        setUsuario(usuarioActualizado)
    }

    function cerrarSesion() {
        localStorage.removeItem('srm_token')
        localStorage.removeItem('srm_refresh_token')
        localStorage.removeItem('srm_user')
        setUsuario(null)
    }

    function refrescarVista(tipo) {
        setVista(tipo)
        setRefreshKey(prev => ({
            ...prev,
            [tipo]: prev[tipo] + 1,
        }))
    }

    function irA(vista, datos = null) {
        setVista(vista)
        setDatosInicialesFormulario(datos)
    }

    const renderVista = () => {
        switch (vista) {
            case 'dashboard':
                return <Dashboard usuario={usuario} onIrA={setVista} />
            case 'productos':
                return <Productos datosIniciales={datosInicialesFormulario} key={`productos-${refreshKey.productos}`} />
            case 'clientes':
                return <Clientes datosIniciales={datosInicialesFormulario} key={`clientes-${refreshKey.clientes}`} />
            case 'pedidos':
                return <Pedidos datosIniciales={datosInicialesFormulario} key={`pedidos-${refreshKey.pedidos}`} />
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
                onUpdateUsuario={actualizarUsuario} tema={tema} onToggleTema={toggleTema}
            />

            <PanelLateral
                onIrA={irA}
                onCreado={refrescarVista}
            />

            <main className="app-main">
                {renderVista()}
            </main>
        </div>
    )
}

