export function prepararCampoCsv(valor) {
    const texto = String(valor ?? '')
    return `"${texto.replace(/"/g, '""')}"`
}

export function exportarCsv({ nombreArchivo, encabezados, filas }) {
    const contenido = [encabezados, ...filas]
        .map(fila => fila.map(prepararCampoCsv).join(';'))
        .join('\n')

    const blob = new Blob([`\ufeff${contenido}`], {
        type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function normalizarTexto(valor) {
    return String(valor ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

export function separarFilaCsv(fila, separador) {
    const valores = []
    let actual = ''
    let entreComillas = false

    for (let i = 0; i < fila.length; i++) {
        const char = fila[i]
        const siguiente = fila[i + 1]

        if (char === '"' && entreComillas && siguiente === '"') {
            actual += '"'
            i++
        } else if (char === '"') {
            entreComillas = !entreComillas
        } else if (char === separador && !entreComillas) {
            valores.push(actual.trim())
            actual = ''
        } else {
            actual += char
        }
    }

    valores.push(actual.trim())
    return valores
}

export function detectarSeparador(linea) {
    const puntoYComa = separarFilaCsv(linea, ';').length
    const coma = separarFilaCsv(linea, ',').length

    return puntoYComa >= coma ? ';' : ','
}

export function obtenerValorFila(fila, indices, nombres) {
    const indice = nombres
        .map(nombre => indices[nombre])
        .find(pos => pos !== undefined)

    return indice === undefined ? '' : fila[indice]
}

export function parsearTablaCsv(contenido) {
    const lineas = contenido
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .filter(linea => linea.trim())

    if (lineas.length < 2) return { filas: [], indices: {} }

    const separador = detectarSeparador(lineas[0])
    const encabezados = separarFilaCsv(lineas[0], separador).map(normalizarTexto)
    const indices = encabezados.reduce((acc, encabezado, index) => {
        acc[encabezado] = index
        return acc
    }, {})

    return {
        indices,
        filas: lineas.slice(1).map(linea => separarFilaCsv(linea, separador))
    }
}

export function parsearNumero(valor, fallback = '') {
    const texto = String(valor ?? '')
        .replace(/\$/g, '')
        .replace(/%/g, '')
        .replace(/\s/g, '')

    if (!texto) return fallback

    const ultimaComa = texto.lastIndexOf(',')
    const ultimoPunto = texto.lastIndexOf('.')
    const normalizado = ultimaComa > ultimoPunto
        ? texto.replace(/\./g, '').replace(',', '.')
        : texto.replace(/,/g, '')
    const numero = parseFloat(normalizado)

    return Number.isFinite(numero) ? numero : fallback
}
