import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: { slug: string };
}

const EXTRA_PLATFORM_LABELS: Record<string, string> = {
  kwai: "Kwai", twitter: "Twitter/X", pinterest: "Pinterest", twitch: "Twitch",
};

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(Math.round(n / 1_000))}K`;
  return n.toString();
}

export async function generateMetadata({ params }: PageProps) {
  const supabase = await createClient();
  const { data: mk } = await supabase
    .from("media_kit")
    .select("user_id, niches")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .single();

  if (!mk) return { title: "Media Kit — Pivo" };

  const { data: u } = await supabase
    .from("users")
    .select("name")
    .eq("id", mk.user_id)
    .single();

  const niches = (mk.niches as string[] | null) ?? [];
  return {
    title: u ? `${u.name} — Media Kit` : "Media Kit — Pivo",
    description: niches.length > 0 ? `Criador de conteúdo em ${niches.join(", ")}.` : undefined,
  };
}

export default async function MediaKitPublicPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: mk } = await supabase
    .from("media_kit")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_public", true)
    .single();

  if (!mk) notFound();

  const { data: profile } = await supabase
    .from("users")
    .select("name, avatar_url, instagram_handle")
    .eq("id", mk.user_id)
    .single();

  if (!profile) notFound();

  const platforms = (mk.platforms as Record<string, Record<string, unknown>>) ?? {};
  const niches = (mk.niches as string[]) ?? [];
  const contentTypes = (mk.content_types as string[]) ?? [];
  const audienceStates = (mk.audience_states as string[]) ?? [];
  const pastBrands = (mk.past_brands as string[]) ?? [];
  const profileImage = mk.profile_image_url ?? profile.avatar_url;
  const location = [mk.city, mk.state].filter(Boolean).join(", ");

  type PlatformEntry = { key: string; label: string; count: number; countLabel: string; engagement: number | null; gradient: string };
  const activePlatforms: PlatformEntry[] = [];

  if (platforms.instagram?.handle) {
    activePlatforms.push({ key: "instagram", label: "Instagram", count: (platforms.instagram.followers as number) ?? 0, countLabel: "seguidores", engagement: (platforms.instagram.engagement as number) ?? null, gradient: "from-amber-500 via-pink-500 to-purple-600" });
  }
  if (platforms.tiktok?.handle) {
    activePlatforms.push({ key: "tiktok", label: "TikTok", count: (platforms.tiktok.followers as number) ?? 0, countLabel: "seguidores", engagement: (platforms.tiktok.engagement as number) ?? null, gradient: "from-gray-900 to-gray-700" });
  }
  if (platforms.youtube?.handle) {
    activePlatforms.push({ key: "youtube", label: "YouTube", count: (platforms.youtube.subscribers as number) ?? 0, countLabel: "inscritos", engagement: (platforms.youtube.engagement as number) ?? null, gradient: "from-red-600 to-red-400" });
  }
  for (const key of ["kwai", "twitter", "pinterest", "twitch"]) {
    if (platforms[key]?.handle) {
      activePlatforms.push({ key, label: EXTRA_PLATFORM_LABELS[key], count: (platforms[key].followers as number) ?? 0, countLabel: "seguidores", engagement: (platforms[key].engagement as number) ?? null, gradient: "from-[#5DC93E] to-[#3DA82A]" });
    }
  }

  const genderFemale = mk.audience_gender_female as number | null;

  return (
    <div className="min-h-screen bg-[#F8FDF6]">
      {/* Hero / Header */}
      <div className="bg-[#1A2547]">
        <div className="max-w-3xl mx-auto px-6 py-14 text-center">
          <div className="flex justify-center mb-5">
            {profileImage ? (
              <img
                src={profileImage}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-[#5DC93E] shadow-xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#5DC93E] flex items-center justify-center text-[#1A2547] text-4xl font-black shadow-xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="font-nunito text-4xl font-black text-white mb-1">{profile.name}</h1>

          {location && (
            <p className="text-[#8A9BBE] text-sm mb-3">📍 {location}</p>
          )}

          {niches.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {niches.map(n => (
                <span key={n} className="bg-[#5DC93E]/20 text-[#5DC93E] text-xs font-semibold px-3 py-1 rounded-full border border-[#5DC93E]/30">
                  {n}
                </span>
              ))}
            </div>
          )}

          {mk.language && (
            <p className="text-[#5A6A82] text-xs mt-1">🌐 {mk.language}</p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Bio */}
        {mk.bio && (
          <section className="bg-white rounded-2xl border border-[#D1E8C8] p-6 shadow-sm">
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-3">Sobre mim</h2>
            <p className="text-[#5A6A82] leading-relaxed whitespace-pre-line">{mk.bio}</p>
          </section>
        )}

        {/* Platforms */}
        {activePlatforms.length > 0 && (
          <section>
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-4">Plataformas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activePlatforms.map(p => (
                <div key={p.key} className="bg-white rounded-2xl border border-[#D1E8C8] p-5 text-center shadow-sm">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} mx-auto mb-3`} />
                  <p className="font-nunito font-black text-[#1A2547] text-2xl">{fmtNum(p.count)}</p>
                  <p className="text-xs text-[#5A6A82] font-medium">{p.countLabel}</p>
                  <p className="text-xs font-semibold text-[#5DC93E] mt-0.5">{p.label}</p>
                  {p.engagement != null && p.engagement > 0 && (
                    <p className="text-xs text-[#8A9BBE] mt-1">{p.engagement}% engaj.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Content types */}
        {contentTypes.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#D1E8C8] p-6 shadow-sm">
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-3">Formatos de conteúdo</h2>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map(t => (
                <span key={t} className="bg-[#EEF2FF] text-[#6366F1] text-sm font-semibold px-3 py-1.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Audience */}
        {(genderFemale != null || mk.audience_age_range || audienceStates.length > 0) && (
          <section className="bg-white rounded-2xl border border-[#D1E8C8] p-6 shadow-sm">
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-5">Audiência</h2>
            <div className="space-y-5">

              {genderFemale != null && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#5A6A82] mb-2">
                    <span>♀ Feminino — {genderFemale}%</span>
                    <span>Masculino — {100 - genderFemale}% ♂</span>
                  </div>
                  <div className="h-3 bg-[#F0F7EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-[#5DC93E] rounded-full"
                      style={{ width: `${genderFemale}%` }}
                    />
                  </div>
                </div>
              )}

              {mk.audience_age_range && (
                <div>
                  <p className="text-xs font-semibold text-[#5A6A82] mb-1">Faixa etária principal</p>
                  <span className="bg-[#F0F7EC] text-[#1A2547] text-sm font-bold px-3 py-1.5 rounded-full border border-[#D1E8C8]">
                    {mk.audience_age_range} anos
                  </span>
                </div>
              )}

              {audienceStates.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#5A6A82] mb-2">Principais estados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {audienceStates.map(s => (
                      <span key={s} className="bg-[#1A2547] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Past brands */}
        {pastBrands.length > 0 && (
          <section className="bg-white rounded-2xl border border-[#D1E8C8] p-6 shadow-sm">
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-3">Marcas com quem já trabalhei</h2>
            <div className="flex flex-wrap gap-2">
              {pastBrands.map(b => (
                <span key={b} className="bg-[#F0F7EC] border border-[#D1E8C8] text-[#1A2547] text-sm font-semibold px-3 py-1.5 rounded-full">
                  {b}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Fee */}
        {mk.show_fee && mk.average_fee && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-1">Cachê médio por publi</h2>
            <p className="text-3xl font-black text-[#1A2547]">{formatCurrency(mk.average_fee as number)}</p>
            <p className="text-xs text-[#8A9BBE] mt-1">Valor de referência — negociável conforme o escopo.</p>
          </section>
        )}

        {/* Contact CTA */}
        {mk.contact_email && (
          <section className="text-center">
            <h2 className="font-nunito text-lg font-black text-[#1A2547] mb-2">Vamos trabalhar juntos?</h2>
            <p className="text-[#5A6A82] text-sm mb-5">Envie uma proposta de parceria diretamente para o e-mail abaixo.</p>
            <a
              href={`mailto:${mk.contact_email}`}
              className="inline-flex items-center gap-3 bg-[#5DC93E] text-[#1A2547] font-bold text-base px-8 py-4 rounded-2xl hover:bg-[#4db534] transition-colors shadow-md"
            >
              ✉ {mk.contact_email}
            </a>
          </section>
        )}
      </div>

      <footer className="border-t border-[#D1E8C8] py-8 mt-10 text-center">
        <a href="/" className="text-sm text-[#8A9BBE] hover:text-[#1A2547] transition-colors">
          Criado com <span className="text-[#5DC93E] font-semibold">Pivo</span> — CRM para criadores de conteúdo
        </a>
      </footer>
    </div>
  );
}
