const express = require('express')
const cors = require('cors')

const clientesRoutes = require('./routes/clientes.routes')
const productosRoutes = require('./routes/productos.routes')
const pedidosRoutes = require('./routes/pedidos.routes')

const app = express()

const PORT = 3011
const HOST = '127.0.0.1'

app.use(cors())
app.use(express.json())

app.use('/clientes', clientesRoutes)
app.use('/productos', productosRoutes)
app.use('/pedidos', pedidosRoutes)


app.get('/', (req, res) => {
    res.send("Servidor SRM")
})

app.listen(PORT, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`)
})