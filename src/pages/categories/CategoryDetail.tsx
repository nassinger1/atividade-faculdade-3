import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategory, deleteCategory } from "../../api/categories";
import { listEnrollments } from "../../api/enrollments";
import { getErrorMessage } from "../../api/client";
import type { Category, Enrollment } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { Spinner, ErrorBlock } from "../../components/StateBlock";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { formatDate, isExpired } from "../../hooks/dates";
import ui from "../../components/ui.module.css";
import styles from "./CategoryDetail.module.css";

export function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [cat, enrs] = await Promise.all([
        getCategory(Number(id)),
        listEnrollments(),
      ]);
      if (!cat) {
        setError("Categoria não encontrada.");
        return;
      }
      setCategory(cat);
      setEnrollments(enrs.filter((e) => e.categoryId === Number(id)));
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao carregar a categoria."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function confirmDelete() {
    if (!category) return;
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      toast.success("Categoria excluída.");
      navigate("/categorias");
    } catch (err) {
      toast.error(getErrorMessage(err, "Falha ao excluir a categoria."));
      setDeleting(false);
      setConfirm(false);
    }
  }

  if (loading) return <Spinner />;
  if (error || !category)
    return (
      <ErrorBlock
        message={error ?? "Categoria não encontrada."}
        onRetry={() => navigate("/categorias")}
      />
    );

  return (
    <div>
      <Link to="/categorias" className={ui.backLink}>
        ← Voltar para categorias
      </Link>

      <PageHeader
        eyebrow={`Categoria #${category.id}`}
        title={category.name}
        actions={
          <>
            <Link
              to={`/categorias/${category.id}/editar`}
              className={`${ui.btn} ${ui.btnGhost}`}
            >
              Editar
            </Link>
            <button
              className={`${ui.btn} ${ui.btnDanger}`}
              onClick={() => setConfirm(true)}
            >
              Excluir
            </button>
          </>
        }
      />

      <div className={styles.meta}>
        <div className={`${ui.card} ${styles.metaCard}`}>
          <span className="field-label">Duração do acesso</span>
          <strong className={styles.metaValue}>
            {category.durationMonths}{" "}
            {category.durationMonths === 1 ? "mês" : "meses"}
          </strong>
        </div>
        <div className={`${ui.card} ${styles.metaCard}`}>
          <span className="field-label">Matrículas vinculadas</span>
          <strong className={styles.metaValue}>{enrollments.length}</strong>
        </div>
      </div>

      <section className={styles.related}>
        <h2 className={styles.relatedTitle}>Alunos nesta categoria</h2>
        {enrollments.length === 0 ? (
          <p className={styles.none}>
            Nenhuma matrícula usa esta categoria ainda.
          </p>
        ) : (
          <ul className={styles.list}>
            {enrollments.map((e) => (
              <li key={e.id}>
                <Link to={`/matriculas/${e.id}`} className={styles.row}>
                  <span className={styles.rowName}>{e.studentName}</span>
                  <span className={styles.rowDate}>
                    {formatDate(e.startDate)} → {formatDate(e.endDate)}
                  </span>
                  <span
                    className={`${ui.badge} ${
                      isExpired(e.endDate) ? ui.badgeExpired : ui.badgeOk
                    }`}
                  >
                    {isExpired(e.endDate) ? "Expirado" : "Ativo"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirm}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${category.name}"?`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
