import { corsHeaders, jsonResponse } from "../shared/cors.ts";
import { createServiceClient, requireUser } from "../shared/auth.ts";

const userScopedTables = [
  "notification_events",
  "push_tokens",
  "relationship_journal_entries",
  "reading_feedback",
  "coffee_readings",
  "tarot_spreads",
  "memory_events",
  "credit_transactions",
  "subscriptions",
  "user_credits",
  "relationships",
  "birth_charts",
  "user_personality_profile",
  "users_profile",
  "readings"
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { user } = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "account" ? "account" : "data";
    const service = createServiceClient();
    const storageRemoved = await deleteCoffeeStorageFolder(service, user.id);

    for (const table of userScopedTables) {
      const { error } = await service.from(table).delete().eq("user_id", user.id);
      if (error && !isMissingTableError(error)) throw error;
    }

    if (mode === "account") {
      const { error } = await service.auth.admin.deleteUser(user.id);
      if (error) throw error;
    }

    return jsonResponse({
      deleted: true,
      account_deleted: mode === "account",
      storage_removed: storageRemoved
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ error: error instanceof Error ? error.message : "Unexpected error" }, 500);
  }
});

async function deleteCoffeeStorageFolder(service: ReturnType<typeof createServiceClient>, userId: string) {
  const bucket = service.storage.from("coffee-readings");
  const paths = await listStoragePaths(bucket, userId);
  if (!paths.length) return 0;

  const { error } = await bucket.remove(paths);
  if (error) throw error;
  return paths.length;
}

async function listStoragePaths(bucket: any, folder: string): Promise<string[]> {
  const { data, error } = await bucket.list(folder, { limit: 1000 });
  if (error) {
    if (/not found|does not exist/i.test(error.message)) return [];
    throw error;
  }

  const paths: string[] = [];
  for (const item of data ?? []) {
    const itemPath = `${folder}/${item.name}`;
    if (item.id) {
      paths.push(itemPath);
    } else {
      paths.push(...(await listStoragePaths(bucket, itemPath)));
    }
  }
  return paths;
}

function isMissingTableError(error: { message?: string; code?: string }) {
  return error.code === "42P01" || /does not exist|schema cache/i.test(error.message ?? "");
}
