const express = require('express')
const router = express.Router()
const { sugerirPrecioVenta, consultarPedidoIA, chatIA, scanearComprobante } = require('../controllers/ia.controller')

router.post('/chat', chatIA)
router.post('/precio-venta', sugerirPrecioVenta)
router.post('/scanear-comprobante', scanearComprobante)  

module.exports = router