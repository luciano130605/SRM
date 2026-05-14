import Comand from "../../icons/Comand"
import X from "../../icons/X"

const comandos = [
    { teclas: 'Ctrl + H', accion: 'Buscar productos' },
    { teclas: 'Ctrl + M', accion: 'Cambiar Cards / Tabla' },
    { teclas: 'Ctrl + E', accion: 'Exportar sheet' },
    { teclas: 'Ctrl + I', accion: 'Importar sheet' },
    { teclas: 'Ctrl + Z', accion: 'Deshacer eliminacion' },
    { teclas: 'Ctrl + /', accion: 'Ver comandos' },
    { teclas: 'Esc', accion: 'Cerrar ventanas' }
]

export default function Comandos({ abierto, setAbierto }) {
    return (
        <>
            <div className="command-switch" aria-label="Comandos de teclado">
                <button
                    onClick={() => setAbierto(true)}
                    type="button"
                    title="Ver comandos de teclado"
                >
                    <Comand />
                </button>
            </div>

            {abierto && (
                <div
                    className="shortcuts-backdrop"
                    onClick={() => setAbierto(false)}
                >
                    <div
                        className="shortcuts-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="shortcuts-header">
                            <h3>Comandos</h3>

                            <button
                                type="button"
                                onClick={() => setAbierto(false)}
                            >
                                <X />
                            </button>
                        </div>

                        <div className="shortcuts-list">
                            {comandos.map(comando => (
                                <div
                                    key={comando.teclas}
                                    className="shortcut-item"
                                >
                                    <kbd>{comando.teclas}</kbd>
                                    <span>{comando.accion}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}