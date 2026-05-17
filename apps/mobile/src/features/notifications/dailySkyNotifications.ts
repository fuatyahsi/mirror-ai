import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Locale } from "@/i18n";

const DAILY_SKY_CHANNEL_ID = "daily-sky";
const RELATIONSHIP_TIMING_CHANNEL_ID = "relationship-timing";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

type RegisterDailySkyNotificationsInput = {
  locale: Locale;
  timezone?: string;
  dailyHour?: number;
};

export async function registerDailySkyNotifications({
  locale,
  timezone,
  dailyHour = 9
}: RegisterDailySkyNotificationsInput) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(DAILY_SKY_CHANNEL_ID, {
      name: locale === "en" ? "Daily Sky Mirror" : "Günlük Gökyüzü Aynası",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 220, 120, 220],
      lightColor: "#D8B56D"
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const finalPermission =
    currentPermission.status === "granted" ? currentPermission : await Notifications.requestPermissionsAsync();

  if (finalPermission.status !== "granted") {
    return {
      enabled: false,
      reason: "permission_denied" as const
    };
  }

  await scheduleLocalDailySkyNotification(locale, dailyHour);

  let expoPushToken: string | undefined;
  let remoteRegistered = false;
  try {
    const tokenResult = await Notifications.getExpoPushTokenAsync();
    expoPushToken = tokenResult.data;

    if (isSupabaseConfigured && expoPushToken) {
      const { error } = await supabase.functions.invoke("register-push-token", {
        body: {
          expo_push_token: expoPushToken,
          platform: Platform.OS,
          locale,
          timezone,
          daily_hour: dailyHour,
          enabled: true
        }
      });
      remoteRegistered = !error;
    }
  } catch {
    // Local notifications still work even if remote Expo push token creation fails on an emulator.
  }

  return {
    enabled: true,
    expoPushToken,
    remoteRegistered,
    localScheduled: true
  };
}

export async function disableDailySkyNotifications(expoPushToken?: string) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (isSupabaseConfigured && expoPushToken) {
    await supabase.functions.invoke("register-push-token", {
      body: {
        expo_push_token: expoPushToken,
        enabled: false
      }
    });
  }
}

export function addDailySkyNotificationResponseListener(onOpen: () => void) {
  return Notifications.addNotificationResponseReceivedListener(() => {
    onOpen();
  });
}

// Push bildiriminin data payload'una göre yönlendirme yapar:
// - relationship_follow_up: ilişki sekmesine git, kullanıcı haftalık raporu açsın
// - daily_sky / diğer: ana ekrana
export type PushPayload = {
  type?: string;
  relationship_key?: string;
  relationship_id?: string;
  source_reading_id?: string;
  follow_up_id?: string;
};

export function addRelationshipFollowUpListener(
  onRelationshipFollowUp: (payload: PushPayload) => void,
  onOther: () => void
) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = (response?.notification?.request?.content?.data ?? {}) as PushPayload;
    if (data?.type === "relationship_follow_up") {
      onRelationshipFollowUp(data);
    } else {
      onOther();
    }
  });
}

export async function scheduleRelationshipTimingNotification(input: {
  locale: Locale;
  nickname?: string;
  suggestedTone?: string;
  dailyHour?: number;
}) {
  const dailyHour = input.dailyHour ?? 20;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(RELATIONSHIP_TIMING_CHANNEL_ID, {
      name: input.locale === "en" ? "Relationship timing" : "İlişki zamanlaması",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 100, 180],
      lightColor: "#5EC4C0"
    });
  }

  const currentPermission = await Notifications.getPermissionsAsync();
  const finalPermission =
    currentPermission.status === "granted" ? currentPermission : await Notifications.requestPermissionsAsync();
  if (finalPermission.status !== "granted") return { enabled: false as const };

  await Notifications.scheduleNotificationAsync({
    content: {
      title:
        input.locale === "en"
          ? `Relationship timing${input.nickname ? `: ${input.nickname}` : ""}`
          : `İlişki zamanlaması${input.nickname ? `: ${input.nickname}` : ""}`,
      body:
        input.suggestedTone ||
        (input.locale === "en"
          ? "Open Mirror AI before you message, interpret silence, or ask for clarity."
          : "Mesaj atmadan, sessizliği yorumlamadan veya netlik istemeden önce Mirror AI’da tonu kontrol et."),
      data: {
        route: "/tabs/relationship",
        reading_type: "relationship_timing"
      }
    },
    trigger: {
      channelId: RELATIONSHIP_TIMING_CHANNEL_ID,
      hour: dailyHour,
      minute: 30,
      repeats: true
    }
  });

  return { enabled: true as const };
}

async function scheduleLocalDailySkyNotification(locale: Locale, dailyHour: number) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: locale === "en" ? "Your Daily Sky Mirror is ready" : "Günlük Gökyüzü Aynan hazır",
      body:
        locale === "en"
          ? "Open Mirror AI for today's personal sky insight."
          : "Bugünün kişisel gökyüzü içgörüsünü Mirror AI'da aç.",
      data: {
        route: "/tabs/home",
        reading_type: "daily_sky"
      }
    },
    trigger: {
      channelId: DAILY_SKY_CHANNEL_ID,
      hour: dailyHour,
      minute: 0,
      repeats: true
    }
  });
}
