let clienteWA = null
let estadoConexion = 'desconectado'
let qrActual = null
let sseClients = [] 

function emitirSSE(evento, datos) {
    const payload = `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`
    sseClients = sseClients.filter(res => {
        try { res.write(payload); return true }
        catch { return false }
    })
}

function registrarSSE(res) {
    sseClients.push(res)
}

function desregistrarSSE(res) {
    sseClients = sseClients.filter(r => r !== res)
}

async function iniciarWhatsapp(onMensaje) {
    if (estadoConexion === 'conectado' || estadoConexion === 'conectando') return

    estadoConexion = 'conectando'
    qrActual = null
    emitirSSE('estado', { estado: 'conectando', qr: null })

    const { create } = require('@open-wa/wa-automate')

    try {
        clienteWA = await create({
            sessionId: 'srm-session',
            headless: true,
            qrTimeout: 0,
            authTimeout: 0,
            killProcessOnBrowserClose: true,
            throwErrorOnTosBlock: false,
            qrRefreshS: 15,
            onQr: (qrBase64) => {
                qrActual = qrBase64
                emitirSSE('qr', { qr: qrBase64 })
            },
        })

        clienteWA.onMessage(onMensaje)
        estadoConexion = 'conectado'
        qrActual = null
        emitirSSE('estado', { estado: 'conectado', qr: null })

    } catch (error) {
        estadoConexion = 'error'
        emitirSSE('estado', { estado: 'error', qr: null })
        console.error('[WA] Error al iniciar:', error.message)
    }
}

function obtenerEstado() {
    return { estado: estadoConexion, qr: qrActual }
}

async function enviarMensaje(numero, mensaje) {
    if (!clienteWA || estadoConexion !== 'conectado')
        throw new Error('WhatsApp no está conectado')

    const id = numero.replace(/\D/g, '') + '@c.us'
    return clienteWA.sendText(id, mensaje)
}

function desconectar() {
    if (clienteWA) { clienteWA.kill(); clienteWA = null }
    estadoConexion = 'desconectado'
    qrActual = null
    emitirSSE('estado', { estado: 'desconectado', qr: null })
}

module.exports = {
    iniciarWhatsapp, obtenerEstado, enviarMensaje,
    desconectar, registrarSSE, desregistrarSSE,
}