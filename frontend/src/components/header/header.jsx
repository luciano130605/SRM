import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, UserCircle, Users } from "lucide-react";
import gridMovimiento from "../../icons/GridMovimiento";
import LogoutIcon from "../../icons/LogOutMoviminto";
import Preferences from "../../icons/SliderHorizontal";
import TrashOpen from "../../icons/TrashOpen";
import AccountSettingsModal from "./account-settings-modal";
import UsersIcon from "../../icons/UsersMovimiento";
import { Sun, Moon } from "lucide-react";

export const IconPedido = ({ size = 16, color = "currentColor" }) => (
    <svg className="app-nav-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <svg className="app-nav-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g className="producto-box producto-box--main">
            <path d="M3.17 7.439L12 12.549L20.77 7.469" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 21.609V12.539" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.93 2.48L4.59 5.45C3.38 6.12 2.39 7.8 2.39 9.18V14.83C2.39 16.21 3.38 17.89 4.59 18.56L9.93 21.53C11.07 22.16 12.94 22.16 14.08 21.53L19.42 18.56C20.63 17.89 21.62 16.21 21.62 14.83V9.18C21.62 7.8 20.63 6.12 19.42 5.45L14.08 2.48C12.93 1.84 11.07 1.84 9.93 2.48Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 13.24V9.58L7.51 4.1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path className="producto-box producto-box--small" d="M5 18.3L8 20L11 18.3L8 16.6L5 18.3Z" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
    </svg>
)

const secciones = [
    { id: "dashboard", label: "Dashboard", icon: gridMovimiento },
    { id: "productos", label: "Productos", icon: IconProducto },
    { id: "clientes", label: "Clientes", icon: UsersIcon },
    { id: "pedidos", label: "Pedidos", icon: IconPedido },
];

export default function Header({ vista, setVista, usuario, onLogout, onUpdateUsuario, onToggleTema, tema }) {
    const iconRefs = useRef({});
    const menuRef = useRef(null)
    const [menuOpen, setMenuOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const logoutRef = useRef(null)
    const preferencesRef = useRef(null)
    const trashRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false)
            }
        }

        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    const nombreUsuario = usuario?.nombre || usuario?.email?.split('@')[0] || 'Usuario'

    function cerrarCuenta() {
        const confirmacion = window.confirm('¿Querés eliminar tu cuenta y cerrar sesión?')
        if (!confirmacion) return
        onLogout()
    }

    function abrirConfiguracion() {
        setSettingsOpen(true)
        setMenuOpen(false)
    }

    return (
        <>
            <header className="app-header">
                <button
                    className="app-brand"
                    type="button"
                    onClick={() => setVista("dashboard")}
                >
                    SRM
                </button>

                <nav className="app-nav">
                    {secciones.map((seccion) => {
                        const Icono = seccion.icon;

                        return (
                            <button
                                key={seccion.id}
                                className={`app-nav-btn ${vista === seccion.id ? "activo" : ""}`}
                                type="button"
                                onClick={() => {
                                    iconRefs.current[seccion.id]?.startAnimation?.();

                                    setTimeout(() => {
                                        iconRefs.current[seccion.id]?.stopAnimation?.();
                                    }, 500);

                                    setVista(seccion.id);
                                }}
                                title={seccion.label}
                                aria-label={seccion.label}
                            >
                                <Icono
                                    ref={(el) => (iconRefs.current[seccion.id] = el)}
                                    className="app-nav-icon"
                                    size={16}
                                    aria-hidden="true"
                                />

                                <span className="app-nav-label">
                                    {seccion.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                <div className="app-auth" ref={menuRef}>
                    <div className="separador"></div>

                    <button
                        className="app-nav-btn"
                        type="button"
                        onClick={() => setMenuOpen(prev => !prev)}
                        title={nombreUsuario}
                        aria-label="Abrir menú de usuario"
                    >
                        <UserCircle className="app-nav-icon" size={17} aria-hidden="true" />
                        <span className="app-user-label">{nombreUsuario}</span>

                    </button>

                    {menuOpen && (
                        <div className="app-user-menu">
                            <button
                                className="app-user-menu-item"
                                type="button"
                                onClick={(e) => { onToggleTema(e); setMenuOpen(false) }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div style={{ position: "relative", top: 2, transition: "transform 0.3s" }}>
                                        {tema === "dark"
                                            ? <Sun size={15} />
                                            : <Moon size={15} />
                                        }
                                    </div>
                                    {tema === "dark" ? "Modo claro" : "Modo oscuro"}
                                </div>
                            </button>
                            <button className="app-user-menu-item" type="button" onClick={abrirConfiguracion}
                                onMouseEnter={() => preferencesRef.current?.startAnimation?.()}
                                onMouseLeave={() => preferencesRef.current?.stopAnimation?.()}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                                    <div style={{ position: "relative", top: 3 }}>
                                        <Preferences ref={preferencesRef} />
                                    </div>
                                    Preferencias
                                </div>

                            </button>
                            <button
                                className="app-user-menu-item"
                                type="button"
                                onClick={onLogout}
                                onMouseEnter={() => logoutRef.current?.startAnimation?.()}
                                onMouseLeave={() => logoutRef.current?.stopAnimation?.()}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ position: "relative", top: 3 }}>
                                        <LogoutIcon ref={logoutRef} />
                                    </div>

                                    Cerrar sesión
                                </div>
                            </button>
                            <button
                                className="app-user-menu-item app-user-menu-item-danger"
                                type="button"
                                onClick={cerrarCuenta}
                                onMouseEnter={() => trashRef.current?.startAnimation?.()}
                                onMouseLeave={() => trashRef.current?.stopAnimation?.()}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                                    <div style={{ position: "relative", top: 3 }}>
                                        <TrashOpen ref={trashRef} />
                                    </div>
                                    Eliminar cuenta
                                </div>
                            </button>
                        </div>
                    )
                    }
                </div >


            </header >
            <header>

                <AccountSettingsModal
                    abierto={settingsOpen}
                    onCerrar={() => setSettingsOpen(false)}
                    usuario={usuario}
                    onUpdateUsuario={onUpdateUsuario}
                />
            </header>
        </>
    );
}


