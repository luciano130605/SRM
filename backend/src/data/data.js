const fs = require('fs')
const path = require('path')

const clientes = [
    {
        id: 1,
        nombre: "ej",
        telefono: "123",
        instagram: "@ej",
        direccion: "ejemplo 123",
        fechaPedido: "10/10/2026"
    }
]

const productos = [
    {
        id: 1,
        nombre: "torta de chocolate",
        categoriaId: 2,
        costo: 100,
        precioVenta: 500
    },
    {
        id: 2,
        nombre: "cookies de limon",
        categoriaId: 1,
        costo: 50,
        precioVenta: 200
    }
]

const categoriasDefault = [
    {
        id: 1,
        nombre: "Cookies",
        orden: 1
    },
    {
        id: 2,
        nombre: "Tortas",
        orden: 2
    }
]


const metodosDefault = [

]

const categoriasPath = path.join(__dirname, 'categorias.json')
const metodosPath = path.join(__dirname, 'metodos-contacto.json')



function cargarCategorias() {
    if (!fs.existsSync(categoriasPath)) return categoriasDefault

    try {
        const data = fs.readFileSync(categoriasPath, 'utf8')
        const categoriasGuardadas = JSON.parse(data)

        return Array.isArray(categoriasGuardadas)
            ? categoriasGuardadas
            : categoriasDefault
    } catch (error) {
        return categoriasDefault
    }
}

const categorias = cargarCategorias()

function guardarCategorias() {
    fs.writeFileSync(
        categoriasPath,
        JSON.stringify(categorias, null, 2)
    )
}

function cargarMetodos() {
    if (!fs.existsSync(metodosPath)) return metodosDefault
    try {
        const data = fs.readFileSync(metodosPath, 'utf8')
        const guardados = JSON.parse(data)
        return Array.isArray(guardados) ? guardados : metodosDefault
    } catch {
        return metodosDefault
    }
}

const metodosContacto = cargarMetodos()

function guardarMetodos() {
    fs.writeFileSync(metodosPath, JSON.stringify(metodosContacto, null, 2))
}

const pedidos = []

module.exports = { clientes, productos, pedidos, categorias, guardarCategorias, metodosContacto, guardarMetodos }
