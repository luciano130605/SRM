import * as React from "react";

const SVGComponent = ({ size = 12, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ marginLeft: "1px" }}
        {...props}
    >
        <g clipPath="url(#clip0_4418_9818)">
            <path
                d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.75 11.9999L10.58 14.8299L16.25 9.16992"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
        <defs>
            <clipPath id="clip0_4418_9818">
                <rect width={24} height={24} fill="currentColor" />
            </clipPath>
        </defs>
    </svg>
)

export default SVGComponent