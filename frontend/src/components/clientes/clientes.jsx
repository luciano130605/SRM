import { useEffect, useMemo, useRef, useState } from 'react'
import api from "../../../services/api"
import TarjetaCliente from "./tarjeta-cliente"
import FormularioCliente from "./formulario-cliente"
import Buscador from "../buscador/buscador"
import Comandos from "../comandos/comandos"
import VistaSwitch from "../vista-switch/vista-switch"
import LimpiarTodo from "../limpiar-todo/limpiar-todo"
import TablaClientes from "./tabla-clientes"
import ImportExport from "../import-export/import-export"
import Paginacion from '../paginacion/paginacion'
import ToastDeshacer from "../toast-deshacer/toast-deshacer"
import Toast from "../toast/toast"
import useEliminacionDeshacer from "../../hooks/use-eliminacion-deshacer"
import { exportarCsv, normalizarTexto, obtenerValorFila, parsearTablaCsv } from "../../utils/csv"
import DropdownMenu from '../dropdown-menu/dropdown-menu'

const POR_PAGINA = 10

const comandosClientes = [
    { teclas: 'Ctrl + H', accion: 'Buscar clientes' },
    { teclas: 'Ctrl + M', accion: 'Cambiar Cards / Tabla' },
    { teclas: 'Ctrl + E', accion: 'Exportar sheet' },
    { teclas: 'Ctrl + I', accion: 'Importar sheet' },
    { teclas: 'Ctrl + Z', accion: 'Deshacer eliminacion' },
    { teclas: 'Ctrl + /', accion: 'Ver comandos' },
    { teclas: 'Esc', accion: 'Cerrar ventanas' }
]

