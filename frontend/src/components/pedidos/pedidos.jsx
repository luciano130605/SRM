import { useEffect, useMemo, useRef, useState } from 'react'
import api from "../../../services/api"
import "./pedidos.css"
import Buscador from "../buscador/buscador"
import VistaSwitch from "../vista-switch/vista-switch"
import ImportExport from "../import-export/import-export"
import LimpiarTodo from "../limpiar-todo/limpiar-todo"
import ToastDeshacer from "../toast-deshacer/toast-deshacer"
import Toast from "../toast/toast"
import Comandos from "../comandos/comandos"
import FormularioPedido from "./formulario-pedido"
import FiltrosPedidos from "./filtros-pedidos"
import ListaPedidos from "./lista-pedidos"
import Paginacion from '../paginacion/paginacion'
import useEliminacionDeshacer from "../../hooks/use-eliminacion-deshacer"
import { exportarCsv, normalizarTexto, obtenerValorFila, parsearNumero, parsearTablaCsv } from "../../utils/csv"

const POR_PAGINA = 3
const comandosPedidos = [
    { teclas: 'Ctrl + H', accion: 'Buscar pedidos' },
    { teclas: 'Ctrl + M', accion: 'Cambiar Cards / Tabla' },
    { teclas: 'Ctrl + E', accion: 'Exportar sheet' },
    { teclas: 'Ctrl + I', accion: 'Importar sheet' },
    { teclas: 'Ctrl + Z', accion: 'Deshacer eliminacion' },
    { teclas: 'Ctrl + /', accion: 'Ver comandos' },
    { teclas: 'Esc', accion: 'Cerrar ventanas' }
]

