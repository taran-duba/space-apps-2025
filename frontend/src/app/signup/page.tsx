"use client";

import React, { useState, useMemo, type ChangeEvent, type FormEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirm: string;
}

export default function SignUpPage(): JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");

  const emailValid: boolean = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form.email]
  );

  const passwordScore: number = useMemo(() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  }, [form.password]);

  const passwordsMatch: boolean = !!form.password && form.password === form.confirm;
  const canSubmit: boolean =
    emailValid &&
    passwordsMatch &&
    passwordScore >= 2 &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0;

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    setSuccess("");
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Please fix the highlighted fields.");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      
      const { error } = await signUp(form.email, form.password);
      
      if (error) {
        toast.error(error);
        return;
      }
      
      toast.success("Account created! Please check your email to confirm your account. Be sure to check your spam folder if you don't see it.");
      setSuccess("Account created! Please check your email to confirm your account. Be sure to check your spam folder if you don't see it.");
      
      // Clear the form but keep the email for reference
      setForm({ 
        firstName: "", 
        lastName: "", 
        email: form.email, // Keep email to show success message
        password: "", 
        confirm: "" 
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    try {
      setSubmitting(true);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google sign-up error:", err);
      toast.error("Failed to start Google sign-up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const strengthLabels = ["Too weak", "Weak", "Okay", "Strong", "Very strong"] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0424] to-[#18314F] flex items-center justify-center p-4 text-[#FFFFFF]">
      <div className="w-full max-w-xl">
        <div className="bg-[#18314F] shadow-xl rounded-2xl border border-[#FFFFFF] overflow-hidden">
          <header className="p-6 md:p-8 bg-[#18314F] text-[#FFFFFF]">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create your account</h1>
            <p className="text-[#FFFFFF] mt-2">Join us to get personalized insights and alerts.</p>
            <div className="mt-4 border-t border-[#FFFFFF]/40"></div>
          </header>

          <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6 text-[#FFFFFF] bg-[#18314F]">
            {success && (
              <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-green-800">{success}</div>
            )}
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">First name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  placeholder="Alex"
                  className="mt-1 w-full rounded-xl border border-[#FFFFFF] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFFFFF] bg-white text-[#18314F]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Last name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  placeholder="Kim"
                  className="mt-1 w-full rounded-xl border border-[#FFFFFF] px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFFFFF] bg-white text-[#18314F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFFFFF] bg-white text-[#18314F] ${form.email && !emailValid ? "border-red-400" : "border-[#FFFFFF]"
                  }`}
              />
              {form.email && !emailValid && (
                <p className="mt-1 text-sm text-red-400">Please enter a valid email address.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="At least 8 characters"
                    className="mt-1 w-full rounded-xl border border-[#FFFFFF] px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-[#FFFFFF] bg-white text-[#18314F]"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#FFFFFF] hover:underline"
                    onClick={() => setShowPwd((s) => !s)}
                  >
                    {showPwd ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-2">
                  <div className="h-2 w-full rounded-full bg-[#FFFFFF] overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${passwordScore <= 1
                        ? "bg-red-400 w-1/4"
                        : passwordScore === 2
                          ? "bg-yellow-400 w-1/2"
                          : passwordScore === 3
                            ? "bg-green-400 w-3/4"
                            : "bg-green-500 w-full"
                        }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#FFFFFF]">{strengthLabels[passwordScore]}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Confirm password</label>
                <input
                  type="password"
                  name="confirm"
                  value={form.confirm}
                  onChange={onChange}
                  placeholder="Re-type your password"
                  className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-[#FFFFFF] bg-white text-[#18314F] ${form.confirm && !passwordsMatch ? "border-red-400" : "border-[#FFFFFF]"
                    }`}
                />
                {form.confirm && !passwordsMatch && (
                  <p className="mt-1 text-sm text-red-400">Passwords do not match.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="w-full rounded-xl py-2.5 font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed bg-[#384E77] text-[#FFFFFF] hover:bg-[#C7E8F3]/20 transition"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#FFFFFF]"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#18314F] px-3 text-xs text-[#FFFFFF]">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={submitting}
              className="w-full rounded-xl py-2.5 font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed bg-[#EA4335] text-white hover:bg-[#c83b2f] transition"
            >
              Continue with Google
            </button>
            <p className="text-center text-sm text-[#FFFFFF]">
              Already have an account? <Link href="/login" className="font-medium underline text-[#FFFFFF]">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}