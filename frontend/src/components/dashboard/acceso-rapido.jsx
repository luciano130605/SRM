const IconPedido = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
        <line x1="12" y1="13" x2="12" y2="17" />
        <line x1="10" y1="15" x2="14" y2="15" />
    </svg>
)

const IconProducto = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
)

const IconCliente = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
)

const IconEntrega = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
)

export default function AccesoRapido({
    onNuevoPedido,
    onAgregarProducto,
    onAgregarCliente,
    onVerEntregas,
    soloBotones = false,
}) {
    const acciones = [
        {
            label: 'Nuevo pedido',
            desc: 'Registrar venta',
            icon: <IconPedido />,
            onClick: onNuevoPedido,
            color: 'var(--pink)',
        },
        {
            label: 'Agregar producto',
            desc: 'Al catalogo',
            icon: <IconProducto />,
            onClick: onAgregarProducto,
            color: 'var(--green)',
        },
        {
            label: 'Agregar cliente',
            desc: 'Nueva persona',
            icon: <IconCliente />,
            onClick: onAgregarCliente,
            color: 'var(--amber)',
        },
        {
            label: 'Ver entregas',
            desc: 'Pendientes hoy',
            icon: <IconEntrega />,
            onClick: onVerEntregas,
            color: 'var(--black)',
        },
    ]

    const botones = acciones.map(({ label, desc, icon, onClick, color }) => (
        <button
            key={label}
            className="acceso-btn"
            style={{ '--acceso-color': color }}
            onClick={onClick}
            type="button"
            aria-label={label}
        >
            <span className="acceso-icon">{icon}</span>
            <span className="acceso-text">
                <span className="acceso-label">{label}</span>
                <span className="acceso-desc">{desc}</span>
            </span>
        </button>
    ))

    if (soloBotones) {
        return <div className="acceso-grid">{botones}</div>
    }

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Acceso rapido</span>
            </div>

            <div className="acceso-grid">
                {botones}
            </div>
        </div>
    )
}