function Pedidos() {
    const [pedidos, setPedidos] = useState([])
    const [clientes, setClientes] = useState([])
    const [productos, setProductos] = useState([])
    const [creando, setCreando] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [orden, setOrden] = useState('reciente')
    const [vista, setVista] = useState('cards')
    const [pagina, setPagina] = useState(1)
    const [importando, setImportando] = useState(false)
    const [resultadoImportacion, setResultadoImportacion] = useState('')
    const [toast, setToast] = useState(null)
    const [comandosAbiertos, setComandosAbiertos] = useState(false)
    const buscadorRef = useRef(null)
    const inputImportRef = useRef(null)

    const {
        toastDeshacer,
        confirmarAccionPendiente,
        deshacerEliminacion,
        eliminarItem,
        limpiarItems,
    } = useEliminacionDeshacer({
        nombreSingular: 'Pedido',
        nombrePlural: 'pedidos',
        setItems: setPedidos,
        eliminarEnServidor: pedido => api.delete(`/pedidos/${pedido.id}`),
        onError: mostrarError,
    })

    const clienteMap = useMemo(() =>
        Object.fromEntries(clientes.map(cliente => [String(cliente.id), cliente])), [clientes])

    const procesados = useMemo(() => {
        let lista = [...pedidos]

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()

            lista = lista.filter(pedido => {
                const cliente = clienteMap[String(pedido.clienteId)] || {}

                return (cliente.nombre || '').toLowerCase().includes(q) ||
                    String(pedido.id).includes(q) ||
                    (pedido.notas || '').toLowerCase().includes(q)
            })
        }

        if (filtroEstado) {
            lista = lista.filter(pedido => (pedido.estado || 'pendiente').toLowerCase() === filtroEstado)
        }

        switch (orden) {
            case 'reciente':
                lista.sort((a, b) => new Date(b.fecha || b.createdAt || 0) - new Date(a.fecha || a.createdAt || 0))
                break
            case 'antiguo':
                lista.sort((a, b) => new Date(a.fecha || a.createdAt || 0) - new Date(b.fecha || b.createdAt || 0))
                break
            case 'mayor-total':
                lista.sort((a, b) => (parseFloat(b.total) || 0) - (parseFloat(a.total) || 0))
                break
            case 'menor-total':
                lista.sort((a, b) => (parseFloat(a.total) || 0) - (parseFloat(b.total) || 0))
                break
            default:
                break
        }

        return lista
    }, [pedidos, busqueda, filtroEstado, orden, clienteMap])

    useEffect(() => { setPagina(1) }, [busqueda, filtroEstado, orden])

    const totalPaginas = Math.ceil(procesados.length / POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * POR_PAGINA
    const hasta = Math.min(desde + POR_PAGINA, procesados.length)
    const paginados = procesados.slice(desde, hasta)

    async function obtener() {
        try {
            const [rPed, rCli, rProd] = await Promise.all([
                api.get('/pedidos'),
                api.get('/clientes'),
                api.get('/productos'),
            ])

            setPedidos(rPed.data?.data ?? rPed.data ?? [])
            setClientes(rCli.data?.data ?? rCli.data ?? [])
            setProductos(rProd.data?.data ?? rProd.data ?? [])
        } catch (error) {
            mostrarError('No se pudieron cargar los pedidos.')
        }
    }

    function mostrarError(mensaje) {
        setToast({ mensaje, tipo: 'error' })
        window.setTimeout(() => setToast(null), 3500)
    }

    async function crearPedido(datos, onExito) {
        setCreando(true)

        try {
            await confirmarAccionPendiente()
            await api.post('/pedidos', datos)
            await obtener()
            onExito()
        } catch (error) {
            mostrarError('No se pudo crear el pedido.')
        } finally {
            setCreando(false)
        }
    }

    async function editarPedido(id, datos) {
        try {
            await confirmarAccionPendiente()
            await api.put(`/pedidos/${id}`, datos)
            setPedidos(prev => prev.map(pedido => pedido.id === id ? { ...pedido, ...datos } : pedido))
        } catch (error) {
            mostrarError('No se pudo editar el pedido.')
        }
    }

    async function cambiarEstado(id, nuevoEstado) {
        try {
            await confirmarAccionPendiente()
            await api.patch(`/pedidos/${id}`, { estado: nuevoEstado })
            setPedidos(prev => prev.map(pedido => pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido))
        } catch (error) {
            try {
                const pedido = pedidos.find(item => item.id === id)
                if (pedido) await editarPedido(id, { ...pedido, estado: nuevoEstado })
            } catch (_) {
                mostrarError('No se pudo cambiar el estado del pedido.')
            }
        }
    }

    async function eliminarPedido(id) {
        const index = pedidos.findIndex(pedido => String(pedido.id) === String(id))
        await eliminarItem(pedidos[index], index)
    }

    async function limpiarPedidos() {
        await limpiarItems(pedidos)
    }

    function exportarPedidosSheet() {
        const filas = procesados.map(pedido => {
            const cliente = clienteMap[String(pedido.clienteId)] || {}
            const items = pedido.items || pedido.productos || []
            const productosTexto = items
                .map(item => {
                    const nombre = item.nombre || item.productoNombre || item.productoId || ''
                    const cantidad = item.cantidad ? ` x${item.cantidad}` : ''
                    return `${nombre}${cantidad}`
                })
                .join(', ')

            return [
                pedido.id,
                cliente.nombre || '',
                pedido.clienteId || '',
                pedido.estado || 'pendiente',
                pedido.fecha || pedido.createdAt || '',
                pedido.total || 0,
                pedido.notas || '',
                productosTexto
            ]
        })

        const encabezados = ['ID', 'Cliente', 'Cliente ID', 'Estado', 'Fecha', 'Total', 'Notas', 'Productos']

        exportarCsv({
            nombreArchivo: `pedidos-${new Date().toISOString().slice(0, 10)}.csv`,
            encabezados,
            filas,
        })
    }

    function buscarClienteImportado(clienteId, clienteNombre) {
        if (clienteId) {
            const porId = clientes.find(cliente => String(cliente.id) === String(clienteId))
            if (porId) return porId.id
        }

        const nombreNormalizado = normalizarTexto(clienteNombre)
        const porNombre = clientes.find(cliente => normalizarTexto(cliente.nombre) === nombreNormalizado)

        return porNombre?.id || ''
    }

    function parsearTablaPedidos(contenido) {
        const { filas, indices } = parsearTablaCsv(contenido)

        return filas
            .map(fila => {
                const clienteNombre = obtenerValorFila(fila, indices, ['cliente', 'nombre cliente']).trim()
                const clienteId = buscarClienteImportado(
                    obtenerValorFila(fila, indices, ['cliente id', 'clienteid']),
                    clienteNombre
                )
                const estado = obtenerValorFila(fila, indices, ['estado']).trim() || 'pendiente'
                const fecha = obtenerValorFila(fila, indices, ['fecha']).trim()
                const total = parsearNumero(obtenerValorFila(fila, indices, ['total']), 0)
                const notas = obtenerValorFila(fila, indices, ['notas', 'nota']).trim()

                return { clienteId, estado, fecha, total, notas, items: [] }
            })
            .filter(pedido => pedido.clienteId)
    }

    async function importarPedidosSheet(e) {
        const archivo = e.target.files?.[0]
        e.target.value = ''

        if (!archivo) return

        setImportando(true)
        setResultadoImportacion('')

        try {
            await confirmarAccionPendiente()
            const contenido = await archivo.text()
            const pedidosImportados = parsearTablaPedidos(contenido)

            if (pedidosImportados.length === 0) {
                setResultadoImportacion('No se encontraron pedidos validos.')
                return
            }

            for (const pedido of pedidosImportados) {
                await api.post('/pedidos', pedido)
            }

            await obtener()
            setResultadoImportacion(`${pedidosImportados.length} pedidos importados.`)
        } catch (error) {
            mostrarError('No se pudo importar la tabla.')
            setResultadoImportacion('No se pudo importar la tabla.')
        } finally {
            setImportando(false)
        }
    }

    useEffect(() => { obtener() }, [])

    useEffect(() => {
        function enfocarBuscador() {
            buscadorRef.current?.focus()
            buscadorRef.current?.select?.()
        }

        function handleKeyDown(e) {
            const tecla = e.key.toLowerCase()
            const conCtrl = e.ctrlKey || e.metaKey

            if (e.key === 'Escape') {
                if (comandosAbiertos) setComandosAbiertos(false)
                if (resultadoImportacion) setResultadoImportacion('')
                return
            }

            if (!conCtrl) return

            if (tecla === 'h') {
                e.preventDefault()
                enfocarBuscador()
            }

            if (tecla === 'm') {
                e.preventDefault()
                setVista(v => v === 'cards' ? 'tabla' : 'cards')
            }

            if (tecla === 'e') {
                e.preventDefault()
                if (procesados.length > 0) exportarPedidosSheet()
            }

            if (tecla === 'i') {
                e.preventDefault()
                if (!importando) inputImportRef.current?.click()
            }

            if (tecla === 'z') {
                e.preventDefault()
                deshacerEliminacion()
            }

            if (e.key === '/') {
                e.preventDefault()
                setComandosAbiertos(true)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [comandosAbiertos, importando, procesados, resultadoImportacion])

    const hayFiltros = busqueda.trim() || filtroEstado

    return (
        <div className="ped-contenedor">
            <header className="ped-header">
                <div>
                    <p className="ped-label">Sistema de gestion</p>
                    <h1 className="ped-title"><em>Pedidos</em></h1>
                </div>
                <span className="ped-header-count">
                    {pedidos.length} {pedidos.length === 1 ? 'pedido' : 'pedidos'}
                </span>
            </header>

            <div className="ped-toolbar">
                <Comandos
                    abierto={comandosAbiertos}
                    setAbierto={setComandosAbiertos}
                    comandos={comandosPedidos}
                />

                <Buscador
                    inputRef={buscadorRef}
                    value={busqueda}
                    onChange={setBusqueda}
                    placeholder="Buscar por cliente, notas o ID..."
                    className="ped-buscador"
                />

                <FiltrosPedidos
                    filtroEstado={filtroEstado}
                    setFiltroEstado={setFiltroEstado}
                    orden={orden}
                    setOrden={setOrden}
                    hayFiltros={hayFiltros}
                    totalFiltrados={procesados.length}
                />
            </div>

            <div className="ped-layout">
                <FormularioPedido
                    onCrear={crearPedido}
                    creando={creando}
                    clientes={clientes}
                    productos={productos}
                />

                <section>
                    <h2 className="ped-list-header">
                        Registro
                        {pedidos.length > 0 && (
                            <span className="ped-badge">
                                {hayFiltros ? `${procesados.length} / ${pedidos.length}` : pedidos.length}
                            </span>
                        )}
                    </h2>

                    <div className="catalogo-actions ped-actions">
                        <LimpiarTodo
                            onLimpiar={limpiarPedidos}
                            disabled={pedidos.length === 0}
                            titulo="Eliminar todos los pedidos"
                        />

                        <VistaSwitch vista={vista} setVista={setVista} />

                        <ImportExport
                            onExportar={exportarPedidosSheet}
                            onImportar={importarPedidosSheet}
                            importando={importando}
                            exportDisabled={procesados.length === 0}
                            inputRef={inputImportRef}
                            titulo="Importar o exportar pedidos"
                        />
                    </div>

                    {resultadoImportacion && (
                        <p className="import-sheet-result">{resultadoImportacion}</p>
                    )}

                    {procesados.length === 0
                        ? <p className="ped-empty">Ningun pedido encontrado.</p>
                        : <>
                            <ListaPedidos
                                pedidos={paginados}
                                clientes={clientes}
                                vista={vista}
                                onEliminar={eliminarPedido}
                                onEditar={editarPedido}
                                onCambiarEstado={cambiarEstado}
                            />
                            <Paginacion
                                pagina={paginaReal}
                                total={totalPaginas}
                                onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                                desde={desde + 1}
                                hasta={hasta}
                                totalItems={procesados.length}
                            />
                        </>
                    }
                </section>
            </div>

            <ToastDeshacer
                mensaje={toastDeshacer?.mensaje}
                onDeshacer={deshacerEliminacion}
            />
            <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
        </div>
    )
}

export default Pedidos
