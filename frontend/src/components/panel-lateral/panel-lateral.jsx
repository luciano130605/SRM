import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Bot, PackagePlus, Sparkles, Tags, UserRoundPlus, X } from "lucide-react"
import api from "../../../services/api"
import CalculadoraCosto from "../productos/calculadora-costo"
import PanelToggle from "./panel-toggle"
import "./panel-lateral.css"
import SendIcon from "../../icons/SendMovimiento"
import BotAnimado from "../../icons/BotAnimado"
import RefreshIcon from "../../icons/RefreshMovimiento"
import ACCIONES from "./acciones"
import PASOS from "./pasos"
import ESTADOS_PEDIDO from "./estados-pedido"
import MENSAJE_INICIAL from "./mensaje-inicial"
import TEXTO_COMANDOS from "./texto-comandos"
import nuevoId from "./nuevo-id"
import numero from "./numero"
import etiquetaTipo from "./etiqueta-tipo"
import destinoVista from "./destino-vista"
import datosIniciales from "./datos-iniciales"
import placeholderEntrada from "./placeholder-entrada"


export default function PanelLateral({ onIrA, onCreado }) {
    const [abierto, setAbierto] = useState(false)
    const [mensajes, setMensajes] = useState([MENSAJE_INICIAL])
    const [entrada, setEntrada] = useState("")
    const [flujo, setFlujo] = useState(null)
    const [pendiente, setPendiente] = useState(null)
    const [categorias, setCategorias] = useState([])
    const [clientes, setClientes] = useState([])
    const [productos, setProductos] = useState([])
    const [metodos, setMetodos] = useState([])
    const [cargandoDatos, setCargandoDatos] = useState(false)
    const [guardando, setGuardando] = useState(false)
    const chatRef = useRef(null)
    const [botEspera, setBotEspera] = useState(false)
    const [mostrarComandos, setMostrarComandos] = useState(false)
    const sendIconRef = useRef(null)
    const [datosInicialesFormulario, setDatosInicialesFormulario] = useState(null)


    const EJEMPLOS_COMANDOS = [
        "/ir productos",
        "/ir clientes",
        "/ir pedidos",
        "/nuevo producto",
        "/nuevo cliente",
        "/nuevo pedido",
        "/nuevo categoria",
        "/limpiar",
        "/comandos",
        "/categorias",
        "/metodos",
    ]

    const [cmdEjemplo, setCmdEjemplo] = useState(0)
    const [cmdVisible, setCmdVisible] = useState(true)

    useEffect(() => {
        if (!entrada.startsWith("/")) return

        const intervalo = setInterval(() => {
            setCmdVisible(false)
            setTimeout(() => {
                setCmdEjemplo(prev => {
                    let next
                    do { next = Math.floor(Math.random() * EJEMPLOS_COMANDOS.length) }
                    while (next === prev)
                    return next
                })
                setCmdVisible(true)
            }, 300)
        }, 3000)

        return () => clearInterval(intervalo)
    }, [entrada])

    useEffect(() => {
        if (!abierto) return

        let cancelado = false
        async function cargarDatos() {
            setCargandoDatos(true)
            try {
                const [resCategorias, resClientes, resProductos, resMetodos] = await Promise.all([
                    api.get("/categorias"),
                    api.get("/clientes"),
                    api.get("/productos"),
                    api.get("/metodos-contacto"),
                ])

                if (cancelado) return
                setCategorias(resCategorias.data?.data ?? resCategorias.data ?? [])
                setClientes(resClientes.data?.data ?? resClientes.data ?? [])
                setProductos(resProductos.data?.data ?? resProductos.data ?? [])
                setMetodos(resMetodos.data?.data ?? resMetodos.data ?? [])
            } catch {
                agregarBot("No pude cargar los datos existentes. Podes seguir, pero algunos selectores pueden aparecer vacios.")
            } finally {
                if (!cancelado) setCargandoDatos(false)
            }
        }

        cargarDatos()
        return () => {
            cancelado = true
        }
    }, [abierto])

    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: "smooth",
        })
    }, [mensajes, pendiente, flujo])

    const totalPedido = useMemo(() => {
        if (!flujo || flujo.tipo !== "pedidos") return 0
        const producto = productos.find(item => String(item.id) === String(flujo.datos.productoId))
        return numero(producto?.precioVenta) * (parseInt(flujo.datos.cantidad) || 1)
    }, [flujo, productos])

    function agregarMensaje(autor, texto) {
        setMensajes(prev => [...prev, { id: nuevoId(), autor, texto }])
    }

    function agregarBot(texto, delay = 600) {
        setBotEspera(true)
        setTimeout(() => {
            setMensajes(prev => [...prev, { id: nuevoId(), autor: "bot", texto }])
            setBotEspera(false)
        }, delay)
    }

    function detectarTipo(texto) {
        const valor = texto.toLowerCase()
        if (valor.includes("categoria")) return "categorias"
        if (valor.includes("metodo") || valor.includes("método") || valor.includes("contacto")) return "metodos-contacto"
        if (valor.includes("producto")) return "productos"
        if (valor.includes("cliente")) return "clientes"
        if (valor.includes("pedido")) return "pedidos"
        return ""
    }

    function iniciarFlujo(tipo, desdeUsuario = true) {
        if (tipo === "comandos") {
            agregarBot(TEXTO_COMANDOS)
            return
        }

        const datos = datosIniciales(tipo)
        const nuevoFlujo = { tipo, pasoIndex: 0, datos }

        setPendiente(null)
        setFlujo(nuevoFlujo)
        if (desdeUsuario) agregarMensaje("user", `Quiero agregar ${etiquetaTipo(tipo)}`)
        agregarBot(preguntaPara(nuevoFlujo))
    }

    function handleSubmit(event) {
        event.preventDefault()
        const texto = entrada.trim()
        if (!texto || guardando) return

        setEntrada("")
        setBotEspera(false)

        sendIconRef.current?.play()
        if (texto.startsWith("/")) {
            procesarComando(texto)
            return
        }
        if (!flujo) {
            agregarMensaje("user", texto)
            const tipo = detectarTipo(texto)

            if (tipo) {
                iniciarFlujo(tipo, false)
                return
            }

            consultarIA(texto)
            return
        }

        responderPaso(texto)
    }

    function parsearFecha(valor) {
        if (!valor) {
            return new Date().toISOString().slice(0, 10)
        }

        const texto = String(valor)
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")

        if (texto === "hoy") {
            return new Date().toISOString().slice(0, 10)
        }

        const meses = {
            enero: 1,
            febrero: 2,
            marzo: 3,
            abril: 4,
            mayo: 5,
            junio: 6,
            julio: 7,
            agosto: 8,
            septiembre: 9,
            setiembre: 9,
            octubre: 10,
            noviembre: 11,
            diciembre: 12,
        }

        let match = texto.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
        if (match) {
            const [, y, m, d] = match
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
        }

        match = texto.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
        if (match) {
            const [, d, m, y] = match
            return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
        }

        match = texto.match(/^(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})$/)
        if (match) {
            const [, d, mesTexto, y] = match
            const mes = meses[mesTexto]

            if (mes) {
                return `${y}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`
            }
        }

        const fecha = new Date(valor)

        if (!isNaN(fecha.getTime())) {
            const y = fecha.getFullYear()
            const m = String(fecha.getMonth() + 1).padStart(2, "0")
            const d = String(fecha.getDate()).padStart(2, "0")

            return `${y}-${m}-${d}`
        }

        return valor
    }

    async function responderPaso(valor, etiqueta = valor) {
        if (!flujo || pendiente) return
        setBotEspera(false)
        const paso = PASOS[flujo.tipo][flujo.pasoIndex]
        const valorFinal = await resolverValorPaso(flujo.tipo, paso, valor)
        let datosActualizados = { ...flujo.datos, [paso]: valorFinal }
        let siguienteIndex = flujo.pasoIndex + 1

        agregarMensaje("user", etiqueta || valorFinal || "Omitir")

        if (flujo.tipo === "clientes" && paso === "contactoMetodo" && !valorFinal) {
            siguienteIndex = PASOS.clientes.indexOf("direccion")
        }

        if (flujo.tipo === "clientes" && paso === "contactoValor") {
            const metodoId = flujo.datos.contactoMetodo
            const valorLimpio = String(valorFinal).trim()

            if (metodoId && valorLimpio) {
                datosActualizados = {
                    ...datosActualizados,
                    contactos: {
                        ...flujo.datos.contactos,
                        [metodoId]: [
                            ...(flujo.datos.contactos?.[metodoId] ?? []),
                            valorLimpio,
                        ],
                    },
                    contactoValor: "",
                }
            }
        }

        if (flujo.tipo === "clientes" && paso === "masContactos") {
            if (esRespuestaSi(valorFinal)) {
                datosActualizados = {
                    ...datosActualizados,
                    contactoMetodo: "",
                    contactoValor: "",
                }
                siguienteIndex = PASOS.clientes.indexOf("contactoMetodo")
            } else {
                siguienteIndex = PASOS.clientes.indexOf("direccion")
            }
        }

        if (siguienteIndex >= PASOS[flujo.tipo].length) {
            const listo = { ...flujo, datos: datosActualizados }
            const datos = construirPayload(listo)

            setFlujo(null)
            setPendiente({ tipo: listo.tipo, datos })
            agregarBot(`Listo, ya tengo los datos del ${etiquetaTipo(listo.tipo)}. Queres ir al campo o crearlo desde aca?`)
            return
        }

        const siguienteFlujo = {
            ...flujo,
            pasoIndex: siguienteIndex,
            datos: datosActualizados,
        }

        setFlujo(siguienteFlujo)
        agregarBot(preguntaPara(siguienteFlujo))
    }

    function esRespuestaSi(valor) {
        const normalizado = String(valor).trim().toLowerCase()
        return ["si", "sí", "s", "yes", "y", "otro", "agregar", "mas", "más"].includes(normalizado)
    }

    async function resolverValorPaso(tipo, paso, valor) {
        if (valor === "__skip__") return ""

        if (tipo === "productos" && paso === "categoriaId") {
            const texto = limpiarTextoCategoria(String(valor).trim())
            if (!texto) return ""

            const existentePorId = categorias.find(categoria => String(categoria.id) === String(texto))
            if (existentePorId) return existentePorId.id

            const existentePorNombre = categorias.find(categoria =>
                categoria.nombre.toLowerCase() === texto.toLowerCase()
            )
            if (existentePorNombre) return existentePorNombre.id

            try {
                const respuesta = await api.post("/categorias", { nombre: texto })
                const nuevaCategoria = respuesta.data?.data
                if (nuevaCategoria) {
                    setCategorias(prev => [...prev, nuevaCategoria])
                    agregarBot(`Cree la categoria ${nuevaCategoria.nombre}.`)
                    return nuevaCategoria.id
                }
            } catch {
                agregarBot("No pude crear esa categoria. Dejo el producto sin categoria por ahora.")
                return ""
            }
        }

        if (tipo === "clientes" && paso === "contactoMetodo") {
            const texto = limpiarTextoMetodo(String(valor).trim())
            if (!texto) return ""

            const existentePorId = metodos.find(metodo => String(metodo.id) === String(texto))
            if (existentePorId) return existentePorId.id

            const existentePorNombre = metodos.find(metodo =>
                metodo.nombre.toLowerCase() === texto.toLowerCase()
            )
            if (existentePorNombre) return existentePorNombre.id

            try {
                const respuesta = await api.post("/metodos-contacto", { nombre: texto, icono: "" })
                const nuevoMetodo = respuesta.data?.data
                if (nuevoMetodo) {
                    setMetodos(prev => [...prev, nuevoMetodo])
                    agregarBot(`Cree el metodo de contacto ${nuevoMetodo.nombre}.`)
                    return nuevoMetodo.id
                }
            } catch {
                agregarBot("No pude crear ese metodo de contacto. Omito el contacto por ahora.")
                return ""
            }
        }

        if (tipo === "pedidos" && paso === "fecha") {
            return parsearFecha(valor)
        }
        if (tipo === "pedidos" && paso === "cantidad") return String(Math.max(parseInt(valor) || 1, 1))
        return valor
    }

    function limpiarTextoCategoria(texto) {
        return texto
            .replace(/^crear\s+(una\s+)?categoria\s*/i, "")
            .replace(/^nueva\s+categoria\s*/i, "")
            .replace(/^categoria\s*/i, "")
            .trim()
    }

    function limpiarTextoMetodo(texto) {
        return texto
            .replace(/^crear\s+(un\s+)?metodo\s*/i, "")
            .replace(/^crear\s+(un\s+)?método\s*/i, "")
            .replace(/^nuevo\s+metodo\s*/i, "")
            .replace(/^nuevo\s+método\s*/i, "")
            .replace(/^metodo\s*/i, "")
            .replace(/^método\s*/i, "")
            .replace(/^contacto\s*/i, "")
            .trim()
    }

    function preguntaPara(estado) {
        const paso = PASOS[estado.tipo][estado.pasoIndex]

        if (estado.tipo === "productos") {
            if (paso === "nombre") return "Que nombre tiene el producto?"
            if (paso === "categoriaId") return "En que categoria va? Podes elegir una existente, escribir una nueva para que la cree, o dejarlo sin categoria."
            if (paso === "costo") return "Cual es el costo de produccion? Si queres, tambien puedo abrir la calculadora."
            return "Cual es el precio de venta?"
        }

        if (estado.tipo === "categorias") {
            return "Como queres llamar a la nueva categoria?"
        }

        if (estado.tipo === "metodos-contacto") {
            if (paso === "nombre") return "Como queres llamar al metodo de contacto?"
            return "Querés agregarle un icono o emoji? Lo podes omitir."
        }

        if (estado.tipo === "clientes") {
            if (paso === "nombre") return "Como se llama el cliente?"
            if (paso === "contactoMetodo") return "Que metodo de contacto queres agregar? Podes elegir uno existente, escribir uno nuevo para que lo cree, u omitir contactos."
            if (paso === "contactoValor") {
                const metodo = metodos.find(item => String(item.id) === String(estado.datos.contactoMetodo))
                return `Cual es el ${metodo?.nombre || "contacto"} del cliente?`
            }
            if (paso === "masContactos") return "Queres agregar otro metodo de contacto?"
            if (paso === "direccion") return "Cual es la direccion?"
            return "Querés agregar alguna nota?"
        }

        if (paso === "clienteId") return "Para que cliente es el pedido?"
        if (paso === "productoId") return "Que producto lleva el pedido?"
        if (paso === "cantidad") return "Que cantidad?"
        if (paso === "estado") return "Con que estado lo dejamos?"
        if (paso === "fecha") return "Que fecha tiene el pedido?"
        return "Alguna nota para este pedido?"
    }

    function construirPayload(estado) {
        const { tipo, datos } = estado

        if (tipo === "productos") {
            return {
                nombre: datos.nombre.trim(),
                categoriaId: datos.categoriaId,
                costo: datos.costo,
                precioVenta: datos.precioVenta,
            }
        }

        if (tipo === "clientes") {
            return {
                nombre: datos.nombre.trim(),
                contactos: datos.contactos || {},
                direccion: datos.direccion,
                notas: datos.notas,
            }
        }

        if (tipo === "categorias") {
            return {
                nombre: datos.nombre.trim(),
            }
        }

        if (tipo === "metodos-contacto") {
            return {
                nombre: datos.nombre.trim(),
                icono: datos.icono || "",
            }
        }

        const producto = productos.find(item => String(item.id) === String(datos.productoId))
        const cantidad = parseInt(datos.cantidad) || 1

        return {
            clienteId: datos.clienteId,
            estado: datos.estado,
            fecha: datos.fecha,
            notas: datos.notas,
            items: [{
                productoId: datos.productoId,
                nombre: producto?.nombre || "",
                cantidad,
                precioUnitario: numero(producto?.precioVenta),
            }],
            total: numero(producto?.precioVenta) * cantidad,
        }
    }

    async function crearPendiente() {
        if (!pendiente) return
        setGuardando(true)

        try {
            const respuesta = await api.post(`/${pendiente.tipo}`, pendiente.datos)
            const creado = respuesta.data?.data

            if (pendiente.tipo === "categorias" && creado) {
                setCategorias(prev => [...prev, creado])
            }

            if (pendiente.tipo === "metodos-contacto" && creado) {
                setMetodos(prev => [...prev, creado])
            }

            agregarBot(`${capitalizar(etiquetaTipo(pendiente.tipo))} creado. Ya lo refresque en su vista.`)
            onCreado?.(destinoVista(pendiente.tipo))
            setPendiente(null)
        } catch (err) {
            agregarBot(err.response?.data?.mensaje || `No pude crear el ${etiquetaTipo(pendiente.tipo)}.`)
        } finally {
            setGuardando(false)
        }
    }
    function irAlCampo() {
        if (!pendiente) return

        onIrA?.(
            destinoVista(pendiente.tipo),
            pendiente.datos
        )

        agregarBot(
            `Te llevo a ${destinoVista(pendiente.tipo)} para completarlo ahi.`
        )

        setPendiente(null)
        setAbierto(false)
    }

    function reiniciarChat() {
        setMensajes([MENSAJE_INICIAL])
        setEntrada("")
        setFlujo(null)
        setPendiente(null)
    }

    function cancelarPreguntas() {
        setEntrada("")
        setFlujo(null)
        setPendiente(null)
        agregarBot("Listo, cancele esas preguntas. Decime que queres crear ahora.")
    }

    function procesarComando(texto) {
        const partes = texto.toLowerCase().trim().split(/\s+/)
        const [cmd, ...args] = partes

        agregarMensaje("user", texto)

        if (cmd === "/limpiar") { reiniciarChat(); return }
        if (cmd === "/cancelar") { cancelarPreguntas(); return }
        if (cmd === "/comandos") { agregarBot(TEXTO_COMANDOS); return }

        if (cmd === "/categorias") {
            agregarBot(categorias.length
                ? `Categorias: ${categorias.map(c => c.nombre).join(", ")}`
                : "No hay categorias cargadas.")
            return
        }

        if (cmd === "/metodos") {
            agregarBot(metodos.length
                ? `Metodos: ${metodos.map(m => `${m.icono || ""} ${m.nombre}`.trim()).join(", ")}`
                : "No hay metodos cargados.")
            return
        }

        if (cmd === "/ir" && args[0]) {
            const destinos = ["productos", "clientes", "pedidos"]
            if (destinos.includes(args[0])) {
                onIrA?.(args[0])
                agregarBot(`Yendo a ${args[0]}...`)
                setAbierto(false)
            } else {
                agregarBot(`No conozco esa vista. Podes ir a: ${destinos.join(", ")}`)
            }
            return
        }

        if (cmd === "/nuevo" && args[0]) {
            const tipo = detectarTipo(args[0])
            if (tipo) {
                iniciarFlujo(tipo, false)
            } else {
                agregarBot("No reconozco ese tipo. Podes usar: producto, cliente, pedido, categoria, metodo.")
            }
            return
        }

        agregarBot("Comando no reconocido. Escribi /comandos para ver los disponibles.")
    }

    async function consultarIA(mensaje) {
        const texto = mensaje.toLowerCase()

        if (texto.includes("calculadora") || texto.includes("calcular costo") || texto.includes("costo")) {
            if (flujo?.tipo === "productos" && pasoActual === "costo") {
                agregarBot("Abrí la calculadora con el botón de abajo.")
            } else {
                iniciarFlujo("productos", false)
                agregarBot("Te inicio el flujo de producto para que puedas usar la calculadora en el paso de costo.")
            }
            return
        }

        if (texto.includes("ingrediente") || texto.includes("receta")) {
            iniciarFlujo("productos", false)
            agregarBot("Te inicio el flujo. Cuando lleguemos al costo vas a poder usar la calculadora de ingredientes.")
            return
        }

        setBotEspera(true)
        try {
            const res = await api.post("/ia/chat", {
                mensaje,
                contexto: { productos, clientes, categorias, metodos }
            })
            agregarBot(res.data?.data?.respuesta || "No pude procesar eso.")
        } catch {
            agregarBot("Hubo un error al consultar la IA.")
        }
    }
    function capitalizar(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1)
    }

    const pasoActual = flujo ? PASOS[flujo.tipo][flujo.pasoIndex] : ""

    return (
        <div className="side-panel">
            <PanelToggle abierto={abierto} onClick={() => setAbierto(prev => !prev)} />

            <AnimatePresence>
                {abierto && (
                    <motion.aside
                        className="side-panel-card side-panel-card--chat"
                        initial={{ x: -24, opacity: 0, scale: 0.98 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: -24, opacity: 0, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 340, damping: 34 }}
                        aria-label="Chatbot IA de creacion rapida"
                    >
                        <div className="side-panel-head">
                            <div>
                                <span className="side-panel-eyebrow">Asistente IA</span>
                                <h2 className="side-panel-title">Crear por chat</h2>
                            </div>
                            <div className="side-panel-head-actions">
                                <button
                                    className="side-panel-close"
                                    type="button"
                                    onClick={reiniciarChat}
                                    title="Limpiar chat"
                                    aria-label="Reiniciar chat"
                                >
                                    <RefreshIcon size={15} aria-hidden="true" />
                                </button>
                                <button
                                    className="side-panel-close"
                                    type="button"
                                    onClick={() => setAbierto(false)}
                                    title="Cerrar panel"
                                    aria-label="Cerrar panel lateral"
                                >
                                    <X size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        <div className="side-panel-chat" ref={chatRef}>
                            {mensajes.map(mensaje => (
                                <motion.div
                                    key={mensaje.id}
                                    className={`chat-message chat-message--${mensaje.autor}`}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.16 }}
                                >
                                    {mensaje.autor === "bot" && (
                                        <span className={`chat-avatar${botEspera && mensaje.id === mensajes.at(-1)?.id
                                            ? " chat-avatar--typing" : ""
                                            }`}>
                                            <BotAnimado size={24} aria-hidden="true" />
                                        </span>
                                    )}
                                    <p>{mensaje.texto}</p>
                                </motion.div>
                            ))}
                            <AnimatePresence>

                                {botEspera && (
                                    <motion.div
                                        className="chat-message chat-message--bot"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.16 }}
                                    >
                                        <span className="chat-avatar">
                                            <BotAnimado size={24} aria-hidden="true" />
                                        </span>
                                        <p>
                                            <span className="typing-dots">
                                                <span /><span /><span />
                                            </span>
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {cargandoDatos && (
                                <div className="chat-status">Actualizando opciones...</div>
                            )}

                            {totalPedido > 0 && flujo?.tipo === "pedidos" && (
                                <div className="chat-status">Total estimado: ${totalPedido.toFixed(2)}</div>
                            )}
                        </div>

                        <div className="side-panel-suggestions">
                            {!flujo && !pendiente && ACCIONES.map(accion => {
                                const Icono = accion.icon

                                if (accion.id === "comandos") {
                                    return (
                                        <div
                                            key="comandos"
                                            style={{ position: "relative" }}
                                            onMouseEnter={() => setMostrarComandos(true)}
                                            onMouseLeave={() => setMostrarComandos(false)}
                                        >
                                            <button
                                                className="chat-chip"
                                                type="button"
                                                onClick={() => agregarBot(TEXTO_COMANDOS)}
                                            >
                                                <Icono size={14} aria-hidden="true" />
                                                {accion.label}
                                            </button>

                                            {mostrarComandos && (
                                                <div className="modalComandos">
                                                    {TEXTO_COMANDOS.split("\n").map((linea, i) => (
                                                        <div key={i}>
                                                            <span style={{ color: "var(--pink-dark)", fontFamily: "monospace" }}>
                                                                {linea.split(" — ")[0]}
                                                            </span>
                                                            {" — "}
                                                            {linea.split(" — ")[1]}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                return (
                                    <button
                                        key={accion.id}
                                        className="chat-chip"
                                        type="button"
                                        onClick={() => iniciarFlujo(accion.id)}
                                    >
                                        <Icono size={14} aria-hidden="true" />
                                        {accion.label}
                                    </button>
                                )
                            })}

                            {flujo && renderOpcionesPaso()}

                            {flujo && (
                                <button
                                    className="chat-chip chat-chip--cancel"
                                    type="button"
                                    onClick={cancelarPreguntas}
                                >
                                    Cancelar
                                </button>
                            )}

                            {pendiente && (
                                <div className="chat-decision">
                                    <button
                                        className="side-panel-secondary"
                                        type="button"
                                        onClick={irAlCampo}
                                    >
                                        Ir al campo
                                    </button>
                                    <button
                                        className="side-panel-primary"
                                        type="button"
                                        onClick={crearPendiente}
                                        disabled={guardando}
                                    >
                                        {guardando ? "Creando..." : "Crearlo"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <form className="side-panel-chat-form" onSubmit={handleSubmit}>
                            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                <input
                                    value={entrada}
                                    onChange={event => setEntrada(event.target.value)}
                                    placeholder={entrada.startsWith("/") ? "" : placeholderEntrada(pasoActual)}
                                    disabled={!!pendiente || guardando}
                                    style={{ width: "100%" }}
                                />
                                {entrada.startsWith("/") && entrada === "/" && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            left: "0.8rem",
                                            fontSize: 13,
                                            pointerEvents: "none",
                                            color: "var(--grey)",
                                            opacity: cmdVisible ? 1 : 0,
                                            transform: cmdVisible ? "translateY(0)" : "translateY(-6px)",
                                            transition: "opacity 0.25s ease, transform 0.25s ease",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            fontFamily: "monospace",
                                        }}
                                    >
                                        {EJEMPLOS_COMANDOS[cmdEjemplo]}
                                    </span>
                                )}
                            </div>
                            <button
                                className="side-panel-send"
                                type="submit"
                                disabled={!entrada.trim() || !!pendiente || guardando}
                                aria-label="Enviar mensaje"
                            >
                                <SendIcon ref={sendIconRef} size={15} aria-hidden="true" />
                            </button>
                        </form>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div >
    )

    function renderOpcionesPaso() {
        if (!flujo) return null

        if (flujo.tipo === "productos" && pasoActual === "categoriaId") {
            return (
                <>
                    <button className="chat-chip" type="button" onClick={() => responderPaso("", "Sin categoria")}>
                        Sin categoria
                    </button>
                    <button
                        className="chat-chip"
                        type="button"
                        onClick={() => {
                            agregarMensaje("user", "Crear nueva categoria")
                            agregarBot("Escribi el nombre de la nueva categoria y la creo para este producto.")
                        }}
                    >
                        Crear nueva categoria
                    </button>
                    {categorias.map(categoria => (
                        <button
                            className="chat-chip"
                            type="button"
                            key={categoria.id}
                            onClick={() => responderPaso(categoria.id, categoria.nombre)}
                        >
                            {categoria.nombre}
                        </button>
                    ))}
                </>
            )
        }

        if (flujo.tipo === "productos" && pasoActual === "costo") {
            return (
                <>
                    <span className="chat-calculator">
                        <CalculadoraCosto
                            nombreProducto={flujo.datos.nombre}
                            onAplicar={({ costo }) => responderPaso(costo, `Costo calculado: $${costo}`)}
                        />
                    </span>
                    <button className="chat-chip" type="button" onClick={() => responderPaso("__skip__", "Omitir costo")}>
                        Omitir costo
                    </button>
                </>
            )
        }

        if (flujo.tipo === "clientes" && pasoActual === "contactoMetodo") {
            return (
                <>
                    <button className="chat-chip" type="button" onClick={() => responderPaso("__skip__", "Omitir contactos")}>
                        Omitir contactos
                    </button>
                    <button
                        className="chat-chip"
                        type="button"
                        onClick={() => {
                            agregarMensaje("user", "Crear nuevo metodo")
                            agregarBot("Escribi el nombre del nuevo metodo de contacto y lo creo para este cliente.")
                        }}
                    >
                        Crear nuevo metodo
                    </button>
                    {metodos.map(metodo => (
                        <button
                            className="chat-chip"
                            type="button"
                            key={metodo.id}
                            onClick={() => responderPaso(metodo.id, metodo.nombre)}
                        >
                            {metodo.icono ? `${metodo.icono} ` : ""}{metodo.nombre}
                        </button>
                    ))}
                </>
            )
        }

        if (flujo.tipo === "clientes" && pasoActual === "contactoValor") {
            return (
                <button className="chat-chip" type="button" onClick={() => responderPaso("__skip__", "Omitir valor")}>
                    Omitir valor
                </button>
            )
        }

        if (flujo.tipo === "clientes" && pasoActual === "masContactos") {
            return (
                <>
                    <button className="chat-chip" type="button" onClick={() => responderPaso("si", "Si, agregar otro")}>
                        Si, agregar otro
                    </button>
                    <button className="chat-chip" type="button" onClick={() => responderPaso("no", "No, seguir")}>
                        No, seguir
                    </button>
                </>
            )
        }

        if (flujo.tipo === "clientes" && ["direccion", "notas"].includes(pasoActual)) {
            return (
                <button className="chat-chip" type="button" onClick={() => responderPaso("__skip__", "Omitir")}>
                    Omitir
                </button>
            )
        }

        if (flujo.tipo === "metodos-contacto" && pasoActual === "nombre" && metodos.length > 0) {
            return (
                <span className="chat-status">
                    Ya existen {metodos.length} metodos
                </span>
            )
        }

        if (flujo.tipo === "metodos-contacto" && pasoActual === "icono") {
            return (
                <button className="chat-chip" type="button" onClick={() => responderPaso("__skip__", "Sin icono")}>
                    Sin icono
                </button>
            )
        }

        if (flujo.tipo === "pedidos" && pasoActual === "clienteId") {
            return clientes.map(cliente => (
                <button
                    className="chat-chip"
                    type="button"
                    key={cliente.id}
                    onClick={() => responderPaso(cliente.id, cliente.nombre)}
                >
                    {cliente.nombre}
                </button>
            ))
        }

        if (flujo.tipo === "pedidos" && pasoActual === "productoId") {
            return productos.map(producto => (
                <button
                    className="chat-chip"
                    type="button"
                    key={producto.id}
                    onClick={() => responderPaso(producto.id, producto.nombre)}
                >
                    {producto.nombre}
                </button>
            ))
        }

        if (flujo.tipo === "pedidos" && pasoActual === "estado") {
            return ESTADOS_PEDIDO.map(estado => (
                <button
                    className="chat-chip"
                    type="button"
                    key={estado}
                    onClick={() => responderPaso(estado)}
                >
                    {estado}
                </button>
            ))
        }

        if (flujo.tipo === "pedidos" && pasoActual === "fecha") {
            return (
                <button
                    className="chat-chip"
                    type="button"
                    onClick={() => responderPaso(new Date().toISOString().slice(0, 10), "Hoy")}
                >
                    Hoy
                </button>
            )
        }

        if (flujo.tipo === "pedidos" && pasoActual === "notas") {
            return (
                <button className="chat-chip" type="button" onClick={() => responderPaso("__skip__", "Sin notas")}>
                    Sin notas
                </button>
            )
        }

        return null
    }
}
