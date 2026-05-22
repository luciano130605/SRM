import { useEffect, useRef, useState } from "react"

export function useTheme() {
    const [tema, setTema] = useState(() =>
        localStorage.getItem("srm_tema") || "light"
    )
    const rippleRef = useRef(null)

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", tema)
        localStorage.setItem("srm_tema", tema)
    }, [tema])

    function toggleTema(event) {
        const x = event?.clientX ?? window.innerWidth / 2
        const y = event?.clientY ?? window.innerHeight / 2

        const ripple = document.createElement("div")
        ripple.className = `theme-ripple${tema === "dark" ? " to-light" : ""}`

        const size = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        ) * 2

        ripple.style.width = `${size}px`
        ripple.style.height = `${size}px`
        ripple.style.left = `${x - size / 2}px`
        ripple.style.top = `${y - size / 2}px`

        document.body.appendChild(ripple)

        ripple.getBoundingClientRect()
        ripple.classList.add("animating")

        setTimeout(() => {
            setTema(prev => prev === "light" ? "dark" : "light")
            ripple.remove()
        }, 300)
    }

    return { tema, toggleTema }
}