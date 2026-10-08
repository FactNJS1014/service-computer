"use client";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { User, Category, Brand, ModelItem, Computer } from "@/lib/types";

type TabType = "users" | "categories" | "brands" | "models" | "computers";

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [uRes, cRes, bRes, mRes, coRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("/api/brands", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("/api/models", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("/api/computers", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);
      setUsers((uRes.users || []) as User[]);
      setCategories((cRes.data || []) as Category[]);
      setBrands((bRes.data || []) as Brand[]);
      setModels((mRes.data || []) as ModelItem[]);
      setComputers((coRes.data || []) as Computer[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) fetchAll();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">ไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      </div>
    );
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("ยืนยันการลบ?")) return;
    try {
      await api.deleteUser(id);
      fetchAll();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  };

  const handleAddCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createCategory(form.get("name") as string);
      fetchAll();
      e.currentTarget.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  };

  const handleAddBrand = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createBrand(form.get("name") as string);
      fetchAll();
      e.currentTarget.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  };

  const handleAddModel = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createModel({
        name: form.get("name") as string,
        brand_id: Number(form.get("brand_id")),
      });
      fetchAll();
      e.currentTarget.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  };

  const handleAddComputer = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api.createComputer({
        name: form.get("name") as string,
        category_id: form.get("category_id")
          ? Number(form.get("category_id"))
          : null,
        brand_id: form.get("brand_id") ? Number(form.get("brand_id")) : null,
        model_id: form.get("model_id") ? Number(form.get("model_id")) : null,
        serial_number: form.get("serial_number") as string,
      });
      fetchAll();
      e.currentTarget.reset();
    } catch (err) {
      alert(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "users", label: "ผู้ใช้งาน" },
    { key: "categories", label: "หมวดหมู่" },
    { key: "brands", label: "ยี่ห้อ" },
    { key: "models", label: "รุ่น" },
    { key: "computers", label: "คอมพิวเตอร์" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              ← กลับ
            </Link>
            <h1 className="text-xl font-bold text-primary-700">จัดการระบบ</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-8">กำลังโหลด...</p>
        ) : (
          <>
            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">ชื่อผู้ใช้</th>
                      <th className="px-4 py-3">อีเมล</th>
                      <th className="px-4 py-3">สิทธิ์</th>
                      <th className="px-4 py-3">วันที่สมัคร</th>
                      <th className="px-4 py-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="px-4 py-3">{u.username}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${u.role === "admin" ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-700"}`}
                          >
                            {u.role === "admin" ? "ผู้ดูแล" : "ผู้ใช้"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString("th-TH")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ลบ
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddCategory}
                  className="bg-white p-5 rounded-xl shadow-sm"
                >
                  <h3 className="font-semibold mb-3">เพิ่มหมวดหมู่</h3>
                  <div className="flex gap-3">
                    <input
                      name="name"
                      type="text"
                      placeholder="ชื่อหมวดหมู่"
                      required
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </form>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">ชื่อ</th>
                        <th className="px-4 py-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="px-4 py-3">{c.name}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm("ลบ?"))
                                  api.deleteCategory(c.id).then(fetchAll);
                              }}
                              className="text-red-500 text-sm"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Brands Tab */}
            {activeTab === "brands" && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddBrand}
                  className="bg-white p-5 rounded-xl shadow-sm"
                >
                  <h3 className="font-semibold mb-3">เพิ่มยี่ห้อ</h3>
                  <div className="flex gap-3">
                    <input
                      name="name"
                      type="text"
                      placeholder="ชื่อยี่ห้อ"
                      required
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </form>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">ชื่อ</th>
                        <th className="px-4 py-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((b) => (
                        <tr key={b.id} className="border-t">
                          <td className="px-4 py-3">{b.name}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm("ลบ?"))
                                  api.deleteBrand(b.id).then(fetchAll);
                              }}
                              className="text-red-500 text-sm"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Models Tab */}
            {activeTab === "models" && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddModel}
                  className="bg-white p-5 rounded-xl shadow-sm"
                >
                  <h3 className="font-semibold mb-3">เพิ่มรุ่น</h3>
                  <div className="flex gap-3 items-end">
                    <select
                      name="brand_id"
                      required
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="">เลือกยี่ห้อ</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <input
                      name="name"
                      type="text"
                      placeholder="ชื่อรุ่น"
                      required
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      type="submit"
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      เพิ่ม
                    </button>
                  </div>
                </form>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">ชื่อรุ่น</th>
                        <th className="px-4 py-3">ยี่ห้อ</th>
                        <th className="px-4 py-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((m) => (
                        <tr key={m.id} className="border-t">
                          <td className="px-4 py-3">{m.name}</td>
                          <td className="px-4 py-3">
                            {brands.find((b) => b.id === m.brand_id)?.name ||
                              "-"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm("ลบ?"))
                                  api.deleteModel(m.id).then(fetchAll);
                              }}
                              className="text-red-500 text-sm"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Computers Tab */}
            {activeTab === "computers" && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddComputer}
                  className="bg-white p-5 rounded-xl shadow-sm"
                >
                  <h3 className="font-semibold mb-3">เพิ่มคอมพิวเตอร์</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="name"
                      type="text"
                      placeholder="ชื่อ/รหัสเครื่อง"
                      required
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      name="serial_number"
                      type="text"
                      placeholder="ซีเรียลนัมเบอร์"
                      className="px-4 py-2 border rounded-lg"
                    />
                    <select
                      name="category_id"
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="">หมวดหมู่</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="brand_id"
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="">ยี่ห้อ</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="model_id"
                      className="px-4 py-2 border rounded-lg md:col-span-2"
                    >
                      <option value="">รุ่น</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    เพิ่ม
                  </button>
                </form>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">ชื่อ</th>
                        <th className="px-4 py-3">ยี่ห้อ/รุ่น</th>
                        <th className="px-4 py-3">สถานะ</th>
                        <th className="px-4 py-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {computers.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="px-4 py-3">
                            {c.name}
                            <br />
                            <small className="text-gray-400">
                              {c.serial_number || "-"}
                            </small>
                          </td>
                          <td className="px-4 py-3">
                            {c.brand_name || "-"}
                            {c.model_name ? ` / ${c.model_name}` : ""}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              {c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => {
                                if (confirm("ลบ?"))
                                  api.deleteComputer(c.id).then(fetchAll);
                              }}
                              className="text-red-500 text-sm"
                            >
                              ลบ
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
