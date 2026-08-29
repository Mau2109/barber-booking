"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);

    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-up"
                style={{ animationDuration: "0.2s" }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Contenido */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                className="
                    animate-fade-up relative w-full max-w-md
                    rounded-t-xl sm:rounded-xl
                    border border-border bg-surface-elevated
                    shadow-2xl shadow-black/60
                "
                style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    {title && (
                        <h2
                            id="modal-title"
                            className="font-display text-lg font-semibold text-text-primary"
                        >
                            {title}
                        </h2>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="
                            ml-auto flex h-8 w-8 items-center justify-center rounded-md
                            text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary
                            focus-visible:outline-2 focus-visible:outline-accent
                        "
                    >
                        ✕
                    </button>
                </div>

                <div className="px-5 py-5">{children}</div>
            </div>
        </div>,
        document.body,
    );
}
