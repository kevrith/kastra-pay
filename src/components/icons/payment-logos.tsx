export function MpesaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="80" rx="8" fill="#00A651"/>
      <text x="100" y="50" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="white" textAnchor="middle">M-PESA</text>
    </svg>
  );
}

export function CardLogos({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img src="/Visa.png" alt="Visa" className="h-12 w-auto" />
      <img src="/MasterCard_Logo.svg" alt="Mastercard" className="h-14 w-auto" />
    </div>
  );
}
