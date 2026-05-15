"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSlug, formatCurrency } from "@/lib/utils";
import {
  Copy, Check, Eye, EyeOff, Plus, X, Camera, Save,
  Instagram, MapPin, Globe, Users, Mail, DollarSign,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const NICHES = [
  "Moda","Beleza","Tech","Lifestyle","Fitness","Gastronomia",
  "Humor","Educação","Finanças","Maternidade","Games","Outro",
];

const CONTENT_TYPES = [
  "Reels","Stories","Posts estáticos","UGC","Lives","YouTube","TikTok","Podcasts",
];

const AGE_RANGES = ["13–17","18–24","25–34","35–44","45+"];

const LANGUAGES = ["Português","Inglês","Espanhol","Bilíngue"];

const EXTRA_PLATFORMS = ["kwai","twitter","pinterest","twitch"] as const;

type ExtraPlatform = typeof EXTRA_PLATFORMS[number];

const EXTRA_PLATFORM_LABELS: Record<ExtraPlatform, string> = {
  kwai: "Kwai", twitter: "Twitter/X", pinterest: "Pinterest", twitch: "Twitch",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(n: string | number): string {
  const v = typeof n === "string" ? parseInt(n) : n;
  if (isNaN(v) || v === 0) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toString();
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlatformState {
  handle: string;
  followers: string;
  engagement: string;
  enabled: boolean;
}

interface ExtPlatformState extends PlatformState {}

interface FormState {
  name: string;
  city: string;
  state: string;
  profileImageUrl: string | null;
  niches: string[];
  contentTypes: string[];
  language: string;
  instagram: PlatformState;
  tiktok: PlatformState;
  youtube: PlatformState & { subscribers: string };
  extra: Record<ExtraPlatform, ExtPlatformState>;
  audienceGenderFemale: number;
  audienceAgeRange: string;
  audienceStates: string[];
  pastBrands: string[];
  averageFee: string;
  showFee: boolean;
  contactEmail: string;
  bio: string;
  isPublic: boolean;
  slug: string;
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMediaKit: any;
  profile: { name: string | null; avatar_url: string | null; instagram_handle: string | null } | null;
  userId: string;
}

// ─── Preview Component ────────────────────────────────────────────────────────

function MediaKitPreview({ form }: { form: FormState }) {
  const activePlatforms = [
    form.instagram.enabled && form.instagram.handle ? { key: "Instagram", handle: form.instagram.handle, count: form.instagram.followers, label: "seguidores", eng: form.instagram.engagement, color: "from-amber-500 via-pink-500 to-purple-600" } : null,
    form.tiktok.enabled && form.tiktok.handle ? { key: "TikTok", handle: form.tiktok.handle, count: form.tiktok.followers, label: "seguidores", eng: form.tiktok.engagement, color: "bg-black" } : null,
    form.youtube.enabled && form.youtube.handle ? { key: "YouTube", handle: form.youtube.handle, count: form.youtube.subscribers, label: "inscritos", eng: form.youtube.engagement, color: "bg-red-600" } : null,
    ...EXTRA_PLATFORMS.map(k => form.extra[k].enabled && form.extra[k].handle ? { key: EXTRA_PLATFORM_LABELS[k], handle: form.extra[k].handle, count: form.extra[k].followers, label: "seguidores", eng: form.extra[k].engagement, color: "bg-[#5DC93E]" } : null),
  ].filter(Boolean);

  return (
    <div className="bg-white border border-[#D1E8C8] rounded-2xl overflow-hidden shadow-sm text-sm">
      {/* Header preview */}
      <div className="bg-[#1A2547] text-white p-6 text-center">
        <div className="flex justify-center mb-3">
          {form.profileImageUrl ? (
            <img src={form.profileImageUrl} alt={form.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#5DC93E]" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#5DC93E] flex items-center justify-center text-[#1A2547] text-xl font-black">
              {form.name ? form.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <h2 className="font-nunito font-black text-lg">{form.name || "Seu nome"}</h2>
        {(form.city || form.state) && (
          <p className="text-[#8A9BBE] text-xs mt-1">{[form.city, form.state].filter(Boolean).join(", ")}</p>
        )}
        {form.niches.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {form.niches.slice(0, 3).map(n => (
              <span key={n} className="text-xs bg-[#5DC93E]/20 text-[#5DC93E] px-2 py-0.5 rounded-full">{n}</span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {form.bio && (
          <div>
            <p className="text-xs font-bold text-[#1A2547] mb-1">Sobre</p>
            <p className="text-xs text-[#5A6A82] leading-relaxed line-clamp-4">{form.bio}</p>
          </div>
        )}

        {activePlatforms.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#1A2547] mb-2">Plataformas</p>
            <div className="grid grid-cols-2 gap-2">
              {activePlatforms.map(p => p && (
                <div key={p.key} className="bg-[#F8FDF6] rounded-xl p-2 text-center">
                  <p className="font-bold text-[#1A2547] text-sm">{fmtNum(p.count)}</p>
                  <p className="text-xs text-[#5A6A82]">{p.key}</p>
                  {p.eng && <p className="text-xs text-[#5DC93E]">{p.eng}% eng.</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {form.contentTypes.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#1A2547] mb-1">Conteúdo</p>
            <div className="flex flex-wrap gap-1">
              {form.contentTypes.map(t => (
                <span key={t} className="text-xs bg-[#EEF2FF] text-[#6366F1] px-2 py-0.5 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        )}

        {form.pastBrands.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#1A2547] mb-1">Marcas</p>
            <div className="flex flex-wrap gap-1">
              {form.pastBrands.slice(0, 8).map(b => (
                <span key={b} className="text-xs bg-[#F0F7EC] text-[#1A2547] px-2 py-0.5 rounded-full border border-[#D1E8C8]">{b}</span>
              ))}
              {form.pastBrands.length > 8 && <span className="text-xs text-[#5A6A82]">+{form.pastBrands.length - 8}</span>}
            </div>
          </div>
        )}

        {form.showFee && form.averageFee && (
          <div className="bg-[#FFF8E6] border border-amber-200 rounded-xl p-2">
            <p className="text-xs font-bold text-[#1A2547]">Cachê médio por publi</p>
            <p className="text-sm font-black text-[#1A2547]">{formatCurrency(parseFloat(form.averageFee) || 0)}</p>
          </div>
        )}

        {form.contactEmail && (
          <div className="bg-[#1A2547] text-white rounded-xl p-2 text-center">
            <p className="text-xs font-semibold">Enviar proposta</p>
            <p className="text-xs text-[#8A9BBE] truncate">{form.contactEmail}</p>
          </div>
        )}

        <p className="text-center text-xs text-[#8A9BBE] pt-1">Criado com <span className="text-[#5DC93E] font-semibold">Pivo</span></p>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#D1E8C8] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#D1E8C8] bg-[#F8FDF6]">
        <h3 className="font-bold text-[#1A2547] text-sm">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ─── Chip selector ────────────────────────────────────────────────────────────

function ChipSelector({ options, selected, onChange, max }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; max?: number }) {
  function toggle(opt: string) {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, opt]);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            selected.includes(opt)
              ? "bg-[#5DC93E] text-[#1A2547] border-[#5DC93E]"
              : "bg-white text-[#5A6A82] border-[#D1E8C8] hover:border-[#5DC93E] hover:text-[#1A2547]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Platform card ────────────────────────────────────────────────────────────

function PlatformCard({
  name, gradient, state, onChange, isFollowers = true,
}: {
  name: string;
  gradient: string;
  state: PlatformState & { subscribers?: string };
  onChange: (field: string, value: string | boolean) => void;
  isFollowers?: boolean;
}) {
  return (
    <div className={`border rounded-xl p-4 transition-all ${state.enabled ? "border-[#5DC93E] bg-[#F8FDF6]" : "border-[#E5E7EB] bg-white opacity-60"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg ${gradient} flex items-center justify-center`} />
          <span className="font-semibold text-sm text-[#1A2547]">{name}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange("enabled", !state.enabled)}
          className={`w-10 h-5 rounded-full transition-colors relative ${state.enabled ? "bg-[#5DC93E]" : "bg-[#D1D5DB]"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${state.enabled ? "left-5" : "left-0.5"}`} />
        </button>
      </div>
      {state.enabled && (
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Handle</Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#5A6A82] text-xs">@</span>
              <Input value={state.handle} onChange={e => onChange("handle", e.target.value.replace("@", ""))} placeholder="handle" className="pl-6 h-8 text-xs" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{isFollowers ? "Seguidores" : "Inscritos"}</Label>
            <Input
              value={isFollowers ? state.followers : (state as PlatformState & { subscribers: string }).subscribers ?? ""}
              onChange={e => onChange(isFollowers ? "followers" : "subscribers", e.target.value)}
              placeholder="150000"
              type="number"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Engaj. %</Label>
            <Input value={state.engagement} onChange={e => onChange("engagement", e.target.value)} placeholder="4.5" type="number" className="h-8 text-xs" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export function MediaKitEditor({ initialMediaKit: mk, profile, userId }: Props) {
  const supabase = createClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [brandInput, setBrandInput] = useState("");

  const platforms = (mk?.platforms ?? {}) as Record<string, Record<string, unknown>>;
  const extra = (key: ExtraPlatform) => ({
    handle: (platforms[key]?.handle as string) ?? "",
    followers: (platforms[key]?.followers as number)?.toString() ?? "",
    engagement: (platforms[key]?.engagement as number)?.toString() ?? "",
    enabled: !!(platforms[key]?.handle),
  });

  const [form, setForm] = useState<FormState>({
    name: profile?.name ?? "",
    city: mk?.city ?? "",
    state: mk?.state ?? "",
    profileImageUrl: mk?.profile_image_url ?? profile?.avatar_url ?? null,
    niches: mk?.niches ?? [],
    contentTypes: mk?.content_types ?? [],
    language: mk?.language ?? "Português",
    instagram: {
      handle: (platforms.instagram?.handle as string) ?? profile?.instagram_handle ?? "",
      followers: (platforms.instagram?.followers as number)?.toString() ?? "",
      engagement: (platforms.instagram?.engagement as number)?.toString() ?? "",
      enabled: !!(platforms.instagram?.handle || profile?.instagram_handle),
    },
    tiktok: {
      handle: (platforms.tiktok?.handle as string) ?? "",
      followers: (platforms.tiktok?.followers as number)?.toString() ?? "",
      engagement: (platforms.tiktok?.engagement as number)?.toString() ?? "",
      enabled: !!(platforms.tiktok?.handle),
      subscribers: "",
    },
    youtube: {
      handle: (platforms.youtube?.handle as string) ?? "",
      followers: "",
      subscribers: (platforms.youtube?.subscribers as number)?.toString() ?? "",
      engagement: (platforms.youtube?.engagement as number)?.toString() ?? "",
      enabled: !!(platforms.youtube?.handle),
    },
    extra: {
      kwai: extra("kwai"),
      twitter: extra("twitter"),
      pinterest: extra("pinterest"),
      twitch: extra("twitch"),
    },
    audienceGenderFemale: mk?.audience_gender_female ?? 50,
    audienceAgeRange: mk?.audience_age_range ?? "",
    audienceStates: mk?.audience_states ?? [],
    pastBrands: mk?.past_brands ?? [],
    averageFee: mk?.average_fee?.toString() ?? "",
    showFee: mk?.show_fee ?? false,
    contactEmail: mk?.contact_email ?? "",
    bio: mk?.bio ?? "",
    isPublic: mk?.is_public ?? false,
    slug: mk?.slug ?? generateSlug(profile?.name ?? "creator") + "-" + Math.random().toString(36).slice(2, 6),
  });

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/mk/${form.slug}` : `/mk/${form.slug}`;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setPlatform(key: "instagram" | "tiktok" | "youtube", field: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: { ...f[key], [field]: value } }));
  }

  function setExtraPlatform(key: ExtraPlatform, field: string, value: string | boolean) {
    setForm(f => ({ ...f, extra: { ...f.extra, [key]: { ...f.extra[key], [field]: value } } }));
  }

  function addBrand() {
    const b = brandInput.trim();
    if (!b || form.pastBrands.includes(b) || form.pastBrands.length >= 20) return;
    set("pastBrands", [...form.pastBrands, b]);
    setBrandInput("");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/profile.${ext}`;
      const { error } = await supabase.storage.from("media-kit").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("media-kit").getPublicUrl(path);
      set("profileImageUrl", data.publicUrl + "?t=" + Date.now());
    } catch {
      toast({ variant: "destructive", title: "Erro ao fazer upload da foto" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const platformData: Record<string, unknown> = {};
      if (form.instagram.enabled && form.instagram.handle) {
        platformData.instagram = { handle: form.instagram.handle, followers: parseInt(form.instagram.followers) || 0, engagement: parseFloat(form.instagram.engagement) || null };
      }
      if (form.tiktok.enabled && form.tiktok.handle) {
        platformData.tiktok = { handle: form.tiktok.handle, followers: parseInt(form.tiktok.followers) || 0, engagement: parseFloat(form.tiktok.engagement) || null };
      }
      if (form.youtube.enabled && form.youtube.handle) {
        platformData.youtube = { handle: form.youtube.handle, subscribers: parseInt(form.youtube.subscribers) || 0, engagement: parseFloat(form.youtube.engagement) || null };
      }
      for (const key of EXTRA_PLATFORMS) {
        if (form.extra[key].enabled && form.extra[key].handle) {
          platformData[key] = { handle: form.extra[key].handle, followers: parseInt(form.extra[key].followers) || 0, engagement: parseFloat(form.extra[key].engagement) || null };
        }
      }

      const { error } = await supabase.from("media_kit").upsert({
        user_id: userId,
        bio: form.bio || null,
        profile_image_url: form.profileImageUrl,
        contact_email: form.contactEmail || null,
        is_public: form.isPublic,
        slug: form.slug,
        platforms: platformData,
        past_campaigns: [],
        // New fields
        city: form.city || null,
        state: form.state || null,
        niches: form.niches,
        content_types: form.contentTypes,
        language: form.language || null,
        audience_gender_female: form.audienceGenderFemale,
        audience_age_range: form.audienceAgeRange || null,
        audience_states: form.audienceStates,
        past_brands: form.pastBrands,
        average_fee: form.averageFee ? parseFloat(form.averageFee) : null,
        show_fee: form.showFee,
        engagement_rate: null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, { onConflict: "user_id" });

      if (error) throw error;
      toast({ title: "Media Kit salvo!", description: form.isPublic ? "Link público ativo." : "Rascunho salvo." });
    } catch (err) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 flex items-center gap-2 bg-[#F0F7EC] border border-[#D1E8C8] rounded-xl px-3 py-2 min-w-0">
          <Globe className="w-4 h-4 text-[#5DC93E] flex-shrink-0" />
          <span className="text-xs text-[#1A2547] font-medium truncate">{publicUrl}</span>
          <button onClick={copyLink} className="flex items-center gap-1 text-xs font-semibold text-[#5A6A82] hover:text-[#1A2547] flex-shrink-0">
            {copied ? <Check className="w-3 h-3 text-[#5DC93E]" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
        <button
          onClick={() => set("isPublic", !form.isPublic)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${form.isPublic ? "bg-[#5DC93E] text-[#1A2547] border-[#5DC93E]" : "bg-white text-[#5A6A82] border-[#D1E8C8]"}`}
        >
          {form.isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {form.isPublic ? "Público" : "Privado"}
        </button>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Form (60%) */}
        <div className="w-3/5 overflow-y-auto space-y-4 pr-1 pb-8">

          {/* 1. Identidade */}
          <Section title="1 · Identidade">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-full border-2 border-dashed border-[#D1E8C8] flex items-center justify-center cursor-pointer hover:border-[#5DC93E] transition-colors overflow-hidden bg-[#F8FDF6] relative"
                >
                  {form.profileImageUrl ? (
                    <img src={form.profileImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-[#8A9BBE]" />
                  )}
                  {uploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-4 h-4 border-2 border-[#5DC93E] border-t-transparent rounded-full animate-spin" /></div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <p className="text-xs text-[#8A9BBE] text-center mt-1">Foto</p>
              </div>
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Seu nome" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Cidade</Label>
                    <Input value={form.city} onChange={e => set("city", e.target.value)} placeholder="São Paulo" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Estado</Label>
                    <select
                      value={form.state}
                      onChange={e => set("state", e.target.value)}
                      className="flex h-10 w-full rounded-xl border border-[#D1E8C8] bg-white px-3 py-2 text-sm text-[#1A2547] focus:outline-none focus:ring-2 focus:ring-[#5DC93E] focus:border-[#5DC93E]"
                    >
                      <option value="">UF</option>
                      {BR_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 2. Posicionamento */}
          <Section title="2 · Posicionamento">
            <div className="space-y-1.5">
              <Label>Nicho (múltipla escolha)</Label>
              <ChipSelector options={NICHES} selected={form.niches} onChange={v => set("niches", v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipos de conteúdo</Label>
              <ChipSelector options={CONTENT_TYPES} selected={form.contentTypes} onChange={v => set("contentTypes", v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Idioma principal</Label>
              <select
                value={form.language}
                onChange={e => set("language", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-[#D1E8C8] bg-white px-3 py-2 text-sm text-[#1A2547] focus:outline-none focus:ring-2 focus:ring-[#5DC93E]"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </Section>

          {/* 3. Plataformas */}
          <Section title="3 · Plataformas">
            <PlatformCard
              name="Instagram"
              gradient="bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600"
              state={form.instagram}
              onChange={(f, v) => setPlatform("instagram", f, v)}
            />
            <PlatformCard
              name="TikTok"
              gradient="bg-black"
              state={form.tiktok}
              onChange={(f, v) => setPlatform("tiktok", f, v)}
            />
            <PlatformCard
              name="YouTube"
              gradient="bg-red-600"
              state={form.youtube}
              onChange={(f, v) => setPlatform("youtube", f, v)}
              isFollowers={false}
            />
            <div className="pt-1">
              <p className="text-xs font-semibold text-[#5A6A82] mb-2 uppercase tracking-wide">Outras plataformas</p>
              <div className="space-y-2">
                {EXTRA_PLATFORMS.map(key => (
                  <PlatformCard
                    key={key}
                    name={EXTRA_PLATFORM_LABELS[key]}
                    gradient="bg-[#5DC93E]"
                    state={form.extra[key]}
                    onChange={(f, v) => setExtraPlatform(key, f, v)}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* 4. Audiência */}
          <Section title="4 · Audiência">
            <div className="space-y-2">
              <Label>Gênero predominante do público</Label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#5A6A82] w-16">♀ {form.audienceGenderFemale}%</span>
                <input
                  type="range" min={0} max={100} value={form.audienceGenderFemale}
                  onChange={e => set("audienceGenderFemale", parseInt(e.target.value))}
                  className="flex-1 accent-[#5DC93E]"
                />
                <span className="text-xs text-[#5A6A82] w-16 text-right">♂ {100 - form.audienceGenderFemale}%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Faixa etária principal</Label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map(r => (
                  <button
                    key={r} type="button"
                    onClick={() => set("audienceAgeRange", form.audienceAgeRange === r ? "" : r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${form.audienceAgeRange === r ? "bg-[#5DC93E] text-[#1A2547] border-[#5DC93E]" : "bg-white text-[#5A6A82] border-[#D1E8C8] hover:border-[#5DC93E]"}`}
                  >{r}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Estados com maior audiência</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {BR_STATES.map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => set("audienceStates", form.audienceStates.includes(s) ? form.audienceStates.filter(x => x !== s) : [...form.audienceStates, s])}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${form.audienceStates.includes(s) ? "bg-[#5DC93E] text-[#1A2547] border-[#5DC93E]" : "bg-white text-[#5A6A82] border-[#D1E8C8]"}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          </Section>

          {/* 5. Prova Social */}
          <Section title="5 · Marcas com quem já trabalhei">
            <div className="flex gap-2">
              <Input
                value={brandInput}
                onChange={e => setBrandInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addBrand(); } }}
                placeholder="Digite o nome da marca e pressione Enter"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addBrand} disabled={form.pastBrands.length >= 20}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.pastBrands.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.pastBrands.map(b => (
                  <span key={b} className="flex items-center gap-1 bg-[#F0F7EC] border border-[#D1E8C8] text-[#1A2547] text-xs font-medium px-2 py-1 rounded-full">
                    {b}
                    <button type="button" onClick={() => set("pastBrands", form.pastBrands.filter(x => x !== b))} className="text-[#5A6A82] hover:text-[#EF4444]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-[#8A9BBE]">{form.pastBrands.length}/20 marcas</p>
          </Section>

          {/* 6. Cachê */}
          <Section title="6 · Cachê">
            <div className="space-y-1.5">
              <Label>Cachê médio por publi (R$) — opcional</Label>
              <Input
                value={form.averageFee}
                onChange={e => set("averageFee", e.target.value)}
                placeholder="Ex: 2500"
                type="number"
              />
              <p className="text-xs text-[#8A9BBE] italic">Visível apenas para quem tiver o link. Não aparece em buscas.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set("showFee", !form.showFee)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.showFee ? "bg-[#5DC93E]" : "bg-[#D1D5DB]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${form.showFee ? "left-5" : "left-0.5"}`} />
              </button>
              <span className="text-sm text-[#1A2547]">Mostrar cachê no media kit público</span>
            </div>
          </Section>

          {/* 7. Contato */}
          <Section title="7 · Contato">
            <div className="space-y-1.5">
              <Label>E-mail de contato para parcerias</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={e => set("contactEmail", e.target.value)}
                placeholder="parcerias@email.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Bio / Apresentação</Label>
                <span className={`text-xs ${form.bio.length > 280 ? "text-red-500" : "text-[#8A9BBE]"}`}>{form.bio.length}/300</span>
              </div>
              <Textarea
                value={form.bio}
                onChange={e => { if (e.target.value.length <= 300) set("bio", e.target.value); }}
                placeholder="Apresente-se para as marcas. Conte quem você é, qual seu diferencial e que tipo de parceria busca..."
                rows={4}
              />
            </div>
          </Section>
        </div>

        {/* Right: Preview (40%) */}
        <div className="w-2/5 overflow-y-auto pb-8">
          <div className="sticky top-0">
            <p className="text-xs font-semibold text-[#5A6A82] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Preview em tempo real
            </p>
            <MediaKitPreview form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}
