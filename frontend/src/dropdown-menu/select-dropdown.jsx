import DropdownMenu from "./dropdown-menu"
import { useState } from "react"
export default function SelectDropdown({ value, options, onChange, placeholder }) {
    const [abierto, setAbierto] = useState(false)

    const label =
        options.find(o => o.value === value)?.label || placeholder

    return (
        <div className="custom-select">
            <button
                type="button"
                onClick={() => setAbierto(v => !v)}
                className="form-input"
            >
                {label}
            </button>

            <DropdownMenu
                abierto={abierto}
                opciones={options}
                onCerrar={() => setAbierto(false)}
                onSeleccionar={(opt) => {
                    onChange(opt.value)
                    setAbierto(false)
                }}
            />
        </div>
    )
}