import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createEnrollment,
  getEnrollment,
  updateEnrollment,
} from "../../api/enrollments";
import { listCategories } from "../../api/categories";
import { getErrorMessage } from "../../api/client";
import type { Category } from "../../types";
import { PageHeader } from "../../components/PageHeader";
import { Spinner, ErrorBlock } from "../../components/StateBlock";
import { useToast } from "../../components/Toast";
import { calculateEndDate, formatDate, toDateInput } from "../../hooks/dates";
import ui from "../../components/ui.module.css";
import form from "../categories/CategoryForm.module.css";
import styles from "./EnrollmentForm.module.css";

export function EnrollmentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [studentName, setStudentName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    studentName?: string;
    startDate?: string;
    categoryId?: string;
  }>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cats = await listCategories();
        if (!active) return;
        setCategories(cats);

        if (isEdit) {
          const enr = await getEnrollment(Number(id));
          if (!active) return;
          if (!enr) {
            setLoadError("Matrícula não encontrada.");
            return;
          }
          setStudentName(enr.studentName);
          setStartDate(toDateInput(enr.startDate));
          setCategoryId(String(enr.categoryId));
        }
      } catch (err) {
        if (active)
          setLoadError(getErrorMessage(err, "Falha ao carregar os dados."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === Number(categoryId)),
    [categories, categoryId]
  );

  // Live preview of the computed access end date (same rule as the API).
  const previewEndDate = useMemo(() => {
    if (!startDate || !selectedCategory) return null;
    return calculateEndDate(startDate, selectedCategory.durationMonths);
  }, [startDate, selectedCategory]);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!studentName.trim()) next.studentName = "Informe o nome do aluno.";
    if (!startDate) next.startDate = "Informe a data de início.";
    if (!categoryId) next.categoryId = "Selecione uma categoria.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        // The API's PUT does not recompute endDate, so we recompute it
        // client-side from the selected category to keep the rule consistent.
        const endDate = calculateEndDate(
          startDate,
          selectedCategory!.durationMonths
        );
        await updateEnrollment(Number(id), {
          studentName: studentName.trim(),
          startDate,
          categoryId: Number(categoryId),
          endDate,
        });
        toast.success("Matrícula atualizada com sucesso.");
        navigate(`/matriculas/${id}`);
      } else {
        // On create the API computes endDate from the category duration.
        const created = await createEnrollment({
          studentName: studentName.trim(),
          startDate,
          categoryId: Number(categoryId),
        });
        toast.success("Matrícula criada com sucesso.");
        navigate(`/matriculas/${created.id}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Falha ao salvar a matrícula."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Carregando…" />;
  if (loadError)
    return (
      <ErrorBlock message={loadError} onRetry={() => navigate("/matriculas")} />
    );

  const noCategories = categories.length === 0;

  return (
    <div>
      <Link to="/matriculas" className={ui.backLink}>
        ← Voltar para matrículas
      </Link>
      <PageHeader
        eyebrow={isEdit ? "Edição" : "Cadastro"}
        title={isEdit ? "Editar matrícula" : "Nova matrícula"}
        description="A data de término do acesso é derivada da duração da categoria escolhida."
      />

      {noCategories ? (
        <ErrorBlock
          title="Ação necessária"
          message="Não há categorias cadastradas. Crie uma categoria antes de registrar matrículas."
          onRetry={() => navigate("/categorias/nova")}
          retryMessage="Criar categoria"
        />
      ) : (
        <div className={styles.layout}>
          <form
            className={`${ui.card} ${form.form}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className={form.field}>
              <label htmlFor="student" className="field-label">
                Nome do aluno
              </label>
              <input
                id="student"
                className={`${form.input} ${
                  errors.studentName ? form.invalid : ""
                }`}
                value={studentName}
                placeholder="Ex.: Maria Oliveira"
                onChange={(e) => setStudentName(e.target.value)}
                autoFocus
              />
              {errors.studentName && (
                <span className={form.err}>{errors.studentName}</span>
              )}
            </div>

            <div className={form.field}>
              <label htmlFor="category" className="field-label">
                Categoria do curso
              </label>
              <select
                id="category"
                className={`${form.input} ${
                  errors.categoryId ? form.invalid : ""
                }`}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Selecione uma categoria…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.durationMonths}{" "}
                    {c.durationMonths === 1 ? "mês" : "meses"})
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className={form.err}>{errors.categoryId}</span>
              )}
            </div>

            <div className={form.field}>
              <label htmlFor="start" className="field-label">
                Data de início
              </label>
              <input
                id="start"
                type="date"
                className={`${form.input} ${
                  errors.startDate ? form.invalid : ""
                }`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {errors.startDate && (
                <span className={form.err}>{errors.startDate}</span>
              )}
            </div>

            <div className={form.actions}>
              <Link to="/matriculas" className={`${ui.btn} ${ui.btnGhost}`}>
                Cancelar
              </Link>
              <button
                type="submit"
                className={`${ui.btn} ${ui.btnPrimary}`}
                disabled={submitting}
              >
                {submitting
                  ? "Salvando…"
                  : isEdit
                  ? "Salvar alterações"
                  : "Criar matrícula"}
              </button>
            </div>
          </form>

          <aside className={`${ui.card} ${styles.preview}`}>
            <span className="field-label">Resumo do acesso</span>
            <p className={styles.previewLead}>
              Calculado automaticamente pela regra de negócio.
            </p>
            <dl className={styles.previewList}>
              <div>
                <dt>Início</dt>
                <dd>{startDate ? formatDate(startDate) : "—"}</dd>
              </div>
              <div>
                <dt>Duração</dt>
                <dd>
                  {selectedCategory
                    ? `${selectedCategory.durationMonths} ${
                        selectedCategory.durationMonths === 1
                          ? "mês"
                          : "meses"
                      }`
                    : "—"}
                </dd>
              </div>
              <div className={styles.previewHighlight}>
                <dt>Término do acesso</dt>
                <dd>{previewEndDate ? formatDate(previewEndDate) : "—"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}
