import { useState, useRef } from "react";
import { motion } from "motion/react";
import SparklesIcon from "../../icons/IaMovimiento";

export function SidebarExpandIcon({
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
}) {
    const [open, setOpen] = useState(false);

    return (
        <motion.svg
            onClick={() => setOpen(!open)}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer"
        >
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />

            <motion.path
                d="M9 4v16"
                animate={{
                    x: open ? -3 : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            <motion.path
                d="M15 10l-2 2l2 2"
                animate={{
                    x: open ? -2 : 0,
                    scale: open ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.svg>
    );
}

export function SidebarCollapseIcon({
    size = 24,
    color = "currentColor",
    strokeWidth = 2,
}) {
    const [closed, setClosed] = useState(false);

    return (
        <motion.svg
            onClick={() => setClosed(!closed)}
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-pointer"
        >
            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />

            <motion.path
                d="M15 4v16"
                animate={{
                    x: closed ? 3 : 0,
                }}
                transition={{ duration: 0.3 }}
            />

            <motion.path
                d="M9 10l2 2l-2 2"
                animate={{
                    x: closed ? 2 : 0,
                    scale: closed ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
            />
        </motion.svg>
    );
}

export default function PanelToggle({ abierto, onClick }) {
    const Icono = abierto ? SidebarCollapseIcon : SidebarExpandIcon
    const sparkleRef = useRef(null);

    return (
        <button
            className="side-panel-toggle"
            type="button"
            onClick={onClick}
            onMouseEnter={() => sparkleRef.current?.startAnimation()}
            onMouseLeave={() => sparkleRef.current?.stopAnimation()}
            title={abierto ? "Achicar panel" : "Expandir panel"}
            aria-label={abierto ? "Achicar panel lateral" : "Expandir panel lateral"}
        >
            <SparklesIcon size={17} ref={sparkleRef} aria-hidden="true" />
        </button>
    )
}
