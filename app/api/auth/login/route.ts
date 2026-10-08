import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { signToken, jsonResponse } from "@/lib/auth";

export async function POST(request: Request): Promise<Response> {
  try {
    const { email, password } = await request.json();

    // 1. หา user จากอีเมล
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);

    if (!result.rows.length) {
      console.log("❌ ไม่พบผู้ใช้:", email);
      return jsonResponse({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    const user = result.rows[0];

    // 2. เปรียบเทียบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ รหัสผ่านไม่ตรง");
      return jsonResponse({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, 401);
    }

    // 3. สร้าง Token
    const token = signToken({ id: user.id });

    console.log("✅ เข้าสู่ระบบสำเร็จ:", user.email);
    return jsonResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    return jsonResponse(
      { message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" },
      500,
    );
  }
}
