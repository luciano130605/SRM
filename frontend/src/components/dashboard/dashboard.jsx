import { useEffect, useState, useMemo } from 'react'
import api from "../../../services/api"
import "./dashboard.css"

function formatPrecio(v) {
    return (parseFloat(v) || 0).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function iniciales(nombre = '') {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

function chipEstado(estado) {
    const map = {
        pendiente: 'estado-pendiente',
        entregado: 'estado-entregado',
        cancelado: 'estado-cancelado',
        'en proceso': 'estado-en-proceso',
        'en-proceso': 'estado-en-proceso',
    }
    return map[(estado || '').toLowerCase()] || 'estado-pendiente'
}

function KPICard({ label, value, sub, money }) {
    return (
        <div className="kpi-card">
            <p className="kpi-label">{label}</p>
            <p className={`kpi-value${money ? ' money' : ''}`}>{value}</p>
            {sub && <p className="kpi-sub">{sub}</p>}
        </div>
    )
}

function PedidosRecientes({ pedidos, clientes }) {
    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(c => [c.id, c])), [clientes])

    const recientes = [...pedidos]
        .sort((a, b) => new Date(b.fecha || b.createdAt) - new Date(a.fecha || a.createdAt))
        .slice(0, 7)

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Pedidos recientes</span>
                <span className="panel-head-badge">{pedidos.length} total</span>
            </div>

            {recientes.length === 0
                ? <p className="dash-empty">Sin pedidos todavía.</p>
                : recientes.map(p => {
                    const cliente = clienteMap[p.clienteId] || {}
                    const fecha = p.fecha || p.createdAt
                        ? new Date(p.fecha || p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                        : '—'
                    return (
                        <div key={p.id} className="pedido-row">
                            <div className="pedido-avatar">{iniciales(cliente.nombre || '?')}</div>
                            <div className="pedido-row-info">
                                <p className="pedido-row-cliente">{cliente.nombre || 'Cliente'}</p>
                                <p className="pedido-row-fecha">{fecha}</p>
                            </div>
                            <div className="pedido-row-right">
                                <p className="pedido-row-monto">${formatPrecio(p.total)}</p>
                                <span className={`pedido-estado-chip ${chipEstado(p.estado)}`}>{p.estado || 'pendiente'}</span>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

function TopProductos({ pedidos }) {
    const top = useMemo(() => {
        const conteo = {}
        pedidos.forEach(ped => {
            (ped.items || ped.productos || []).forEach(item => {
                const key = item.productoId || item.nombre || 'Desconocido'
                const nombre = item.nombre || item.productoNombre || key
                const cat = item.categoria || ''
                if (!conteo[key]) conteo[key] = { nombre, cat, cant: 0 }
                conteo[key].cant += item.cantidad || 1
            })
        })
        return Object.values(conteo).sort((a, b) => b.cant - a.cant).slice(0, 6)
    }, [pedidos])

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Más vendidos</span>
                <span className="panel-head-badge">Top 6</span>
            </div>

            {top.length === 0
                ? <p className="dash-empty">Sin datos de ventas.</p>
                : top.map((p, i) => (
                    <div key={p.nombre} className="top-prod-row">
                        <span className="top-prod-num">{i + 1}</span>
                        <div className="top-prod-info">
                            <p className="top-prod-nombre">{p.nombre}</p>
                            {p.cat && <p className="top-prod-cat">{p.cat}</p>}
                        </div>
                        <div className="top-prod-cant">
                            {p.cant}
                            <span>unidades</span>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}

function ClientesActivos({ clientes, pedidos }) {
    const top = useMemo(() => {
        const conteo = {}
        pedidos.forEach(p => {
            if (p.clienteId) conteo[p.clienteId] = (conteo[p.clienteId] || 0) + 1
        })
        return clientes
            .map(c => ({ ...c, pedidosCount: conteo[c.id] || 0 }))
            .filter(c => c.pedidosCount > 0)
            .sort((a, b) => b.pedidosCount - a.pedidosCount)
            .slice(0, 6)
    }, [clientes, pedidos])

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Clientes frecuentes</span>
                <span className="panel-head-badge">{clientes.length} total</span>
            </div>

            {top.length === 0
                ? <p className="dash-empty">Sin clientes con pedidos.</p>
                : <div className="cliente-chip-grid">
                    {top.map(c => (
                        <div key={c.id} className="cliente-chip">
                            <div className="cliente-chip-av">{iniciales(c.nombre)}</div>
                            <span className="cliente-chip-nombre">{c.nombre}</span>
                            <span className="cliente-chip-pedidos">{c.pedidosCount} pedido{c.pedidosCount !== 1 ? 's' : ''}</span>
                        </div>
                    ))}
                </div>
            }
        </div>
    )
}

function Dashboard() {
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
    const [productos, setProductos] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/pedidos'),
            api.get('/clientes'),
            api.get('/productos'),
        ]).then(([rPed, rCli, rProd]) => {
            setPedidos(rPed.data.data || rPed.data || [])
            setClientes(rCli.data.data || rCli.data || [])
            setProductos(rProd.data.data || rProd.data || [])
        }).catch(console.error)
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
                    <h1 className="dash-title">SRM <em>Dashboard</em></h1>
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
                    <ClientesActivos clientes={clientes} pedidos={pedidos} />
                </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <TopProductos pedidos={pedidos} />
            </div>
        </div>
    )
}

export default Dashboard