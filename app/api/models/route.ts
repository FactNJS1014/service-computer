import { query } from "@/lib/db";
import { getUserFromRequest, jsonResponse, requireAdmin } from "@/lib/auth";
import type { ModelItem } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

  const result = await query<ModelItem>(
    "SELECT * FROM models ORDER BY id DESC",
  );
  return jsonResponse({ data: result.rows });
}

export async function POST(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { name, brand_id } = await request.json();
  const result = await query<ModelItem>(
    "INSERT INTO models (name, brand_id, created_by) VALUES ($1, $2, $3) RETURNING *",
    [name, brand_id, user.id],
  );

  return jsonResponse({ data: result.rows[0] }, 201);
}

export async function PUT(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { name, brand_id } = await request.json();

  const result = await query<ModelItem>(
    "UPDATE models SET name = $1, brand_id = $2 WHERE id = $3 RETURNING *",
    [name, brand_id, id],
  );

  return jsonResponse({ data: result.rows[0] });
}

export async function DELETE(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await query("DELETE FROM models WHERE id = $1", [id]);
  return jsonResponse({ message: "Deleted" });
}
