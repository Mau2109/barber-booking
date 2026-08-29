import { Service } from "@/types/booking";

interface ServiceCardProps {
    service: Service;
    selected: boolean;
    onSelect: (service: Service) => void;
}

function formatPrice(price: string) {
    const value = Number(price);
    if (Number.isNaN(value)) return price;
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
    });
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(service)}
            aria-pressed={selected}
            className={`
                group relative w-full rounded-xl border p-5 text-left
                transition-all duration-200 ease-out
                focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                ${selected
                    ? "border-accent/50 bg-accent-soft"
                    : "border-border bg-surface hover:border-border-strong hover:bg-surface-elevated"
                }
            `}
        >
            {selected && (
                <span
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-xl bg-accent"
                    aria-hidden="true"
                />
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h3 className="font-display text-base font-semibold text-text-primary">
                        {service.name}
                    </h3>

                    {service.description && (
                        <p className="mt-1 text-sm leading-relaxed text-text-muted">
                            {service.description}
                        </p>
                    )}

                    <p className="mt-2.5 font-mono text-xs text-text-subtle">
                        {service.durationMinutes} min
                    </p>
                </div>

                <span
                    className={`
                        shrink-0 rounded-md px-2.5 py-1 font-mono text-sm font-medium
                        ${selected ? "bg-accent text-on-accent" : "bg-surface-elevated text-accent"}
                    `}
                >
                    {formatPrice(service.price)}
                </span>
            </div>
        </button>
    );
}
