import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { PlatformData } from "@/lib/supabase/types";

interface PageProps {
  params: { slug: string };
}

interface MediaKitData {
  user_id: string;
  bio: string | null;
  profile_image_url: string | null;
  platforms: unknown;
  engagement_rate: number | null;
  past_campaigns: unknown;
  contact_email: string | null;
  is_public: boolean;
  slug: string;
}

interface UserData {
  name: string;
  avatar_url: string | null;
  instagram_handle: string | null;
  niche: string | null;
  followers_count: number | null;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_kit")
    .select("user_id")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .single();

  if (!data) return { title: "Media Kit — Pivo" };

  const mk = data as { user_id: string };
  const { data: userRow } = await supabase
    .from("users")
    .select("name, niche")
    .eq("id", mk.user_id)
    .single();

  const u = userRow as { name: string; niche: string | null } | null;
  return {
    title: u ? `${u.name} — Media Kit` : "Media Kit — Pivo",
    description: u?.niche ? `Criador de conteúdo no nicho de ${u.niche}.` : undefined,
  };
}

export default async function MediaKitPublicPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: mkRaw } = await supabase
    .from("media_kit")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .single();

  if (!mkRaw) notFound();
  const mediaKit = mkRaw as unknown as MediaKitData;

  const { data: userRaw } = await supabase
    .from("users")
    .select("name, avatar_url, instagram_handle, niche, followers_count")
    .eq("id", mediaKit.user_id)
    .single();

  if (!userRaw) notFound();
  const user = userRaw as unknown as UserData;

  const platforms = (mediaKit.platforms as PlatformData) ?? {};
  const hasPlatforms = Object.keys(platforms).length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#1A2547] text-white">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} className="w-24 h-24 rounded-2xl mx-auto mb-6 object-cover border-2 border-[#5DC93E]" />
          ) : (
            <div className="w-24 h-24 rounded-2xl mx-auto mb-6 bg-[#5DC93E] flex items-center justify-center text-[#1A2547] text-3xl font-black">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="font-nunito text-4xl font-black mb-2">{user.name}</h1>
          {user.niche && (
            <span className="inline-block bg-[#5DC93E]/20 text-[#5DC93E] text-sm font-semibold px-3 py-1 rounded-full mb-4">
              {user.niche}
            </span>
          )}
          {user.instagram_handle && (
            <p className="text-[#8A9BBE] text-sm">@{user.instagram_handle}</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-12">
        {mediaKit.bio && (
          <section>
            <h2 className="font-nunito text-xl font-black text-[#1A2547] mb-4">Sobre</h2>
            <p className="text-[#5A6A82] leading-relaxed text-base whitespace-pre-line">{mediaKit.bio}</p>
          </section>
        )}

        {(hasPlatforms || mediaKit.engagement_rate) && (
          <section>
            <h2 className="font-nunito text-xl font-black text-[#1A2547] mb-4">Números</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {platforms.instagram && (
                <div className="bg-[#F0F7EC] rounded-2xl p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 mx-auto mb-2" />
                  <p className="font-bold text-[#1A2547] text-xl">{formatNumber(platforms.instagram.followers)}</p>
                  <p className="text-xs text-[#5A6A82]">Instagram</p>
                </div>
              )}
              {platforms.tiktok && (
                <div className="bg-[#F0F7EC] rounded-2xl p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-black mx-auto mb-2" />
                  <p className="font-bold text-[#1A2547] text-xl">{formatNumber(platforms.tiktok.followers)}</p>
                  <p className="text-xs text-[#5A6A82]">TikTok</p>
                </div>
              )}
              {platforms.youtube && (
                <div className="bg-[#F0F7EC] rounded-2xl p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-red-600 mx-auto mb-2" />
                  <p className="font-bold text-[#1A2547] text-xl">{formatNumber(platforms.youtube.subscribers)}</p>
                  <p className="text-xs text-[#5A6A82]">YouTube</p>
                </div>
              )}
              {mediaKit.engagement_rate && (
                <div className="bg-[#F0F7EC] rounded-2xl p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#5DC93E] mx-auto mb-2 flex items-center justify-center text-[#1A2547] font-bold text-sm">%</div>
                  <p className="font-bold text-[#1A2547] text-xl">{Number(mediaKit.engagement_rate).toFixed(1)}%</p>
                  <p className="text-xs text-[#5A6A82]">Engajamento</p>
                </div>
              )}
            </div>
          </section>
        )}

        {mediaKit.contact_email && (
          <section>
            <h2 className="font-nunito text-xl font-black text-[#1A2547] mb-4">Contato</h2>
            <a
              href={`mailto:${mediaKit.contact_email}`}
              className="inline-flex items-center gap-3 bg-[#1A2547] text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-[#243060] transition-colors"
            >
              Enviar proposta para {mediaKit.contact_email}
            </a>
          </section>
        )}
      </div>

      <footer className="border-t border-[#D1E8C8] py-6 text-center">
        <a href="/" className="text-sm text-[#5A6A82] hover:text-[#1A2547] transition-colors">
          Criado com <span className="text-[#5DC93E] font-semibold">Pivo</span> — CRM para criadores de conteúdo
        </a>
      </footer>
    </div>
  );
}
