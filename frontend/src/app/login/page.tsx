"use client";

import React, { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

// Helper component to safely read search params within a Suspense boundary
function RedirectFromParams({ setRedirectTo }: { setRedirectTo: React.Dispatch<React.SetStateAction<string>> }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectedFrom = searchParams.get("redirectedFrom");
    if (redirectedFrom) setRedirectTo(redirectedFrom);
  }, [searchParams, setRedirectTo]);

  return null;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState("/dashboard");
  const [showUnverifiedNote, setShowUnverifiedNote] = useState(false);

  // Search params are handled in the Suspense-wrapped helper above

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error, errorCode } = await signIn(email, password);

      if (error) {
        // Show a helpful note if the email hasn't been verified yet
        const looksUnverified =
          errorCode === 'email_not_confirmed' || /confirm/i.test(error);
        setShowUnverifiedNote(looksUnverified);
        toast.error(error);
        return;
      }

      toast.success("Successfully signed in!");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0424] to-[#18314F] text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-sm border-white/20 bg-[#18314F] text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Suspense boundary required for hooks like useSearchParams during prerender */}
          <Suspense fallback={null}>
            <RedirectFromParams setRedirectTo={setRedirectTo} />
          </Suspense>
          {showUnverifiedNote && (
            <div className="mb-4 rounded-md border border-amber-300/60 bg-amber-100/10 px-3 py-2 text-amber-200">
              Please verify your email to sign in. Check your inbox for the confirmation link.
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#384E77] text-white placeholder-white/70 border-white focus-visible:ring-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#384E77] text-white placeholder-white/70 border-white pr-24 focus-visible:ring-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-[#0A0424] hover:bg-[#C7E8F3] font-semibold"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-4 text-center text-white/90">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4 decoration-white/70 hover:text-white">
              Sign up here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
