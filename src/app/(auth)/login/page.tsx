"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pill,
  ShieldCheck,
  TrendingUp,
  Package,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-brand-700">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/10">
              <Pill className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white tracking-tight">
                PharmaCare
              </h1>
              <p className="text-brand-200 text-[11px] tracking-wide">
                Management System
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl font-semibold text-white leading-snug">
                Manage your pharmacy
                <br />
                <span className="text-brand-200 font-normal">
                  with confidence.
                </span>
              </h2>
            </div>
            <div className="space-y-6">
              <FeatureItem
                icon={<Package className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                title="Smart Inventory"
                desc="Batch-wise tracking with FEFO, multi-unit conversion, and expiry alerts"
              />
              <FeatureItem
                icon={<TrendingUp className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                title="GST-Compliant Billing"
                desc="Lightning-fast POS billing with automatic CGST/SGST calculation"
              />
              <FeatureItem
                icon={<ShieldCheck className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                title="Complete Reports"
                desc="Sales analytics, inventory valuation, GST reports, and data exports"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-5">
            <p className="text-white/40 text-xs">
              © {new Date().getFullYear()} PharmaCare. Built for Indian medical
              stores.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-14 bg-surface-50">
        <div className="w-full max-w-[400px] animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                PharmaCare
              </h1>
              <p className="text-gray-400 text-[11px]">Management System</p>
            </div>
          </div>

          <div className="space-y-1.5 mb-10">
            <h2 className="text-2xl font-semibold text-gray-900">
              Welcome back
            </h2>
            <p className="text-gray-500 text-[15px]">
              Sign in to your pharmacy management system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-slide-up">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@pharmacy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-10 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-[11px] text-gray-500 font-medium mb-1.5 uppercase tracking-wider">
              Default Credentials
            </p>
            <p className="text-[13px] text-gray-600">
              Email:{" "}
              <span className="font-mono text-gray-800">
                admin@pharmacy.com
              </span>
            </p>
            <p className="text-[13px] text-gray-600">
              Password:{" "}
              <span className="font-mono text-gray-800">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3.5 items-start">
      <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 border border-white/8">
        <span className="text-brand-200">{icon}</span>
      </div>
      <div>
        <h3 className="text-white font-medium text-sm">{title}</h3>
        <p className="text-white/50 text-[13px] mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
