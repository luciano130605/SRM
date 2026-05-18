const express = require('express')
const router = express.Router()

const { sugerirPrecioVenta } = require('../controllers/ia.controller')

router.post('/precio-venta', sugerirPrecioVenta)

module.exports = router
