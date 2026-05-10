import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { addDailySkyNotificationResponseListener } from "@/features/notifications/dailySkyNotifications";
import { queryClient } from "@/lib/queryClient";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { colors } from "@/theme";

// Mirror AI ön yüzü çoğu işi local Zustand'da tutar; ama edge function'lar
// için kalıcı bir kullanıcı kimliği şart. İlk açılışta supabase anonymous
// sign-in ile bir kimlik oluşturup AsyncStorage üzerinden saklarız.
async function ensureAnonymousSession() {
  if (!isSupabaseConfigured) return;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return;
    await supabase.auth.signInAnonymously();
  } catch (error) {
    // Proje ayarlarında anon sign-in kapalıysa sessiz başarısızlık; edge
    // function 401 dönerse paywall yönlendirmesi devreye girer.
    console.warn("[auth] anonymous sign-in failed", error);
  }
}

export default function RootLayout() {
  useEffect(() => {
    ensureAnonymousSession();

    const subscription = addDailySkyNotificationResponseListener(() => {
      router.push("/tabs/home");
    });

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      />
    </QueryClientProvider>
  );
}
