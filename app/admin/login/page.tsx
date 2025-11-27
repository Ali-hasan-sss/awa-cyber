"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Lock, Mail, KeyRound, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const { messages } = useLanguage();
  const copy = messages?.adminLogin || {};
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (field: "email" | "password", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    login(form.email, form.password).catch((err) => {
      const message =
        typeof err === "string"
          ? err
          : (copy.error as string) || "حدث خطأ أثناء تسجيل الدخول";
      setLocalError(message);
    });
  };

  return (
    <>
      <Navbar />
      <section className="relative min-h-screen bg-gradient-to-br from-amber-900/40 via-amber-800/50 to-amber-950/60 text-white overflow-hidden pt-28 pb-16">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl glow-spot translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 ltr:left-0 rtl:right-0 w-[24rem] h-[24rem] bg-primary/30 rounded-full blur-3xl glow-spot -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto bg-amber-950/40 backdrop-blur-sm border border-amber-800/30 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-8">
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-800/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                <Lock className="h-4 w-4" />
                {copy.badge}
              </span>
              <h1 className="text-3xl font-bold text-white">{copy.title}</h1>
              <p className="text-sm text-amber-100/80">{copy.subtitle}</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <label className="text-sm text-amber-100/90 space-y-2 block">
                  <span className="inline-flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {copy.emailLabel}
                  </span>
                  <Input
                    type="email"
                    required
                    placeholder={copy.emailPlaceholder}
                    className="h-12 rounded-2xl border border-amber-700/40 bg-amber-900/30 text-sm text-white placeholder:text-amber-200/50 focus-visible:ring-0 focus:border-primary"
                    value={form.email}
                    onChange={(event) =>
                      handleChange("email", event.target.value)
                    }
                  />
                </label>

                <label className="text-sm text-amber-100/90 space-y-2 block">
                  <span className="inline-flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    {copy.passwordLabel}
                  </span>
                  <Input
                    type="password"
                    required
                    placeholder={copy.passwordPlaceholder}
                    className="h-12 rounded-2xl border border-amber-700/40 bg-amber-900/30 text-sm text-white placeholder:text-amber-200/50 focus-visible:ring-0 focus:border-primary"
                    value={form.password}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                  />
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-primary text-black hover:bg-primary/90 py-6 font-semibold disabled:opacity-70"
              >
                {loading ? "..." : copy.submit}
              </Button>

              {(localError || error) && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>{localError || error}</span>
                </div>
              )}
            </form>

            <p className="text-center text-xs text-amber-200/60">
              {copy.backText}{" "}
              <Link href="/" className="text-primary hover:underline">
                {copy.backLink}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
