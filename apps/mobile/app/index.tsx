import { Redirect } from "expo-router";
import { useUserStore } from "@/stores/useUserStore";

export default function Index() {
  const onboardingCompleted = useUserStore((state) => state.profile.onboarding_completed);
  return <Redirect href={onboardingCompleted ? "/tabs/home" : "/onboarding"} />;
}

