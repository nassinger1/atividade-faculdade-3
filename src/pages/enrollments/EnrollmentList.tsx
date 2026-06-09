import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { deleteEnrollment, listEnrollments } from "../../api/enrollments";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { PageHeader } from "../../components/PageHeader";
import { EmptyState, ErrorBlock, Spinner } from "../../components/StateBlock";
import { useToast } from "../../components/Toast";
import ui from "../../components/ui.module.css";
import { accessStatus, formatDate } from "../../hooks/dates";
import type { Enrollment } from "../../types";
import styles from "./Enrollments.module.css";

export function EnrollmentList() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [target, setTarget] = useState<Enrollment | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [query, setQuery] = useState("");
    const toast = useToast();

    async function load() {
        setLoading(true);
        setError(null);
        try {
            setEnrollments(await listEnrollments());
        } catch (err) {
            setError(
                getErrorMessage(err, "Não foi possível listar as matrículas.")
            );
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
            await deleteEnrollment(target.id);
            toast.success(`Matrícula de "${target.studentName}" excluída.`);
            setEnrollments((prev) => prev.filter((e) => e.id !== target.id));
            setTarget(null);
        } catch (err) {
            toast.error(getErrorMessage(err, "Falha ao excluir a matrícula."));
        } finally {
            setDeleting(false);
        }
    }

    const filtered = enrollments.filter((e) =>
        e.studentName.toLowerCase().includes(query.trim().toLowerCase())
    );

    return (
        <div>
            <PageHeader
                eyebrow="Registros"
                title="Matrículas"
                description="Cada matrícula vincula um aluno a uma categoria. A data de término do acesso é calculada automaticamente a partir da duração da categoria."
                actions={
                    <Link
                        to="/matriculas/nova"
                        className={`${ui.btn} ${ui.btnPrimary}`}
                    >
                        + Nova matrícula
                    </Link>
                }
            />

            {loading ? (
                <Spinner />
            ) : error ? (
                <ErrorBlock message={error} onRetry={load} />
            ) : enrollments.length === 0 ? (
                <EmptyState
                    title="Nenhuma matrícula ainda"
                    hint="Registre o primeiro aluno em uma categoria de curso."
                    action={
                        <Link
                            to="/matriculas/nova"
                            className={`${ui.btn} ${ui.btnPrimary}`}
                        >
                            + Nova matrícula
                        </Link>
                    }
                />
            ) : (
                <>
                    <div className={styles.toolbar}>
                        <input
                            className={styles.search}
                            placeholder="Buscar por nome do aluno…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <span className={styles.count}>
                            {filtered.length} de {enrollments.length}
                        </span>
                    </div>

                    <div className={`${ui.card} ${styles.tableWrap}`}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Categoria</th>
                                    <th>Início</th>
                                    <th>Término</th>
                                    <th>Status</th>
                                    <th aria-label="Ações" />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((e) => {
                                    const status = accessStatus(e.endDate);
                                    return (
                                        <tr key={e.id}>
                                            <td>
                                                <Link
                                                    to={`/matriculas/${e.id}`}
                                                    className={styles.nameLink}
                                                >
                                                    {e.studentName}
                                                </Link>
                                            </td>
                                            <td className={styles.dim}>
                                                {e.category?.name ?? "-"}
                                            </td>
                                            <td className={styles.num}>
                                                {formatDate(e.startDate)}
                                            </td>
                                            <td className={styles.num}>
                                                {formatDate(e.endDate)}
                                            </td>
                                            <td>
                                                <span
                                                    className={`${ui.badge} ${
                                                        status.expired
                                                            ? ui.badgeExpired
                                                            : ui.badgeOk
                                                    }`}
                                                >
                                                    {status.expired
                                                        ? "Expirado"
                                                        : "Ativo"}
                                                </span>
                                            </td>
                                            <td className={styles.rowActions}>
                                                <Link
                                                    to={`/matriculas/${e.id}/editar`}
                                                    className={`${ui.btn} ${ui.btnSubtle}`}
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    className={`${ui.btn} ${ui.btnDanger}`}
                                                    onClick={() => setTarget(e)}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <p className={styles.noMatch}>
                                Nenhum aluno encontrado para “{query}”.
                            </p>
                        )}
                    </div>
                </>
            )}

            <ConfirmDialog
                open={target !== null}
                title="Excluir matrícula"
                message={`Tem certeza que deseja excluir a matrícula de "${target?.studentName}"?`}
                busy={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}
