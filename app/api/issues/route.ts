import { query } from "@/lib/db";
import { getUserFromRequest, jsonResponse, requireAdmin } from "@/lib/auth";
import type { Issue, IssueStatus } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

  const result = await query<Issue>(`
    SELECT i.*, u1.username as reporter_name, u2.username as assignee_name, c.name as computer_name
    FROM issues i
    LEFT JOIN users u1 ON i.reported_by = u1.id
    LEFT JOIN users u2 ON i.assigned_to = u2.id
    LEFT JOIN computers c ON i.computer_id = c.id
    ORDER BY i.created_at DESC
  `);

  return jsonResponse({ data: result.rows });
}

export async function POST(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) return jsonResponse({ message: "Unauthorized" }, 401);

  const { title, description, computer_id } = await request.json();

  const result = await query<Issue>(
    `INSERT INTO issues (title, description, computer_id, reported_by)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, description, computer_id || null, user.id],
  );

  return jsonResponse({ data: result.rows[0] }, 201);
}

export async function PUT(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);

  // ✅ เพิ่มตรงนี้ — เฉพาะ Admin เท่านั้นที่อัปเดตสถานะได้
  if (!user || user.role !== "admin") {
    return jsonResponse({ message: "Admin access required" }, 403);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { status, assigned_to } = await request.json();

  const result = await query<Issue>(
    `UPDATE issues
     SET status = COALESCE($1, status), assigned_to = COALESCE($2, assigned_to), updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [status, assigned_to, id],
  );

  if (!result.rows.length) {
    return jsonResponse({ message: "Issue not found" }, 404);
  }

  return jsonResponse({ data: result.rows[0] });
}

export async function DELETE(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);

  // ✅ ลบก็เฉพาะ Admin เท่านั้น
  if (!user || user.role !== "admin") {
    return jsonResponse({ message: "Admin access required" }, 403);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  await query("DELETE FROM issues WHERE id = $1", [id]);
  return jsonResponse({ message: "Deleted" });
}
