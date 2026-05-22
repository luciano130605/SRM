export default function Toast({ mensaje, tipo = 'info', accion, textoAccion = 'Deshacer' }) {
    if (!mensaje) return null

    return (
        <div className={`app-toast app-toast-${tipo}`} role="status">
            <span>{mensaje}</span>
            {accion && (
                <button type="button" onClick={accion} className="app-toast-btn">
                    {textoAccion}
                </button>
            )}
        </div>
    )
}

