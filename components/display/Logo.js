export default function Logo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#FF6B35", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#FF8E64", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M100 20C55.8 20 20 55.8 20 100s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80zm0 140c-33.1 0-60-26.9-60-60s26.9-60 60-60 60 26.9 60 60-26.9 60-60 60z"
        fill="url(#logoGradient)"
      />
      <path
        d="M100 50c-27.6 0-50 22.4-50 50s22.4 50 50 50 50-22.4 50-50-22.4-50-50-50zm0 85c-19.3 0-35-15.7-35-35s15.7-35 35-35 35 15.7 35 35-15.7 35-35 35z"
        fill="url(#logoGradient)"
      />
      <circle cx="100" cy="100" r="15" fill="#FF6B35" />
      <path
        d="M100 70l10 20h-20z"
        fill="#FFFFFF"
        transform="rotate(180 100 100) translate(0 -45)"
      />
    </svg>
  );
}
