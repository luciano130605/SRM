const { llamarGeminiJson } = require('../services/gemini.service')


async function sugerirPrecioVenta(req, res) {
    const { nombreProducto, costoProduccion, categoria } = req.body
    const costo = Number(costoProduccion)

    if (!costo || costo <= 0)
        return res.status(400).json({ ok: false, mensaje: 'Falta un costo de produccion valido' })

    const prompt = `
Sos un experto en costos y precios para pequenos negocios de gastronomia / manufactura artesanal.

Producto: "${nombreProducto || 'sin nombre'}"
Categoria: "${categoria || 'sin categoria'}"
Costo de produccion: $${costo.toFixed(2)}

Calcula un precio de venta sugerido para este producto.

Devolve SOLO un objeto JSON (sin markdown, sin texto extra) con esta forma exacta:
{
  "precioSugerido": <numero>,
  "margen": <numero entre 0 y 100>,
  "razon": "<una frase corta explicando el margen sugerido>"
}

Considera margenes tipicos del rubro, competitividad, costos indirectos y que el negocio sea rentable.
`.trim()

    try {
        const sugerencia = await llamarGeminiJson(prompt)
        res.status(200).json({ ok: true, data: sugerencia })
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message || 'No se pudo obtener sugerencia de IA' })
    }
}


async function consultarPedidoIA({ numeroPedido, pedido }) {
    const fechaEntrega = pedido.fechaEntrega || pedido.fecha || null
    const diasDesdeCreacion = pedido.createdAt
        ? Math.floor((Date.now() - new Date(pedido.createdAt)) / 86_400_000)
        : null

    const prompt = `
Sos el asistente de un pequeño negocio. Un cliente preguntó por su pedido #${numeroPedido}.

Datos del pedido:
- Estado actual: ${pedido.estado || 'pendiente'}
- Fecha de creacion: ${pedido.createdAt ? new Date(pedido.createdAt).toLocaleDateString('es-AR') : 'desconocida'}
- Fecha de entrega registrada: ${fechaEntrega ? new Date(fechaEntrega).toLocaleDateString('es-AR') : 'no especificada'}
- Dias desde que se hizo el pedido: ${diasDesdeCreacion ?? 'desconocido'}
- Notas: ${pedido.notas || 'ninguna'}
- Total: $${pedido.total || 0}

Con esa info, redacta un mensaje corto y amigable para WhatsApp (maximo 3 oraciones) que le diga al cliente:
1. El estado actual de su pedido
2. Una estimacion de cuando estara listo (si no hay fecha exacta, estimala segun el estado y los dias transcurridos)

Hablale de vos, tono cercano. No uses emojis. No menciones el numero de pedido en el mensaje.
Devolve SOLO el texto del mensaje, sin comillas ni formato extra.
`.trim()

    return llamarGemini(prompt, 0.5)
}

module.exports = { sugerirPrecioVenta, consultarPedidoIA }