import { useState, useEffect } from "react"
import { createPortal } from 'react-dom'
import Calculadora from "../../icons/Calculadora";
import X from "../../icons/X";
import calcularCostoIngrediente from "./calcular-costo-ingrendientes";
import FilaIngrediente from "./fila-ingredientes";

function crearIngrediente() {
    return {
        id: crypto.randomUUID(),
        nombre: '',
        cantComprada: '',
        unidad: 'u',
        precioCompra: '',
        cantUsada: '',
    }
}


export default function CalculadoraCosto({ nombreProducto, onAplicar }) {
    const [abierto, setAbierto] = useState(false)
    const [ingredientes, setIngredientes] = useState([crearIngrediente()])
    const [focusUltimo, setFocusUltimo] = useState(false)


    const costoTotal = ingredientes.reduce((acc, i) => {
        const c = calcularCostoIngrediente(i)
        return acc + (c ?? 0)
    }, 0)

    function actualizar(id, datos) {
        setIngredientes(prev => prev.map(i => i.id === id ? { ...i, ...datos } : i))
        setFocusUltimo(false)
    }

    function eliminar(id) {
        setIngredientes(prev =>
            prev.length === 1 ? [crearIngrediente()] : prev.filter(i => i.id !== id)
        )
    }

    function agregar() {
        setIngredientes(prev => [...prev, crearIngrediente()])
        setFocusUltimo(true)
    }

    function aplicar() {
        onAplicar({
            costo: costoTotal.toFixed(2),
            precioVenta: '',
        })
        setAbierto(false)
    }

    useEffect(() => {
        if (!abierto) return
        const fn = e => { if (e.key === 'Escape') setAbierto(false) }
        window.addEventListener('keydown', fn)
        return () => window.removeEventListener('keydown', fn)
    }, [abierto])

    return (
        <>
            <button type="button" className="cc-trigger" onClick={() => setAbierto(true)}>
                <Calculadora />
                Calcular con ingredientes
            </button>

            {abierto && createPortal(
                <div className="cc-backdrop" onClick={e => e.target === e.currentTarget && setAbierto(false)}>
                    <div className="cc-modal" role="dialog" aria-modal="true">

                        <div className="cc-header">
                            <div>
                                <h2 className="cc-titulo">Calculadora de costo</h2>
                                {nombreProducto && <p className="cc-subtitulo">{nombreProducto}</p>}
                            </div>
                            <button className="cc-btn-x cc-btn-x--lg" onClick={() => setAbierto(false)} type="button"><X size={18} /></button>
                        </div>

                        <p className="cc-leyenda">
                            Ingresa cuanto compraste y a que precio, y cuanto usas en la receta. El costo se calcula solo.
                        </p>

                        <div className="cc-tabla-wrapper">
                            <table className="cc-tabla">
                                <thead>
                                    <tr>
                                        <th>Ingrediente</th>
                                        <th title="Cuanto compraste en total?">Cant. comprada</th>
                                        <th>Unidad</th>
                                        <th title="Cuanto pagaste por esa cantidad?">Precio compra</th>
                                        <th title="Cuanto usas en esta receta?">Cant. usada</th>
                                        <th title="Costo proporcional calculado">Costo receta</th>
                                        <th />
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingredientes.map((item, idx) => (
                                        <FilaIngrediente
                                            key={item.id}
                                            item={item}
                                            onChange={datos => actualizar(item.id, datos)}
                                            onEliminar={() => eliminar(item.id)}
                                            autoFocus={focusUltimo && idx === ingredientes.length - 1}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button type="button" className="cc-agregar" onClick={agregar}>
                            Agregar ingrediente
                        </button>

                        <div className="cc-resumen">
                            <div className="cc-resumen-info">
                                <span className="cc-resumen-label">Costo de produccion</span>
                                <span className="cc-resumen-desc">suma de costos proporcionales</span>
                            </div>
                            <strong className="cc-resumen-valor">${costoTotal.toFixed(2)}</strong>
                        </div>

                        <div className="cc-acciones">
                            <button
                                type="button"
                                className="cc-btn cc-btn--primario"
                                onClick={aplicar}
                                disabled={costoTotal === 0}
                            >
                                Aplicar al formulario
                            </button>
                        </div>

                        <p className="cc-hint">
                            Se aplicara solo el costo calculado.
                        </p>
                    </div>
                </div>,
                document.body
            )}

        </>
    )
}
