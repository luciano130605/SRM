const express = require('express')
const router = express.Router()

const { login, registro, recuperarContrasena } = require('../controllers/auth.controller')

router.post('/login', login)
router.post('/registro', registro)
router.post('/recuperar-contrasena', recuperarContrasena)

module.exports = router
