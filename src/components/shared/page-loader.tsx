export default function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-24 h-24">
          {/* Logo with pulse */}
          <img 
            src="/k-pay.png" 
            alt="Loading" 
            className="w-24 h-24 object-contain animate-pulse"
          />
          {/* Spinning border */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" 
               style={{ animationDuration: '1s' }} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-foreground">Loading</p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
