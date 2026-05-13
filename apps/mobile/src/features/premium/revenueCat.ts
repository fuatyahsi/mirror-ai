import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, type CustomerInfo, type PurchasesPackage } from "react-native-purchases";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type RevenueCatSetupReason = "missing_key" | "test_key_in_release";

export type EntitlementStatus = {
  isPremium: boolean;
  activeEntitlement?: string;
  expiresAt?: string | null;
};

export type PurchaseResult = {
  completed: boolean;
  reason?: RevenueCatSetupReason | "no_offering" | "cancelled" | "not_premium" | "purchase_failed";
  entitlement?: EntitlementStatus;
};

export type StorePackagePreview = {
  packageIdentifier: string;
  productIdentifier: string;
  title: string;
  description: string;
  priceString: string;
  pricePerMonthString?: string | null;
};

export type RevenueCatOfferPreview = {
  configured: boolean;
  hasOffering: boolean;
  reason?: RevenueCatSetupReason;
  monthly?: StorePackagePreview;
  yearly?: StorePackagePreview;
  creditSmall?: StorePackagePreview;
};

export const revenueCatConfig = {
  entitlementId: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "mirror_plus",
  offeringId: process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID ?? "default",
  monthlyProductId: process.env.EXPO_PUBLIC_REVENUECAT_PLUS_MONTHLY_PRODUCT_ID ?? "mirror_plus_monthly",
  yearlyProductId: process.env.EXPO_PUBLIC_REVENUECAT_PLUS_YEARLY_PRODUCT_ID ?? "mirror_plus_yearly",
  creditSmallProductId: process.env.EXPO_PUBLIC_REVENUECAT_CREDIT_SMALL_PRODUCT_ID ?? "mirror_credits_10"
};

let configured = false;
let configuredUserId: string | undefined;

export async function getRevenueCatEntitlement(): Promise<EntitlementStatus> {
  const setup = await configureRevenueCat();
  if (!setup.configured) return { isPremium: false };

  const customerInfo = await Purchases.getCustomerInfo();
  await syncRevenueCatToSupabase();
  return readEntitlement(customerInfo);
}

export async function getRevenueCatOfferPreview(): Promise<RevenueCatOfferPreview> {
  const setup = await configureRevenueCat();
  if (!setup.configured) return { configured: false, hasOffering: false, reason: setup.reason };

  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[revenueCatConfig.offeringId] ?? offerings.current;
    const packages = offering?.availablePackages ?? [];

    return {
      configured: true,
      hasOffering: Boolean(offering),
      monthly: toStorePackagePreview(findMatchingPackage(packages, revenueCatConfig.monthlyProductId)),
      yearly: toStorePackagePreview(findMatchingPackage(packages, revenueCatConfig.yearlyProductId)),
      creditSmall: toStorePackagePreview(findMatchingPackage(packages, revenueCatConfig.creditSmallProductId))
    };
  } catch {
    return { configured: true, hasOffering: false };
  }
}

export async function purchasePlus(packageIdentifier?: string): Promise<PurchaseResult> {
  const setup = await configureRevenueCat();
  if (!setup.configured) return { completed: false, reason: setup.reason ?? "missing_key" };

  try {
    const offeringPackage = await findPackage(packageIdentifier ?? revenueCatConfig.yearlyProductId);
    if (!offeringPackage) return { completed: false, reason: "no_offering" };

    const { customerInfo } = await Purchases.purchasePackage(offeringPackage);
    await syncRevenueCatToSupabase();
    const entitlement = readEntitlement(customerInfo);
    return { completed: entitlement.isPremium, reason: entitlement.isPremium ? undefined : "not_premium", entitlement };
  } catch (error) {
    if (isRevenueCatCancellation(error)) return { completed: false, reason: "cancelled" };
    return { completed: false, reason: "purchase_failed" };
  }
}

export async function purchaseCreditPack(): Promise<PurchaseResult> {
  const setup = await configureRevenueCat();
  if (!setup.configured) return { completed: false, reason: setup.reason ?? "missing_key" };

  try {
    const offeringPackage = await findPackage(revenueCatConfig.creditSmallProductId);
    if (!offeringPackage) return { completed: false, reason: "no_offering" };

    await Purchases.purchasePackage(offeringPackage);
    await syncRevenueCatToSupabase();
    return { completed: true };
  } catch (error) {
    if (isRevenueCatCancellation(error)) return { completed: false, reason: "cancelled" };
    return { completed: false, reason: "purchase_failed" };
  }
}

export async function restoreRevenueCatPurchases(): Promise<PurchaseResult> {
  const setup = await configureRevenueCat();
  if (!setup.configured) return { completed: false, reason: setup.reason ?? "missing_key" };

  const customerInfo = await Purchases.restorePurchases();
  await syncRevenueCatToSupabase();
  const entitlement = readEntitlement(customerInfo);
  return { completed: entitlement.isPremium, reason: entitlement.isPremium ? undefined : "not_premium", entitlement };
}

export async function presentPaywallPlaceholder() {
  return purchasePlus();
}

async function configureRevenueCat() {
  const apiKey = Platform.OS === "ios" ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  if (!apiKey) return { configured: false, reason: "missing_key" as const };
  if (!__DEV__ && apiKey.startsWith("test_")) {
    return { configured: false, reason: "test_key_in_release" as const };
  }

  const appUserID = await getCurrentUserId();
  if (!configured) {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey, appUserID });
    configured = true;
    configuredUserId = appUserID;
    return { configured: true };
  }

  if (appUserID && configuredUserId !== appUserID) {
    await Purchases.logIn(appUserID);
    configuredUserId = appUserID;
  }

  return { configured: true };
}

async function findPackage(preferredProductId: string): Promise<PurchasesPackage | undefined> {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.all[revenueCatConfig.offeringId] ?? offerings.current;
  const packages = offering?.availablePackages ?? [];

  return (
    findMatchingPackage(packages, preferredProductId) ??
    packages.find((item) => item.product.identifier === revenueCatConfig.yearlyProductId) ??
    packages[0]
  );
}

function findMatchingPackage(packages: PurchasesPackage[], preferredProductId: string) {
  return packages.find(
    (item) =>
      item.product.identifier === preferredProductId ||
      item.identifier === preferredProductId ||
      item.identifier.replace("$", "") === preferredProductId
  );
}

function toStorePackagePreview(packageItem?: PurchasesPackage): StorePackagePreview | undefined {
  if (!packageItem) return undefined;

  return {
    packageIdentifier: packageItem.identifier,
    productIdentifier: packageItem.product.identifier,
    title: packageItem.product.title,
    description: packageItem.product.description,
    priceString: packageItem.product.priceString,
    pricePerMonthString: packageItem.product.pricePerMonthString
  };
}

function readEntitlement(customerInfo: CustomerInfo): EntitlementStatus {
  const active = customerInfo.entitlements.active[revenueCatConfig.entitlementId];
  return {
    isPremium: Boolean(active),
    activeEntitlement: active?.identifier,
    expiresAt: active?.expirationDate ?? null
  };
}

async function getCurrentUserId() {
  if (!isSupabaseConfigured) return undefined;
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

async function syncRevenueCatToSupabase() {
  if (!isSupabaseConfigured) return;
  await supabase.functions.invoke("sync-revenuecat-entitlement", { body: {} }).catch(() => undefined);
}

function isRevenueCatCancellation(error: unknown) {
  return Boolean(error && typeof error === "object" && "userCancelled" in error && error.userCancelled);
}
