import { useRef } from "react";
import "./header.css";

const secciones = [
    { id: "dashboard", label: "Dashboard" },
    { id: "productos", label: "Productos" },
    { id: "clientes", label: "Clientes" },
    { id: "pedidos", label: "Pedidos" },
];

export default function Header({ vista, setVista, usuario, onLogout }) {
    const iconRefs = useRef({});

    return (
        <header className="app-header">
            <button
                className="app-brand"
                type="button"
                onClick={() => setVista("dashboard")}
            >
                SRM
            </button>

            <nav className="app-nav">
                {secciones.map((seccion) => (
                    <button
                        key={seccion.id}
                        className={`app-nav-btn ${vista === seccion.id ? "activo" : ""
                            }`}
                        type="button"
                        onClick={() => setVista(seccion.id)}
                        onMouseEnter={() =>
                            iconRefs.current[seccion.id]?.startAnimation?.()
                        }
                        onMouseLeave={() =>
                            iconRefs.current[seccion.id]?.stopAnimation?.()
                        }
                    >
                        {seccion.label}
                    </button>
                ))}
            </nav>

            <div className="app-auth">
                <button className="app-login-btn" type="button" onClick={onLogout}>
                    Salir
                </button>
            </div>
        </header>
    );
}
