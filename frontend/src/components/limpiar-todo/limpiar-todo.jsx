import "./limpiar-todo.css"

export default function LimpiarTodo({ onLimpiar, disabled, titulo = 'Eliminar todos' }) {
    return (
        <div className="danger-switch" aria-label={titulo}>
            <button
                onClick={onLimpiar}
                disabled={disabled}
                type="button"
                title={titulo}
            >
                Limpiar todo
            </button>
        </div>
    )
}
