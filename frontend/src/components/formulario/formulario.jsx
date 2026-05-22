import SelectDropdown from "../dropdown-menu/select-dropdown"
import DateField from "../dropdown-menu/date-field"
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
                                <SelectDropdown
                                    value={campo.value}
                                    options={campo.options}
                                    onChange={campo.onChange}
                                    placeholder={campo.placeholder}
                                />
                            ) : campo.type === 'date' ? (
                                <DateField
                                    name={campo.name}
                                    label={campo.label}
                                    value={campo.value}
                                    onChange={campo.onChange}
                                    required={campo.required}
                                />
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

                {children}


                <button
                    className="form-btn-create"
                    type="submit"
                    disabled={!valido || cargando}
                >
                    {cargando ? textoCargando : textoBoton}
                </button>
            </form>

        </aside>
    )
}

