import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <Card className="border-2 shadow-2xl">
      <CardHeader className="text-center space-y-2 pb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-500 to-green-600 bg-clip-text text-transparent">Welcome Back</CardTitle>
        <CardDescription className="text-base">Sign in to your Kastra Pay account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-6 text-center text-sm">
          <Link
            href="/forgot-password"
            className="text-primary hover:underline font-medium"
          >
            Forgot your password?
          </Link>
        </div>
        <div className="mt-3 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
