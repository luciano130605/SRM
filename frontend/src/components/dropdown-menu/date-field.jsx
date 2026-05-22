import { useEffect, useMemo, useRef, useState } from "react"
import ArrowLeft from "../../icons/ArrowLeft"
import ArrowRight from "../../icons/ArrowRight"

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

export default function DateField({ value, onChange, name }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    const today = new Date()

    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [currentYear, setCurrentYear] = useState(today.getFullYear())

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function format(dateStr) {
        if (!dateStr) return "Seleccionar fecha"
        const [y, m, d] = dateStr.split("-")
        return `${d}/${m}/${y}`
    }

    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate()
    }

    function firstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay()
    }

    function selectDay(day) {
        const mm = String(currentMonth + 1).padStart(2, "0")
        const dd = String(day).padStart(2, "0")
        onChange(`${currentYear}-${mm}-${dd}`)
        setOpen(false)
    }

    function prevMonth() {
        setCurrentMonth(prev => {
            if (prev === 0) {
                setCurrentYear(y => y - 1)
                return 11
            }
            return prev - 1
        })
    }

    function nextMonth() {
        setCurrentMonth(prev => {
            if (prev === 11) {
                setCurrentYear(y => y + 1)
                return 0
            }
            return prev + 1
        })
    }

    const days = useMemo(() => {
        const total = daysInMonth(currentYear, currentMonth)
        const start = firstDayOfMonth(currentYear, currentMonth)

        const arr = []

        for (let i = 0; i < start; i++) arr.push(null)
        for (let d = 1; d <= total; d++) arr.push(d)

        return arr
    }, [currentMonth, currentYear])

    return (
        <div className="toolbar-dropdown" ref={ref}>
            <button
                type="button"
                style={{ width: "300px" }}
                className="form-input btn-date"
                onClick={() => setOpen(v => !v)}
            >
                {format(value)}
            </button>

            {open && (
                <div className="dropdown-menu calendar">
                    <div className="calendar-header">
                        <button onClick={prevMonth} style={{ color: "var(--black)" }}><ArrowLeft /></button>

                        <div className="calendar-title">
                            {MONTHS[currentMonth]} {currentYear}
                        </div>

                        <button onClick={nextMonth} style={{ color: "var(--black)" }}><ArrowRight /></button>
                    </div>

                    <div className="calendar-grid">
                        {["D", "L", "M", "X", "J", "V", "S"].map(d => (
                            <div key={d} className="calendar-weekday">{d}</div>
                        ))}

                        {days.map((day, i) => (
                            <button
                                key={i}
                                disabled={!day}
                                className={`calendar-day ${!day ? "empty" : ""}`}
                                onClick={() => day && selectDay(day)}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}