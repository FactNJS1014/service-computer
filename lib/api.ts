const API_URL = "/api";

interface RequestOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = (await res.json()) as T & { message?: string };
  if (!res.ok) throw new Error(data.message || "Error");
  return data;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface CreateIssueData {
  title: string;
  description?: string;
  computer_id?: number | null;
}

interface CreateComputerData {
  name: string;
  category_id?: number | null;
  brand_id?: number | null;
  model_id?: number | null;
  serial_number?: string;
}

export const api = {
  register: (body: RegisterData) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: LoginData) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),
  getUsers: () => request("/admin/users"),
  deleteUser: (id: string) =>
    request(`/admin/users?id=${id}`, { method: "DELETE" }),
  getCategories: () => request("/categories"),
  createCategory: (name: string) =>
    request("/categories", { method: "POST", body: JSON.stringify({ name }) }),
  deleteCategory: (id: number) =>
    request(`/categories?id=${id}`, { method: "DELETE" }),
  getBrands: () => request("/brands"),
  createBrand: (name: string) =>
    request("/brands", { method: "POST", body: JSON.stringify({ name }) }),
  deleteBrand: (id: number) =>
    request(`/brands?id=${id}`, { method: "DELETE" }),
  getModels: () => request("/models"),
  createModel: (data: { name: string; brand_id: number }) =>
    request("/models", { method: "POST", body: JSON.stringify(data) }),
  deleteModel: (id: number) =>
    request(`/models?id=${id}`, { method: "DELETE" }),
  getComputers: () => request("/computers"),
  createComputer: (data: CreateComputerData) =>
    request("/computers", { method: "POST", body: JSON.stringify(data) }),
  deleteComputer: (id: number) =>
    request(`/computers?id=${id}`, { method: "DELETE" }),
  getIssues: () => request("/issues"),
  createIssue: (data: CreateIssueData) =>
    request("/issues", { method: "POST", body: JSON.stringify(data) }),
};
