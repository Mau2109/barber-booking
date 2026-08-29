interface StepHeadingProps {
    step: number;
    title: string;
    description?: string;
}

export function StepHeading({ step, title, description }: StepHeadingProps) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft font-mono text-xs font-semibold text-accent">
                {step}
            </span>
            <div>
                <h2 className="font-display text-lg font-semibold text-text-primary">
                    {title}
                </h2>
                {description && (
                    <p className="mt-0.5 text-sm text-text-muted">{description}</p>
                )}
            </div>
        </div>
    );
}
