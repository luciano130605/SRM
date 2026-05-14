import { useMemo } from "react"
import formatPrecio from "./format-precio"

/**
 * GraficaVentas — barras SVG animadas de ingresos por mes (últimos 6)
 * Props: pedidos[]
 */
export default function GraficaVentas({ pedidos }) {
    const datos = useMemo(() => {
        const meses = {}
        pedidos.forEach(p => {
            if ((p.estado || '').toLowerCase() === 'cancelado') return
            const fecha = new Date(p.fecha || p.createdAt)
            if (isNaN(fecha)) return
            const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
            meses[key] = (meses[key] || 0) + (parseFloat(p.total) || 0)
        })

        return Object.entries(meses)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([key, total]) => {
                const [year, month] = key.split('-')
                const label = new Date(Number(year), Number(month) - 1)
                    .toLocaleDateString('es-AR', { month: 'short' })
                    .replace('.', '')
                return { label, total }
            })
    }, [pedidos])

    if (datos.length === 0) {
        return (
            <div className="dash-panel">
                <div className="panel-head">
                    <span className="panel-head-title">Ingresos por mes</span>
                    <span className="panel-head-badge">Últimos 6</span>
                </div>
                <p className="dash-empty">Sin datos suficientes.</p>
            </div>
        )
    }

    const maxVal  = Math.max(...datos.map(d => d.total), 1)
    const H       = 130   // chart height px
    const BAR_W   = 36
    const GAP     = 16
    const PAD_L   = 4
    const totalW  = datos.length * (BAR_W + GAP) - GAP + PAD_L

    return (
        <div className="dash-panel">
            <div className="panel-head">
                <span className="panel-head-title">Ingresos por mes</span>
                <span className="panel-head-badge">Últimos 6</span>
            </div>

            <div className="grafica-wrap">
                <svg
                    viewBox={`0 0 ${totalW} ${H + 42}`}
                    className="grafica-svg"
                    aria-label="Gráfica de ingresos mensuales"
                >
                    <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#C8435A" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#E8899A" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="barGradDim" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#DDD9D0" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#EDEBE5" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>

                    {/* Líneas guía horizontales */}
                    {[0.25, 0.5, 0.75, 1].map(frac => {
                        const y = H - H * frac
                        return (
                            <line key={frac}
                                x1={PAD_L} y1={y}
                                x2={totalW} y2={y}
                                stroke="#EDEBE5"
                                strokeWidth={1}
                            />
                        )
                    })}

                    {datos.map((d, i) => {
                        const isLast = i === datos.length - 1
                        const barH   = Math.max((d.total / maxVal) * H, 4)
                        const x      = PAD_L + i * (BAR_W + GAP)
                        const y      = H - barH

                        return (
                            <g key={d.label}>
                                {/* Barra */}
                                <rect
                                    x={x} y={y}
                                    width={BAR_W} height={barH}
                                    rx={6}
                                    fill={isLast ? 'url(#barGrad)' : 'url(#barGradDim)'}
                                    style={{
                                        animation: `growBar 0.6s cubic-bezier(.22,1,.36,1) ${i * 0.08}s both`,
                                    }}
                                />

                                {/* Valor encima — solo en la barra más alta o la última */}
                                {(isLast || d.total === maxVal) && (
                                    <text
                                        x={x + BAR_W / 2} y={y - 6}
                                        textAnchor="middle"
                                        fontSize={8.5}
                                        fill="#C8435A"
                                        fontFamily="'Outfit', sans-serif"
                                        fontWeight={600}
                                        letterSpacing={0.3}
                                    >
                                        ${formatPrecio(d.total)}
                                    </text>
                                )}

                                {/* Etiqueta mes */}
                                <text
                                    x={x + BAR_W / 2} y={H + 18}
                                    textAnchor="middle"
                                    fontSize={10}
                                    fill="#9A948C"
                                    fontFamily="'Outfit', sans-serif"
                                    fontWeight={400}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {d.label}
                                </text>
                            </g>
                        )
                    })}

                    <style>{`
                        @keyframes growBar {
                            from { transform: scaleY(0); transform-origin: bottom; }
                            to   { transform: scaleY(1); transform-origin: bottom; }
                        }
                    `}</style>
                </svg>
            </div>
        </div>
    )
}