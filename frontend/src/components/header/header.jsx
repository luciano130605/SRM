import "./header.css"

const secciones = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'productos', label: 'Productos' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'pedidos', label: 'Pedidos' },
]

export default function Header({ vista, setVista }) {
    return (
        <header className="app-header">
            <button
                className="app-brand"
                type="button"
                onClick={() => setVista('dashboard')}
                title="Ir al dashboard"
            >
                SRM
            </button>

            <nav className="app-nav" aria-label="Secciones principales">
                {secciones.map(seccion => (
                    <button
                        key={seccion.id}
                        className={`app-nav-btn${vista === seccion.id ? ' activo' : ''}`}
                        type="button"
                        onClick={() => setVista(seccion.id)}
                    >
                        {seccion.label}
                    </button>
                ))}
            </nav>
        </header>
    )
}
