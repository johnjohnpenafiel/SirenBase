import { cn } from "@/lib/utils";

interface CheckmarkAnimationProps {
  className?: string;
  size?: number;
}

export function CheckmarkAnimation({
  className,
  size = 64,
}: CheckmarkAnimationProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      role="img"
      aria-label="Success"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Green circle background */}
        <circle
          cx="32"
          cy="32"
          r="30"
          className="fill-green-500 animate-scale-circle"
          style={{ transformOrigin: "center" }}
        />
        {/* White checkmark */}
        <polyline
          points="20,34 28,42 44,24"
          className="animate-draw-checkmark"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: 36,
            strokeDashoffset: 36,
          }}
        />
      </svg>
    </div>
  );
}
