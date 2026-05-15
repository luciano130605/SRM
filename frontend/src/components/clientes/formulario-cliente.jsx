import { useState } from "react"
import Formulario from "../formulario/formulario"
import GestorMetodosContacto from "./gestor-metodos"
import X from "../../icons/X"

export default function FormularioCliente({ onCrear, creando, metodos = [], setMetodos, onError }) {
    const [nombre, setNombre] = useState('')
    const [direccion, setDireccion] = useState('')
    const [notas, setNotas] = useState('')
    const [contactos, setContactos] = useState({})

    function setValor(metodId, index, valor) {
        setContactos(prev => {
            const arr = [...(prev[metodId] ?? [''])]
            arr[index] = valor
            return { ...prev, [metodId]: arr }
        })
    }

    function agregarValor(metodId) {
        setContactos(prev => ({
            ...prev,
            [metodId]: [...(prev[metodId] ?? ['']), '']
        }))
    }

    function quitarValor(metodId, index) {
        setContactos(prev => {
            const arr = [...(prev[metodId] ?? [])]
            arr.splice(index, 1)
            return { ...prev, [metodId]: arr.length ? arr : [] }
        })
    }

    const valido = nombre.trim() !== ''

    function handleCrear() {
        if (!valido) return

        const contactosLimpios = Object.fromEntries(
            Object.entries(contactos)
                .map(([k, arr]) => [k, arr.filter(v => v.trim())])
                .filter(([, arr]) => arr.length > 0)
        )

        onCrear(
            { nombre, contactos: contactosLimpios, direccion, notas },
            () => {
                setNombre('')
                setDireccion('')
                setNotas('')
                setContactos({})
            }
        )
    }

    const campos = [
        {
            name: 'nombre',
            label: 'Nombre',
            required: true,
            value: nombre,
            onChange: setNombre,
            placeholder: 'Nombre completo',
        },
        {
            name: 'direccion',
            label: 'Dirección',
            value: direccion,
            onChange: setDireccion,
            placeholder: 'Calle y número',
        },
        {
            name: 'notas',
            label: 'Notas',
            value: notas,
            onChange: setNotas,
            placeholder: 'Preferencias, alergias...',
        },
    ]

    const seccionContactos = metodos.length > 0 && (
        <div>
            {metodos.map(metodo => {
                const valores = contactos[metodo.id] ?? ['']
                return (
                    <div key={metodo.id} className="form-label-Conteiner">
                        <label className="form-label">
                            <span>{metodo.icono}</span> {metodo.nombre}
                        </label>
                        {valores.map((val, i) => (
                            <div key={i} className="formulario-metodo-row">
                                <input
                                    className="form-input"
                                    value={val}
                                    onChange={e => setValor(metodo.id, i, e.target.value)}
                                    placeholder={`${metodo.nombre}...`}
                                />
                                {valores.length > 1 && (
                                    <button
                                        type="button"
                                        className="formulario-metodo-quitar"
                                        onClick={() => quitarValor(metodo.id, i)}
                                    ><X /></button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="formulario-metodo-agregar"
                            onClick={() => agregarValor(metodo.id)}
                        >
                            otro
                        </button>
                    </div>
                )
            })}
        </div>
    )

    return (
        <Formulario
            titulo="Agregar cliente"
            campos={campos}
            textoBoton="Crear cliente"
            cargando={creando}
            valido={valido}
            onSubmit={handleCrear}
        >
            {seccionContactos}
            <GestorMetodosContacto
                metodos={metodos}
                setMetodos={setMetodos}
                onError={onError}
            />
        </Formulario>
    )
}