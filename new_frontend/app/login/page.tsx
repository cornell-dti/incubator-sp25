"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="h-8 w-8 text-rose-500 mr-2" />
            <span className="text-2xl font-bold">SyllabusSync</span>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                className="h-4 w-4"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            )}
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
