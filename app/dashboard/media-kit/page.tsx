import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MediaKitEditor } from "./media-kit-editor";

export default async function MediaKitPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: mediaKit } = await supabase
    .from("media_kit")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: profile } = await supabase
    .from("users")
    .select("name, avatar_url, instagram_handle, niche, followers_count")
    .eq("id", user.id)
    .single();

  return (
    <MediaKitEditor
      initialMediaKit={mediaKit}
      profile={profile}
      userId={user.id}
    />
  );
}
