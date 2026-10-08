import { query } from "@/lib/db";
import { getUserFromRequest, jsonResponse, requireAdmin } from "@/lib/auth";
import type { Brand } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

  const result = await query<Brand>("SELECT * FROM brands ORDER BY id DESC");
  return jsonResponse({ data: result.rows });
}

export async function POST(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { name } = await request.json();
  const result = await query<Brand>(
    "INSERT INTO brands (name, created_by) VALUES ($1, $2) RETURNING *",
    [name, user.id],
  );

  return jsonResponse({ data: result.rows[0] }, 201);
}

export async function PUT(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { name } = await request.json();

  const result = await query<Brand>(
    "UPDATE brands SET name = $1 WHERE id = $2 RETURNING *",
    [name, id],
  );

  return jsonResponse({ data: result.rows[0] });
}

export async function DELETE(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await query("DELETE FROM brands WHERE id = $1", [id]);
  return jsonResponse({ message: "Deleted" });
}
