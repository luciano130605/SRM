import { ArrowRight, Bot, PackagePlus, Sparkles, Tags, UserRoundPlus, X } from "lucide-react"
import InfoCircleIcon from "../../icons/InfoMovimiento"

export const IconPedido = ({ size = 16, color = "currentColor" }) => (
    <svg
        className="acceso-svg acceso-svg--pedido"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g className="pedido-sheet">
            <path
                d="M21.93 6.761L18.56 20.291C18.32 21.301 17.42 22.001 16.38 22.001H3.24C1.73 22.001 0.65 20.521 1.1 19.071L5.31 5.551C5.6 4.611 6.47 3.961 7.45 3.961H19.75C20.7 3.961 21.49 4.541 21.82 5.341C22.01 5.771 22.05 6.261 21.93 6.761Z"
                stroke={color}
                strokeWidth="1.5"
                strokeMiterlimit="10"
            />
            <path
                d="M16 22H20.78C22.07 22 23.08 20.91 22.99 19.62L22 6"
                stroke={color}
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M9.68 6.38L10.72 2.06"
                stroke={color}
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M16.38 6.391L17.32 2.051"
                stroke={color}
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>

        <path
            d="M8 13H16"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12 9V17"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export function PhonePlusIcon({
    size = 16,
    color = "currentColor",
    strokeWidth = 2,
}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Teléfono */}
            <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />

            {/* + */}
            <path d="M18 2v4" />
            <path d="M16 4h4" />
        </svg>
    );
}

const ACCIONES = [
    { id: "productos", label: "Agregar producto", icon: PackagePlus },
    { id: "clientes", label: "Agregar cliente", icon: UserRoundPlus },
    { id: "pedidos", label: "Agregar pedido", icon: IconPedido },
    { id: "categorias", label: "Crear categoria", icon: Tags },
    { id: "metodos-contacto", label: "Crear metodo", icon: PhonePlusIcon },
    { id: "comandos", label: "Ver comandos", icon: InfoCircleIcon },
]

export default ACCIONES;