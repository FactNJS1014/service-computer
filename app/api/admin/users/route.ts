import { query } from "@/lib/db";
import { getUserFromRequest, jsonResponse, requireAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const result = await query<User>(
    "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC",
  );

  return jsonResponse({ users: result.rows });
}

export async function DELETE(request: Request): Promise<Response> {
  const currentUser = await getUserFromRequest(request);
  requireAdmin(currentUser);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id === currentUser?.id) {
    return jsonResponse({ message: "Cannot delete yourself" }, 400);
  }

  await query("DELETE FROM users WHERE id = $1", [id]);
  return jsonResponse({ message: "User deleted" });
}
