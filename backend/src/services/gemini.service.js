const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function limpiarJsonGemini(texto) {
    return texto.replace(/```json|```/g, '').trim()
}

/**
 * Llama a Gemini con un prompt y devuelve el texto crudo de la respuesta.
 * @param {string} prompt
 * @param {number} temperature
 * @returns {Promise<string>}
 */
async function llamarGemini(prompt, temperature = 0.3) {
    if (!GEMINI_KEY) throw new Error('Falta GEMINI_API_KEY en el backend')

    const respuesta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature },
            }),
        }
    )

    if (!respuesta.ok) throw new Error(`Gemini error: ${respuesta.status}`)

    const data = await respuesta.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

/**
 * Llama a Gemini y parsea la respuesta como JSON.
 * @param {string} prompt
 * @param {number} temperature
 * @returns {Promise<object>}
 */
async function llamarGeminiJson(prompt, temperature = 0.3) {
    const raw = await llamarGemini(prompt, temperature)
    return JSON.parse(limpiarJsonGemini(raw))
}

module.exports = { llamarGemini, llamarGeminiJson }