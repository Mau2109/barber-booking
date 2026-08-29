import { AvailabilitySlot } from "@/types/booking";

interface TimeSlotProps {
    slot: AvailabilitySlot;
    selected: boolean;
    onSelect: (slot: AvailabilitySlot) => void;
}

export function TimeSlot({ slot, selected, onSelect }: TimeSlotProps) {
    const disabled = !slot.available;

    return (
        <button
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(slot)}
            className={`
                h-11 rounded-lg border font-mono text-sm font-medium
                transition-all duration-200 ease-out
                focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-text-subtle disabled:line-through
                ${!disabled && selected
                    ? "border-accent bg-accent text-on-accent"
                    : !disabled
                        ? "border-border bg-surface text-text-primary hover:border-accent/50 hover:bg-surface-elevated"
                        : ""
                }
            `}
        >
            {slot.start}
        </button>
    );
}

interface TimeSlotGridProps {
    slots: AvailabilitySlot[];
    selectedSlot: AvailabilitySlot | null;
    onSelect: (slot: AvailabilitySlot) => void;
}

export function TimeSlotGrid({ slots, selectedSlot, onSelect }: TimeSlotGridProps) {
    if (slots.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-border py-8 text-center">
                <p className="text-sm text-text-muted">
                    No hay horarios disponibles para esta fecha.
                </p>
                <p className="mt-1 text-xs text-text-subtle">
                    Prueba con otro día.
                </p>
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
            role="listbox"
            aria-label="Horarios disponibles"
        >
            {slots.map((slot) => (
                <TimeSlot
                    key={slot.start}
                    slot={slot}
                    selected={selectedSlot?.start === slot.start}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
