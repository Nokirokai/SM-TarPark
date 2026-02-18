export function SMLogoSVG({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 200 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blue background rectangle */}
      <rect width="200" height="100" fill="#1E40AF" rx="8"/>
      
      {/* SM Text */}
      <text 
        x="100" 
        y="70" 
        fontSize="72" 
        fontWeight="900" 
        fill="#FFFFFF" 
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
      >
        SM
      </text>
    </svg>
  );
}