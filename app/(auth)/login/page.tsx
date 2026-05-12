"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  "Pipeline de campanhas estilo Kanban — zero planilha",
  "Controle financeiro simplificado em um só lugar",
  "Visualização prática de todas as propostas e contratos",
];

export default function LoginPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.replace("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao entrar";
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: message.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Mobile header — navy com hero image */}
        <div className="lg:hidden bg-[#1A2547] w-full flex justify-center items-center py-6 px-6">
          <Image
            src="/hero-login.png"
            alt="Pivo"
            width={280}
            height={147}
            className="object-contain"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Lado esquerdo — navy (desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1A2547] flex-col justify-between p-12">
          <div>
            {/* Hero */}
            <div className="mb-4">
              <Image
                src="/hero-login.png"
                alt="Pivo"
                width={320}
                height={168}
                className="object-contain"
                style={{ mixBlendMode: "screen" }}
              />
            </div>

            {/* Tagline */}
            <h1 className="text-white font-nunito text-4xl font-black leading-tight mb-4">
              Você é uma empresa.
              <br />
              <span className="text-[#5DC93E]">Opere como uma.</span>
            </h1>
            <p className="text-[#8A9BBE] text-lg mb-8">
              O CRM feito para o influenciador brasileiro gerenciar campanhas
              com profissionalismo.
            </p>

            {/* Benefícios */}
            <ul className="space-y-4">
              {BENEFITS.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5DC93E] flex-shrink-0 mt-0.5" />
                  <span className="text-[#CBD5E9] text-sm leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer nav */}
          <p className="text-[#5A6A82] text-sm">
            © 2024 Pivo · Feito com 💚 para criadores brasileiros
          </p>
        </div>

        {/* Lado direito — formulário */}
        <div className="flex-1 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="font-nunito text-2xl font-black text-[#1A2547] mb-1">
                Bem-vindo de volta
              </h2>
              <p className="text-[#5A6A82] text-sm">
                Não tem conta?{" "}
                <Link href="/cadastro" className="text-[#5DC93E] font-semibold hover:underline">
                  Criar conta grátis
                </Link>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6A82] hover:text-[#1A2547]"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? "Entrando..." : (
                  <>
                    Entrar <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
