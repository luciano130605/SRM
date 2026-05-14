export default function KPICard({ label, value, sub, money }) {
    return (
        <div className="kpi-card">
            <p className="kpi-label">{label}</p>
            <p className={`kpi-value${money ? ' money' : ''}`}>{value}</p>
            {sub && <p className="kpi-sub">{sub}</p>}
        </div>
    )
}