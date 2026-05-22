export default function BotAnimado({ size = 14 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="bot-animado"
            aria-hidden="true"
        >
            <g className="bot-antena">
                <path d="M12 8V4H8" />
            </g>

            <rect width="16" height="12" x="4" y="8" rx="2" />

            <path className="bot-oreja bot-oreja--izq" d="M2 14h2" />
            <path className="bot-oreja bot-oreja--der" d="M20 14h2" />

            <circle className="bot-ojo bot-ojo--izq" cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
            <circle className="bot-ojo bot-ojo--der" cx="15" cy="14" r="1" fill="currentColor" stroke="none" />

            <rect className="bot-parpado bot-parpado--izq" x="7.8" y="12.8" width="2.4" height="2.4" rx="0.4" fill="currentColor" stroke="none" />
            <rect className="bot-parpado bot-parpado--der" x="13.8" y="12.8" width="2.4" height="2.4" rx="0.4" fill="currentColor" stroke="none" />
        </svg>
    )
}