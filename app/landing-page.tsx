"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  FileSpreadsheet,
  AlertCircle,
  Kanban,
  FileText,
  DollarSign,
  BarChart2,
  Monitor,
  UserPlus,
  PlusCircle,
  TrendingUp,
  Check,
  Shield,
  CreditCard,
  X,
  Instagram,
  Linkedin,
  Menu,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const CONFIG = {
  trialDays: 7,
  creatorPrice: "R$197",
  agencyPrice: "R$697",
  agencyProPrice: "R$1.497",
  annualDiscount: "20%",
  ctaUrl: "/signup",
  loginUrl: "/login",
  demoUrl: "#como-funciona",
  totalUsers: "200+",
};

// ─── ANIMATION VARIANTS ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = (i: number): Variants => ({
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1 } },
});

// ─── MOUSE TRAIL ───────────────────────────────────────────────────────────────
function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Particle = { x: number; y: number; size: number; alpha: number; vx: number; vy: number };
    const particles: Particle[] = [];
    let mouse = { x: 0, y: 0 };
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
      for (let i = 0; i < 3; i++) {
        particles.push({
          x: mouse.x + (Math.random() - 0.5) * 8,
          y: mouse.y + (Math.random() - 0.5) * 8,
          size: Math.random() * 5 + 2,
          alpha: 0.7,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.alpha -= 0.025;
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 0.97;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(93, 201, 62, ${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    window.addEventListener("mousemove", onMove);
    draw();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}
    />
  );
}

// ─── MARQUEE BAR ───────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "KANBAN VISUAL", "CRM BRASILEIRO", "INFLUENCER ECONOMY",
  "PIPELINE DE CAMPANHAS", "CONTRATOS DIGITAIS", "NOTA FISCAL AUTOMÁTICA",
  "CREATOR SCORE™", "PAGAMENTO GARANTIDO", "MEDIA KIT DINÂMICO",
  "GESTÃO PROFISSIONAL", "7 DIAS GRÁTIS",
];

function MarqueeBar() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ background: "#5DC93E", overflow: "hidden", padding: "10px 0", position: "relative", zIndex: 49 }}>
      <div className="marquee-track" style={{ display: "flex", gap: 0, width: "max-content" }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "Space Grotesk, sans-serif", fontWeight: 700,
            fontSize: "0.8125rem", color: "#0F1A35",
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0 28px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 12,
          }}>
            {item}
            <span style={{ color: "#0F1A35", opacity: 0.5, fontSize: "0.5rem" }}>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      style={{
        position: "fixed", top: 32, left: 0, right: 0, zIndex: 50,
        height: 72, display: "flex", alignItems: "center", padding: "0 24px",
        transition: "background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease",
        background: scrolled ? "rgba(15, 26, 53, 0.97)" : "rgba(15, 26, 53, 0.75)",
        backdropFilter: "blur(20px)",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.05)" : "none",
      }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo — white filter for dark bg */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image
            src="/logo.png"
            alt="PIVO"
            width={90}
            height={36}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex" style={{ gap: 32, alignItems: "center" }}>
          {[{ label: "Como funciona", href: "#como-funciona" }, { label: "Preços", href: "#precos" }].map((link) => (
            <a key={link.href} href={link.href} style={{ color: "#A0AEBF", textDecoration: "none", fontSize: "0.9375rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEBF")}>
              {link.label}
            </a>
          ))}
          <a href={CONFIG.loginUrl} style={{ color: "#A0AEBF", textDecoration: "none", fontSize: "0.9375rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#A0AEBF")}>
            Entrar
          </a>
          <a href={CONFIG.ctaUrl} style={{ background: "#5DC93E", color: "#0F1A35", padding: "10px 22px", borderRadius: 9999, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none", transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out", display: "inline-block" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(93,201,62,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
            Começar grátis
          </a>
        </div>

        <button className="md:hidden" aria-label="Abrir menu" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 8 }}>
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} transition={{ duration: 0.3 }}
              style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "80vw", maxWidth: 320, background: "#0F1A35", padding: "80px 32px 32px", display: "flex", flexDirection: "column", gap: 24, zIndex: 100 }}>
              <button aria-label="Fechar menu" onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 24, right: 24, background: "none", border: "none", color: "#fff", cursor: "pointer" }}><X size={24} /></button>
              <a href="#como-funciona" onClick={() => setMenuOpen(false)} style={{ color: "#fff", fontSize: "1.125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, textDecoration: "none" }}>Como funciona</a>
              <a href="#precos" onClick={() => setMenuOpen(false)} style={{ color: "#fff", fontSize: "1.125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, textDecoration: "none" }}>Preços</a>
              <a href={CONFIG.loginUrl} style={{ color: "#A0AEBF", fontSize: "1.125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, textDecoration: "none" }}>Entrar</a>
              <a href={CONFIG.ctaUrl} style={{ background: "#5DC93E", color: "#0F1A35", padding: "14px 24px", borderRadius: 12, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1rem", textDecoration: "none", textAlign: "center" }}>Começar grátis</a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} />
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── HERO ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const parallax = (xAmt: number, yAmt: number, invert = false) => ({
    transform: `translate(${mouse.x * xAmt * (invert ? -1 : 1)}px, ${mouse.y * yAmt * (invert ? -1 : 1)}px)`,
    transition: "transform 0.1s ease-out",
  });

  return (
    <section style={{ background: "#0F1A35", minHeight: "100vh", display: "flex", alignItems: "center", padding: "140px 24px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "radial-gradient(circle, rgba(93,201,62,0.15) 1px, transparent 1px)", backgroundSize: "32px 32px", opacity: 0.4 }} />
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(93,201,62,0.18) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)", zIndex: 0, animation: "blob-float 8s ease-in-out infinite alternate", ...parallax(30, 20) }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(26,37,71,0.8) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", zIndex: 0, animation: "blob-float2 10s ease-in-out infinite alternate" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <motion.div style={parallax(6, 3)} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(93,201,62,0.12)", border: "1px solid rgba(93,201,62,0.3)", borderRadius: 9999, padding: "6px 16px", marginBottom: 24 }}>
              <Sparkles size={14} color="#5DC93E" />
              <span style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.02em" }}>Novo · O CRM feito para criadores brasileiros</span>
            </div>
            <h1 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)", color: "#FFFFFF", lineHeight: 1.1, marginBottom: 16 }}>
              Chega de gerenciar<br />campanha no WhatsApp.
            </h1>
            <p style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: "#5DC93E", marginBottom: 20, lineHeight: 1.3 }}>
              Você é uma empresa. Opere como uma.
            </p>
            <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 400, fontSize: "1.125rem", color: "#A0AEBF", lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
              O PIVO organiza seus deals, contratos e pagamentos num lugar só. Do primeiro contato da marca ao pagamento na conta — tudo sob controle.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
              <a href={CONFIG.ctaUrl} style={{ background: "#5DC93E", color: "#0F1A35", padding: "16px 32px", borderRadius: 12, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.0625rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(93,201,62,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
                Começar grátis por {CONFIG.trialDays} dias <ChevronRight size={18} />
              </a>
              <a href={CONFIG.demoUrl} style={{ background: "transparent", color: "#FFFFFF", padding: "16px 32px", borderRadius: 12, fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "1.0625rem", textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.25)", transition: "border-color 0.2s, background 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}>
                Ver como funciona
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex" }}>
                {["R", "T", "G", "M", "A"].map((l, i) => (
                  <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 40}, 50%, 50%)`, border: "2px solid #0F1A35", marginLeft: i > 0 ? -10 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "0.75rem", color: "#fff" }}>{l}</div>
                ))}
              </div>
              <span style={{ color: "#A0AEBF", fontSize: "0.9rem", fontFamily: "Space Grotesk, sans-serif" }}>
                Mais de <strong style={{ color: "#fff" }}>{CONFIG.totalUsers}</strong> criadores que já saíram do caos
              </span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} style={{ position: "relative", display: "flex", justifyContent: "center" }} className="hero-mockup">
            <div style={{ position: "relative", ...parallax(12, 8) }}>
              <div style={{ background: "#1E2D4D", borderRadius: 16, border: "1px solid rgba(93,201,62,0.2)", boxShadow: "0 40px 80px rgba(93,201,62,0.15), 0 20px 40px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                <div style={{ background: "#152034", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
                  </div>
                  <div style={{ flex: 1, background: "#1A2547", borderRadius: 6, padding: "4px 12px", fontSize: "0.75rem", color: "#6B7A99", fontFamily: "Space Grotesk, sans-serif", textAlign: "center" }}>
                    app.pivo.com.br/dashboard
                  </div>
                </div>
                <Image src="/hero-login.png" alt="Dashboard do PIVO" width={640} height={420} style={{ display: "block", width: "100%", height: "auto" }} priority />
              </div>
              <div style={{ position: "absolute", bottom: -40, right: -20, zIndex: 10, ...parallax(20, 10, true) }}>
                <Image src="/mascote-sentado.png" alt="Mascote PIVO" width={130} height={130} style={{ objectFit: "contain", filter: "drop-shadow(0 8px 24px rgba(93,201,62,0.3))" }} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── PAIN ──────────────────────────────────────────────────────────────────────
function PainSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const cards = [
    { icon: <MessageCircle size={28} color="#5DC93E" />, title: "WhatsApp como CRM", text: "Proposta da marca perdida entre meme de amigo e figurinha. Você vira a tela do celular de cabeça pra baixo procurando o valor que a marca te mandou." },
    { icon: <FileSpreadsheet size={28} color="#5DC93E" />, title: "Planilha do caos", text: "Linha 47: 'Collab Nike - PAGO?'. Linha 48: 'Nike 2 - não sei'. Linha 49: em branco. Você não sabe o que recebeu, o que vai receber, nem o que esqueceu." },
    { icon: <AlertCircle size={28} color="#5DC93E" />, title: "NF no improviso", text: "Marca pede nota fiscal. Você lembra que é MEI, que talvez tenha emitido uma vez, abre o portal da prefeitura e reza." },
  ];
  return (
    <section style={{ background: "#F7F9FC", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>A Realidade de Todo Criador</div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#1A2547", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", marginBottom: 16 }}>Você ainda gerencia assim?</h2>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", fontSize: "1.125rem", maxWidth: 560, margin: "0 auto" }}>Se você fechou campanha nos últimos 30 dias, provavelmente se reconhece aqui:</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {cards.map((card, i) => (
            <motion.div key={i} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"}
              style={{ background: "#fff", borderRadius: 16, borderLeft: "4px solid #5DC93E", padding: "32px 28px", boxShadow: "0 4px 24px rgba(26,37,71,0.08)", cursor: "default" }}
              whileHover={{ y: -6, boxShadow: "0 12px 40px rgba(26,37,71,0.16)" }}>
              <div style={{ marginBottom: 16 }}>{card.icon}</div>
              <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "#1A2547", marginBottom: 12 }}>{card.title}</h3>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", lineHeight: 1.7, fontSize: "1rem" }}>{card.text}</p>
            </motion.div>
          ))}
        </div>
        <motion.p variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginTop: 48, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "#5DC93E" }}>
          Existe uma forma melhor. ↓
        </motion.p>
      </div>
    </section>
  );
}

// ─── FEATURES WITH SCREENSHOTS ─────────────────────────────────────────────────
function FeaturesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: <Kanban size={22} color="#5DC93E" />, title: "Pipeline de Campanhas", text: "Visualize cada deal do primeiro contato até o pagamento. Kanban visual, sem planilha, sem caos.", img: "/pivo-pipeline.png", badge: "Mais usado" },
    { icon: <DollarSign size={22} color="#5DC93E" />, title: "Controle Financeiro", text: "Tudo que recebeu, tudo que vai receber, tudo que está atrasado. Por campanha, por mês, por marca.", img: "/pivo-financeiro.png" },
    { icon: <FileText size={22} color="#5DC93E" />, title: "Media Kit Dinâmico", text: "Sua página pública com dados reais e sempre atualizados. Manda o link, não o PDF velho de 2022.", img: "/pivo-mediakit.png" },
    { icon: <Monitor size={22} color="#5DC93E" />, title: "Dashboard", text: "Visão completa do seu negócio numa tela. Receitas, campanhas ativas e próximos vencimentos de relance.", img: "/pivo-dashboard.png" },
  ];

  return (
    <section id="como-funciona" style={{ background: "#1A2547", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>O Que o PIVO Faz Por Você</div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#FFFFFF", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", marginBottom: 16 }}>Tudo que você precisa.<br />Nada que você não usa.</h2>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#A0AEBF", fontSize: "1.125rem", maxWidth: 520, margin: "0 auto" }}>Construído especificamente para o dia a dia do influenciador brasileiro.</p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(540px, 1fr))", gap: 28 }} className="features-grid">
          {features.map((f, i) => (
            <motion.div key={i} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"}
              style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", cursor: "default" }}
              whileHover={{ borderColor: "rgba(93,201,62,0.35)", boxShadow: "0 0 40px rgba(93,201,62,0.1)" }}>
              {/* Screenshot */}
              <div style={{ position: "relative", background: "#0F1A35", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Browser bar */}
                <div style={{ background: "#0a1428", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
                  </div>
                  <div style={{ flex: 1, background: "#1A2547", borderRadius: 4, padding: "3px 10px", fontSize: "0.7rem", color: "#6B7A99", fontFamily: "Space Grotesk, sans-serif", textAlign: "center" }}>app.pivo.com.br</div>
                </div>
                <Image src={f.img} alt={f.title} width={600} height={340} style={{ display: "block", width: "100%", height: "auto", maxHeight: 240, objectFit: "cover", objectPosition: "top" }} />
              </div>
              {/* Card body */}
              <div style={{ padding: "24px 28px", display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(93,201,62,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "#FFFFFF", margin: 0 }}>{f.title}</h3>
                    {f.badge && <span style={{ background: "rgba(93,201,62,0.2)", border: "1px solid rgba(93,201,62,0.4)", borderRadius: 9999, padding: "2px 10px", fontSize: "0.72rem", color: "#5DC93E", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600 }}>{f.badge}</span>}
                  </div>
                  <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#A0AEBF", lineHeight: 1.65, fontSize: "0.9375rem", margin: 0 }}>{f.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW IT WORKS (3 steps) ────────────────────────────────────────────────────
function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const steps = [
    { icon: <UserPlus size={28} color="#5DC93E" />, title: "Crie sua conta", desc: "Cadastro em menos de 1 minuto. Sem cartão de crédito." },
    { icon: <PlusCircle size={28} color="#5DC93E" />, title: "Adicione sua primeira campanha", desc: "Marca, valor, prazo, briefing. Tudo num lugar só." },
    { icon: <TrendingUp size={28} color="#5DC93E" />, title: "Acompanhe e receba", desc: "Saiba exatamente o que foi pago, o que está pendente e o que vence essa semana." },
  ];
  return (
    <section style={{ background: "#F7F9FC", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Simples Assim</div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#1A2547", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}>Comece em menos de 5 minutos</h2>
        </motion.div>
        <div style={{ position: "relative" }}>
          <div className="steps-line" style={{ position: "absolute", top: 40, left: "16%", right: "16%", height: 2, zIndex: 0 }}>
            <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : { scaleX: 0 }} transition={{ duration: 1.2, delay: 0.3 }} style={{ height: "100%", background: "#5DC93E", transformOrigin: "left", width: "100%" }} />
          </div>
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32 }}>
            {steps.map((step, i) => (
              <motion.div key={i} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fff", border: "3px solid #5DC93E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0", boxShadow: "0 0 0 6px rgba(93,201,62,0.1)" }}>{step.icon}</div>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#5DC93E", color: "#0F1A35", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: "0.875rem", margin: "-14px auto 20px", position: "relative", zIndex: 2 }}>{i + 1}</div>
                <h3 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "#1A2547", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", fontSize: "0.9375rem", lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STATS ─────────────────────────────────────────────────────────────────────
function AnimatedCounter({ target, prefix = "", suffix = "", duration = 2000 }: { target: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section ref={ref} style={{ background: "#5DC93E", padding: "96px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#0F1A35", fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", textAlign: "center", marginBottom: 64 }}>
          O mercado está crescendo.<br />Sua gestão precisa acompanhar.
        </motion.h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 0 }}>
          {[
            { content: <>{inView && <AnimatedCounter target={500} suffix="k+" />}</>, label: "Criadores monetizados no Brasil" },
            { content: <>{inView && <>R$<AnimatedCounter target={32} suffix="B" /></>}</>, label: "Mercado global de influencer marketing" },
            { content: <>{inView && <AnimatedCounter target={7} suffix=" dias" />}</>, label: "Para testar o PIVO completamente de graça" },
          ].map((stat, i) => (
            <motion.div key={i} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="stat-item"
              style={{ textAlign: "center", padding: "0 32px", borderRight: i < 2 ? "1px solid rgba(15,26,53,0.2)" : "none" }}>
              <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: "clamp(2.5rem, 5vw, 3.5rem)", color: "#0F1A35", lineHeight: 1, marginBottom: 12 }}>{stat.content}</div>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#0F1A35", opacity: 0.75, fontSize: "1rem", maxWidth: 200, margin: "0 auto" }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const testimonials = [
    { name: "Rafaela B.", handle: "@rafaelab · 89k seguidores", niche: "Moda & Lifestyle", color: "#E879B0", text: "Eu literalmente perdia proposta de marca porque ficava enterrada no WhatsApp. Agora vejo tudo num kanban. Parece óbvio mas não existia antes.", initial: "R" },
    { name: "Thalita M.", handle: "@thalitam · 154k seguidores", niche: "Fitness", color: "#F97316", text: "O media kit dinâmico salvou minha vida. Parei de mandar PDF. Mando o link e ele já tem todos os meus dados atualizados automaticamente.", initial: "T" },
    { name: "Giovanna G.", handle: "@gio · 67k seguidores", niche: "Gastronomia", color: "#8B5CF6", text: "Finalmente sei quanto recebi no mês. Soa básico mas era impossível saber antes. Abria 3 aplicativos de banco e ainda ficava com dúvida.", initial: "G" },
  ];
  return (
    <section style={{ background: "#FFFFFF", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Quem Já Usa</div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#1A2547", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}>O que os criadores estão dizendo</h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"}
              style={{ background: "#fff", borderRadius: 16, borderLeft: "3px solid #5DC93E", padding: "32px 28px", boxShadow: "0 4px 24px rgba(26,37,71,0.08)", position: "relative" }}
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(26,37,71,0.14)" }}>
              <div style={{ position: "absolute", top: 16, right: 20, fontSize: "5rem", lineHeight: 1, color: "rgba(93,201,62,0.12)", fontFamily: "Nunito, sans-serif", fontWeight: 900, userSelect: "none" }}>"</div>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[...Array(5)].map((_, s) => <span key={s} style={{ color: "#5DC93E", fontSize: "0.875rem" }}>★</span>)}
              </div>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#374151", lineHeight: 1.7, fontSize: "1rem", marginBottom: 24 }}>"{t.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "#fff" }}>{t.initial}</div>
                <div>
                  <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "0.9375rem", color: "#1A2547" }}>{t.name}</div>
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "0.8125rem", color: "#6B7A99" }}>{t.handle}</div>
                  <span style={{ display: "inline-block", marginTop: 4, background: "rgba(93,201,62,0.1)", color: "#5DC93E", fontSize: "0.75rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, padding: "2px 8px", borderRadius: 9999 }}>{t.niche}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ───────────────────────────────────────────────────────────────────
function PricingSection() {
  const [annual, setAnnual] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const plans = [
    { name: "Creator", price: annual ? "R$157" : CONFIG.creatorPrice, tagline: "Para criadores independentes", highlight: false, features: ["Pipeline ilimitado de campanhas", "Media Kit dinâmico com link público", "Controle financeiro completo", "Gestão de contratos", "Até 3 usuários", "Suporte por chat"], cta: "Começar grátis por 7 dias", ctaUrl: CONFIG.ctaUrl },
    { name: "Agency", price: annual ? "R$557" : CONFIG.agencyPrice, tagline: "Para assessorias de influência", highlight: true, badge: "Mais popular", features: ["Tudo do Creator", "Criadores ilimitados na carteira", "Dashboard centralizado por criador", "Relatórios por carteira", "Revenue share com criadores", "Suporte prioritário"], cta: "Começar grátis por 7 dias", ctaUrl: CONFIG.ctaUrl },
    { name: "Agency Pro", price: annual ? "R$1.197" : CONFIG.agencyProPrice, tagline: "Para assessorias em escala", highlight: false, features: ["Tudo do Agency", "White-label (sua marca)", "API de integração", "Suporte dedicado", "SLA garantido", "Onboarding personalizado"], cta: "Falar com time comercial", ctaUrl: "mailto:comercial@pivo.com.br" },
  ];
  return (
    <section id="precos" style={{ background: "#F7F9FC", padding: "96px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Planos</div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#1A2547", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", marginBottom: 12 }}>Simples. Transparente. Sem surpresa.</h2>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", fontSize: "1.125rem", marginBottom: 32 }}>{CONFIG.trialDays} dias grátis em qualquer plano. Cancele quando quiser.</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: !annual ? "#1A2547" : "#6B7A99", fontSize: "0.9375rem" }}>Mensal</span>
            <button onClick={() => setAnnual(!annual)} aria-label="Alternar entre mensal e anual" style={{ width: 52, height: 28, borderRadius: 9999, background: annual ? "#5DC93E" : "#E2E8F0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: annual ? 27 : 3, transition: "left 0.3s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </button>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Space Grotesk, sans-serif", fontWeight: 500, color: annual ? "#1A2547" : "#6B7A99", fontSize: "0.9375rem" }}>
              Anual <span style={{ background: "#5DC93E", color: "#0F1A35", fontSize: "0.75rem", fontWeight: 700, padding: "2px 8px", borderRadius: 9999 }}>Economize {CONFIG.annualDiscount}</span>
            </span>
          </div>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
          {plans.map((plan, i) => (
            <motion.div key={plan.name} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"}
              style={{ background: plan.highlight ? "#1A2547" : "#fff", borderRadius: 16, border: plan.highlight ? "2px solid #5DC93E" : "1.5px solid #E2E8F0", padding: "36px 28px", position: "relative", transform: plan.highlight ? "scale(1.03)" : "scale(1)", boxShadow: plan.highlight ? "0 0 40px rgba(93,201,62,0.2), 0 12px 40px rgba(26,37,71,0.2)" : "0 4px 24px rgba(26,37,71,0.06)", transition: "box-shadow 0.25s" }}
              whileHover={{ boxShadow: plan.highlight ? "0 0 60px rgba(93,201,62,0.35)" : "0 12px 40px rgba(26,37,71,0.12)" }}>
              {plan.badge && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#5DC93E", color: "#0F1A35", padding: "4px 16px", borderRadius: 9999, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{plan.badge}</div>}
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, fontSize: "0.875rem", color: "#5DC93E", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{plan.name}</div>
              <div style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, fontSize: "2.5rem", color: plan.highlight ? "#fff" : "#1A2547", lineHeight: 1, marginBottom: 4 }}>
                {plan.price}<span style={{ fontSize: "1rem", fontWeight: 500, color: plan.highlight ? "#A0AEBF" : "#6B7A99" }}>/mês</span>
              </div>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", color: plan.highlight ? "#A0AEBF" : "#6B7A99", fontSize: "0.9rem", marginBottom: 28, marginTop: 6 }}>{plan.tagline}</p>
              <a href={plan.ctaUrl} style={{ display: "block", textAlign: "center", background: plan.highlight ? "#5DC93E" : "transparent", color: plan.highlight ? "#0F1A35" : "#1A2547", border: plan.highlight ? "none" : "2px solid #1A2547", padding: "14px 24px", borderRadius: 12, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "0.9375rem", textDecoration: "none", marginBottom: 28, transition: "transform 0.2s, box-shadow 0.2s, background 0.2s" }}
                onMouseEnter={(e) => { if (plan.highlight) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(93,201,62,0.4)"; } else { e.currentTarget.style.background = "#1A2547"; e.currentTarget.style.color = "#fff"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; if (!plan.highlight) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1A2547"; } }}>
                {plan.cta}
              </a>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {plan.features.map((feat) => (
                  <li key={feat} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <Check size={16} color="#5DC93E" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "0.9rem", color: plan.highlight ? "#A0AEBF" : "#6B7A99", lineHeight: 1.5 }}>{feat}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap", marginTop: 48, padding: "32px", background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0" }}>
          {[
            { icon: <Shield size={18} color="#5DC93E" />, text: "Garantia de 30 dias. Se não gostar, devolvemos 100%." },
            { icon: <CreditCard size={18} color="#5DC93E" />, text: "Sem cartão de crédito para começar." },
            { icon: <X size={18} color="#5DC93E" />, text: "Cancele quando quiser, sem multa." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {item.icon}
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "0.9rem", color: "#6B7A99" }}>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Como o Pivo ajuda a organizar minhas campanhas?",
    a: "O Pivo oferece um pipeline visual estilo kanban onde você move cada deal pelas etapas: Proposta → Fechado → Entregue → Pago. Você tem visão completa de todas as campanhas ativas, prazos e valores em um único lugar.",
  },
  {
    q: "Como funciona o trial de 7 dias?",
    a: "Você tem acesso completo a todas as funcionalidades do Pivo por 7 dias sem precisar cadastrar cartão de crédito. Ao final do período, você escolhe o plano que melhor se encaixa na sua realidade.",
  },
  {
    q: "Preciso ser MEI ou ter CNPJ para usar o Pivo?",
    a: "Não. Qualquer criador de conteúdo pode usar o Pivo, independente de ter ou não CNPJ. A plataforma funciona para pessoas físicas e jurídicas. Se você quiser emitir notas fiscais, o Pivo te ajuda a controlar quando e para quem emitir.",
  },
  {
    q: "O Pivo funciona para micro e nano influenciadores?",
    a: "Sim! O Pivo foi construído para qualquer criador que fecha campanhas com marcas — desde quem tem 5 mil seguidores até quem tem 5 milhões. O tamanho da audiência não importa; o que importa é que você opera com profissionalismo.",
  },
  {
    q: "Meus dados e contratos ficam seguros?",
    a: "Sim. Todos os dados são armazenados com criptografia e backups automáticos. Você pode exportar seus contratos e relatórios a qualquer momento. Nunca compartilhamos seus dados com marcas ou terceiros sem sua autorização.",
  },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section style={{ background: "#F7F9FC", padding: "96px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ color: "#5DC93E", fontSize: "0.8125rem", fontFamily: "Space Grotesk, sans-serif", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Dúvidas Frequentes</div>
          <h2 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 800, color: "#1A2547", fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}>Perguntas frequentes</h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQ_ITEMS.map((item, i) => (
            <motion.div key={i} variants={stagger(i)} initial="hidden" animate={inView ? "visible" : "hidden"}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", background: "#fff", border: open === i ? "1.5px solid #5DC93E" : "1.5px solid #E2E8F0", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: open === i ? "0 0 20px rgba(93,201,62,0.1)" : "0 2px 8px rgba(26,37,71,0.05)", textAlign: "left" }}
              >
                <span style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, fontSize: "1.0625rem", color: "#1A2547", paddingRight: 16 }}>{item.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flexShrink: 0 }}>
                  <ChevronDown size={20} color={open === i ? "#5DC93E" : "#6B7A99"} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ background: "#fff", padding: "0 24px 20px", borderRadius: "0 0 14px 14px", borderLeft: "1.5px solid #5DC93E", borderRight: "1.5px solid #5DC93E", borderBottom: "1.5px solid #5DC93E", marginTop: -2 }}>
                      <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", lineHeight: 1.75, fontSize: "1rem", paddingTop: 16, margin: 0 }}>{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA FINAL ─────────────────────────────────────────────────────────────────
function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section style={{ background: "linear-gradient(135deg, #0F1A35 0%, #1A2547 100%)", padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(93,201,62,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", animation: "blob-float 8s ease-in-out infinite alternate" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(93,201,62,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(80px)", animation: "blob-float2 10s ease-in-out infinite alternate" }} />
      <div ref={ref} style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ display: "flex", justifyContent: "center", marginBottom: 32, animation: "mascot-idle 3s ease-in-out infinite alternate" }}>
          <Image src="/pivo-standing.png" alt="Mascote PIVO" width={180} height={180} style={{ objectFit: "contain", filter: "drop-shadow(0 16px 40px rgba(93,201,62,0.3))" }} />
        </motion.div>
        <motion.h2 variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ fontFamily: "Nunito, sans-serif", fontWeight: 900, color: "#FFFFFF", fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15, marginBottom: 20 }}>
          Você é uma empresa.<br />Opere como uma.
        </motion.h2>
        <motion.p variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} style={{ fontFamily: "Space Grotesk, sans-serif", color: "#A0AEBF", fontSize: "1.125rem", lineHeight: 1.7, marginBottom: 40 }}>
          Junte-se aos criadores que pararam de improvisar e começaram a operar com profissionalismo.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"}>
          <a href={CONFIG.ctaUrl} style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#5DC93E", color: "#0F1A35", padding: "20px 44px", borderRadius: 16, fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "1.125rem", textDecoration: "none", transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(93,201,62,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}>
            Começar grátis por {CONFIG.trialDays} dias <ChevronRight size={20} />
          </a>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "0.875rem", color: "#6B7A99", marginTop: 16 }}>Sem cartão de crédito · Cancele quando quiser · Setup em 5 minutos</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────────────────
function Footer() {
  const cols = [
    { title: "Produto", links: ["Media Kit", "Pipeline", "Financeiro", "Contratos", "Creator Score™"] },
    { title: "Empresa", links: ["Sobre", "Blog", "Parceiros", "Afiliados"] },
    { title: "Legal", links: ["Termos de uso", "Política de privacidade", "Contato"] },
  ];
  return (
    <footer style={{ background: "#0F1A35", padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <Image src="/logo.png" alt="PIVO" width={80} height={32} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 16 }} />
            <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", fontSize: "0.9375rem", lineHeight: 1.6, maxWidth: 240, marginBottom: 24 }}>Você é uma empresa. Opere como uma.</p>
            <div style={{ display: "flex", gap: 12 }}>
              {[{ icon: <Instagram size={18} />, label: "Instagram" }, { icon: <Linkedin size={18} />, label: "LinkedIn" }].map((s) => (
                <a key={s.label} href="#" aria-label={s.label} style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7A99", textDecoration: "none", transition: "color 0.2s, background 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#5DC93E"; e.currentTarget.style.background = "rgba(93,201,62,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#6B7A99"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 style={{ fontFamily: "Nunito, sans-serif", fontWeight: 700, color: "#fff", fontSize: "0.9375rem", marginBottom: 20 }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {col.links.map((link) => (
                  <li key={link}><a href="#" style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", fontSize: "0.9rem", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7A99")}>{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, textAlign: "center" }}>
          <p style={{ fontFamily: "Space Grotesk, sans-serif", color: "#6B7A99", fontSize: "0.875rem" }}>© 2025 Pivo · Feito com ♥ para criadores brasileiros</p>
        </div>
      </div>
    </footer>
  );
}

// ─── SCROLL PROGRESS ───────────────────────────────────────────────────────────
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setProgress((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 100, background: "rgba(93,201,62,0.15)" }}>
      <div style={{ height: "100%", background: "#5DC93E", width: `${progress}%`, transition: "width 0.1s linear" }} />
    </div>
  );
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <MouseTrail />
      <ScrollProgress />
      <MarqueeBar />
      <Navbar />
      <main>
        <HeroSection />
        <PainSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
