import { query } from "@/lib/db";
import { getUserFromRequest, jsonResponse, requireAdmin } from "@/lib/auth";
import type { Computer } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

  const result = await query<Computer>(`
    SELECT c.*, cat.name as category_name, b.name as brand_name, m.name as model_name
    FROM computers c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN brands b ON c.brand_id = b.id
    LEFT JOIN models m ON c.model_id = m.id
    ORDER BY c.id DESC
  `);

  return jsonResponse({ data: result.rows });
}

export async function POST(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { name, category_id, brand_id, model_id, serial_number } =
    await request.json();

  const result = await query<Computer>(
    `INSERT INTO computers (name, category_id, brand_id, model_id, serial_number, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      name,
      category_id || null,
      brand_id || null,
      model_id || null,
      serial_number,
      user.id,
    ],
  );

  return jsonResponse({ data: result.rows[0] }, 201);
}

export async function PUT(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { name, category_id, brand_id, model_id, serial_number, status } =
    await request.json();

  const result = await query<Computer>(
    `UPDATE computers
     SET name = $1, category_id = $2, brand_id = $3, model_id = $4, serial_number = $5, status = $6
     WHERE id = $7 RETURNING *`,
    [
      name,
      category_id || null,
      brand_id || null,
      model_id || null,
      serial_number,
      status || "active",
      id,
    ],
  );

  return jsonResponse({ data: result.rows[0] });
}

export async function DELETE(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  requireAdmin(user);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await query("DELETE FROM computers WHERE id = $1", [id]);
  return jsonResponse({ message: "Deleted" });
}
