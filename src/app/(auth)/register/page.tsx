import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <Card className="border-2 shadow-2xl">
      <CardHeader className="text-center space-y-2 pb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">Create Account</CardTitle>
        <CardDescription className="text-base">
          Join Kastra Pay and start accepting payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <RegisterForm />
        </Suspense>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
