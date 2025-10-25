import React from "react";

type SemiGaugeProps = {
    /** Value to display on the gauge */
    value: number;
    /** Lower bound (default 1) */
    min?: number;
    /** Upper bound (default 500) */
    max?: number;
    /** Pixel size of the square SVG view (default 240) */
    size?: number;
    /** Optional label shown under the needle value */
    label?: string;
    /** Optional color of the label */
    color?: string;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Semicircle Gauge:
 * - Green (left, min) → Red (right, max)
 * - Needle pivots from left (min) through top (mid) to right (max)
 * - Uses a smooth gradient stroke on the semicircular arc
 */
const SemiGauge: React.FC<SemiGaugeProps> = ({
    value,
    min = 1,
    max = 500,
    size = 240,
    label,
    color
}) => {
    // Normalize and clamp the value
    const v = clamp(value, min, max);
    const norm = (v - min) / (max - min); // 0 → 1

    // SVG geometry - adjusted for better proportions
    const vb = 200; // Reduced viewBox for better proportions
    const cx = 100; // Center X (half of viewBox width)
    const cy = 90;  // Move up to create space for the label below
    const r = 80;   // Adjusted radius
    const arcStroke = 14;

    // Needle geometry
    const needleLen = r - 5;
    // Angle mapping: min -> 180° (left), max -> 0° (right), mid -> 90° (up)
    const angleDeg = 180 - norm * 180;
    const theta = (angleDeg * Math.PI) / 180;
    const needleX = cx + needleLen * Math.cos(theta);
    // IMPORTANT: subtract since SVG y increases downward
    const needleY = cy - needleLen * Math.sin(theta);

    // Tick marks have been removed as per user request

    const format = (n: number) =>
        new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);


    return (
        <div className="w-full flex flex-col items-center gap-0">
            <svg
                viewBox={`0 0 ${vb} ${vb}`}
                width={size}
                height={size * 0.9}  // Reduce height to account for label
                className="block -mb-2"  // Pull up slightly
                role="img"
                aria-label={`Air quality gauge showing ${format(v)} on a scale from ${min} to ${max}`}
            >
                <defs>
                    {/* Gradient across the arc, left (green) → right (red) */}
                    <linearGradient id="gauge-grad" x1="0" y1={cy} x2={vb} y2={cy} gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#16a34a" />   {/* green-600 */}
                        <stop offset="35%" stopColor="#eab308" />  {/* yellow-500 */}
                        <stop offset="70%" stopColor="#f97316" />  {/* orange-500 */}
                        <stop offset="100%" stopColor="#dc2626" /> {/* red-600 */}
                    </linearGradient>

                    <filter id="needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity="0.25" />
                    </filter>

                    {/* Arrowhead marker */}
                    <marker
                        id="arrowhead"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path d="M0,0 L6,3 L0,6 Z" fill="white" />
                    </marker>
                </defs>

                {/* Background arc (track) */}
                <path
                    d={`M ${cx - r - 2} ${cy} A ${r + 2} ${r + 2} 0 0 1 ${cx + r + 2} ${cy}`}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeOpacity="0.15"
                    strokeWidth={arcStroke}
                    strokeLinecap="round"
                />

                {/* Foreground arc with gradient */}
                <path
                    d={`M ${cx - r - 2} ${cy} A ${r + 2} ${r + 2} 0 0 1 ${cx + r + 2} ${cy}`}
                    fill="none"
                    stroke="url(#gauge-grad)"
                    strokeWidth={arcStroke}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="none"
                />


                {/* Min and Max labels */}
                {/* Left (min) */}
                <text x={cx - r - 2} y={cy + 18} textAnchor="end" className="fill-slate-400 text-[11px] select-none">
                    {format(min)}
                </text>
                {/* Right (max) */}
                <text x={cx + r + 2} y={cy + 18} textAnchor="start" className="fill-slate-400 text-[11px] select-none">
                    {format(max)}
                </text>

                {/* Needle */}
                <g filter="url(#needle-shadow)">
                    <line
                        x1={cx}
                        y1={cy}
                        x2={needleX}
                        y2={needleY}
                        stroke="white"
                        strokeWidth={3}
                        strokeLinecap="round"
                        markerEnd="url(#arrowhead)"
                        style={{ transition: "x2 300ms ease, y2 300ms ease" }}
                    />
                    {/* Hub */}
                    <circle cx={cx} cy={cy} r="6" fill="white" />
                </g>
            </svg>

            {label && (
                <p className={`${color} text-center text-base font-medium -mt-1`}>
                    {label}
                </p>
            )}

            {/* Readout */}
            <div className="flex flex-col items-center">
                <div className="text-xl font-semibold tabular-nums">{format(v)}</div>
                <div className="text-xs text-slate-500 -mt-1">({min}–{max})</div>
            </div>

        </div>
    );
};

export default SemiGauge;