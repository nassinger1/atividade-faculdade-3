import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { deleteEnrollment, getEnrollment } from "../../api/enrollments";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { PageHeader } from "../../components/PageHeader";
import { ErrorBlock, Spinner } from "../../components/StateBlock";
import { useToast } from "../../components/Toast";
import ui from "../../components/ui.module.css";
import { accessStatus, formatDate } from "../../hooks/dates";
import type { Enrollment } from "../../types";
import styles from "./EnrollmentDetail.module.css";

export function EnrollmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirm, setConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const enr = await getEnrollment(Number(id));
            if (!enr) {
                setError("Matrícula não encontrada.");
                return;
            }
            setEnrollment(enr);
        } catch (err) {
            setError(getErrorMessage(err, "Falha ao carregar a matrícula."));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function confirmDelete() {
        if (!enrollment) return;
        setDeleting(true);
        try {
            await deleteEnrollment(enrollment.id);
            toast.success("Matrícula excluída.");
            navigate("/matriculas");
        } catch (err) {
            toast.error(getErrorMessage(err, "Falha ao excluir a matrícula."));
            setDeleting(false);
            setConfirm(false);
        }
    }

    if (loading) return <Spinner />;
    if (error || !enrollment)
        return (
            <ErrorBlock
                message={error ?? "Matrícula não encontrada."}
                onRetry={() => navigate("/matriculas")}
            />
        );

    const status = accessStatus(enrollment.endDate);

    return (
        <div>
            <Link to="/matriculas" className={ui.backLink}>
                ← Voltar para matrículas
            </Link>

            <PageHeader
                eyebrow={`Matrícula #${enrollment.id}`}
                title={enrollment.studentName}
                actions={
                    <>
                        <Link
                            to={`/matriculas/${enrollment.id}/editar`}
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

            <div
                className={`${styles.statusBar} ${
                    status.expired ? styles.expired : styles.active
                }`}
            >
                <span
                    className={`${ui.badge} ${
                        status.expired ? ui.badgeExpired : ui.badgeOk
                    }`}
                >
                    {status.expired ? "Acesso expirado" : "Acesso ativo"}
                </span>
                <span className={styles.statusHint}>{status.label}</span>
            </div>

            <div className={styles.grid}>
                <div className={`${ui.card} ${styles.cell}`}>
                    <span className="field-label">Categoria</span>
                    {enrollment.category ? (
                        <Link
                            to={`/categorias/${enrollment.category.id}`}
                            className={styles.catLink}
                        >
                            {enrollment.category.name}
                        </Link>
                    ) : (
                        <strong className={styles.value}>-</strong>
                    )}
                    {enrollment.category && (
                        <span className={styles.sub}>
                            Duração: {enrollment.category.durationMonths}{" "}
                            {enrollment.category.durationMonths === 1
                                ? "mês"
                                : "meses"}
                        </span>
                    )}
                </div>

                <div className={`${ui.card} ${styles.cell}`}>
                    <span className="field-label">Início do curso</span>
                    <strong className={styles.value}>
                        {formatDate(enrollment.startDate)}
                    </strong>
                </div>

                <div className={`${ui.card} ${styles.cell}`}>
                    <span className="field-label">Término do acesso</span>
                    <strong className={styles.value}>
                        {formatDate(enrollment.endDate)}
                    </strong>
                    <span className={styles.sub}>
                        Calculado pela duração da categoria
                    </span>
                </div>
            </div>

            <ConfirmDialog
                open={confirm}
                title="Excluir matrícula"
                message={`Tem certeza que deseja excluir a matrícula de "${enrollment.studentName}"?`}
                busy={deleting}
                onConfirm={confirmDelete}
                onCancel={() => setConfirm(false)}
            />
        </div>
    );
}
