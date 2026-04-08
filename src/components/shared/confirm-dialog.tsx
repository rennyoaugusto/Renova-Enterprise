"use client"

import { AlertTriangle } from "lucide-react"

type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "default"
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="surface-card-strong w-full max-w-sm p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="mb-4 flex items-start gap-3">
          {variant === "danger" ? (
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: "hsl(var(--danger) / 0.1)", color: "hsl(var(--danger))" }}
            >
              <AlertTriangle size={16} />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2
              id="confirm-title"
              className="text-base font-semibold"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted))" }}>
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="premium-button-secondary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === "danger" ? "btn-danger" : "premium-button"}
          >
            {isLoading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
