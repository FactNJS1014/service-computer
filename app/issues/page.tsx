"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Issue, Computer, IssueStatus } from "@/lib/types";

export default function IssuesPage() {
  const { user, isAdmin } = useAuth(); // ✅ มี isAdmin ใช้งานได้เลย
  const [issues, setIssues] = useState<Issue[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    computer_id: "" as string | number | null,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [iRes, cRes] = await Promise.all([
        fetch("/api/issues", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("/api/computers", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);
      setIssues((iRes.data || []) as Issue[]);
      setComputers((cRes.data || []) as Computer[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.createIssue({
        title: formData.title,
        description: formData.description,
        computer_id: formData.computer_id ? Number(formData.computer_id) : null,
      });
      setFormData({ title: "", description: "", computer_id: "" });
      setFormOpen(false);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    }
  };

  // ✅ เฉพาะ Admin เรียกได้
  const updateStatus = async (id: number, status: IssueStatus) => {
    if (!isAdmin) return;
    try {
      await fetch(`/api/issues?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    statusFilter === "all"
      ? issues
      : issues.filter((i) => i.status === statusFilter);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← กลับ
            </Link>
            <h1 className="text-xl font-bold text-primary-700">จัดการปัญหา</h1>
          </div>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            {formOpen ? "ยกเลิก" : "+ แจ้งปัญหาใหม่"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {formOpen && (
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-sm mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">แจ้งปัญหาใหม่</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อ *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เครื่องคอมพิวเตอร์
                </label>
                <select
                  value={formData.computer_id ?? ""}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      computer_id: e.target.value || null,
                    }))
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- ไม่ระบุ --</option>
                  {computers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.serial_number || "ไม่มีซีเรียล"})
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                บันทึก
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 mb-6">
          {["all", "pending", "in_progress", "resolved", "closed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                statusFilter === s
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {s === "all"
                ? "ทั้งหมด"
                : s === "pending"
                  ? "รอดำเนินการ"
                  : s === "in_progress"
                    ? "กำลังดำเนินการ"
                    : s === "resolved"
                      ? "เสร็จสิ้น"
                      : "ปิด"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">กำลังโหลด...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">ไม่มีรายการ</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((issue) => (
              <div key={issue.id} className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{issue.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {issue.description || "ไม่มีรายละเอียด"}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      <span>เครื่อง: {issue.computer_name || "-"}</span>
                      <span>แจ้งโดย: {issue.reporter_name || "-"}</span>
                      <span>
                        วันที่:{" "}
                        {new Date(issue.created_at).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
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

                    {/* ✅ เฉพาะ Admin เห็นปุ่ม */}
                    {isAdmin && (
                      <div className="flex gap-1 mt-2">
                        {issue.status === "pending" && (
                          <button
                            onClick={() =>
                              updateStatus(issue.id, "in_progress")
                            }
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            เริ่ม
                          </button>
                        )}
                        {issue.status === "in_progress" && (
                          <button
                            onClick={() => updateStatus(issue.id, "resolved")}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            เสร็จ
                          </button>
                        )}
                        {issue.status !== "closed" && (
                          <button
                            onClick={() => updateStatus(issue.id, "closed")}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                          >
                            ปิด
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
