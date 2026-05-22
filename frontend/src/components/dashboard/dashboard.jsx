import { useEffect, useMemo, useState } from 'react'
import api from "../../../services/api"
import formatPrecio from './format-precio'
import KPICard from './kpi-card'
import PedidosRecientes from "./pedidos-recientes"
import ClientesActivos from './clientes-activos'
import AccesoRapido from './acceso-rapido'
import Comandos from '../comandos/comandos'
import Toast from '../toast/toast'

const comandosDashboard = [
    { teclas: 'Alt + C', accion: 'Crear nuevo cliente' },
    { teclas: 'Alt + P', accion: 'Crear nuevo producto' },
    { teclas: 'Alt + N', accion: 'Crear nuevo pedido' },
    {teclas: 'Ctrl + K', accion: 'Abrir chat IA'}
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
    const [estados, setEstados] = useState([])
    useEffect(() => {
        Promise.all([
            api.get('/pedidos'),
            api.get('/clientes'),
            api.get('/productos'),
            api.get('/estados-pedido'),
        ]).then(([rPed, rCli, rProd]) => {
            setPedidos(rPed.data.data || rPed.data || [])
            setClientes(rCli.data.data || rCli.data || [])
            setProductos(rProd.data.data || rProd.data || [])
            setEstados(rEst.data.data || rEst.data || [])
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
                <PedidosRecientes pedidos={pedidos} clientes={clientes} estados={estados} />
                <ClientesActivos clientes={clientes} pedidos={pedidos} />
            </div>

            <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
        </div>
    )
}

