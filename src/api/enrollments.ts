import { api } from "./client";
import type {
  Enrollment,
  EnrollmentCreateInput,
  EnrollmentUpdateInput,
} from "../types";

// GET /enrollments (includes nested category)
export async function listEnrollments(): Promise<Enrollment[]> {
  const { data } = await api.get<Enrollment[]>("/enrollments");
  return data;
}

// GET /enrollments/:id (includes nested category)
export async function getEnrollment(id: number): Promise<Enrollment> {
  const { data } = await api.get<Enrollment>(`/enrollments/${id}`);
  return data;
}

// POST /enrollments — server computes endDate from the category duration
export async function createEnrollment(
  payload: EnrollmentCreateInput
): Promise<Enrollment> {
  const { data } = await api.post<Enrollment>("/enrollments", payload);
  return data;
}

// PUT /enrollments/:id (API responds 204 No Content)
export async function updateEnrollment(
  id: number,
  payload: EnrollmentUpdateInput
): Promise<void> {
  await api.put(`/enrollments/${id}`, payload);
}

// DELETE /enrollments/:id (API responds 204 No Content)
export async function deleteEnrollment(id: number): Promise<void> {
  await api.delete(`/enrollments/${id}`);
}
