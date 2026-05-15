import { useEffect, useMemo, useState } from 'react'
import api from "../../../services/api"
import "./dashboard.css"
import formatPrecio from './format-precio'
import KPICard from './kpi-card'
import PedidosRecientes from "./pedidos-recientes"
import TopProductos from './top-productos'
import ClientesActivos from './clientes-activos'
import AccesoRapido from './acceso-rapido'
import GraficaVentas from './grafica-ventas'
import Comandos from '../comandos/comandos'
import Toast from '../toast/toast'

const comandosDashboard = [
    { teclas: 'Alt + C', accion: 'Crear nuevo cliente' },
    { teclas: 'Alt + P', accion: 'Crear nuevo producto' },
    { teclas: 'Alt + N', accion: 'Crear nuevo pedido' },
]

function obtenerSaludo() {
    const hora = new Date().getHours()
    if (hora < 12) return 'Buen dia'
    if (hora < 20) return 'Buenas tardes'
    return 'Buenas noches'
}

function primerNombre(usuario) {
    const nombre = usuario?.nombre || usuario?.email?.split('@')[0] || ''
    return nombre ? nombre.split(/[.\s_-]/)[0] : ''
}

function normalizarEstado(estado = '') {
    return estado.toLowerCase().trim() || 'pendiente'
}

function ChartEstados({ pedidos }) {
    const datos = useMemo(() => {
        const total = Math.max(pedidos.length, 1)
        const base = [
            { id: 'pendiente', label: 'Pendientes', color: 'var(--amber)', count: 0 },
            { id: 'en proceso', label: 'En proceso', color: 'var(--pink-light)', count: 0 },
            { id: 'entregado', label: 'Entregados', color: 'var(--green)', count: 0 },
            { id: 'cancelado', label: 'Cancelados', color: 'var(--pink-dark)', count: 0 },
        ]
        const porId = Object.fromEntries(base.map(item => [item.id, item]))

        pedidos.forEach(pedido => {
            const estado = normalizarEstado(pedido.estado)
            if (porId[estado]) porId[estado].count += 1
            else porId.pendiente.count += 1
        })

        return base.map(item => ({
            ...item,
            pct: Math.round((item.count / total) * 100),
        }))
    }, [pedidos])

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Estado de pedidos</span>
                <span className="panel-head-badge">{pedidos.length} total</span>
            </div>

            <div className="estado-chart">
                {datos.map(item => (
                    <div key={item.id} className="estado-chart-row">
                        <div className="estado-chart-meta">
                            <span>{item.label}</span>
                            <strong>{item.count}</strong>
                        </div>
                        <div className="estado-chart-track" aria-label={`${item.label}: ${item.pct}%`}>
                            <span
                                className="estado-chart-fill"
                                style={{ width: `${item.pct}%`, background: item.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function AccionesDashboard({ onIrA }) {
    return (
        <div className="dash-panel dash-actions-panel">
            <div className="panel-head">
                <span className="panel-head-title">Acceso rapido y comandos</span>
            </div>

            <div className="dash-actions-combo">
                <AccesoRapido
                    soloBotones
                    onNuevoPedido={() => onIrA('pedidos')}
                    onAgregarProducto={() => onIrA('productos')}
                    onAgregarCliente={() => onIrA('clientes')}
                    onVerEntregas={() => onIrA('pedidos')}
                />

                <div className="dash-inline-commands">
                    <p className="dash-inline-title">Atajos</p>
                    <Comandos comandos={comandosDashboard} inline />
                </div>
            </div>
        </div>
    )
}

export default function Dashboard({ usuario, onIrA = () => { } }) {
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [toast, setToast] = useState(null)

    useEffect(() => {
        Promise.all([
            api.get('/pedidos'),
            api.get('/clientes'),
            api.get('/productos'),
        ]).then(([rPed, rCli, rProd]) => {
            setPedidos(rPed.data.data || rPed.data || [])
            setClientes(rCli.data.data || rCli.data || [])
            setProductos(rProd.data.data || rProd.data || [])
        }).catch(() => {
            setToast({ mensaje: 'No se pudo cargar el dashboard.', tipo: 'error' })
            window.setTimeout(() => setToast(null), 3500)
        })
            .finally(() => setCargando(false))
    }, [])

    useEffect(() => {
        function handleKeyDown(e) {
            if (!e.altKey) return

            const tecla = e.key.toLowerCase()
            if (tecla === 'c') {
                e.preventDefault()
                onIrA('clientes')
            }
            if (tecla === 'p') {
                e.preventDefault()
                onIrA('productos')
            }
            if (tecla === 'n') {
                e.preventDefault()
                onIrA('pedidos')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onIrA])

    const stats = useMemo(() => {
        const pedidosActivos = pedidos.filter(p => normalizarEstado(p.estado) !== 'cancelado')
        const ingresos = pedidosActivos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0)
        const pendientes = pedidos.filter(p => normalizarEstado(p.estado) === 'pendiente').length
        const ticketProm = pedidosActivos.length > 0 ? ingresos / pedidosActivos.length : 0
        return { ingresos, pendientes, ticketProm }
    }, [pedidos])

    const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    const nombre = primerNombre(usuario)
    const saludo = `${obtenerSaludo()}${nombre ? `, ${nombre}` : ''}`

    if (cargando) return <div className="dash-contenedor"><p className="dash-loading">Cargando...</p></div>

    return (
        <div className="dash-contenedor">
            <header className="dash-hero">
                <div>
                    <p className="dash-label">Panel de control</p>
                    <h1 className="dash-title">{saludo}</h1>
                    <p className="dash-subtitle">
                        Tenes {stats.pendientes} pedido{stats.pendientes !== 1 ? 's' : ''} pendiente{stats.pendientes !== 1 ? 's' : ''} y {productos.length} producto{productos.length !== 1 ? 's' : ''} en catalogo.
                    </p>
                </div>
                <span className="dash-fecha">{hoy}</span>
            </header>

            <AccionesDashboard onIrA={onIrA} />

            <div className="kpi-grid">
                <KPICard label="Ingresos totales" value={formatPrecio(stats.ingresos)} money sub={`${pedidos.length} pedidos`} />
                <KPICard label="Ticket promedio" value={formatPrecio(stats.ticketProm)} money sub="por pedido" />
                <KPICard label="Pendientes" value={stats.pendientes} sub="pedidos sin entregar" />
                <KPICard label="Catalogo" value={productos.length} sub={`${clientes.length} clientes`} />
            </div>

            <div className="dash-grid">
                <GraficaVentas pedidos={pedidos} />
                <ChartEstados pedidos={pedidos} />
            </div>

            <div className="dash-grid-3">
                <PedidosRecientes pedidos={pedidos} clientes={clientes} />
                <ClientesActivos clientes={clientes} pedidos={pedidos} />
            </div>

            <div className="dash-top-section">
                <TopProductos pedidos={pedidos} />
            </div>
            <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
        </div>
    )
}
