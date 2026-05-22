const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode')

let sock = null
let estadoConexion = 'desconectado'
let sseClients = []

function emitirSSE(evento, datos) {
    const payload = `event: ${evento}\ndata: ${JSON.stringify(datos)}\n\n`
    sseClients = sseClients.filter(res => {
        try { res.write(payload); return true }
        catch { return false }
    })
}

function registrarSSE(res) { sseClients.push(res) }
function desregistrarSSE(res) { sseClients = sseClients.filter(r => r !== res) }
function obtenerEstado() { return { estado: estadoConexion } }

async function iniciarWhatsapp(onMensaje) {
    if (estadoConexion === 'conectado' || estadoConexion === 'conectando') return

    estadoConexion = 'conectando'
    emitirSSE('estado', { estado: 'conectando' })

    const { state, saveCreds } = await useMultiFileAuthState('./wa-session')

    sock = makeWASocket({ auth: state, printQRInTerminal: false })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            const qrBase64 = await qrcode.toDataURL(qr)
            emitirSSE('qr', { qr: qrBase64 })
        }

        if (connection === 'open') {
            estadoConexion = 'conectado'
            emitirSSE('estado', { estado: 'conectado' })
        }

        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            const reconectar = code !== DisconnectReason.loggedOut

            estadoConexion = 'desconectado'
            emitirSSE('estado', { estado: 'desconectado' })

            if (reconectar) {
                setTimeout(() => iniciarWhatsapp(onMensaje), 3000)
            }
        }
    })

    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.key.fromMe && msg.message) {
                await onMensaje(msg).catch(console.error)
            }
        }
    })
}

async function enviarMensaje(numero, mensaje) {
    if (!sock || estadoConexion !== 'conectado')
        throw new Error('WhatsApp no está conectado')

    const jid = numero.replace(/\D/g, '') + '@s.whatsapp.net'
    await sock.sendMessage(jid, { text: mensaje })
}

function desconectar() {
    sock?.end()
    sock = null
    estadoConexion = 'desconectado'
    emitirSSE('estado', { estado: 'desconectado' })
}

module.exports = { iniciarWhatsapp, obtenerEstado, enviarMensaje, desregistrarSSE, registrarSSE, desconectar }