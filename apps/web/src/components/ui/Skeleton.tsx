interface SkeletonProps {
    className?: string;
}

/** Bloque de carga base. Combínalo con className para el tamaño deseado. */
export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-md bg-surface-elevated ${className}`}
            aria-hidden="true"
        />
    );
}

/** Skeleton de una ServiceCard, para el estado de carga de la lista de servicios. */
export function ServiceCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3.5 w-full" />
                    <Skeleton className="h-3.5 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 shrink-0" />
            </div>
        </div>
    );
}

/** Skeleton de una fila de horarios disponibles. */
export function TimeSlotSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
            ))}
        </div>
    );
}
