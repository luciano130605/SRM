import * as React from "react";
const SVGComponent = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-chevrons-down-up-icon lucide-chevrons-down-up"
        {...props}
    >
        <path d="m7 20 5-5 5 5" />
        <path d="m7 4 5 5 5-5" />
    </svg>
);
export default SVGComponent;
