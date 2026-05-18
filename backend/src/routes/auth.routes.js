const express = require('express')
const router = express.Router()

const { login, registro, recuperarContrasena, refrescarSesion } = require('../controllers/auth.controller')

router.post('/login', login)
router.post('/registro', registro)
router.post('/recuperar-contrasena', recuperarContrasena)
router.post('/refresh', refrescarSesion)

module.exports = router
