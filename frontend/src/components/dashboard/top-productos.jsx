import { useMemo } from "react"

export default function TopProductos({ pedidos }) {
    const top = useMemo(() => {
        const conteo = {}
        pedidos.forEach(ped => {
            (ped.items || ped.productos || []).forEach(item => {
                const key = item.productoId || item.nombre || 'Desconocido'
                const nombre = item.nombre || item.productoNombre || key
                const cat = item.categoria || ''
                if (!conteo[key]) conteo[key] = { nombre, cat, cant: 0 }
                conteo[key].cant += item.cantidad || 1
            })
        })
        return Object.values(conteo).sort((a, b) => b.cant - a.cant).slice(0, 6)
    }, [pedidos])

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Más vendidos</span>
                <span className="panel-head-badge">Top 6</span>
            </div>

            {top.length === 0
                ? <p className="dash-empty">Sin datos de ventas.</p>
                : top.map((p, i) => (
                    <div key={p.nombre} className="top-prod-row">
                        <span className="top-prod-num">{i + 1}</span>
                        <div className="top-prod-info">
                            <p className="top-prod-nombre">{p.nombre}</p>
                            {p.cat && <p className="top-prod-cat">{p.cat}</p>}
                        </div>
                        <div className="top-prod-cant">
                            {p.cant}
                            <span>unidades</span>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}