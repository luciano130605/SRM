
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
        <path d="M8.90991 19.9201L15.4299 13.4001C16.1999 12.6301 16.1999 11.3701 15.4299 10.6001L8.90991 4.08008" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />


    </svg>
)

export default SVGComponent