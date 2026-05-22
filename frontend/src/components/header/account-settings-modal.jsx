import { useEffect, useState } from "react"
import api from "../../../services/api"
import X from "../../icons/X"
import GestorCategorias from "../productos/gestor-categorias"
import GestorMetodosContacto from "../clientes/gestor-metodos"
import GestorEstadosPedido from "../pedidos/gestor-estados-pedidos"

export default function AccountSettingsModal({ abierto, onCerrar, onError, usuario, onUpdateUsuario }) {
    const [categorias, setCategorias] = useState([])
    const [estados, setEstados] = useState([])
    const [metodos, setMetodos] = useState([])
    const [nombre, setNombre] = useState(usuario?.nombre || '')
    const [cargando, setCargando] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!abierto) return
        setCargando(true)
        setError('')

        Promise.all([
            api.get('/categorias'),
            api.get('/metodos-contacto'),
            api.get('/estados-pedido')
        ])
            .then(([catRes, metRes, estRes]) => {
                setCategorias(catRes.data.data || catRes.data || [])
                setMetodos(metRes.data.data || metRes.data || [])
                setNombre(usuario?.nombre || '')
                setEstados(estRes.data.data || estRes.data || [])
            })
            .catch(() => {
                setError('No se pudieron cargar las preferencias. Intenta de nuevo.')
            })
            .finally(() => setCargando(false))
    }, [abierto, usuario])

    async function guardarNombre() {
        const valor = nombre.trim()
        if (!valor || valor === usuario?.nombre) return

        setGuardando(true)
        try {
            const actualizado = {
                ...usuario,
                nombre: valor,
            }
            onUpdateUsuario(actualizado)
        } finally {
            setGuardando(false)
        }
    }

    function cerrarYReset() {
        setError('')
        onCerrar()
    }

    if (!abierto) return null

    return (
        <div className="header-settings-overlay" onClick={e => e.target === e.currentTarget && cerrarYReset()}>
            <div className="header-settings-modal">
                <div className="header-settings-header">
                    <div>
                        <p className="header-settings-title">Preferencias y administración</p>
                        <p className="header-settings-subtitle">Editá tu nombre, categorías y métodos de contacto desde aquí.</p>
                    </div>
                    <button className="btn-icon btn-delete" type="button" onClick={cerrarYReset}><X /></button>
                </div>

                {error && <p className="header-settings-error">{error}</p>}

                <div className="header-settings-panel">
                    <div className="header-settings-section">
                        <h3>Cuenta</h3>
                        <label className="header-settings-label">Nombre</label>
                        <input
                            className="header-settings-input"
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Tu nombre"
                        />
                        <label className="header-settings-label">Email</label>
                        <input
                            className="header-settings-input"
                            value={usuario?.email || ''}
                            disabled
                        />
                        <button
                            className="header-settings-save"
                            type="button"
                            onClick={guardarNombre}
                            disabled={guardando || nombre.trim() === (usuario?.nombre || '')}
                        >
                            {guardando ? 'Guardando...' : 'Guardar nombre'}
                        </button>
                    </div>

                    <div className="header-settings-section">
                        <h3>Categorías</h3>
                        {cargando ? (
                            <p>Cargando categorías…</p>
                        ) : (
                            <GestorCategorias
                                categorias={categorias}
                                setCategorias={setCategorias}
                                productosPorCategoria={{}}
                                onError={setError}
                            />
                        )}
                    </div>

                    <div className="header-settings-section">
                        <h3>Métodos de contacto</h3>
                        {cargando ? (
                            <p>Cargando métodos…</p>
                        ) : (
                            <GestorMetodosContacto
                                metodos={metodos}
                                setMetodos={setMetodos}
                                onError={setError}
                            />
                        )}

                    </div>
                    <div className="header-settings-section">
                        <h3>Estado de los pedidos</h3>
                        {cargando ? (
                            <p>Cargando estados…</p>
                        ) : (
                            <GestorEstadosPedido
                                estados={estados}
                                setEstados={setEstados}
                                onError={onError}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
