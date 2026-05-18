import { useEffect, useRef } from "react";
import X from "../../icons/X";
import calcularCostoIngrediente from "./calcular-costo-ingrendientes";

const UNIDADES = [
    { value: 'u', label: 'Unidad' },
    { value: 'g', label: 'Gramos' },
    { value: 'kg', label: 'Kilogramos' },
    { value: 'ml', label: 'Mililitros' },
    { value: 'l', label: 'Litros' },
    { value: 'cdas', label: 'Cucharadas' },
    { value: 'cditas', label: 'Cucharaditas' },
    { value: 'taza', label: 'Taza' },
]

export default function FilaIngrediente({ item, onChange, onEliminar, autoFocus }) {
    const ref = useRef(null)

    useEffect(() => {
        if (autoFocus) ref.current?.focus()
    }, [autoFocus])

    const costoCalculado = calcularCostoIngrediente(item)

    return (
        <tr className="cc-fila">
            <td>
                <input
                    ref={ref}
                    className="cc-input"
                    placeholder="Ej. Huevos"
                    value={item.nombre}
                    onChange={e => onChange({ ...item, nombre: e.target.value })}
                />
            </td>

            <td>
                <input
                    className="cc-input cc-input--num"
                    type="number"
                    placeholder="8"
                    min="0"
                    step="any"
                    value={item.cantComprada}
                    onChange={e => onChange({ ...item, cantComprada: e.target.value })}
                />
            </td>

            <td>
                <select
                    className="cc-select"
                    value={item.unidad}
                    onChange={e => onChange({ ...item, unidad: e.target.value })}
                >
                    {UNIDADES.map(u => (
                        <option
                            key={u.value}
                            value={u.value}
                            title={u.label}
                        >
                            {u.value}
                        </option>
                    ))}
                </select>
            </td>

            <td>
                <div className="cc-input-prefix-wrap">
                    <span className="cc-prefix">$</span>

                    <input
                        className="cc-input cc-input--num cc-input--con-prefix"
                        type="number"
                        placeholder="500"
                        min="0"
                        step="0.01"
                        value={item.precioCompra}
                        onChange={e => onChange({ ...item, precioCompra: e.target.value })}
                    />
                </div>
            </td>

            <td>
                <td>
                    <div className="cc-input-unidad-wrap">
                        <input
                            className="cc-input cc-input--num"
                            type="number"
                            placeholder="2"
                            min="0"
                            step="any"
                            value={item.cantUsada}
                            onChange={e => onChange({ ...item, cantUsada: e.target.value })}
                        />

                        <span
                            className="cc-unidad-indicador"
                            title={
                                UNIDADES.find(u => u.value === item.unidad)?.label
                            }
                        >
                            {item.unidad}
                        </span>
                    </div>
                </td>
            </td>

            <td className="cc-td-costo">
                {costoCalculado !== null
                    ? <span className="cc-costo-calc">${costoCalculado.toFixed(2)}</span>
                    : <span className="cc-costo-vacio">—</span>
                }
            </td>

            <td>
                <button
                    className="cc-btn-x"
                    onClick={onEliminar}
                    type="button"
                    title="Eliminar"
                >
                    <X />
                </button>
            </td>
        </tr>
    )
}