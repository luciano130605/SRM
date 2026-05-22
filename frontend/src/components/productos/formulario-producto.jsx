import { useState, useEffect } from "react"
import GestorCategorias from './gestor-categorias'
import Formulario from "../formulario/formulario"
import CalculadoraCosto from "./calculadora-costo"
import SugerenciaIA from "../ia/sugerencia-ia"
import DropdownMenu from "../dropdown-menu/dropdown-menu"

export default function FormularioProducto({ datosIniciales, onCrear, creando, categorias, setCategorias, productosPorCategoria, nombreInputRef, onError }) {
    const [nombre, setNombre] = useState('')
    const [categoria, setCategoria] = useState('')
    const [costo, setCosto] = useState('')
    const [precioVenta, setPrecioVenta] = useState('')
    const [versionSugerencia, setVersionSugerencia] = useState(0)
    const [categoriaAbierta, setCategoriaAbierta] = useState(false)

    useEffect(() => {
        if (!datosIniciales) return

        setNombre(String(datosIniciales.nombre ?? ""))
        setCategoria(String(datosIniciales.categoriaId ?? ""))
        setCosto(String(datosIniciales.costo ?? ""))
        setPrecioVenta(String(datosIniciales.precioVenta ?? ""))
    }, [datosIniciales])

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
            render: () => {
                const categoriaActual =
                    categorias.find(cat => cat.id === categoria)?.nombre ||
                    'Sin categoría'

                return (
                    <div className="form-label-Conteiner">
                        <label className="form-label">
                            Categoría
                        </label>

                        <div className="dropdown-field">
                            <button
                                type="button"
                                className="form-input dropdown-trigger"
                                onClick={() => setCategoriaAbierta(v => !v)}
                            >
                                {categoriaActual}
                            </button>

                            <DropdownMenu
                                abierto={categoriaAbierta}
                                onCerrar={() => setCategoriaAbierta(false)}
                                opciones={[
                                    {
                                        value: '',
                                        label: 'Sin categoría',
                                    },
                                    ...categorias.map(cat => ({
                                        value: cat.id,
                                        label: cat.nombre,
                                    })),
                                ]}
                                onSeleccionar={({ value }) => {
                                    setCategoria(value)
                                    setVersionSugerencia(v => v + 1)
                                    setCategoriaAbierta(false)
                                }}
                            />
                        </div>
                    </div>
                )
            },
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
