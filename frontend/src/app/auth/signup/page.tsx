"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Mail, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-[#FF4560]", percent: 25 };
    if (score <= 3) return { label: "Moderate", color: "bg-[#FFB020]", percent: 60 };
    if (score <= 4) return { label: "Strong", color: "bg-[#00B0FF]", percent: 85 };
    return { label: "Military Grade", color: "bg-[#00D68F]", percent: 100 };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setErrorMessage("All fields are mandatory for deployment.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Security key must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await signUp(email, password, { full_name: name });
      if (error) {
        setErrorMessage(error.message || "Failed to create security operator account.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Encountered unexpected enrollment error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] bg-grid-cyber flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-[#7C4DFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

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
          New Defense Deployment Request
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card variant="elevated" glow glowColor="purple" className="border-white/10">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-bold">Enroll Security Operator</CardTitle>
            <CardDescription>
              Activate your autonomous threat protection shield
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
                label="Operator Full Name"
                type="text"
                placeholder="Agent Alex Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Enterprise / Work Email"
                type="email"
                placeholder="vance@security.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-2">
                <Input
                  label="Master Passphrase"
                  type="password"
                  placeholder="Min 8 characters with symbols"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#8794A8]">Entropy Level:</span>
                      <span className="font-semibold text-[#F4F7FB]">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#101725] rounded-full overflow-hidden border border-white/5">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.percent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Deploy Shield & Access Dashboard
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-[#8794A8]">
              Already enrolled?{" "}
              <Link
                href="/auth/login"
                className="text-[#00E5FF] font-semibold hover:underline"
              >
                Log In to Command Center
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trust reassurance */}
      <div className="mt-8 flex items-center gap-2 text-xs text-[#8794A8]/70">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" />
        <span>Instant Activation • No Hardware Required • SOC2 Ready</span>
      </div>
    </div>
  );
}
