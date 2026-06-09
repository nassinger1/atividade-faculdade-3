// Domain types mirroring the Sequelize models exposed by the API.

export interface Category {
  id: number;
  name: string;
  durationMonths: number;
  createdAt?: string;
  updatedAt?: string;
}

// Payload sent to POST /categories and PUT /categories/:id
export interface CategoryInput {
  name: string;
  durationMonths: number;
}

export interface Enrollment {
  id: number;
  studentName: string;
  startDate: string;
  endDate: string;
  categoryId: number;
  // Returned by the API on GET (Enrollment.findAll/findByPk with include: Category).
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

// Payload for POST /enrollments. The API computes endDate from the
// category duration, so we only send these three fields on create.
export interface EnrollmentCreateInput {
  studentName: string;
  startDate: string;
  categoryId: number;
}

// Payload for PUT /enrollments/:id. The API's update does NOT recompute
// endDate, so we send the (client-recomputed) endDate to keep the
// business rule consistent across edits.
export interface EnrollmentUpdateInput {
  studentName: string;
  startDate: string;
  categoryId: number;
  endDate: string;
}
