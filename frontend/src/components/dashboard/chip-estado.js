export default function chipEstado(estado) {
    const map = {
        pendiente: 'estado-pendiente',
        entregado: 'estado-entregado',
        cancelado: 'estado-cancelado',
        'en proceso': 'estado-en-proceso',
        'en-proceso': 'estado-en-proceso',
    }
    return map[(estado || '').toLowerCase()] || 'estado-pendiente'
}
