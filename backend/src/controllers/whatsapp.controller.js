const waService = require('../services/whatsapp.service')
const { consultarPedidoIA } = require('./ia.controller')
const supabase = require('../supabase')

async function manejarMensajeEntrante(msg) {
    if (msg.key.fromMe || msg.key.remoteJid.endsWith('@g.us')) return

    const texto = (
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        ''
    ).trim()

    const match = texto.match(/\b(\d+)\b/)
    if (!match) return

    const numeroPedido = match[1]
    const numeroCliente = msg.key.remoteJid.replace('@s.whatsapp.net', '')

    try {
        const { data: pedido, error } = await supabase
            .from('pedidos')
            .select('*, clientes(id, nombre)')
            .eq('id', numeroPedido)
            .single()

        if (error || !pedido) {
            await waService.enviarMensaje(
                numeroCliente,
                `No encontré ningún pedido con el número ${numeroPedido}. Verificá el número e intentá de nuevo.`
            )
            return
        }

        const respuesta = await consultarPedidoIA({ numeroPedido, pedido })
        await waService.enviarMensaje(numeroCliente, respuesta)
    } catch (error) {
        console.error('[WA webhook]', error.message)
    }
}
async function conectar(req, res) {
    try {
        await waService.iniciarWhatsapp(manejarMensajeEntrante)
        res.json({ ok: true, ...waService.obtenerEstado() })
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message })
    }
}

// GET /whatsapp/estado
function estado(req, res) {
    res.json({ ok: true, ...waService.obtenerEstado() })
}

function eventos(req, res) {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const actual = waService.obtenerEstado()
    res.write(`event: estado\ndata: ${JSON.stringify(actual)}\n\n`)

    waService.registrarSSE(res)
    req.on('close', () => waService.desregistrarSSE(res))
}

async function enviar(req, res) {
    const { numero, mensaje } = req.body
    if (!numero || !mensaje)
        return res.status(400).json({ ok: false, mensaje: 'Faltan numero y mensaje' })

    try {
        await waService.enviarMensaje(numero, mensaje)
        res.json({ ok: true })
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message })
    }
}

function desconectar(req, res) {
    waService.desconectar()
    res.json({ ok: true })
}

module.exports = { conectar, estado, eventos, enviar, desconectar }