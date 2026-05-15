import { useState } from "react"
import api from "../../../services/api"
import X from "../../icons/X"

const METODOS_FIJOS = []

export default function GestorMetodosContacto({ metodos, setMetodos, onError }) {
    const [nuevo, setNuevo] = useState({ nombre: '', icono: '' })
    const [visible, setVisible] = useState(false)

    async function agregarMetodo() {
        const nombre = nuevo.nombre.trim()
        if (!nombre || metodos.some(m => m.nombre.toLowerCase() === nombre.toLowerCase())) return

        try {
            const res = await api.post('/metodos-contacto', { nombre, icono: nuevo.icono || '' })
            setMetodos(prev => [...prev, res.data.data])
            setNuevo({ nombre: '', icono: '' })
        } catch {
            onError?.('No se pudo agregar el método.')
        }
    }

    async function eliminarMetodo(metodo) {
        if (metodo.fijo) return
        try {
            await api.delete(`/metodos-contacto/${metodo.id}`)
            setMetodos(prev => prev.filter(m => m.id !== metodo.id))
        } catch {
            onError?.('No se pudo eliminar el método.')
        }
    }

    return (
        <div>
            <div className="panel-section-divider" />
            <div className="categorias-manager-title">
                <span>Métodos de contacto</span>
                <button onClick={() => setVisible(v => !v)}>{visible ? '-' : '+'}</button>
            </div>

            {visible && (
                <>
                    <div className="categorias-list">
                        {metodos.map(m => (
                            <div key={m.id} className="categoria-item">
                                <span style={{ fontSize: '1rem' }}>{m.icono}</span>
                                <span className="categoria-item-name">{m.nombre}</span>
                                {m.fijo
                                    ? <span className="categoria-item-count" title="Método fijo">fijo</span>
                                    : (
                                        <button
                                            className="btn-cat-delete"
                                            onClick={() => eliminarMetodo(m)}
                                            title="Eliminar método"
                                        >
                                            <X size={12} />
                                        </button>
                                    )
                                }
                            </div>
                        ))}
                    </div>

                    <div className="categoria-nueva-row">
                        <input
                            className="categoria-nueva-input"
                            placeholder="Nuevo método…"
                            value={nuevo.nombre}
                            onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && agregarMetodo()}
                        />
                        <button
                            className="btn-cat-add"
                            onClick={agregarMetodo}
                            disabled={!nuevo.nombre.trim() || metodos.some(m => m.nombre === nuevo.nombre.trim())}
                        >
                            +
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}