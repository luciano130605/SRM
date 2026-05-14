const express = require('express')
const router = express.Router()

const { obtenerProductos, crearProducto, eliminarProducto, editarProducto } = require('../controllers/productos.controller')

router.get('/', obtenerProductos)

router.post('/', crearProducto)

router.put('/:id', editarProducto)

router.delete('/:id', eliminarProducto)

module.exports = router
