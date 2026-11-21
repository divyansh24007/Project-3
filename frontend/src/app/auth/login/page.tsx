"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and security key.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error.message || "Authentication failed. Check credentials.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during authorization.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("operator@aegisos.internal");
    setPassword("CyberSecurity2026!");
    setIsLoading(true);
    try {
      await signIn("operator@aegisos.internal", "CyberSecurity2026!");
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] bg-grid-cyber flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#7C4DFF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF] to-[#7C4DFF] p-[2px] shadow-[0_0_25px_rgba(0,229,255,0.4)]">
            <div className="w-full h-full bg-[#080B12] rounded-[14px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[#00E5FF]" />
            </div>
          </div>
          <span className="text-2xl font-black tracking-widest text-[#F4F7FB]">
            AEGIS<span className="text-[#00E5FF]">OS</span>
          </span>
        </Link>
        <p className="text-xs font-mono tracking-widest uppercase text-[#8794A8] mt-2">
          Autonomous Security Command Center
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated" glow glowColor="cyan" className="border-white/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">Operator Authentication</CardTitle>
            <CardDescription>
              Enter authorized credentials to access defense telemetry
            </CardDescription>
          </CardHeader>

          <CardContent>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-lg bg-[#FF4560]/15 border border-[#FF4560]/40 flex items-center gap-2.5 text-xs text-[#FF4560]"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Operator Email"
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1">
                <Input
                  label="Security Key / Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <div className="flex justify-end pt-1">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-[#00E5FF] hover:underline"
                  >
                    Forgot security key?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Authenticate Session
              </Button>

              {/* Demo Mode Instant Access */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleDemoLogin}
                  className="w-full text-xs font-mono border-dashed"
                >
                  ⚡ Instant Demo Access (One-Click)
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-[#8794A8]">
              Don&apos;t have defense clearance?{" "}
              <Link
                href="/auth/signup"
                className="text-[#00E5FF] font-semibold hover:underline"
              >
                Request Access / Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security badge footer */}
      <div className="mt-8 flex items-center gap-2 text-xs text-[#8794A8]/70">
        <CheckCircle className="w-3.5 h-3.5 text-[#00D68F]" />
        <span>End-to-End Quantum Resistant Multi-Agent Guard</span>
      </div>
    </div>
  );
}
