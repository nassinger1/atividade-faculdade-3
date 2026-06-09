import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCategories } from "../../api/categories";
import { listEnrollments } from "../../api/enrollments";
import { getErrorMessage } from "../../api/client";
import type { Category, Enrollment } from "../../types";
import { Spinner, ErrorBlock } from "../../components/StateBlock";
import { isExpired } from "../../hooks/dates";
import ui from "../../components/ui.module.css";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [cats, enrs] = await Promise.all([
        listCategories(),
        listEnrollments(),
      ]);
      setCategories(cats);
      setEnrollments(enrs);
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao carregar o painel."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Spinner label="Montando o painel…" />;
  if (error) return <ErrorBlock message={error} onRetry={load} />;

  const active = enrollments.filter((e) => !isExpired(e.endDate)).length;
  const expired = enrollments.length - active;

  return (
    <div>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Painel</p>
        <h1 className={styles.heroTitle}>
          Controle de acesso aos cursos,
          <br />
          calculado a partir de cada categoria.
        </h1>
        <p className={styles.heroText}>
          Cadastre categorias com a duração em meses e registre matrículas — a
          data de término do acesso é calculada automaticamente pela regra de
          negócio da API.
        </p>
        <div className={styles.heroActions}>
          <Link to="/matriculas/nova" className={`${ui.btn} ${ui.btnPrimary}`}>
            + Nova matrícula
          </Link>
          <Link to="/categorias/nova" className={`${ui.btn} ${ui.btnGhost}`}>
            + Nova categoria
          </Link>
        </div>
      </section>

      <section className={styles.stats}>
        <Link to="/categorias" className={`${ui.card} ${styles.stat}`}>
          <span className={styles.statNum}>{categories.length}</span>
          <span className={styles.statLabel}>Categorias cadastradas</span>
          <span className={styles.statArrow}>Ver categorias →</span>
        </Link>

        <Link to="/matriculas" className={`${ui.card} ${styles.stat}`}>
          <span className={styles.statNum}>{enrollments.length}</span>
          <span className={styles.statLabel}>Matrículas no total</span>
          <span className={styles.statArrow}>Ver matrículas →</span>
        </Link>

        <div className={`${ui.card} ${styles.stat}`}>
          <span className={`${styles.statNum} ${styles.ok}`}>{active}</span>
          <span className={styles.statLabel}>Acessos ativos</span>
        </div>

        <div className={`${ui.card} ${styles.stat}`}>
          <span className={`${styles.statNum} ${styles.expired}`}>
            {expired}
          </span>
          <span className={styles.statLabel}>Acessos expirados</span>
        </div>
      </section>

      <section className={styles.recent}>
        <div className={styles.recentHead}>
          <h2 className={styles.recentTitle}>Matrículas recentes</h2>
          <Link to="/matriculas" className={ui.btnSubtle + " " + ui.btn}>
            Ver todas →
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <p className={styles.none}>Nenhuma matrícula registrada ainda.</p>
        ) : (
          <ul className={styles.list}>
            {[...enrollments]
              .slice(-5)
              .reverse()
              .map((e) => (
                <li key={e.id}>
                  <Link to={`/matriculas/${e.id}`} className={styles.row}>
                    <span className={styles.rowName}>{e.studentName}</span>
                    <span className={styles.rowCat}>
                      {e.category?.name ?? "—"}
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
    </div>
  );
}
