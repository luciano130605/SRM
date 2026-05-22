import { useState } from "react";

export const IconPedido = ({ size = 16, color = "currentColor" }) => (
    <svg className="acceso-svg acceso-svg--pedido" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="pedido-sheet">
            <path d="M21.93 6.761L18.56 20.291C18.32 21.301 17.42 22.001 16.38 22.001H3.24C1.73 22.001 0.65 20.521 1.1 19.071L5.31 5.551C5.6 4.611 6.47 3.961 7.45 3.961H19.75C20.7 3.961 21.49 4.541 21.82 5.341C22.01 5.771 22.05 6.261 21.93 6.761Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" />
            <path d="M16 22H20.78C22.07 22 23.08 20.91 22.99 19.62L22 6" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.68 6.38L10.72 2.06" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.38 6.391L17.32 2.051" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path className="pedido-line pedido-line--one" d="M7.7 12H15.7" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        <path className="pedido-line pedido-line--two" d="M6.7 16H14.7" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const IconProducto = ({ size = 16, color = "currentColor" }) => (
    <svg className="acceso-svg acceso-svg--producto" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="producto-box producto-box--main">
            <path d="M3.17 7.439L12 12.549L20.77 7.469" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 21.609V12.539" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.93 2.48L4.59 5.45C3.38 6.12 2.39 7.8 2.39 9.18V14.83C2.39 16.21 3.38 17.89 4.59 18.56L9.93 21.53C11.07 22.16 12.94 22.16 14.08 21.53L19.42 18.56C20.63 17.89 21.62 16.21 21.62 14.83V9.18C21.62 7.8 20.63 6.12 19.42 5.45L14.08 2.48C12.93 1.84 11.07 1.84 9.93 2.48Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 13.24V9.58L7.51 4.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path className="producto-box producto-box--small" d="M5 18.3L8 20L11 18.3L8 16.6L5 18.3Z" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
    </svg>
)

export const IconCliente = ({ size = 16, color = "currentColor" }) => (
    <svg className="acceso-svg acceso-svg--cliente" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="cliente-main">
            <path d="M12 12C14.761 12 17 9.761 17 7C17 4.239 14.761 2 12 2C9.239 2 7 4.239 7 7C7 9.761 9.239 12 12 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.41 22C3.41 18.13 7.26 15 12 15C12.96 15 13.89 15.13 14.76 15.37" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g className="cliente-plus">
            <path d="M22 18C22 20.21 20.21 22 18 22C15.79 22 14 20.21 14 18C14 15.79 15.79 14 18 14C20.21 14 22 15.79 22 18Z" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19.49 17.98H16.51" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 16.52V19.51" stroke={color} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    </svg>
)

export const IconEntrega = ({ size = 16, color = "currentColor" }) => (
    <svg className="acceso-svg acceso-svg--entrega" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="entrega-truck">
            <path d="M15 2V12C15 13.1 14.1 14 13 14H2V6C2 3.79 3.79 2 6 2H15Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 14V17C22 18.66 20.66 20 19 20H18C18 18.9 17.1 18 16 18C14.9 18 14 18.9 14 20H10C10 18.9 9.1 18 8 18C6.9 18 6 18.9 6 20H5C3.34 20 2 18.66 2 17V14H13C14.1 14 15 13.1 15 12V5H16.84C17.56 5 18.22 5.39 18.58 6.01L20.29 9H19C18.45 9 18 9.45 18 10V13C18 13.55 18.45 14 19 14H22Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 12V14H19C18.45 14 18 13.55 18 13V10C18 9.45 18.45 9 19 9H20.29L22 12Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path className="entrega-wheel entrega-wheel--left" d="M8 22C9.105 22 10 21.105 10 20C10 18.895 9.105 18 8 18C6.895 18 6 18.895 6 20C6 21.105 6.895 22 8 22Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="entrega-wheel entrega-wheel--right" d="M16 22C17.105 22 18 21.105 18 20C18 18.895 17.105 18 16 18C14.895 18 14 18.895 14 20C14 21.105 14.895 22 16 22Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="entrega-exhaust" d="M1 17H4" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0" />
    </svg>
)

export default function AccesoRapido({
    onNuevoPedido,
    onAgregarProducto,
    onAgregarCliente,
    onVerEntregas,
    soloBotones = false,
}) {
    const [animando, setAnimando] = useState(null);

    const handleClick = (label, callback) => {
        setAnimando(label);

        setTimeout(() => {
            setAnimando(null);
        }, 500);

        callback?.();
    };
    const acciones = [
        {
            label: 'Nuevo pedido',
            desc: 'Registrar venta',
            icon: <IconPedido color="white" />,
            onClick: onNuevoPedido,
            color: 'var(--pink)',
        },
        {
            label: 'Agregar producto',
            desc: 'Al catalogo',
            icon: <IconProducto color="white" />,
            onClick: onAgregarProducto,
            color: 'var(--green)',
        },
        {
            label: 'Agregar cliente',
            desc: 'Nueva persona',
            icon: <IconCliente color="white" />,
            onClick: onAgregarCliente,
            color: 'var(--amber)',
        },
        {
            label: 'Ver entregas',
            desc: 'Pendientes hoy',
            icon: <IconEntrega color="white" />,
            onClick: onVerEntregas,
            color: 'var(--pink-dark)',
        },
    ]

    const botones = acciones.map(({ label, desc, icon, onClick, color }) => (
        <button
            key={label}
            className={`acceso-btn ${animando === label ? 'animando' : ''}`}
            style={{ '--acceso-color': color }}
            onClick={() => handleClick(label, onClick)}
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
