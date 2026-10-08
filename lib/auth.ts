import "server-only";
import jwt from "jsonwebtoken";
import { query } from "./db";
import type { User, UserRole } from "./types";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  id: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(
  request: Request,
): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const result = await query<User>(
    "SELECT id, username, email, role FROM users WHERE id = $1",
    [decoded.id],
  );
  return result.rows[0] || null;
}

export function jsonResponse<T = unknown>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function requireAdmin(user: User | null): void {
  if (!user || user.role !== "admin") {
    throw new Error("Admin access required");
  }
}
