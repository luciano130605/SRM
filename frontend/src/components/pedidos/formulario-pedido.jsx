import { useMemo, useState, useEffect } from "react"
import Formulario from "../formulario/formulario"
import { ESTADOS_PEDIDO } from "./estados-pedido"
import formatPrecio from "./format-precio"
import X from "../../icons/X"
import DropdownMenu from "../../dropdown-menu/dropdown-menu"


export default function FormularioPedido({ datosIniciales, onCrear, creando, clientes, productos }) {
    const [clienteId, setClienteId] = useState('')

    const [estado, setEstado] = useState('pendiente')
    const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
    const [notas, setNotas] = useState('')
    const [items, setItems] = useState([{ productoId: '', cantidad: 1 }])

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
            setEstado('pendiente')
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
                ...clientes.map(cliente => ({ value: cliente.id, label: cliente.nombre })),
            ],
        },
        {
            name: 'estado',
            label: 'Estado',
            type: 'select',
            value: estado,
            onChange: setEstado,
            options: ESTADOS_PEDIDO.map(item => ({ value: item, label: item })),
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
                                    {
                                        value: '',
                                        label: 'Seleccionar...',
                                    },
                                    ...productos.map(producto => ({
                                        value: producto.id,
                                        label: producto.nombre,
                                    })),
                                ]}
                                onChange={value =>
                                    updateItem(index, 'productoId', value)
                                }
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
