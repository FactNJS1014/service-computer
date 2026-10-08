import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { jsonResponse } from "@/lib/auth";
import type { ApiResponse } from "@/lib/types";

export async function POST(request: Request): Promise<Response> {
  try {
    const { username, email, password } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, 'user') RETURNING id, username, email, role`,
      [username, email, hashedPassword],
    );

    return jsonResponse<ApiResponse>({ user: result.rows[0] }, 201);
  } catch {
    return jsonResponse({ message: "Username or email already exists" }, 400);
  }
}
