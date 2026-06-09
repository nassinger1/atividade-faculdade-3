import type { ReactNode } from "react";
import styles from "./StateBlock.module.css";

export function Spinner({ label }: { label?: string }) {
    return (
        <div className={styles.center} role="status">
            <span className={styles.spinner} aria-hidden />
            <span className={styles.dim}>{label ?? "Carregando…"}</span>
        </div>
    );
}

export function ErrorBlock({
    title,
    message,
    onRetry,
    retryMessage
}: {
    title?: string;
    message: string;
    onRetry?: () => void;
    retryMessage?: string;
}) {
    return (
        <div className={styles.center}>
            <p className={styles.errorTitle}>{title || "Algo deu errado"}</p>
            <p className={styles.dim}>{message}</p>
            {onRetry && (
                <button className={styles.retry} onClick={onRetry}>
                    {retryMessage || "Tentar novamente"}
                </button>
            )}
        </div>
    );
}

export function EmptyState({
    title,
    hint,
    action
}: {
    title: string;
    hint?: string;
    action?: ReactNode;
}) {
    return (
        <div className={styles.center}>
            <span className={styles.empty} aria-hidden>
                +
            </span>
            <p className={styles.emptyTitle}>{title}</p>
            {hint && <p className={styles.dim}>{hint}</p>}
            {action && <div className={styles.emptyAction}>{action}</div>}
        </div>
    );
}
