"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  "14 dias grátis — sem cartão de crédito",
  "Pipeline de campanhas visual e intuitivo",
  "Media Kit profissional em minutos",
];

export default function CadastroPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Senha muito curta", description: "A senha deve ter pelo menos 8 caracteres." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            instagram_handle: instagramHandle || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Se confirmação de e-mail desabilitada no Supabase, já loga
      if (data.session) {
        router.push("/onboarding");
        router.refresh();
      } else {
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao criar conta";
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: message.includes("already registered")
          ? "Este e-mail já está cadastrado."
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
            <h1 className="text-white font-nunito text-4xl font-black leading-tight mb-4">
              Comece a operar como
              <br />
              <span className="text-[#5DC93E]">uma empresa de verdade.</span>
            </h1>
            <p className="text-[#8A9BBE] text-lg mb-12">
              Junte-se a criadores que já gerenciam suas campanhas com profissionalismo.
            </p>
            <ul className="space-y-4">
              {BENEFITS.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5DC93E] flex-shrink-0 mt-0.5" />
                  <span className="text-[#CBD5E9] text-sm leading-snug">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[#5A6A82] text-sm">© 2024 Pivo · Feito com 💚 para criadores brasileiros</p>
        </div>

        {/* Lado direito */}
        <div className="flex-1 flex items-center justify-center p-6 bg-white">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="font-nunito text-2xl font-black text-[#1A2547] mb-1">
                Crie sua conta grátis
              </h2>
              <p className="text-[#5A6A82] text-sm">
                Já tem conta?{" "}
                <Link href="/login" className="text-[#5DC93E] font-semibold hover:underline">
                  Fazer login
                </Link>
              </p>
            </div>

            <form onSubmit={handleCadastro} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome artístico *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como você é conhecido"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
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
                <Label htmlFor="instagram">Instagram (opcional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A82] text-sm">@</span>
                  <Input
                    id="instagram"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value.replace("@", ""))}
                    placeholder="seuhandle"
                    className="pl-7"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className="pr-10"
                    minLength={8}
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
                {loading ? "Criando conta..." : (
                  <>
                    Criar conta grátis <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>

              <p className="text-xs text-[#5A6A82] text-center">
                Ao criar a conta, você concorda com nossos{" "}
                <span className="underline cursor-pointer">Termos de Uso</span> e{" "}
                <span className="underline cursor-pointer">Política de Privacidade</span>.
              </p>
            </form>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}
