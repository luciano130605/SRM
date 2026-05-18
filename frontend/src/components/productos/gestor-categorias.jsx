import { useState } from "react"
import api from "../../../services/api"
import ModalEliminar from "./modal-eliminar"
import X from "../../icons/X"
import GripVertical from "../../icons/GripVertical"

export default function GestorCategorias({
    categorias,
    setCategorias,
    productosPorCategoria,
    onError,
}) {
    const [nueva, setNueva] = useState('')
    const [visible, setVisible] = useState(false)
    const [arrastrandoId, setArrastrandoId] = useState(null)
    const [categoriaSobreId, setCategoriaSobreId] = useState(null)
    const [guardandoOrden, setGuardandoOrden] = useState(false)

    const [modal, setModal] = useState({
        open: false,
        categoria: null,
        id: null,
        count: 0
    })

    async function agregarCategoria() {
        const nombre = nueva.trim()

        if (
            !nombre ||
            categorias.some(
                c => c.nombre.toLowerCase() === nombre.toLowerCase()
            )
        ) return

        try {
            const res = await api.post('/categorias', { nombre })

            const nuevaCategoria = res.data.data

            setCategorias(prev => [...prev, nuevaCategoria])
            setNueva('')

        } catch (error) {
            onError?.(error.response?.data?.mensaje || 'No se pudo agregar la categoria.')
        }
    }

    function moverCategoria(origenId, destinoId) {
        if (!origenId || !destinoId || String(origenId) === String(destinoId)) {
            return categorias
        }

        const origenIndex = categorias.findIndex(
            cat => String(cat.id) === String(origenId)
        )
        const destinoIndex = categorias.findIndex(
            cat => String(cat.id) === String(destinoId)
        )

        if (origenIndex === -1 || destinoIndex === -1) return categorias

        const nuevasCategorias = [...categorias]
        const [categoriaMovida] = nuevasCategorias.splice(origenIndex, 1)
        nuevasCategorias.splice(destinoIndex, 0, categoriaMovida)

        return nuevasCategorias.map((cat, index) => ({
            ...cat,
            orden: index + 1
        }))
    }

    function iniciarArrastre(e, cat) {
        setArrastrandoId(cat.id)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(cat.id))
    }

    function pasarSobre(e, cat) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setCategoriaSobreId(cat.id)
    }

    async function soltarCategoria(e, destino) {
        e.preventDefault()

        const origenId = e.dataTransfer.getData('text/plain') || arrastrandoId
        const categoriasAnteriores = categorias
        const nuevasCategorias = moverCategoria(origenId, destino.id)

        setArrastrandoId(null)
        setCategoriaSobreId(null)

        if (nuevasCategorias === categoriasAnteriores) return

        setCategorias(nuevasCategorias)
        setGuardandoOrden(true)

        try {
            const res = await api.put('/categorias/orden', {
                orden: nuevasCategorias.map(cat => cat.id)
            })

            setCategorias(res.data.data)
        } catch (error) {
            onError?.('No se pudo guardar el orden de categorias.')
            setCategorias(categoriasAnteriores)
        } finally {
            setGuardandoOrden(false)
        }
    }

    function terminarArrastre() {
        setArrastrandoId(null)
        setCategoriaSobreId(null)
    }

    function pedirEliminar(cat) {
        const count = productosPorCategoria[cat.nombre] || 0

        if (count > 0) {
            setModal({
                open: true,
                categoria: cat.nombre,
                id: cat.id,
                count
            })
        } else {
            eliminarCategoria(cat)
        }
    }

    async function eliminarCategoria(cat) {
        try {
            await api.delete(`/categorias/${cat.id}`)

            setCategorias(prev =>
                prev.filter(c => c.id !== cat.id)
            )

            cancelar()

        } catch (error) {
            onError?.('No se pudo eliminar la categoria.')
        }
    }

    function cancelar() {
        setModal({
            open: false,
            categoria: null,
            id: null,
            count: 0
        })
    }

    return (
        <div>
            <div className="panel-section-divider" />

            <div className="categorias-manager-title">
                <span>Categorías</span>

                <button onClick={() => setVisible(v => !v)}>
                    {visible ? '-' : '+'}
                </button>
            </div>

            {visible && (
                <>
                    <div className="categorias-list">
                        {categorias.map(cat => (
                            <div
                                key={cat.id}
                                className={[
                                    'categoria-item',
                                    String(arrastrandoId) === String(cat.id) ? 'dragging' : '',
                                    String(categoriaSobreId) === String(cat.id) ? 'drag-over' : ''
                                ].filter(Boolean).join(' ')}
                                draggable={!guardandoOrden}
                                onDragStart={e => iniciarArrastre(e, cat)}
                                onDragOver={e => pasarSobre(e, cat)}
                                onDragLeave={() => setCategoriaSobreId(null)}
                                onDrop={e => soltarCategoria(e, cat)}
                                onDragEnd={terminarArrastre}
                                title="Arrastrar para ordenar"
                            >
                                <GripVertical className="categoria-drag-handle" />

                                <span className="categoria-item-name">
                                    {cat.nombre}
                                </span>

                                {(productosPorCategoria[cat.nombre] || 0) > 0 && (
                                    <span className="categoria-item-count">
                                        {productosPorCategoria[cat.nombre]}
                                    </span>
                                )}

                                <button
                                    className="btn-cat-delete"
                                    onClick={() => pedirEliminar(cat)}
                                    title="Eliminar categoría"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="categoria-nueva-row">
                        <input
                            className="categoria-nueva-input"
                            placeholder="Nueva categoría…"
                            value={nueva}
                            onChange={e => setNueva(e.target.value)}
                            onKeyDown={e =>
                                e.key === 'Enter' && agregarCategoria()
                            }
                        />

                        <button
                            className="btn-cat-add"
                            onClick={agregarCategoria}
                            title="Agregar categoría"
                            disabled={
                                !nueva.trim() ||
                                categorias.some(
                                    c => c.nombre === nueva.trim()
                                )
                            }
                        >
                            +
                        </button>
                    </div>
                </>
            )}

            {modal.open && (
                <ModalEliminar
                    categoria={modal.categoria}
                    count={modal.count}
                    onCancelar={cancelar}
                    onConfirmar={() =>
                        eliminarCategoria({
                            id: modal.id,
                            nombre: modal.categoria
                        })
                    }
                />
            )}
        </div>
    )
}
