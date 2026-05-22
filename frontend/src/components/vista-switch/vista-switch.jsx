import { Grid2X2, Table2 } from "lucide-react"

const opcionesDefault = [
    { id: 'cards', label: 'Cards', icon: Grid2X2 },
    { id: 'tabla', label: 'Tabla', icon: Table2 },
]

export default function VistaSwitch({
    vista,
    setVista,
    opciones = opcionesDefault,
    ariaLabel = 'Cambiar vista'
}) {
    const esMovil = window.innerWidth < 768

    const opcionesVisibles = esMovil
        ? opciones.filter(opcion => opcion.id !== 'tabla')
        : opciones

    return (
        <div className="vista-switch" aria-label={ariaLabel}>
            {opcionesVisibles.map(opcion => {
                const Icono = opcion.icon

                return (
                    <button
                        key={opcion.id}
                        className={`${vista === opcion.id ? 'activo' : ''}${Icono ? ' with-icon' : ''}`.trim()}
                        onClick={() => setVista(opcion.id)}
                        type="button"
                        title={opcion.label}
                        aria-label={opcion.label}
                    >
                        {Icono && <Icono size={15} aria-hidden="true" />}
                        <span className="button-label">{opcion.label}</span>
                    </button>
                )
            })}
        </div>
    )
}