import { useState } from "react"
import api from "../../../services/api"
import X from "../../icons/X"
import { chipEstadoStyle } from "./estados-pedido"

export default function GestorEstadosPedido({ estados, setEstados, onError }) {
    const [nuevo, setNuevo] = useState({ nombre: '', color: '' })
    const [visible, setVisible] = useState(false)

    async function agregar() {
        const nombre = nuevo.nombre.trim()
        if (!nombre || estados.some(e => e.nombre.toLowerCase() === nombre.toLowerCase())) return

        try {
            const res = await api.post('/estados-pedido', { nombre, color: nuevo.color || null })
            setEstados(prev => [...prev, res.data.data])
            setNuevo({ nombre: '', color: '' })
        } catch {
            onError?.('No se pudo agregar el estado.')
        }
    }

    async function eliminar(estado) {
        try {
            await api.delete(`/estados-pedido/${estado.id}`)
            setEstados(prev => prev.filter(e => e.id !== estado.id))
        } catch {
            onError?.('No se pudo eliminar el estado.')
        }
    }

    return (
        <div>
            <div className="panel-section-divider" />
            <div className="categorias-manager-title">
                <span>Estados de pedido</span>
                <button onClick={() => setVisible(v => !v)}>{visible ? '-' : '+'}</button>
            </div>

            {visible && (
                <>
                    <div className="categorias-list">
                        {estados.map(e => (
                            <div key={e.id} className="categoria-item">
                                {e.color && (
                                    <span
                                        style={chipEstadoStyle(e.color)}
                                    />
                                )}
                                <span className="categoria-item-name">{e.nombre}</span>
                                <button
                                    className="btn-cat-delete"
                                    onClick={() => eliminar(e)}
                                    title="Eliminar estado"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="categoria-nueva-row">
                        <input
                            className="categoria-nueva-input"
                            placeholder="Nuevo estado…"
                            value={nuevo.nombre}
                            onChange={e => setNuevo(p => ({ ...p, nombre: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && agregar()}
                        />
                        <input
                            type="color"
                            style={{ width: 32, height: 32, padding: 2, borderRadius: 6, cursor: 'pointer', border: 'none' }}
                            value={nuevo.color || '#6366f1'}
                            onChange={e => setNuevo(p => ({ ...p, color: e.target.value }))}
                            title="Color del estado"
                        />
                        <button
                            className="btn-cat-add"
                            onClick={agregar}
                            disabled={!nuevo.nombre.trim() || estados.some(e => e.nombre === nuevo.nombre.trim())}
                        >
                            +
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}