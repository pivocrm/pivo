"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils";
import { Copy, Check, ExternalLink, Eye, EyeOff } from "lucide-react";
import type { MediaKitRow, PlatformData } from "@/lib/supabase/types";

interface MediaKitEditorProps {
  initialMediaKit: MediaKitRow | null;
  profile: {
    name: string | null;
    avatar_url: string | null;
    instagram_handle: string | null;
    niche: string | null;
    followers_count: number | null;
  } | null;
  userId: string;
}

export function MediaKitEditor({ initialMediaKit, profile, userId }: MediaKitEditorProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const platforms = (initialMediaKit?.platforms as PlatformData) ?? {};

  const [bio, setBio] = useState(initialMediaKit?.bio ?? "");
  const [engagementRate, setEngagementRate] = useState(initialMediaKit?.engagement_rate?.toString() ?? "");
  const [contactEmail, setContactEmail] = useState(initialMediaKit?.contact_email ?? "");
  const [isPublic, setIsPublic] = useState(initialMediaKit?.is_public ?? false);
  const [slug] = useState(
    initialMediaKit?.slug ??
    generateSlug(profile?.name ?? "creator") + "-" + Math.random().toString(36).slice(2, 6)
  );

  const [instaHandle, setInstaHandle] = useState(platforms.instagram?.handle ?? profile?.instagram_handle ?? "");
  const [instaFollowers, setInstaFollowers] = useState(platforms.instagram?.followers?.toString() ?? profile?.followers_count?.toString() ?? "");
  const [tiktokHandle, setTiktokHandle] = useState(platforms.tiktok?.handle ?? "");
  const [tiktokFollowers, setTiktokFollowers] = useState(platforms.tiktok?.followers?.toString() ?? "");
  const [youtubeHandle, setYoutubeHandle] = useState(platforms.youtube?.handle ?? "");
  const [youtubeSubs, setYoutubeSubs] = useState(platforms.youtube?.subscribers?.toString() ?? "");

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/mk/${slug}` : `/mk/${slug}`;

  async function handleSave() {
    setSaving(true);
    try {
      const platformData: PlatformData = {};
      if (instaHandle) platformData.instagram = { handle: instaHandle, followers: parseInt(instaFollowers) || 0 };
      if (tiktokHandle) platformData.tiktok = { handle: tiktokHandle, followers: parseInt(tiktokFollowers) || 0 };
      if (youtubeHandle) platformData.youtube = { handle: youtubeHandle, subscribers: parseInt(youtubeSubs) || 0 };

      const { error } = await supabase.from("media_kit").upsert({
        user_id: userId,
        bio: bio || null,
        engagement_rate: parseFloat(engagementRate) || null,
        contact_email: contactEmail || null,
        is_public: isPublic,
        slug,
        platforms: platformData as Record<string, unknown>,
        past_campaigns: initialMediaKit?.past_campaigns ?? [],
      } as never, { onConflict: "user_id" });

      if (error) throw error;
      toast({ title: "Media Kit salvo!", description: isPublic ? "Seu link público está ativo." : "Rascunho salvo." });
    } catch (err: unknown) {
      toast({ variant: "destructive", title: "Erro", description: err instanceof Error ? err.message : "Erro" });
    } finally {
      setSaving(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const formatFollowers = (n: string) => {
    const num = parseInt(n);
    if (isNaN(num)) return "—";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-nunito text-2xl font-black text-[#1A2547]">Media Kit</h1>
          <p className="text-[#5A6A82] text-sm mt-0.5">Seu portfólio profissional com link único</p>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/mk/${slug}`} target="_blank" className="text-[#5A6A82] hover:text-[#1A2547] transition-colors p-2">
            <ExternalLink className="w-5 h-5" />
          </a>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      </div>

      <Card className="border-[#5DC93E]/30 bg-[#F0F7EC]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#5A6A82] mb-1">Seu link público</p>
              <p className="text-sm font-medium text-[#1A2547] truncate">{publicUrl}</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5 flex-shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-[#5DC93E]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isPublic ? "bg-[#5DC93E] text-[#1A2547]" : "bg-[#D1E8C8] text-[#5A6A82]"}`}
            >
              {isPublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {isPublic ? "Público" : "Privado"}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Sobre você</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Bio / Apresentação</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Apresente-se para as marcas..." rows={4} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Taxa de engajamento (%)</Label>
              <Input value={engagementRate} onChange={(e) => setEngagementRate(e.target.value)} placeholder="Ex: 4.5" inputMode="decimal" />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail de contato</Label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="parcerias@email.com" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Plataformas</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {/* Instagram */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </div>
              <span className="font-semibold text-sm text-[#1A2547]">Instagram</span>
              {instaFollowers && <span className="text-xs text-[#5A6A82] ml-auto">{formatFollowers(instaFollowers)} seguidores</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Handle</Label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A82] text-sm">@</span>
                  <Input value={instaHandle} onChange={(e) => setInstaHandle(e.target.value.replace("@", ""))} placeholder="seuhandle" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Seguidores</Label>
                <Input value={instaFollowers} onChange={(e) => setInstaFollowers(e.target.value)} placeholder="150000" type="number" />
              </div>
            </div>
          </div>

          {/* TikTok */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.25 8.25 0 004.82 1.54V6.77a4.85 4.85 0 01-1.05-.08z"/></svg>
              </div>
              <span className="font-semibold text-sm text-[#1A2547]">TikTok</span>
              {tiktokFollowers && <span className="text-xs text-[#5A6A82] ml-auto">{formatFollowers(tiktokFollowers)} seguidores</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Handle</Label>
                <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6A82] text-sm">@</span>
                  <Input value={tiktokHandle} onChange={(e) => setTiktokHandle(e.target.value.replace("@", ""))} placeholder="seuhandle" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Seguidores</Label>
                <Input value={tiktokFollowers} onChange={(e) => setTiktokFollowers(e.target.value)} placeholder="50000" type="number" />
              </div>
            </div>
          </div>

          {/* YouTube */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              <span className="font-semibold text-sm text-[#1A2547]">YouTube</span>
              {youtubeSubs && <span className="text-xs text-[#5A6A82] ml-auto">{formatFollowers(youtubeSubs)} inscritos</span>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Canal</Label>
                <Input value={youtubeHandle} onChange={(e) => setYoutubeHandle(e.target.value)} placeholder="@seucanal" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Inscritos</Label>
                <Input value={youtubeSubs} onChange={(e) => setYoutubeSubs(e.target.value)} placeholder="10000" type="number" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="min-w-32">
          {saving ? "Salvando..." : "Salvar Media Kit"}
        </Button>
      </div>
    </div>
  );
}
