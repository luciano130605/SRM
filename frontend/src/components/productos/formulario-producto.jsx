import { useState } from "react"
import GestorCategorias from './gestor-categorias'
import Formulario from "../formulario/formulario"
import CalculadoraCosto from "./calculadora-costo"
import SugerenciaIA from "../ia/sugerencia-ia"

export default function FormularioProducto({ onCrear, creando, categorias, setCategorias, productosPorCategoria, nombreInputRef, onError }) {
    const [nombre, setNombre] = useState('')
    const [categoria, setCategoria] = useState('')
    const [costo, setCosto] = useState('')
    const [precioVenta, setPrecioVenta] = useState('')
    const [versionSugerencia, setVersionSugerencia] = useState(0)

    function handleCrear() {
        if (!nombre.trim() || !precioVenta) return
        onCrear({ nombre, categoriaId: categoria, costo, precioVenta }, () => {
            setNombre('')
            setCategoria('')
            setCosto('')
            setPrecioVenta('')
        })
    }

    function handleAplicarCalculadora({ costo: c, precioVenta: pv }) {
        if (c) setCosto(c)
        if (pv) setPrecioVenta(pv)
        setVersionSugerencia(v => v + 1)
    }

    const valido = nombre.trim() !== '' && precioVenta !== ''

    const campos = [
        {
            name: 'nombre',
            label: 'Nombre',
            required: true,
            value: nombre,
            onChange: valor => {
                setNombre(valor)
                setVersionSugerencia(v => v + 1)
            },
            placeholder: 'Ej. Torta de chocolate',
            inputRef: nombreInputRef,
        },
        {
            name: 'categoria',
            label: 'Categoria',
            type: 'select',
            value: categoria,
            onChange: valor => {
                setCategoria(valor)
                setVersionSugerencia(v => v + 1)
            },
            options: [
                { value: '', label: 'Sin categoria' },
                ...categorias.map(cat => ({ value: cat.id, label: cat.nombre })),
            ],
        },
        {
            name: 'costo',
            render: () => (
                <div className="form-label-Conteiner">
                    <label className="form-label" htmlFor="costo">
                        Costo de produccion
                    </label>
                    <input
                        id="costo"
                        name="costo"
                        className="form-input"
                        type="number"
                        placeholder="0.00"
                        value={costo}
                        min="0"
                        step="0.01"
                        onChange={e => {
                            setCosto(e.target.value)
                            setVersionSugerencia(v => v + 1)
                        }}
                    />
                    <CalculadoraCosto
                        nombreProducto={nombre}
                        onAplicar={handleAplicarCalculadora}
                    />
                </div>
            ),
        },
        {
            name: 'precioVenta',
            render: () => (
                <div className="form-label-Conteiner">
                    <label
                        className="form-label required"
                        htmlFor="precioVenta"
                        title="Campo obligatorio"
                    >
                        Precio de venta
                    </label>
                    <input
                        id="precioVenta"
                        name="precioVenta"
                        className="form-input"
                        type="number"
                        value={precioVenta}
                        onChange={e => {
                            setPrecioVenta(e.target.value)
                            setVersionSugerencia(v => v + 1)
                        }}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                    />
                    <SugerenciaIA
                        key={versionSugerencia}
                        endpoint="/ia/precio-venta"
                        label="Sugerir precio con IA"
                        disabled={!Number(costo) || Number(costo) <= 0}
                        payload={{
                            nombreProducto: nombre,
                            costoProduccion: Number(costo),
                            categoria: categorias.find(cat => cat.id === categoria)?.nombre,
                        }}
                        onSugerencia={sugerencia => setPrecioVenta(String(sugerencia.precioSugerido))}
                        renderResultado={sugerencia => (
                            <div className="ia-sugerencia-card">
                                <div className="ia-sugerencia-card-top">
                                    <span className="ia-sugerencia-badge">IA</span>
                                    <span>{sugerencia.razon}</span>
                                </div>
                                <div className="ia-sugerencia-card-grid">
                                    <span>
                                        Precio sugerido
                                        <strong>${Number(sugerencia.precioSugerido).toFixed(2)}</strong>
                                    </span>
                                    <span>
                                        Margen
                                        <strong>{sugerencia.margen}%</strong>
                                    </span>
                                </div>
                            </div>
                        )}
                    />
                </div>
            ),
        },
    ]

    return (
        <Formulario
            titulo="Agregar producto"
            campos={campos}
            textoBoton="Crear producto"
            cargando={creando}
            valido={valido}
            onSubmit={handleCrear}
        >
            <GestorCategorias
                categorias={categorias}
                setCategorias={setCategorias}
                productosPorCategoria={productosPorCategoria}
                onError={onError}
            />
        </Formulario>
    )
}
