import "./formulario.css"

export default function Formulario({
    titulo,
    campos,
    textoBoton,
    textoCargando = 'Guardando...',
    cargando = false,
    valido = true,
    onSubmit,
    children,
}) {
    function handleSubmit(event) {
        event.preventDefault()
        if (!valido || cargando) return
        onSubmit()
    }

    return (
        <aside className="form-panel">
            <h2 className="panel-title">{titulo}</h2>

            <form onSubmit={handleSubmit}>
                {campos.map(campo => (
                    campo.render ? (
                        <div key={campo.name || campo.label} className="form-label-Conteiner">
                            {campo.render()}
                        </div>
                    ) : (
                        <div key={campo.name || campo.label} className="form-label-Conteiner">
                            <label
                                className={`form-label${campo.required ? ' required' : ''}`}
                                htmlFor={campo.name}
                                title={campo.required ? 'Campo obligatorio' : undefined}
                            >
                                {campo.label}
                            </label>

                            {campo.type === 'select' ? (
                                <select
                                    id={campo.name}
                                    name={campo.name}
                                    className="form-input"
                                    value={campo.value}
                                    onChange={event => campo.onChange(event.target.value)}
                                >
                                    {campo.options.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id={campo.name}
                                    name={campo.name}
                                    ref={campo.inputRef}
                                    className="form-input"
                                    type={campo.type || 'text'}
                                    placeholder={campo.placeholder}
                                    value={campo.value}
                                    min={campo.min}
                                    step={campo.step}
                                    onChange={event => campo.onChange(event.target.value)}
                                />
                            )}
                        </div>
                    )
                ))}

                <button
                    className="form-btn-create"
                    type="submit"
                    disabled={!valido || cargando}
                >
                    {cargando ? textoCargando : textoBoton}
                </button>
            </form>

            {children}
        </aside>
    )
}
