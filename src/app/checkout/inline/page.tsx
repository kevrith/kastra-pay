export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import InlineCheckoutClient from "./inline-checkout-client";

export default function InlineCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      }
    >
      <InlineCheckoutClient />
    </Suspense>
  );
}
