import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary:
        "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-hover",
    secondary:
        "bg-surface-elevated text-text-primary border border-border-strong hover:bg-surface-hover hover:border-accent/40",
    ghost:
        "bg-transparent text-text-muted hover:text-text-primary hover:bg-surface-hover",
    danger:
        "bg-danger-soft text-danger border border-danger/30 hover:bg-danger/20",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-14 px-6 text-base gap-2.5",
};

/**
 * Button — botón base del sistema de diseño.
 *
 * Variantes:
 * - primary: acción principal (confirmar, reservar)
 * - secondary: acción alterna (regresar, editar)
 * - ghost: acción de bajo énfasis (cancelar, cerrar)
 * - danger: acción destructiva (cancelar cita)
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "lg",
            loading = false,
            fullWidth = false,
            disabled,
            className = "",
            children,
            ...props
        },
        ref,
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
                    inline-flex items-center justify-center
                    rounded-lg font-semibold
                    transition-all duration-200 ease-out
                    active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100
                    focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                    ${VARIANT_CLASSES[variant]}
                    ${SIZE_CLASSES[size]}
                    ${fullWidth ? "w-full" : ""}
                    ${className}
                `}
                {...props}
            >
                {loading && (
                    <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-90"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                )}
                {children}
            </button>
        );
    },
);

Button.displayName = "Button";
