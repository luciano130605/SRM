const { llamarGemini, llamarGeminiJson, escanearTicket } = require('../services/gemini.service')

function ajustarSugerenciaPrecio(sugerencia, costo) {
    const precioSugerido = Number(sugerencia?.precioSugerido)
    const margenIA = Number(sugerencia?.margen)

    if (!precioSugerido || precioSugerido <= costo) {
        const margenModerado = 45
        return {
            ...sugerencia,
            precioSugerido: Number((costo * (1 + margenModerado / 100)).toFixed(2)),
            margen: margenModerado,
            razon: sugerencia?.razon || 'Margen moderado para mantener un precio competitivo.',
        }
    }

    const margenCalculado = ((precioSugerido - costo) / costo) * 100
    const margen = Number.isFinite(margenIA) ? margenIA : margenCalculado

    if (margen <= 65) {
        return {
            ...sugerencia,
            precioSugerido: Number(precioSugerido.toFixed(2)),
            margen: Number(margen.toFixed(1)),
        }
    }

    const margenMaximo = 55

    return {
        ...sugerencia,
        precioSugerido: Number((costo * (1 + margenMaximo / 100)).toFixed(2)),
        margen: margenMaximo,
        razon: 'Ajuste a un margen mas moderado para que el precio no quede demasiado alto.',
    }
}


async function chatIA(req, res) {
    const { mensaje, contexto } = req.body

    if (!mensaje?.trim())
        return res.status(400).json({ ok: false, mensaje: 'Falta el mensaje' })

    const { productos = [], clientes = [], pedidos = [], categorias = [] } = contexto || {}

    const resumenProductos = productos.length
        ? productos.map(p =>
            `- ${p.nombre}: costo $${p.costo ?? '?'}, precio venta $${p.precioVenta ?? '?'}${p.categoria?.nombre ? `, categoria: ${p.categoria.nombre}` : ''}`
        ).join('\n')
        : 'No hay productos cargados.'

    const resumenClientes = clientes.length
        ? `${clientes.length} clientes registrados.`
        : 'No hay clientes.'

    const resumenPedidos = pedidos.length
        ? `${pedidos.length} pedidos. Estados: ${[...new Set(pedidos.map(p => p.estado))].join(', ')}.`
        : 'No hay pedidos.'

    const prompt = `
Sos el asistente de un pequeño negocio. Ayudas con preguntas sobre precios, productos, ideas y análisis.
IMPORTANTE: Si el usuario pide abrir algo, ejecutar una acción o navegar a alguna pantalla, respondé SOLO con:
"Para eso usá los botones de acción rápida o escribí /comandos."
No inventes que podés hacer cosas que no podés.
Datos del negocio:
Productos:
${resumenProductos}

Clientes: ${resumenClientes}
Pedidos: ${resumenPedidos}
Categorias: ${categorias.map(c => c.nombre).join(', ') || 'ninguna'}

El dueño te pregunta: "${mensaje.trim()}"

Respondé de forma directa, concisa y útil. Maximo 4 oraciones. Tono cercano, hablale de vos. Sin markdown, sin listas, texto plano.
`.trim()

    try {
        const respuesta = await llamarGemini(prompt, 0.6)
        res.json({ ok: true, data: { respuesta } })
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message })
    }
}



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
Usa margenes moderados y competitivos: normalmente entre 35% y 55% sobre el costo.
Evita margenes cercanos al 100%; solo podrias superar 65% si el costo es muy bajo y el precio final sigue siendo razonable para el mercado.

Devolve SOLO un objeto JSON (sin markdown, sin texto extra) con esta forma exacta:
{
  "precioSugerido": <numero>,
  "margen": <numero entre 0 y 100>,
  "razon": "<una frase corta explicando el margen sugerido>"
}

Considera margenes tipicos del rubro, competitividad, costos indirectos y que el negocio sea rentable sin quedar caro.
`.trim()

    try {
        const sugerencia = await llamarGeminiJson(prompt)
        res.status(200).json({ ok: true, data: ajustarSugerenciaPrecio(sugerencia, costo) })
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


async function scanearComprobante(req, res) {
    const { archivoBase64, mimeType } = req.body

    if (!archivoBase64)
        return res.status(400).json({ ok: false, mensaje: 'Falta el archivo' })

    try {
        const items = await escanearTicket(archivoBase64, mimeType || 'application/pdf')
        res.json({ ok: true, data: items })
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message })
    }
}

module.exports = { sugerirPrecioVenta, consultarPedidoIA, chatIA, scanearComprobante }
