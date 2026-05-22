const express = require('express')
const router = express.Router()
const {
    obtenerEstados,
    crearEstado,
    eliminarEstado,
} = require('../controllers/estados-pedido.controller')

router.get('/', obtenerEstados)
router.post('/', crearEstado)
router.delete('/:id', eliminarEstado)

module.exports = router