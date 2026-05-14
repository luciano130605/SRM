import { useEffect, useState, useMemo } from 'react'
import api from "../../../services/api"
import "./dashboard.css"
import formatPrecio from './format-precio'
import KPICard from './kpi-card'
import PedidosRecientes from "./pedidos-recientes"
import TopProductos from './top-productos'
import ClientesActivos from './clientes-activos'
import Toast from '../toast/toast'


export default function Dashboard() {
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

    const stats = useMemo(() => {
        const pedidosActivos = pedidos.filter(p => (p.estado || '').toLowerCase() !== 'cancelado')
        const ingresos = pedidosActivos.reduce((s, p) => s + (parseFloat(p.total) || 0), 0)
        const pendientes = pedidos.filter(p => (p.estado || '').toLowerCase() === 'pendiente').length
        const ticketProm = pedidosActivos.length > 0 ? ingresos / pedidosActivos.length : 0
        return { ingresos, pendientes, ticketProm }
    }, [pedidos])

    const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

    if (cargando) return <div className="dash-contenedor"><p className="dash-loading">Cargando…</p></div>

    return (
        <div className="dash-contenedor">
            <header className="dash-header">
                <div>
                    <p className="dash-label">Panel de control</p>
                    <h1 className="dash-title"><em>Dashboard</em></h1>
                </div>
                <span className="dash-fecha">{hoy}</span>
            </header>

            <div className="kpi-grid">
                <KPICard label="Ingresos totales" value={formatPrecio(stats.ingresos)} money sub={`${pedidos.length} pedidos`} />
                <KPICard label="Ticket promedio" value={formatPrecio(stats.ticketProm)} money sub="por pedido" />
                <KPICard label="Pendientes" value={stats.pendientes} sub="pedidos sin entregar" />
                <KPICard label="Catálogo" value={productos.length} sub={`${clientes.length} clientes`} />
            </div>

            <div className="dash-grid-3">
                <PedidosRecientes pedidos={pedidos} clientes={clientes} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <TopProductos pedidos={pedidos} />
            </div>
            <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
        </div>
    )
}

