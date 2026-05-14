const { categorias, guardarCategorias } = require('../data/data')
const { v4: uuidv4 } = require('uuid')

function obtenerCategorias(req, res) {
    res.status(200).json({
        ok: true,
        data: categorias.sort((a, b) => (a.orden || 0) - (b.orden || 0))
    })
}

function crearCategoria(req, res) {
    try {
        const { nombre } = req.body

        if (!nombre) {
            return res.status(400).json({
                ok: false,
                mensaje: "Falta el nombre"
            })
        }

        const existe = categorias.find(
            c => c.nombre.toLowerCase() === nombre.toLowerCase()
        )

        if (existe) {
            return res.status(400).json({
                ok: false,
                mensaje: "La categoría ya existe"
            })
        }

        const nuevaCategoria = {
            id: uuidv4(),
            nombre,
            orden: categorias.length
                ? Math.max(...categorias.map(c => c.orden || 0)) + 1
                : 1
        }

        categorias.push(nuevaCategoria)
        guardarCategorias()

        res.status(200).json({
            ok: true,
            data: nuevaCategoria
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error servidor"
        })
    }
}

function eliminarCategoria(req, res) {
    try {
        const { id } = req.params

        const index = categorias.findIndex(c => String(c.id) === id)

        if (index === -1) {
            return res.status(404).json({
                ok: false,
                mensaje: "Categoría no encontrada"
            })
        }

        categorias.splice(index, 1)
        categorias.forEach((categoria, index) => {
            categoria.orden = index + 1
        })
        guardarCategorias()

        res.status(200).json({
            ok: true,
            mensaje: "Categoría eliminada"
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error servidor"
        })
    }
}

function reordenarCategorias(req, res) {
    try {
        const { orden } = req.body

        if (!Array.isArray(orden)) {
            return res.status(400).json({
                ok: false,
                mensaje: "Falta el orden"
            })
        }

        const idsActuales = categorias.map(c => String(c.id))
        const idsRecibidos = orden.map(id => String(id))
        const mismosIds =
            idsActuales.length === idsRecibidos.length &&
            idsActuales.every(id => idsRecibidos.includes(id))

        if (!mismosIds) {
            return res.status(400).json({
                ok: false,
                mensaje: "El orden no coincide con las categorias existentes"
            })
        }

        orden.forEach((id, index) => {
            const categoria = categorias.find(c => String(c.id) === String(id))
            categoria.orden = index + 1
        })

        categorias.sort((a, b) => (a.orden || 0) - (b.orden || 0))
        guardarCategorias()

        res.status(200).json({
            ok: true,
            data: categorias
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error servidor"
        })
    }
}

module.exports = {
    obtenerCategorias,
    crearCategoria,
    reordenarCategorias,
    eliminarCategoria
}
