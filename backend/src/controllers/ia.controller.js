const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function limpiarJsonGemini(texto) {
    return texto.replace(/```json|```/g, '').trim()
}

async function sugerirPrecioVenta(req, res) {
    const { nombreProducto, costoProduccion, categoria } = req.body
    const costo = Number(costoProduccion)

    if (!GEMINI_KEY) {
        return res.status(500).json({ ok: false, mensaje: 'Falta GEMINI_API_KEY en el backend' })
    }

    if (!costo || costo <= 0) {
        return res.status(400).json({ ok: false, mensaje: 'Falta un costo de produccion valido' })
    }

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
        const respuesta = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3 },
                }),
            }
        )

        if (!respuesta.ok) {
            return res.status(502).json({ ok: false, mensaje: `Gemini error: ${respuesta.status}` })
        }

        const data = await respuesta.json()
        const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        const sugerencia = JSON.parse(limpiarJsonGemini(raw))

        res.status(200).json({ ok: true, data: sugerencia })
    } catch (error) {
        res.status(500).json({ ok: false, mensaje: error.message || 'No se pudo obtener sugerencia de IA' })
    }
}

module.exports = { sugerirPrecioVenta }
