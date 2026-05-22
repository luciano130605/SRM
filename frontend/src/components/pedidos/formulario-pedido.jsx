import { useMemo, useState, useEffect } from "react"
import Formulario from "../formulario/formulario"
import formatPrecio from "./format-precio"
import X from "../../icons/X"
import DropdownMenu from "../dropdown-menu/dropdown-menu"
import GestorEstadosPedido from "./gestor-estados-pedidos"

export default function FormularioPedido({ datosIniciales, onCrear, creando, clientes, productos, estados, setEstados, onError }) {
    const [clienteId, setClienteId] = useState('')
    const [estado, setEstado] = useState('')
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
    const [notas, setNotas] = useState('')
    const [items, setItems] = useState([{ productoId: '', cantidad: 1 }])

    useEffect(() => {
        if (estado === '' && estados.length > 0)
            setEstado(estados[0].nombre)
    }, [estados])

    useEffect(() => {
        if (!datosIniciales) return
        setClienteId(String(datosIniciales.clienteId ?? ""))
        setEstado(String(datosIniciales.estado ?? ""))
        setFecha(String(datosIniciales.fecha ?? ""))
        setNotas(String(datosIniciales.notas ?? ""))
    }, [datosIniciales])

    const total = useMemo(() => {
        return items.reduce((sum, item) => {
            const producto = productos.find(p => String(p.id) === String(item.productoId))
            return sum + (parseFloat(producto?.precioVenta) || 0) * (parseInt(item.cantidad) || 1)
        }, 0)
    }, [items, productos])

    function addItem() {
        setItems(prev => [...prev, { productoId: '', cantidad: 1 }])
    }

    function removeItem(index) {
        setItems(prev => prev.filter((_, idx) => idx !== index))
    }

    function updateItem(index, field, value) {
        setItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item))
    }

    function handleCrear() {
        const itemsConDatos = items
            .filter(item => item.productoId)
            .map(item => {
                const producto = productos.find(p => String(p.id) === String(item.productoId))
                return {
                    productoId: item.productoId,
                    nombre: producto?.nombre || '',
                    cantidad: parseInt(item.cantidad) || 1,
                    precioUnitario: parseFloat(producto?.precioVenta) || 0,
                }
            })

        if (!clienteId || itemsConDatos.length === 0) return

        onCrear({ clienteId, estado, fecha, notas, items: itemsConDatos, total }, () => {
            setClienteId('')
            setEstado(estados[0]?.nombre || '')
            setFecha(new Date().toISOString().slice(0, 10))
            setNotas('')
            setItems([{ productoId: '', cantidad: 1 }])
        })
    }

    const campos = [
        {
            name: 'cliente',
            label: 'Cliente',
            required: true,
            type: 'select',
            value: clienteId,
            onChange: setClienteId,
            options: [
                { value: '', label: 'Seleccionar cliente' },
                ...clientes.map(c => ({ value: c.id, label: c.nombre })),
            ],
        },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            value: estado,
            onChange: setEstado,
            options: estados.map(e => ({ value: e.nombre, label: e.nombre })),
        },
        {
            name: 'fecha',
            label: 'Fecha',
            type: 'date',
            value: fecha,
            onChange: setFecha,
        },
        {
            name: 'productos',
            render: () => (
                <div className="ped-items-section">
                    <div className="ped-items-label">
                        <span className="required">Productos</span>
                        <button type="button" onClick={addItem}>Agregar</button>
                    </div>

                    {items.map((item, index) => (
                        <div key={index} className="ped-item-row">
                            <DropdownMenu
                                value={item.productoId}
                                placeholder="Seleccionar..."
                                options={[
                                    { value: '', label: 'Seleccionar...' },
                                    ...productos.map(p => ({ value: p.id, label: p.nombre })),
                                ]}
                                onChange={value => updateItem(index, 'productoId', value)}
                            />
                            <input
                                type="number"
                                min="1"
                                value={item.cantidad}
                                onChange={e => updateItem(index, 'cantidad', e.target.value)}
                                placeholder="Cant."
                            />
                            <button
                                type="button"
                                className="btn-cat-delete"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                            >
                                <X />
                            </button>
                        </div>
                    ))}

                    {total > 0 && (
                        <div className="ped-total-estimado">
                            Total estimado: <strong>${formatPrecio(total)}</strong>
                        </div>
                    )}
                </div>
            ),
        },
        {
            name: 'notas',
            label: 'Notas',
            value: notas,
            onChange: setNotas,
            placeholder: 'Indicaciones especiales...',
        },
        {
            name: 'gestor',
            render: () => (
                <GestorEstadosPedido
                    estados={estados}
                    setEstados={setEstados}
                    onError={onError}
                />
            ),
        },
    ]

    const valido = !!clienteId && items.some(item => item.productoId)

    return (
        <Formulario
            titulo="Nuevo pedido"
            campos={campos}
            textoBoton="Crear pedido"
            cargando={creando}
            valido={valido}
            onSubmit={handleCrear}
        />
    )
}