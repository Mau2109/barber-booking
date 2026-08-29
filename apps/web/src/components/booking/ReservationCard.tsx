import { Reservation } from "@/types/booking";
import { Button } from "@/components/ui/Button";

interface ReservationCardProps {
    reservation: Reservation;
    onCancel?: (reservation: Reservation) => void;
    cancelling?: boolean;
}

const STATUS_STYLES: Record<
    Reservation["status"],
    { label: string; className: string }
> = {
    CONFIRMED: { label: "Confirmada", className: "bg-accent-soft text-accent" },
    COMPLETED: { label: "Completada", className: "bg-success/10 text-success" },
    CANCELLED: { label: "Cancelada", className: "bg-danger-soft text-danger" },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("es-MX", {
        hour: "numeric",
        minute: "2-digit",
    });
}

export function ReservationCard({
    reservation,
    onCancel,
    cancelling = false,
}: ReservationCardProps) {
    const status = STATUS_STYLES[reservation.status];
    const canCancel = reservation.status === "CONFIRMED" && onCancel;

    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-5">
            <span
                className="absolute inset-y-0 left-0 w-[3px] bg-accent"
                aria-hidden="true"
            />

            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="font-display text-base font-semibold text-text-primary">
                        {reservation.service.name}
                    </h3>
                    <p className="mt-0.5 text-sm capitalize text-text-muted">
                        {formatDate(reservation.startTime)}
                    </p>
                </div>

                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                >
                    {status.label}
                </span>
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 font-mono text-sm text-text-muted">
                <span>{formatTime(reservation.startTime)}</span>
                <span aria-hidden="true">·</span>
                <span>{reservation.barber.name}</span>
                <span aria-hidden="true">·</span>
                <span>{reservation.service.durationMinutes} min</span>
            </div>

            {canCancel && (
                <Button
                    variant="danger"
                    size="md"
                    fullWidth
                    loading={cancelling}
                    onClick={() => onCancel(reservation)}
                    className="mt-4"
                >
                    Cancelar cita
                </Button>
            )}
        </div>
    );
}
