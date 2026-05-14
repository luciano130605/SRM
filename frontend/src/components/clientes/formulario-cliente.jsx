import { useState } from "react"
import Formulario from "../formulario/formulario"

export default function FormularioCliente({ onCrear, creando }) {
    const [nombre, setNombre] = useState('')
    const [telefono, setTelefono] = useState('')
    const [direccion, setDireccion] = useState('')
    const [notas, setNotas] = useState('')
    const [instagram, setInstagram] = useState('')

    function handleCrear() {
        if (!valido) return
        onCrear({ nombre, telefono, direccion, notas, instagram }, () => {
            setNombre('')
            setTelefono('')
            setDireccion('')
            setNotas('')
            setInstagram('')
        })
    }

    const valido = nombre.trim() !== '' && (telefono.trim() !== '' || instagram.trim() !== '')

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
            name: 'instagram',
            label: 'Instagram',
            value: instagram,
            onChange: setInstagram,
            placeholder: '@usuario',
        },
        {
            name: 'telefono',
            label: 'Telefono',
            type: 'tel',
            value: telefono,
            onChange: setTelefono,
            placeholder: 'Ej. 11 1234-5678',
        },
        {
            name: 'direccion',
            label: 'Direccion',
            value: direccion,
            onChange: setDireccion,
            placeholder: 'Calle y numero',
        },
        {
            name: 'notas',
            label: 'Notas',
            value: notas,
            onChange: setNotas,
            placeholder: 'Preferencias, alergias...',
        },
    ]

    return (
        <Formulario
            titulo="Agregar cliente"
            campos={campos}
            textoBoton="Crear cliente"
            cargando={creando}
            valido={valido}
            onSubmit={handleCrear}
        />
    )
}
