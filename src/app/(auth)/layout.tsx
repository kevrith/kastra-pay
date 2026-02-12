import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/k-pay.png" alt="Kastra Pay" width={44} height={44} />
          <span className="font-bold text-2xl">Kastra Pay</span>
        </div>
        {children}
      </div>
    </div>
  );
}
