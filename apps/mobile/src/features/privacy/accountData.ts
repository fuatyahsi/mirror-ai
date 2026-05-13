import { assertRemoteServicesAvailable, isSupabaseConfigured, supabase } from "@/lib/supabase";

export type DeleteUserDataResult = {
  deleted: boolean;
  account_deleted?: boolean;
  local_only?: boolean;
  storage_removed?: number;
};

export async function deleteUserData(mode: "data" | "account" = "data"): Promise<DeleteUserDataResult> {
  assertRemoteServicesAvailable();

  if (!isSupabaseConfigured) {
    return { deleted: true, local_only: true };
  }

  const { data, error } = await supabase.functions.invoke("delete-user-data", {
    body: { mode }
  });

  if (error) throw error;
  return data as DeleteUserDataResult;
}
