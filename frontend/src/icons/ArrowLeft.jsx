

import * as React from "react";

const SVGComponent = ({ size = 12, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ marginLeft: "1px", position: "relative", top: "2" }}
        {...props}
    >
        <path d="M14.9998 19.9201L8.47984 13.4001C7.70984 12.6301 7.70984 11.3701 8.47984 10.6001L14.9998 4.08008" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />

    </svg>
)

export default SVGComponent