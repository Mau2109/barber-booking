"use client";

interface DateSelectorProps {
    selectedDate: string | null;
    onSelect: (date: string) => void;
    /** Cuántos días hacia adelante mostrar. Default 14. */
    daysAhead?: number;
    /** Devuelve true si la fecha debe mostrarse deshabilitada (ej. días de descanso). */
    isDateDisabled?: (date: Date) => boolean;
}

function toInputFormat(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function buildDays(daysAhead: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: daysAhead }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        return date;
    });
}

export function DateSelector({
    selectedDate,
    onSelect,
    daysAhead = 14,
    isDateDisabled,
}: DateSelectorProps) {
    const days = buildDays(daysAhead);

    return (
        <div
            className="scrollbar-thin flex gap-2.5 overflow-x-auto pb-2"
            role="listbox"
            aria-label="Selecciona una fecha"
        >
            {days.map((date) => {
                const value = toInputFormat(date);
                const isSelected = value === selectedDate;
                const isToday = value === toInputFormat(new Date());
                const disabled = isDateDisabled?.(date) ?? false;

                const weekday = date
                    .toLocaleDateString("es-MX", { weekday: "short" })
                    .replace(".", "");
                const dayNumber = date.getDate();

                return (
                    <button
                        key={value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={disabled}
                        onClick={() => onSelect(value)}
                        className={`
                            flex shrink-0 flex-col items-center gap-1
                            rounded-lg border px-4 py-3
                            transition-all duration-200 ease-out
                            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                            disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:bg-surface
                            ${isSelected
                                ? "border-accent bg-accent text-on-accent"
                                : "border-border bg-surface text-text-primary hover:border-border-strong hover:bg-surface-elevated"
                            }
                        `}
                    >
                        <span
                            className={`text-[11px] font-medium uppercase tracking-wide ${
                                isSelected ? "text-on-accent/70" : "text-text-muted"
                            }`}
                        >
                            {weekday}
                        </span>
                        <span className="font-display text-lg font-semibold leading-none">
                            {dayNumber}
                        </span>
                        {isToday && !isSelected && (
                            <span className="h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
