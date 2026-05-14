const { clientes } = require('../data/data')
const { v4: uuidv4 } = require('uuid')

function obtenerClientes(req, res) {
    res.status(200).json({
        ok: true,
        data: clientes
    })
}

function crearCliente(req, res) {
    try {
        const { nombre, telefono, instagram, direccion, notas } = req.body

        if (!nombre || (!telefono && !instagram)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Faltan datos"
            })
        }

        const nuevoCliente = {
            id: uuidv4(),
            nombre,
            telefono,
            instagram,
            direccion,
            notas,
            fechaPedido: new Date().toISOString()
        }

        clientes.push(nuevoCliente)

        res.status(200).json({
            ok: true,
            data: nuevoCliente
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error servidor"
        })
    }
}

function editarCliente(req, res) {
    const { id } = req.params
    const { nombre, telefono, instagram, direccion, notas } = req.body

    if (!nombre || (!telefono && !instagram)) {
        return res.status(400).json({
            ok: false,
            mensaje: "Faltan datos"
        })
    }

    const indice = clientes.findIndex(cliente => String(cliente.id) === String(id))

    if (indice === -1) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Cliente no encontrado'
        })
    }

    clientes[indice] = {
        ...clientes[indice],
        nombre,
        telefono,
        instagram,
        direccion,
        notas
    }

    res.status(200).json({
        ok: true,
        data: clientes[indice]
    })
}

function eliminarCliente(req, res) {
    const { id } = req.params
    const indice = clientes.findIndex(cliente => String(cliente.id) === String(id))

    if (indice === -1) {
        return res.status(404).json({
            ok: false,
            mensaje: 'Cliente no encontrado'
        })
    }

    clientes.splice(indice, 1)

    res.status(200).json({
        ok: true,
        mensaje: 'Cliente eliminado'
    })
}

module.exports = { obtenerClientes, crearCliente, editarCliente, eliminarCliente }
