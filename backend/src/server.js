require('dotenv').config()
const express = require('express')
const cors = require('cors')

const clientesRoutes = require('./routes/clientes.routes')
const productosRoutes = require('./routes/productos.routes')
const pedidosRoutes = require('./routes/pedidos.routes')
const categoriasRoutes = require('./routes/categorias.routes')
const metodosContactoRouter = require('./routes/metodos-contacto.routes')
const authRoutes = require('./routes/auth.routes')
const iaRoutes = require('./routes/ia.routes')
const requiereAuth = require('./middlewares/auth.middleware')

const app = express()

const PORT = 3011
const HOST = '127.0.0.1'

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Servidor SRM')
})

app.use('/auth', authRoutes)
app.use(requiereAuth)

app.use('/clientes', clientesRoutes)
app.use('/productos', productosRoutes)
app.use('/pedidos', pedidosRoutes)
app.use('/categorias', categoriasRoutes)
app.use('/metodos-contacto', metodosContactoRouter)
app.use('/ia', iaRoutes)

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`)
})
