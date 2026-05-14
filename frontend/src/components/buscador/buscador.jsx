import Search from "../../icons/Search"
import "./buscador.css"

export default function Buscador({
    value,
    onChange,
    placeholder,
    inputRef,
    className = '',
}) {
    return (
        <div className={`buscador ${className}`.trim()}>
            <span className="buscador-icon"><Search /></span>
            <input
                ref={inputRef}
                placeholder={placeholder}
                value={value}
                onChange={event => onChange(event.target.value)}
            />
        </div>
    )
}
