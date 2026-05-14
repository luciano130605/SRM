import "./vista-switch.css"

export default function VistaSwitch({ vista, setVista }) {
    return (
        <div className="vista-switch" aria-label="Cambiar vista">
            <button
                className={vista === 'cards' ? 'activo' : ''}
                onClick={() => setVista('cards')}
                type="button"
            >
                Cards
            </button>
            <button
                className={vista === 'tabla' ? 'activo' : ''}
                onClick={() => setVista('tabla')}
                type="button"
            >
                Tabla
            </button>
        </div>
    )
}
