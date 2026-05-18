import { forwardRef, useCallback, useImperativeHandle } from "react";
import { motion, useAnimate } from "framer-motion";

const ClearMovimiento = forwardRef(function ClearMovimiento(
    { size = 18, color = "currentColor" },
    ref
) {
    const [scope, animate] = useAnimate();

    const startAnimation = useCallback(() => {
        animate(
            ".broom",
            {
                rotate: [-8, 16, -12, 10, 0],
                x: [0, 2, -2, 1, 0],
                y: [0, -1, 1, 0, 0],
            },
            {
                duration: 0.72,
                ease: "easeInOut",
            }
        );

        animate(
            ".bristle",
            {
                pathLength: [1, 0.45, 1],
                opacity: [1, 0.55, 1],
            },
            {
                duration: 0.42,
                delay: 0.12,
                ease: "easeOut",
            }
        );

        animate(
            ".sweep-dust",
            {
                x: [0, 6, 11],
                opacity: [0, 1, 0],
                scale: [0.7, 1, 0.65],
            },
            {
                duration: 0.62,
                delay: 0.08,
                ease: "easeOut",
            }
        );
    }, [animate]);

    const stopAnimation = useCallback(() => {
        animate(".broom", { rotate: 0, x: 0, y: 0 }, { duration: 0.18 });
        animate(".bristle", { pathLength: 1, opacity: 1 }, { duration: 0.18 });
        animate(".sweep-dust", { x: 0, opacity: 0, scale: 0.7 }, { duration: 0.12 });
    }, [animate]);

    useImperativeHandle(ref, () => ({
        startAnimation,
        stopAnimation,
    }));

    return (
        <motion.svg
            ref={scope}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
        >
            <motion.g className="broom" style={{ originX: "50%", originY: "70%" }}>
                <path
                    d="M9.87006 5.66912L6.45006 7.74914L4.89007 5.18914C4.32007 4.24914 4.62006 3.00914 5.56006 2.43914C6.50006 1.86914 7.74006 2.16913 8.31006 3.10913L9.87006 5.66912Z"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M11.82 9.1596L8.66 11.0796C6.82 12.1996 6.25999 14.4596 7.14999 16.2596L9.19999 20.4396C9.85999 21.7896 11.46 22.2596 12.74 21.4696L19.17 17.5596C20.46 16.7796 20.77 15.1496 19.88 13.9396L17.11 10.1996C15.91 8.57964 13.66 8.0396 11.82 9.1596Z"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M10.7567 5.09815L5.63208 8.21875L7.71248 11.6351L12.8371 8.51455L10.7567 5.09815Z"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <motion.path
                    className="bristle"
                    d="M14.3101 16.8105L15.9601 19.5206"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <motion.path
                    className="bristle"
                    d="M11.75 18.3691L13.4 21.0792"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <motion.path
                    className="bristle"
                    d="M16.87 15.25L18.52 17.96"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </motion.g>

            <motion.g className="sweep-dust" initial={{ opacity: 0, scale: 0.7 }}>
                <circle cx="3.4" cy="19" r="0.75" fill={color} />
                <circle cx="5.8" cy="20.4" r="0.45" fill={color} />
                <path
                    d="M2.7 21.2H7.5"
                    stroke={color}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                />
            </motion.g>
        </motion.svg>
    );
});

export default ClearMovimiento;
