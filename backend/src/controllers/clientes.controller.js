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
        const { nombre, telefono, instagram, direccion } = req.body

        if (!nombre || !telefono) {
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

module.exports = { obtenerClientes, crearCliente }