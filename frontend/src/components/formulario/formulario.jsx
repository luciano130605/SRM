import SelectDropdown from "../dropdown-menu/select-dropdown"
import DateField from "../dropdown-menu/date-field"
import { useState } from "react"
import ArrowUp from "../../icons/ArrowUp2"
import ArrowDown from "../../icons/ArrowDown2"


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
    const [minimizado, setMinimizado] = useState(false)
    function handleSubmit(event) {
        event.preventDefault()
        if (!valido || cargando) return
        onSubmit()
    }

    return (
        <aside className={`form-panel ${minimizado ? "min" : ""}`}>

            <div className="form-header">
                <h2 className="panel-title">{titulo}</h2>

                <button
                    type="button"
                    className="form-minimize-btn"
                    onClick={() => setMinimizado(prev => !prev)}
                    aria-label="Minimizar formulario"
                >
                
                    {minimizado ? <ArrowUp /> : <ArrowDown />}
                </button>
            </div>

            {!minimizado && (
                <form onSubmit={handleSubmit}>
                    {campos.map(campo => (
                        campo.render ? (
                            <div key={campo.name || campo.label} className="form-label-Conteiner">
                                {campo.render()}
                            </div>
                        ) : (
                            <div key={campo.name || campo.label} className="form-label-Conteiner">
                                <label className={`form-label${campo.required ? ' required' : ''}`}>
                                    {campo.label}
                                </label>

                                {campo.type === 'select' ? (
                                    <SelectDropdown {...campo} />
                                ) : campo.type === 'date' ? (
                                    <DateField {...campo} />
                                ) : (
                                    <input
                                        className="form-input"
                                        type={campo.type || 'text'}
                                        value={campo.value}
                                        onChange={e => campo.onChange(e.target.value)}
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
            )}
        </aside>
    )
}

