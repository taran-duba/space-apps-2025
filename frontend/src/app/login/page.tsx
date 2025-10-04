"use client";

import * as React from "react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export type LoginPageProps = {
  onSubmit?: (payload: { username: string; password: string }) => void | Promise<void>;
  onSignUpClick?: () => void;
};

/**
 * Tailwind + shadcn/ui styled login page
 * - Background: diagonal gradient from #0A0424 to #18314F
 * - Card with rounded corners and subtle shadow
 * - Accessible labels and inputs
 */
const LoginPage: React.FC<LoginPageProps> = ({ onSubmit, onSignUpClick }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (onSubmit) {
      return onSubmit({ username: email, password });
    }
    
    try {
      setLoading(true);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error);
        return;
      }
      
      toast.success("Successfully signed in!");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0424] to-[#18314F] text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-sm border-white/20 bg-[#18314F] text-white shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                name="email"
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
                  name="password"
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
            <Link href="/signup">
              <button
                type="button"
                onClick={onSignUpClick}
                className="underline underline-offset-4 decoration-white/70 hover:text-white"
              >
                Sign up here
              </button>
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;