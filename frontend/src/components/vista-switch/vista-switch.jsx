import "./vista-switch.css"

const opcionesDefault = [
    { id: 'cards', label: 'Cards' },
    { id: 'tabla', label: 'Tabla' },
]

export default function VistaSwitch({ vista, setVista, opciones = opcionesDefault, ariaLabel = 'Cambiar vista' }) {
    return (
        <div className="vista-switch" aria-label={ariaLabel}>
            {opciones.map(opcion => (
                <button
                    key={opcion.id}
                    className={vista === opcion.id ? 'activo' : ''}
                    onClick={() => setVista(opcion.id)}
                    type="button"
                >
                    {opcion.label}
                </button>
            ))}
        </div>
    )
}
