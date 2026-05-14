import { useState } from "react"
import GestorCategorias from './gestor-categorias'
import Formulario from "../formulario/formulario"

export default function FormularioProducto({ onCrear, creando, categorias, setCategorias, productosPorCategoria, nombreInputRef, onError }) {
    const [nombre, setNombre] = useState('')
    const [categoria, setCategoria] = useState('')
    const [costo, setCosto] = useState('')
    const [precioVenta, setPrecioVenta] = useState('')

    function handleCrear() {
        if (!nombre.trim() || !precioVenta) return
        onCrear({ nombre, categoriaId: categoria, costo, precioVenta }, () => {
            setNombre('')
            setCategoria('')
            setCosto('')
            setPrecioVenta('')
        })
    }

    const valido = nombre.trim() !== '' && precioVenta !== ''

    const campos = [
        {
            name: 'nombre',
            label: 'Nombre',
            required: true,
            value: nombre,
            onChange: setNombre,
            placeholder: 'Ej. Torta de chocolate',
            inputRef: nombreInputRef,
        },
        {
            name: 'categoria',
            label: 'Categoria',
            type: 'select',
            value: categoria,
            onChange: setCategoria,
            options: [
                { value: '', label: 'Sin categoria' },
                ...categorias.map(cat => ({ value: cat.id, label: cat.nombre })),
            ],
        },
        {
            name: 'costo',
            label: 'Costo de produccion',
            required: true,
            type: 'number',
            value: costo,
            onChange: setCosto,
            placeholder: '0.00',
            min: '0',
            step: '0.01',
        },
        {
            name: 'precioVenta',
            label: 'Precio de venta',
            required: true,
            type: 'number',
            value: precioVenta,
            onChange: setPrecioVenta,
            placeholder: '0.00',
            min: '0',
            step: '0.01',
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
