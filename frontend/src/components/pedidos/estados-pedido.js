const ESTADOS_PEDIDO = ["pendiente", "preparando", "listo", "entregado", "cancelado"]


export function chipEstadoStyle(color) {
    if (!color) return {}
    return {
        background: color + '18',
        border: `1px solid ${color}55`,
        color: color,
    }
}

export default ESTADOS_PEDIDO