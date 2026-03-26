import { supabase } from "./supabase.js";
import { profileToDb, dbToProfile, DEFAULT_PROFILE } from "@cygnet/shared";
import type { Profile, DbProfile } from "@cygnet/shared";
import { getSettings, saveSettings } from "./storage.js";

export async function pushProfileToSupabase(profile: Profile): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const dbData = profileToDb(profile);
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...dbData })
    .select()
    .single();

  if (error) throw error;
}

export async function pullProfileFromSupabase(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return dbToProfile(data as DbProfile);
}

export async function syncProfile(): Promise<void> {
  const remoteProfile = await pullProfileFromSupabase();
  if (!remoteProfile) return;

  const settings = await getSettings();
  const local = settings.profile;

  const localHasData = Object.values(local).some((v) => v !== "");
  const remoteHasData = Object.values(remoteProfile).some((v) => v !== "");

  if (localHasData && !remoteHasData) {
    await pushProfileToSupabase(local);
    return;
  }

  if (remoteHasData) {
    // Keep password local-only and never overwrite it from cloud data.
    await saveSettings({
      ...settings,
      profile: { ...remoteProfile, password: local.password || "" },
    });
  }
}