function Clientes({ datosIniciales }) {
    const [clientes, setClientes] = useState([])
    const [pedidos, setPedidos] = useState([])
    const [creando, setCreando] = useState(false)
    const [busqueda, setBusqueda] = useState('')
    const [orden, setOrden] = useState('reciente')
    const [pagina, setPagina] = useState(1)
    const [editandoId, setEditandoId] = useState(null)
    const [vista, setVista] = useState('cards')
    const [comandosAbiertos, setComandosAbiertos] = useState(false)
    const [importando, setImportando] = useState(false)
    const [resultadoImportacion, setResultadoImportacion] = useState('')
    const [toast, setToast] = useState(null)
    const buscadorRef = useRef(null)
    const inputImportRef = useRef(null)
    const [metodos, setMetodos] = useState([])
    const [ordenAbierto, setOrdenAbierto] = useState(false)

    const {
        toastDeshacer,
        confirmarAccionPendiente,
        deshacerEliminacion,
        eliminarItem,
        limpiarItems,
    } = useEliminacionDeshacer({
        nombreSingular: 'Cliente',
        nombrePlural: 'clientes',
        setItems: setClientes,
        eliminarEnServidor: cliente => api.delete(`/clientes/${cliente.id}`),
        onError: mostrarError,
    })

    const pedidosPorCliente = useMemo(() =>
        pedidos.reduce((acc, p) => {
            if (p.clienteId) acc[p.clienteId] = (acc[p.clienteId] || 0) + 1
            return acc
        }, {}), [pedidos])

    const procesados = useMemo(() => {
        let lista = [...clientes]

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            lista = lista.filter(c => {
                const q = busqueda.toLowerCase()
                if ((c.nombre || '').toLowerCase().includes(q)) return true

                if (c.contactos) {
                    return Object.values(c.contactos).some(arr =>
                        arr.some(v => v.toLowerCase().includes(q))
                    )
                }
                return (c.telefono || '').includes(q) || (c.instagram || '').includes(q)
            })
        }

        switch (orden) {
            case 'az':
                lista.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'))
                break
            case 'za':
                lista.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || '', 'es'))
                break
            case 'mas-pedidos':
                lista.sort((a, b) => (pedidosPorCliente[b.id] || 0) - (pedidosPorCliente[a.id] || 0))
                break
            default:
                break
        }

        return lista
    }, [clientes, busqueda, orden, pedidosPorCliente])

    const totalPaginas = Math.ceil(procesados.length / POR_PAGINA)
    const paginaReal = Math.min(pagina, Math.max(totalPaginas, 1))
    const desde = (paginaReal - 1) * POR_PAGINA
    const hasta = Math.min(desde + POR_PAGINA, procesados.length)
    const paginados = procesados.slice(desde, hasta)

    async function obtener(signal) {
        try {
            const [rCli, rPed, rMet] = await Promise.all([
                api.get('/clientes'),
                api.get('/pedidos'),
                api.get('/metodos-contacto')
            ])
            if (signal?.aborted) return
            setClientes(rCli.data?.data ?? rCli.data ?? [])
            setPedidos(rPed.data?.data ?? rPed.data ?? [])
            setMetodos(rMet.data?.data ?? [])
        } catch (e) {
            mostrarError('No se pudieron cargar los clientes.')
        }
    }
    const opcionesOrden = [
        { value: "reciente", label: "Más reciente" },
        { value: "az", label: "A - Z" },
        { value: "za", label: "Z - A" },
        { value: "mas-pedidos", label: "Más pedidos" },
    ]

    const ordenActual =
        opcionesOrden.find(op => op.value === orden)?.label || "Más reciente"
    function mostrarError(mensaje) {
        setToast({ mensaje, tipo: 'error' })
        window.setTimeout(() => setToast(null), 3500)
    }

    async function crearCliente(datos, onExito) {
        setCreando(true)
        try {
            await api.post('/clientes', datos)
            await obtener()
            onExito()
        } catch (e) {
            mostrarError('No se pudo crear el cliente.')
        } finally {
            setCreando(false)
        }
    }

    async function editarCliente(id, datos) {
        try {
            await api.put(`/clientes/${id}`, datos)
            setClientes(prev => prev.map(c => c.id === id ? { ...c, ...datos } : c))
        } catch (e) {
            mostrarError('No se pudo editar el cliente.')
        }
    }

    async function eliminarCliente(id) {
        const index = clientes.findIndex(cliente => String(cliente.id) === String(id))
        await eliminarItem(clientes[index], index)
    }

    async function limpiarClientes() {
        setEditandoId(null)
        await limpiarItems(clientes)
    }

    function exportarClientesSheet() {
        const idsMetodos = metodos.map(m => m.id)

        const encabezados = ['Cliente', ...metodos.map(m => m.nombre), 'Direccion', 'Notas', 'Pedidos']

        const filas = procesados.map(cliente => {
            const contactosCols = idsMetodos.map(id => {
                const vals = cliente.contactos?.[id] ?? []
                if (!vals.length && id === 'telefono') return cliente.telefono || ''
                if (!vals.length && id === 'instagram') return cliente.instagram || ''
                return vals.join(' | ')
            })
            return [
                cliente.nombre,
                ...contactosCols,
                cliente.direccion || '',
                cliente.notas || '',
                pedidosPorCliente[cliente.id] || 0
            ]
        })

        exportarCsv({
            nombreArchivo: `clientes-${new Date().toISOString().slice(0, 10)}.csv`,
            encabezados,
            filas,
        })
    }

    function parsearTablaClientes(contenido) {
        const { filas, indices } = parsearTablaCsv(contenido)

        return filas
            .map(fila => {
                const nombre = obtenerValorFila(fila, indices, ['cliente', 'nombre']).trim()
                const direccion = obtenerValorFila(fila, indices, ['direccion']).trim()
                const notas = obtenerValorFila(fila, indices, ['notas', 'nota']).trim()

                const contactos = {}
                for (const metodo of metodos) {
                    const val = obtenerValorFila(fila, indices, [metodo.nombre.toLowerCase(), metodo.id]).trim()
                    if (val) contactos[metodo.id] = val.split('|').map(v => v.trim()).filter(Boolean)
                }

                return { nombre, contactos, direccion, notas }
            })
            .filter(cliente => cliente.nombre)
    }

    async function importarClientesSheet(e) {
        const archivo = e.target.files?.[0]
        e.target.value = ''

        if (!archivo) return

        setImportando(true)
        setResultadoImportacion('')

        try {
            const contenido = await archivo.text()
            const clientesImportados = parsearTablaClientes(contenido)

            if (clientesImportados.length === 0) {
                setResultadoImportacion('No se encontraron clientes validos.')
                return
            }

            for (const cliente of clientesImportados) {
                await api.post('/clientes', cliente)
            }

            await obtener()
            setResultadoImportacion(`${clientesImportados.length} clientes importados.`)
        } catch (error) {
            mostrarError('No se pudo importar la tabla.')
            setResultadoImportacion('No se pudo importar la tabla.')
        } finally {
            setImportando(false)
        }
    }

    useEffect(() => {
        const controller = new AbortController()
        Promise.resolve().then(() => obtener(controller.signal))
        return () => controller.abort()
    }, [])

    function handleBusquedaChange(value) {
        setBusqueda(value)
        setPagina(1)
    }

    function handleOrdenChange(event) {
        setOrden(event.target.value)
        setPagina(1)
    }

    useEffect(() => {
        function enfocarBuscador() {
            buscadorRef.current?.focus()
            buscadorRef.current?.select?.()
        }

        function handleKeyDown(e) {
            const tecla = String(e.key || '').toLowerCase()
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
                if (procesados.length > 0) exportarClientesSheet()
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

    const hayFiltros = busqueda.trim()

    return (
        <div className="page-container cli-contenedor">
            <header className="page-header cli-header">
                <div>
                    <p className="page-label cli-label">Sistema de gestion</p>
                    <h1 className="page-title cli-title"><em>Clientes</em></h1>
                </div>
                <span className="page-count cli-header-count">
                    {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'}
                </span>
            </header>

            <div className="page-toolbar cli-toolbar">
                <div className="comandosBtn">
                    <Comandos
                        abierto={comandosAbiertos}
                        setAbierto={setComandosAbiertos}
                        comandos={comandosClientes}
                    />
                </div>

                <Buscador
                    inputRef={buscadorRef}
                    value={busqueda}
                    onChange={handleBusquedaChange}
                    placeholder="Buscar por nombre o telefono..."
                />
                <div className="toolbar-dropdown">
                    <button
                        type="button"
                        className="toolbar-select"
                        onClick={() => setOrdenAbierto(v => !v)}
                    >
                        {ordenActual}
                    </button>

                    <DropdownMenu
                        abierto={ordenAbierto}
                        onCerrar={() => setOrdenAbierto(false)}
                        opciones={opcionesOrden}
                        onSeleccionar={({ value }) => {
                            setOrden(value)
                            setPagina(1)
                            setOrdenAbierto(false)
                        }}
                    />
                </div>
                {hayFiltros && (
                    <span className="cli-results-label">{procesados.length} resultado{procesados.length !== 1 ? 's' : ''}</span>
                )}
            </div>

            <div className="page-layout cli-layout">
                <FormularioCliente
                    onCrear={crearCliente}
                    creando={creando}
                    metodos={metodos}
                    setMetodos={setMetodos}
                    onError={mostrarError}
                    datosIniciales={datosIniciales}
                />

                <section>
                    <h2 className="section-heading cli-list-header">
                        Directorio
                        {clientes.length > 0 && (
                            <span className="count-badge cli-badge">
                                {hayFiltros ? `${procesados.length} / ${clientes.length}` : clientes.length}
                            </span>
                        )}
                    </h2>

                    <div className="catalogo-actions">
                        <div className="action-row">

                            <LimpiarTodo
                                onLimpiar={limpiarClientes}
                                disabled={clientes.length === 0}
                                titulo="Eliminar todos los clientes"
                            />

                            <div className="action-group">

                                <ImportExport
                                    onExportar={exportarClientesSheet}
                                    onImportar={importarClientesSheet}
                                    vista={vista}
                                    importando={importando}
                                    exportDisabled={procesados.length === 0}
                                    inputRef={inputImportRef}
                                    titulo="Importar o exportar clientes"
                                />
                                <VistaSwitch vista={vista} setVista={setVista} />

                            </div>
                        </div>
                    </div>

                    {resultadoImportacion && (
                        <p className="import-sheet-result">{resultadoImportacion}</p>
                    )}

                    {procesados.length === 0
                        ? <p className="empty-state cli-empty">Ningun cliente encontrado.</p>
                        : <>
                            {vista === 'tabla' ? (
                                <TablaClientes
                                    clientes={paginados}
                                    onEliminar={eliminarCliente}
                                    onEditar={editarCliente}
                                    pedidosPorCliente={pedidosPorCliente}
                                    metodos={metodos}
                                />
                            ) : (
                                <div className="cli-grid">
                                    {paginados.map(c => (
                                        <TarjetaCliente
                                            key={c.id}
                                            metodos={metodos}
                                            cliente={c}
                                            onEliminar={eliminarCliente}
                                            onEditar={editarCliente}
                                            pedidosCount={pedidosPorCliente[c.id] || 0}
                                            editando={String(editandoId) === String(c.id)}
                                            onIniciarEdicion={() => setEditandoId(c.id)}
                                            onCerrarEdicion={() => setEditandoId(null)}
                                        />
                                    ))}
                                </div>
                            )}
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

export default Clientes

