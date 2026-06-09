import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createCategory,
  getCategory,
  updateCategory,
} from "../../api/categories";
import { getErrorMessage } from "../../api/client";
import { PageHeader } from "../../components/PageHeader";
import { Spinner, ErrorBlock } from "../../components/StateBlock";
import { useToast } from "../../components/Toast";
import ui from "../../components/ui.module.css";
import styles from "./CategoryForm.module.css";

export function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; duration?: string }>(
    {}
  );

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const cat = await getCategory(Number(id));
        if (!active) return;
        if (!cat) {
          setLoadError("Categoria não encontrada.");
          return;
        }
        setName(cat.name);
        setDurationMonths(String(cat.durationMonths));
      } catch (err) {
        if (active)
          setLoadError(getErrorMessage(err, "Falha ao carregar a categoria."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  function validate(): boolean {
    const next: { name?: string; duration?: string } = {};
    if (!name.trim()) next.name = "Informe o nome da categoria.";
    const n = Number(durationMonths);
    if (!durationMonths.trim()) next.duration = "Informe a duração.";
    else if (!Number.isInteger(n) || n <= 0)
      next.duration = "A duração deve ser um número inteiro maior que zero.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      name: name.trim(),
      durationMonths: Number(durationMonths),
    };
    try {
      if (isEdit) {
        await updateCategory(Number(id), payload);
        toast.success("Categoria atualizada com sucesso.");
        navigate(`/categorias/${id}`);
      } else {
        const created = await createCategory(payload);
        toast.success("Categoria criada com sucesso.");
        navigate(`/categorias/${created.id}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Falha ao salvar a categoria."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Carregando categoria…" />;
  if (loadError)
    return (
      <ErrorBlock
        message={loadError}
        onRetry={() => navigate("/categorias")}
      />
    );

  return (
    <div>
      <Link to="/categorias" className={ui.backLink}>
        ← Voltar para categorias
      </Link>
      <PageHeader
        eyebrow={isEdit ? "Edição" : "Cadastro"}
        title={isEdit ? "Editar categoria" : "Nova categoria"}
        description="A duração define por quantos meses o aluno terá acesso ao curso após o início."
      />

      <form className={`${ui.card} ${styles.form}`} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="name" className="field-label">
            Nome da categoria
          </label>
          <input
            id="name"
            className={`${styles.input} ${errors.name ? styles.invalid : ""}`}
            value={name}
            placeholder="Ex.: Desenvolvimento Web Full-Stack"
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {errors.name && <span className={styles.err}>{errors.name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="duration" className="field-label">
            Duração (meses)
          </label>
          <input
            id="duration"
            type="number"
            min={1}
            step={1}
            className={`${styles.input} ${
              errors.duration ? styles.invalid : ""
            }`}
            value={durationMonths}
            placeholder="Ex.: 6"
            onChange={(e) => setDurationMonths(e.target.value)}
          />
          {errors.duration && (
            <span className={styles.err}>{errors.duration}</span>
          )}
        </div>

        <div className={styles.actions}>
          <Link to="/categorias" className={`${ui.btn} ${ui.btnGhost}`}>
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
              : "Criar categoria"}
          </button>
        </div>
      </form>
    </div>
  );
}
