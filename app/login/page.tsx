"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("admin@nfcflow.in");
  const [password, setPassword] = useState("Admin@123456");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = createClient();

      // 1. Attempt standard password sign-in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // 2. If user doesn't exist yet, attempt first-time Super Admin registration
        if (
          signInError.message.toLowerCase().includes("invalid login credentials") ||
          signInError.message.toLowerCase().includes("user not found")
        ) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: "Super Admin",
                role: "super_admin",
              },
            },
          });

          if (!signUpError && signUpData.user) {
            setSuccessMessage("Super Admin account initialized and logged in! Redirecting...");
            setTimeout(() => {
              router.push(next);
              router.refresh();
            }, 600);
            return;
          }
        }

        throw new Error(signInError.message || "Invalid email or password");
      }

      if (signInData.user) {
        setSuccessMessage("Authentication successful! Redirecting to dashboard...");
        setTimeout(() => {
          router.push(next);
          router.refresh();
        }, 600);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAdmin = (adminEmail: string, pass: string) => {
    setEmail(adminEmail);
    setPassword(pass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white font-bold text-lg tracking-wider shadow-xs mb-3">
          NF
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          NFCFlow Admin Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Single Super Admin authentication for managing review cards &amp; locations
        </p>
      </div>

      {/* Main Form Box */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200 rounded-2xl shadow-xs space-y-5">
          {/* Security Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Protected Super Admin Console</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Customer NFC taps and QR redirects continue operating publicly with zero authentication.
              </p>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800 font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nfcflow.in"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                size="md"
                className="w-full justify-center text-xs h-10 font-semibold shadow-xs"
              >
                {isLoading ? (
                  "Authenticating..."
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Quick Fill / First-Time Setup Helper */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-slate-500" /> First-Time Admin Credentials:
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoAdmin("admin@nfcflow.in", "Admin@123456")}
                className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between text-xs text-slate-700 group cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-900 block">admin@nfcflow.in</span>
                  <span className="text-[10px] text-slate-500 font-mono">Password: Admin@123456</span>
                </div>
                <span className="text-[11px] font-medium text-indigo-600 group-hover:underline">
                  Auto-fill
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1 transition-colors"
          >
            ← Return to Marketing Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
