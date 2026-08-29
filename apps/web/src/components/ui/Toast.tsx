"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
    id: string;
    message: string;
    variant: ToastVariant;
}

interface ToastContextValue {
    showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
    ToastVariant,
    { border: string; icon: string; iconColor: string }
> = {
    success: { border: "border-l-success", icon: "✓", iconColor: "text-success" },
    error: { border: "border-l-danger", icon: "✕", iconColor: "text-danger" },
    info: { border: "border-l-accent", icon: "i", iconColor: "text-accent" },
};

/**
 * Envuelve tu app (o layout) con <ToastProvider> una sola vez.
 * Luego usa `const { showToast } = useToast()` en cualquier componente hijo.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback(
        (message: string, variant: ToastVariant = "info") => {
            const id = crypto.randomUUID();
            setToasts((prev) => [...prev, { id, message, variant }]);

            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        },
        [],
    );

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div
                className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
                style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                aria-live="polite"
            >
                {toasts.map((toast) => {
                    const style = VARIANT_STYLES[toast.variant];
                    return (
                        <div
                            key={toast.id}
                            role="status"
                            className={`
                                animate-fade-up pointer-events-auto
                                flex w-full max-w-sm items-center gap-3
                                rounded-lg border border-border border-l-2 ${style.border}
                                bg-surface-elevated px-4 py-3.5 shadow-lg shadow-black/40
                            `}
                        >
                            <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold ${style.iconColor}`}
                                aria-hidden="true"
                            >
                                {style.icon}
                            </span>
                            <p className="text-sm text-text-primary">{toast.message}</p>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        throw new Error("useToast debe usarse dentro de <ToastProvider>");
    }
    return ctx;
}
