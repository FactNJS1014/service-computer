"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import type { Issue, Computer } from "@/lib/types";

export default function HomePage() {
  const { user, isAdmin, logout } = useAuth();
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const [issueRes, compRes] = await Promise.all([
          fetch("/api/issues", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((r) => r.json()),
          fetch("/api/computers", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }).then((r) => r.json()),
        ]);
        setRecentIssues((issueRes.data || []) as Issue[]);
        setComputers((compRes.data || []) as Computer[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <h1 className="text-4xl font-bold text-primary-700 mb-4">
            ระบบแจ้งปัญหาคอมพิวเตอร์
          </h1>
          <p className="text-gray-600 mb-8">
            จัดการ ติดตาม และแก้ไขปัญหาอุปกรณ์คอมพิวเตอร์
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
            >
              ลงทะเบียน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-700">แดชบอร์ด</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">สวัสดี, {user.username}</span>
            {isAdmin && (
              <Link href="/admin" className="text-accent-600 hover:underline">
                จัดการระบบ
              </Link>
            )}
            <button onClick={logout} className="text-red-500 hover:underline">
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">คอมพิวเตอร์ทั้งหมด</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {computers.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">ปัญหาทั้งหมด</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {recentIssues.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-gray-500 text-sm">รอดำเนินการ</h3>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {recentIssues.filter((i) => i.status === "pending").length}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">ปัญหาล่าสุด</h2>
          <Link
            href="/issues"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            แจ้งปัญหาใหม่
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลด...</p>
        ) : recentIssues.length === 0 ? (
          <p className="text-center text-gray-500 py-8">ยังไม่มีรายการปัญหา</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">หัวข้อ</th>
                  <th className="px-4 py-3">เครื่อง</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">ผู้แจ้ง</th>
                </tr>
              </thead>
              <tbody>
                {recentIssues.slice(0, 5).map((issue) => (
                  <tr key={issue.id} className="border-t">
                    <td className="px-4 py-3">{issue.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {issue.computer_name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          issue.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : issue.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : issue.status === "resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {issue.status === "pending"
                          ? "รอดำเนินการ"
                          : issue.status === "in_progress"
                            ? "กำลังดำเนินการ"
                            : issue.status === "resolved"
                              ? "เสร็จสิ้น"
                              : "ปิด"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {issue.reporter_name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
