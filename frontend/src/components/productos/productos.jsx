import { useEffect, useState, useMemo, useRef } from 'react'
import api from "../../../services/api"
import calcularMargen from "./calcular-margen"
import FormularioProducto from "./formulario-producto"
import obtenerNombreCategoria from './obtener-nombre-categoria'
import ListaProductos from './lista-productos'
import Buscador from '../buscador/buscador'
import FiltrosProductos from './filtro-productos'
import Comandos from './comandos'
import ImportExport from '../import-export/import-export'
import LimpiarTodo from '../limpiar-todo/limpiar-todo'
import VistaSwitch from '../vista-switch/vista-switch'
import ToastDeshacer from '../toast-deshacer/toast-deshacer'
import Toast from '../toast/toast'
import useEliminacionDeshacer from '../../hooks/use-eliminacion-deshacer'
import { exportarCsv, normalizarTexto, obtenerValorFila, parsearNumero, parsearTablaCsv } from '../../utils/csv'

const CATEGORIAS_DEFAULT = []

function Productos({ datosIniciales }) {
    const [productos, setProductos] = useState([])
    const [creando, setCreando] = useState(false)
    const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT)

    const [busqueda, setBusqueda] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState('')
    const [orden, setOrden] = useState('reciente')
    const [vista, setVista] = useState('cards')
    const [importando, setImportando] = useState(false)
    const [resultadoImportacion, setResultadoImportacion] = useState('')
    const [toast, setToast] = useState(null)
    const [comandosAbiertos, setComandosAbiertos] = useState(false)

    const [pagina, setPagina] = useState(1)
    const buscadorRef = useRef(null)
    const nombreProductoRef = useRef(null)
    const inputImportRef = useRef(null)

    const {
        toastDeshacer,
        confirmarAccionPendiente,
        deshacerEliminacion,
        eliminarItem,
        limpiarItems,
    } = useEliminacionDeshacer({
        nombreSingular: 'Producto',
        nombrePlural: 'productos',
        setItems: setProductos,
        eliminarEnServidor: producto => api.delete(`/productos/${producto.id}`),
        onError: mostrarError,
    })

    const productosPorCategoria = useMemo(() => {
        return productos.reduce((acc, p) => {
            const categoria = obtenerNombreCategoria(p, categorias)
            if (categoria) acc[categoria] = (acc[categoria] || 0) + 1
            return acc
        }, {})
    }, [productos, categorias])

    const productosProcesados = useMemo(() => {
        let lista = [...productos]

        if (busqueda.trim()) {
            const q = busqueda.toLowerCase()
            lista = lista.filter(p => p.nombre.toLowerCase().includes(q))
        }

        if (filtroCategoria) {
            lista = lista.filter(p => obtenerNombreCategoria(p, categorias) === filtroCategoria)
        }

        switch (orden) {
            case 'az':
                lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
                break
            case 'za':
                lista.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'))
                break
            case 'precio-asc':
                lista.sort((a, b) => (parseFloat(a.precioVenta) || 0) - (parseFloat(b.precioVenta) || 0))
                break
            case 'precio-desc':
                lista.sort((a, b) => (parseFloat(b.precioVenta) || 0) - (parseFloat(a.precioVenta) || 0))
                break
            case 'margen-desc':
                lista.sort((a, b) => {
                    const mA = calcularMargen(a.costo, a.precioVenta) ?? -Infinity
                    const mB = calcularMargen(b.costo, b.precioVenta) ?? -Infinity
                    return mB - mA
                })
                break
            default:
                break
        }

        return lista
    }, [productos, categorias, busqueda, filtroCategoria, orden])

    useEffect(() => { setPagina(1) }, [busqueda, filtroCategoria, orden])

    async function obtenerProductos() {
        try {
            const response = await api.get('/productos')
            setProductos(response.data.data)
        } catch (error) {
            mostrarError('No se pudieron cargar los productos.')
        }
    }

    async function obtenerCategorias() {
        try {
            const response = await api.get('/categorias')
            setCategorias(response.data.data)
        } catch (error) {
            mostrarError('No se pudieron cargar las categorias.')
        }
    }

    function mostrarError(mensaje) {
        setToast({ mensaje, tipo: 'error' })
        window.setTimeout(() => setToast(null), 3500)
    }

    async function crearProducto(datos, onExito) {
        setCreando(true)
        try {
            await api.post('/productos', datos)
            await obtenerProductos()
            onExito()
        } catch (error) {
            mostrarError(error.response?.data?.mensaje || 'No se pudo crear el producto.')
        } finally {
            setCreando(false)
        }
    }

    async function editarProducto(id, datos) {
        try {
            const response = await api.put(`/productos/${id}`, datos)
            setProductos(prev => prev.map(p => String(p.id) === String(id) ? response.data.data : p))
        } catch (error) {
            mostrarError('No se pudo editar el producto.')
        }
    }

    async function eliminarProducto(id) {
        const index = productos.findIndex(producto => String(producto.id) === String(id))
        await eliminarItem(productos[index], index)
    }

    async function limpiarProductos() {
        await limpiarItems(productos)
    }

    function exportarProductosSheet() {
        const filas = productosProcesados.map(producto => {
            const costo = parseFloat(producto.costo) || 0
            const venta = parseFloat(producto.precioVenta) || 0
            const margen = calcularMargen(costo, venta)

            return [
                producto.nombre,
                obtenerNombreCategoria(producto, categorias) || 'Sin categoria',
                costo ? costo.toFixed(2) : '',
                venta.toFixed(2),
                margen ?? ''
            ]
        })

        const encabezados = ['Producto', 'Categoria', 'Costo', 'Precio venta', 'Margen %']
        exportarCsv({
            nombreArchivo: `productos-${new Date().toISOString().slice(0, 10)}.csv`,
            encabezados,
            filas,
        })
    }

    function parsearTablaProductos(contenido) {
        const { filas, indices } = parsearTablaCsv(contenido)

        return filas
            .map(fila => {
                const nombre = obtenerValorFila(fila, indices, ['producto', 'nombre']).trim()
                const categoria = obtenerValorFila(fila, indices, ['categoria', 'categorias']).trim()
                const costo = parsearNumero(obtenerValorFila(fila, indices, ['costo', 'costo produccion', 'costo de produccion']))
                const precioVenta = parsearNumero(obtenerValorFila(fila, indices, ['precio venta', 'precio de venta', 'venta']))

                return {
                    nombre,
                    categoria,
                    costo: costo === '' ? '' : costo.toFixed(2),
                    precioVenta: precioVenta === '' ? '' : precioVenta.toFixed(2)
                }
            })
            .filter(producto => producto.nombre && producto.precioVenta)
    }

    async function obtenerCategoriaImportada(nombre, categoriasActuales) {
        const categoriaLimpia = nombre.trim()

        if (!categoriaLimpia || normalizarTexto(categoriaLimpia) === 'sin categoria') {
            return { categoriaId: '', categoriasActuales }
        }

        const existente = categoriasActuales.find(
            cat => normalizarTexto(cat.nombre) === normalizarTexto(categoriaLimpia)
        )

        if (existente) {
            return { categoriaId: existente.id, categoriasActuales }
        }

        const res = await api.post('/categorias', { nombre: categoriaLimpia })
        const nuevaCategoria = res.data.data

        return {
            categoriaId: nuevaCategoria.id,
            categoriasActuales: [...categoriasActuales, nuevaCategoria]
        }
    }

    async function importarProductosSheet(e) {
        const archivo = e.target.files?.[0]
        e.target.value = ''

        if (!archivo) return

        setImportando(true)
        setResultadoImportacion('')

        try {
            const contenido = await archivo.text()
            const productosImportados = parsearTablaProductos(contenido)

            if (productosImportados.length === 0) {
                setResultadoImportacion('No se encontraron productos validos.')
                return
            }

            let categoriasActuales = [...categorias]

            for (const producto of productosImportados) {
                const categoria = await obtenerCategoriaImportada(producto.categoria, categoriasActuales)
                categoriasActuales = categoria.categoriasActuales

                await api.post('/productos', {
                    nombre: producto.nombre,
                    categoriaId: categoria.categoriaId,
                    costo: producto.costo,
                    precioVenta: producto.precioVenta
                })
            }

            setCategorias(categoriasActuales)
            await obtenerProductos()
            await obtenerCategorias()
            setResultadoImportacion(`${productosImportados.length} productos importados.`)
        } catch (error) {
            mostrarError('No se pudo importar la tabla.')
            setResultadoImportacion('No se pudo importar la tabla.')
        } finally {
            setImportando(false)
        }
    }

    useEffect(() => {
        obtenerProductos()
        obtenerCategorias()
    }, [])

    useEffect(() => {
        function enfocar(ref) {
            ref.current?.focus()
            ref.current?.select?.()
        }

        function handleKeyDown(e) {
            const tecla = (e.key || '').toLowerCase()
            if (!tecla) return
            const conCtrl = e.ctrlKey || e.metaKey

            if (e.key === 'Escape') {
                if (comandosAbiertos) {
                    setComandosAbiertos(false)
                    return
                }

                if (resultadoImportacion) {
                    setResultadoImportacion('')
                }

                return
            }

            if (!conCtrl) return

            if (tecla === 'h') {
                e.preventDefault()
                enfocar(buscadorRef)
            }
            if (tecla === 'm') {
                e.preventDefault()
                setVista(v => v === 'cards' ? 'tabla' : 'cards')
            }

            if (tecla === 'e') {
                e.preventDefault()
                if (productosProcesados.length > 0) exportarProductosSheet()
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
    }, [comandosAbiertos, importando, productosProcesados, resultadoImportacion])

    const hayFiltros = busqueda.trim() || filtroCategoria
    const totalFiltrados = productosProcesados.length

    return (
        <div className="page-container contenedor-productos">
            <header className="page-header contenedor-header">
                <div>
                    <p className="page-label productos-label">Sistema de gestión</p>
                    <h1 className="page-title productos-title"><em>Productos</em></h1>
                </div>
                <span className="page-count productos-header-count">
                    {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
                </span>
            </header>

            <div className="page-toolbar toolbar">
                <Comandos
                    abierto={comandosAbiertos}
                    setAbierto={setComandosAbiertos}
                />

                <Buscador
                    value={busqueda}
                    onChange={setBusqueda}
                    inputRef={buscadorRef}
                    placeholder="Buscar productos..."
                />

                <FiltrosProductos
                    categorias={categorias}
                    filtroCategoria={filtroCategoria}
                    setFiltroCategoria={setFiltroCategoria}
                    orden={orden}
                    setOrden={setOrden}
                    hayFiltros={hayFiltros}
                    totalFiltrados={totalFiltrados}
                />

            </div>

            <div className="page-layout contenedor-form">
                <FormularioProducto
                    datosIniciales={datosIniciales}
                    onCrear={crearProducto}
                    creando={creando}
                    categorias={categorias}
                    setCategorias={setCategorias}
                    productosPorCategoria={productosPorCategoria}
                    nombreInputRef={nombreProductoRef}
                    onError={mostrarError}
                />

                <section>
                    <h2 className="section-heading form-list-header">
                        Catálogo
                        {productos.length > 0 && (
                            <span className="count-badge cant-productos">
                                {hayFiltros ? `${totalFiltrados} / ${productos.length}` : productos.length}
                            </span>
                        )}
                    </h2>

                    <div className="catalogo-actions">
                        <div className="action-row">
                            <LimpiarTodo
                                onLimpiar={limpiarProductos}
                                disabled={productos.length === 0}
                                titulo="Eliminar todos los productos"
                            />
                            <div className="action-group">
                                <ImportExport
                                    onExportar={exportarProductosSheet}
                                    onImportar={importarProductosSheet}
                                    importando={importando}
                                    exportDisabled={productosProcesados.length === 0}
                                    inputRef={inputImportRef}
                                    titulo="Importar o exportar productos"
                                    vista={vista}
                                />

                                <VistaSwitch vista={vista} setVista={setVista} />
                            </div>
                        </div>
                    </div>

                    {resultadoImportacion && (
                        <p className="import-sheet-result">{resultadoImportacion}</p>
                    )}

                    <ListaProductos
                        productos={productosProcesados}
                        onEliminar={eliminarProducto}
                        onEditar={editarProducto}
                        categorias={categorias}
                        pagina={pagina}
                        setPagina={setPagina}
                        vista={vista}
                    />
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

export default Productos

