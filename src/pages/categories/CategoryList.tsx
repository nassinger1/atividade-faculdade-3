import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listCategories, deleteCategory } from "../../api/categories";
import { getErrorMessage } from "../../api/client";
import type { Category } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { Spinner, ErrorBlock, EmptyState } from "../../components/StateBlock";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import ui from "../../components/ui.module.css";
import styles from "./Categories.module.css";

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setCategories(await listCategories());
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível listar as categorias."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteCategory(target.id);
      toast.success(`Categoria "${target.name}" excluída.`);
      setCategories((prev) => prev.filter((c) => c.id !== target.id));
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Falha ao excluir a categoria."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catálogo"
        title="Categorias de cursos"
        description="Cada categoria define a duração do acesso, em meses. Esse valor é a base do cálculo da data de término das matrículas."
        actions={
          <Link to="/categorias/nova" className={`${ui.btn} ${ui.btnPrimary}`}>
            + Nova categoria
          </Link>
        }
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria ainda"
          hint="Comece criando a primeira categoria de curso."
          action={
            <Link
              to="/categorias/nova"
              className={`${ui.btn} ${ui.btnPrimary}`}
            >
              + Nova categoria
            </Link>
          }
        />
      ) : (
        <div className={styles.grid}>
          {categories.map((c) => (
            <article key={c.id} className={`${ui.card} ${styles.cat}`}>
              <div
                className={styles.catBody}
                onClick={() => navigate(`/categorias/${c.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate(`/categorias/${c.id}`)
                }
              >
                <span className={`${ui.badge} ${ui.badgeForest}`}>
                  {c.durationMonths}{" "}
                  {c.durationMonths === 1 ? "mês" : "meses"}
                </span>
                <h3 className={styles.catName}>{c.name}</h3>
                <span className={styles.catId}>#{c.id}</span>
              </div>
              <div className={styles.catActions}>
                <Link
                  to={`/categorias/${c.id}/editar`}
                  className={`${ui.btn} ${ui.btnSubtle}`}
                >
                  Editar
                </Link>
                <button
                  className={`${ui.btn} ${ui.btnDanger}`}
                  onClick={() => setTarget(c)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${target?.name}"? Matrículas vinculadas podem ser afetadas.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
