const GEMINI_KEY =
    process.env.GEMINI_API_KEY

const GEMINI_MODEL =
    process.env.GEMINI_MODEL || 'gemini-2.5-flash'

const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const OPENROUTER_KEY =
    process.env.OPENROUTER_API_KEY

const OPENROUTER_MODEL =
    process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash:free'

const OPENROUTER_URL =
    'https://openrouter.ai/api/v1/chat/completions'

function limpiarJsonGemini(texto) {
    return texto.replace(/```json|```/g, '').trim()
}

async function escanearTicket(base64, mimeType = 'application/pdf') {
    if (!GEMINI_KEY) throw new Error('Falta GEMINI_API_KEY')
    const prompt = `
Analizá este comprobante/ticket de compra y extraé todos los productos comprados.
Devolvé SOLO un array JSON (sin markdown) con esta forma exacta:
[
  {
    "nombre": "nombre del producto (sin el peso/volumen si ya está en cantidadComprada)",
    "cantidadComprada": <número total en la unidad indicada>,
    "precioUnitario": <precio por unidad de medida>,
    "unidad": "u" | "g" | "kg" | "ml" | "l"
  }
]

Reglas importantes:
- Si el producto tiene peso/volumen en el nombre (ej: "250 GR", "1 KG", "500 ML"):
  * cantidadComprada = cantidad de paquetes × peso por paquete (ej: 3 x 250g = 750)
  * unidad = "g", "kg", "ml" o "l" según corresponda
  * precioUnitario = precio total / cantidadComprada
- Si no tiene peso/volumen: cantidadComprada = unidades compradas, unidad = "u"
- Si hay descuentos en el ítem, usá el precio final con descuento
- Ignorá subtotales, descuentos generales y bolsas
`.trim()

    const respuesta = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64,
                        }
                    },
                    { text: prompt }
                ]
            }],
            generationConfig: { temperature: 0.1 }
        })
    })

    if (!respuesta.ok) {
        const detalles = await leerDetalleError(respuesta)
        throw new Error(`Gemini error ${respuesta.status}: ${detalles}`)
    }

    const data = await respuesta.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    try {
        return JSON.parse(limpiarJsonGemini(raw))
    } catch (e) {
        throw new Error(`No se pudo parsear la respuesta: ${e.message}`)
    }
}


async function leerDetalleError(respuesta) {
    try {
        const body = await respuesta.json()
        return JSON.stringify(body)
    } catch {
        return respuesta.text()
    }
}

async function llamarGeminiDirecto(prompt, temperature = 0.3) {
    if (!GEMINI_KEY) {
        throw new Error('Falta GEMINI_API_KEY')
    }

    const respuesta = await fetch(
        `${GEMINI_URL}?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature,
                },
            }),
        }
    )

    if (!respuesta.ok) {
        const detalles = await leerDetalleError(respuesta)

        throw new Error(
            `Gemini error ${respuesta.status}: ${detalles}`
        )
    }

    const data = await respuesta.json()

    return (
        data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    )
}

async function llamarOpenRouter(prompt, temperature = 0.3) {
    if (!OPENROUTER_KEY) {
        throw new Error('Falta OPENROUTER_API_KEY')
    }

    const respuesta = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
            'X-Title': process.env.OPENROUTER_APP_NAME || 'SRM',
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature,
        }),
    })

    if (!respuesta.ok) {
        const detalles = await leerDetalleError(respuesta)

        throw new Error(
            `OpenRouter error ${respuesta.status}: ${detalles}`
        )
    }

    const data = await respuesta.json()

    return data?.choices?.[0]?.message?.content || ''
}

async function llamarGemini(prompt, temperature = 0.3) {
    try {
        return await llamarGeminiDirecto(prompt, temperature)
    } catch (geminiError) {
        try {
            return await llamarOpenRouter(prompt, temperature)
        } catch (openRouterError) {
            throw new Error(
                `Gemini fallo: ${geminiError.message}. OpenRouter fallback fallo: ${openRouterError.message}`
            )
        }
    }
}

async function llamarGeminiJson(
    prompt,
    temperature = 0.3
) {
    const raw = await llamarGemini(
        prompt,
        temperature
    )

    try {
        return JSON.parse(
            limpiarJsonGemini(raw)
        )
    } catch (error) {
        throw new Error(
            `No se pudo parsear JSON: ${error.message}`
        )
    }
}

module.exports = { llamarGemini, llamarGeminiJson, llamarOpenRouter, escanearTicket }