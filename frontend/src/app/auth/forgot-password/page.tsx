"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message || "Failed to trigger security key reset.");
      } else {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] bg-grid-cyber flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

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
          Security Key Recovery
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
            <CardTitle className="text-xl font-bold">Reset Passphrase</CardTitle>
            <CardDescription>
              We will send encrypted recovery instructions to your email
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#00D68F]/15 border border-[#00D68F]/40 flex items-center justify-center mx-auto text-[#00D68F] shadow-[0_0_20px_rgba(0,214,143,0.3)]">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#F4F7FB]">
                    Recovery Dispatch Sent
                  </h4>
                  <p className="text-xs text-[#8794A8] mt-1.5 leading-relaxed">
                    If an active security profile exists for{" "}
                    <span className="text-[#00E5FF] font-medium">{email}</span>, you
                    will receive an authenticated recovery link within 60 seconds.
                  </p>
                </div>
                <Link href="/auth/login" className="block pt-2">
                  <Button variant="outline" size="md" className="w-full">
                    Return to Operator Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={isLoading}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Send Recovery Key
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-white/5 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-xs text-[#8794A8] hover:text-[#00E5FF] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Operator Login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
