const express = require('express')
const router = express.Router()

const {
    obtenerCategorias,
    crearCategoria,
    reordenarCategorias,
    eliminarCategoria
} = require('../controllers/categorias.controller')

router.get('/', obtenerCategorias)
router.post('/', crearCategoria)
router.put('/orden', reordenarCategorias)
router.delete('/:id', eliminarCategoria)

module.exports = router
