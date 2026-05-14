import { useEffect, useRef, useState } from "react"

export default function useEliminacionDeshacer({
    nombreSingular,
    nombrePlural,
    setItems,
    eliminarEnServidor,
    onError,
    getId = item => item.id,
    duracion = 5000,
}) {
    const [toastDeshacer, setToastDeshacer] = useState(null)
    const accionPendienteRef = useRef(null)

    async function confirmarAccionPendiente() {
        const accion = accionPendienteRef.current

        if (!accion) return

        clearTimeout(accion.timer)
        accionPendienteRef.current = null
        setToastDeshacer(null)

        try {
            await Promise.all(accion.items.map(eliminarEnServidor))
        } catch (error) {
            onError?.('No se pudo confirmar la eliminacion.')
        }
    }

    function deshacerEliminacion() {
        const accion = accionPendienteRef.current

        if (!accion) return

        clearTimeout(accion.timer)
        accionPendienteRef.current = null
        setToastDeshacer(null)

        if (accion.tipo === 'limpiar') {
            setItems(accion.items)
            return
        }

        setItems(prev => {
            const item = accion.items[0]

            if (prev.some(actual => String(getId(actual)) === String(getId(item)))) {
                return prev
            }

            const restaurados = [...prev]
            restaurados.splice(accion.index, 0, item)
            return restaurados
        })
    }

    function programarEliminacion(accion) {
        const timer = setTimeout(() => {
            confirmarAccionPendiente()
        }, duracion)

        accionPendienteRef.current = { ...accion, timer }
        setToastDeshacer({
            mensaje: accion.tipo === 'limpiar'
                ? `${accion.items.length} ${nombrePlural} eliminados.`
                : `${nombreSingular} eliminado.`
        })
    }

    async function eliminarItem(item, index) {
        if (!item) return

        await confirmarAccionPendiente()

        setItems(prev => prev.filter(actual => String(getId(actual)) !== String(getId(item))))
        programarEliminacion({
            tipo: 'item',
            items: [item],
            index
        })
    }

    async function limpiarItems(items) {
        if (items.length === 0) return

        await confirmarAccionPendiente()

        setItems([])
        programarEliminacion({
            tipo: 'limpiar',
            items: [...items]
        })
    }

    useEffect(() => {
        return () => {
            if (accionPendienteRef.current) {
                clearTimeout(accionPendienteRef.current.timer)
            }
        }
    }, [])

    return {
        toastDeshacer,
        confirmarAccionPendiente,
        deshacerEliminacion,
        eliminarItem,
        limpiarItems,
    }
}
