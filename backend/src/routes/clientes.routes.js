const express = require('express')
const router = express.Router()

const { obtenerClientes, crearCliente, editarCliente, eliminarCliente } = require('../controllers/clientes.controller')

router.get('/', obtenerClientes)
router.post('/', crearCliente)
router.put('/:id', editarCliente)
router.delete('/:id', eliminarCliente)

module.exports = router
