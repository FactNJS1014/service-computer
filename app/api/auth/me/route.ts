import { getUserFromRequest, jsonResponse } from "@/lib/auth";

export async function GET(request: Request): Promise<Response> {
  const user = await getUserFromRequest(request);
  if (!user) {
    return jsonResponse({ message: "Unauthorized" }, 401);
  }
  return jsonResponse({ user });
}
