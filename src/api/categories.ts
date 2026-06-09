import { api } from "./client";
import type { Category, CategoryInput } from "../types";

// GET /categories
export async function listCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories");
  return data;
}

// GET /categories/:id
export async function getCategory(id: number): Promise<Category> {
  const { data } = await api.get<Category>(`/categories/${id}`);
  return data;
}

// POST /categories
export async function createCategory(
  payload: CategoryInput
): Promise<Category> {
  const { data } = await api.post<Category>("/categories", payload);
  return data;
}

// PUT /categories/:id  (API responds 204 No Content)
export async function updateCategory(
  id: number,
  payload: CategoryInput
): Promise<void> {
  await api.put(`/categories/${id}`, payload);
}

// DELETE /categories/:id  (API responds 204 No Content)
export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
