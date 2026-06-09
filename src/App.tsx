import { Routes, Route, Navigate, Link } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/home/Dashboard";
import { CategoryList } from "./pages/categories/CategoryList";
import { CategoryForm } from "./pages/categories/CategoryForm";
import { CategoryDetail } from "./pages/categories/CategoryDetail";
import { EnrollmentList } from "./pages/enrollments/EnrollmentList";
import { EnrollmentForm } from "./pages/enrollments/EnrollmentForm";
import { EnrollmentDetail } from "./pages/enrollments/EnrollmentDetail";
import { EmptyState } from "./components/StateBlock";
import ui from "./components/ui.module.css";

function NotFound() {
  return (
    <EmptyState
      title="Página não encontrada"
      hint="O endereço acessado não existe."
      action={
        <Link to="/" className={`${ui.btn} ${ui.btnPrimary}`}>
          Ir para o painel
        </Link>
      }
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        {/* Categorias: listagem, cadastro, detalhe, edição */}
        <Route path="categorias" element={<CategoryList />} />
        <Route path="categorias/nova" element={<CategoryForm />} />
        <Route path="categorias/:id" element={<CategoryDetail />} />
        <Route path="categorias/:id/editar" element={<CategoryForm />} />

        {/* Matrículas: listagem, cadastro, detalhe, edição */}
        <Route path="matriculas" element={<EnrollmentList />} />
        <Route path="matriculas/nova" element={<EnrollmentForm />} />
        <Route path="matriculas/:id" element={<EnrollmentDetail />} />
        <Route path="matriculas/:id/editar" element={<EnrollmentForm />} />

        {/* Legado / aliases */}
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
