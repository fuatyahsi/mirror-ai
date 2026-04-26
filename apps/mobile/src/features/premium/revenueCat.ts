export type EntitlementStatus = {
  isPremium: boolean;
  activeEntitlement?: string;
};

export async function getRevenueCatEntitlement(): Promise<EntitlementStatus> {
  return {
    isPremium: false
  };
}

export async function presentPaywallPlaceholder() {
  return {
    completed: false,
    reason: "RevenueCat integration is a phase-two placeholder."
  };
}

