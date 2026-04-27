import { Redirect } from "expo-router";
import { useUserStore } from "@/stores/useUserStore";

export default function Index() {
  const profile = useUserStore((state) => state.profile);
  const hasPersonalProfile = profile.onboarding_completed && Boolean(profile.mystic_profile);
  return <Redirect href={hasPersonalProfile ? "/tabs/home" : "/onboarding"} />;
}
