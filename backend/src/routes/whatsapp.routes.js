const express = require('express')
const router = express.Router()
const { conectar, estado, eventos, enviar, desconectar } = require('../controllers/whatsapp.controller')

router.post('/conectar', conectar)
router.get('/estado', estado)
router.get('/eventos', eventos)   
router.post('/enviar', enviar)
router.post('/desconectar', desconectar)

module.exports = router