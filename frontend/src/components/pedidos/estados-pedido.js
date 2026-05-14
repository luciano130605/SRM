export const ESTADOS_PEDIDO = ['pendiente', 'en proceso', 'entregado', 'cancelado']

export function chipClass(estado) {
    const map = {
        pendiente: 'estado-pendiente',
        entregado: 'estado-entregado',
        cancelado: 'estado-cancelado',
        'en proceso': 'estado-en-proceso',
        'en-proceso': 'estado-en-proceso',
    }

    return map[(estado || '').toLowerCase()] || 'estado-pendiente'
}

export function siguienteEstado(estado) {
    const ciclo = ['pendiente', 'en proceso', 'entregado']
    const i = ciclo.indexOf((estado || '').toLowerCase())

    return i >= 0 && i < ciclo.length - 1 ? ciclo[i + 1] : estado
}

export function estadoLabel(estado) {
    return estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : ''
}
