const express = require('express')

const router = express.Router()

const {
    obtenerPedidos,
    crearPedido,
    editarPedido,
    actualizarEstadoPedido,
    eliminarPedido
} = require('../controllers/pedidos.controller')

router.get('/', obtenerPedidos)

router.post('/', crearPedido)

router.put('/:id', editarPedido)

router.patch('/:id', actualizarEstadoPedido)

router.delete('/:id', eliminarPedido)

module.exports = router
