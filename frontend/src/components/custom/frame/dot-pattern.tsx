export const DotPattern = ({
  className,
  color = "#FFD700" /* Default Yellow */,
}: {
  className?: string;
  color?: string;
}) => (
  <svg
    className={`absolute ${className}`}
    width="100" // Adjust size as needed
    height="100"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {Array.from({ length: 4 }).map((_, r) =>
      Array.from({ length: 4 }).map((_, c) => (
        <circle
          key={`${r}-${c}`}
          cx={15 + c * 20} // Adjust spacing
          cy={15 + r * 20}
          r="4" // Adjust dot size
          fill={color}
        />
      ))
    )}
  </svg>
);
