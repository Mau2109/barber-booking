import Image from "next/image";

interface LogoProps {
    className?: string;
    /** Tamaño del ícono en px. Default 32. */
    size?: number;
    /** Muestra el nombre de la barbería junto al ícono. Default true. */
    showName?: boolean;
    /** Clases extra para el texto del nombre (ej. ocultarlo en mobile). */
    nameClassName?: string;
}

/** Logo de Deluxe Barber. */
export function Logo({
    className = "",
    size = 32,
    showName = true,
    nameClassName = "",
}: LogoProps) {
    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            <span
                className="relative shrink-0 overflow-hidden rounded-md bg-black"
                style={{ width: size, height: size }}
            >
                <Image
                    src="/logo.jpeg"
                    alt="Deluxe Barber"
                    fill
                    sizes={`${size}px`}
                    className="object-cover"
                    priority
                />
            </span>
            {showName && (
                <span
                    className={`font-display text-lg font-semibold tracking-tight text-text-primary ${nameClassName}`}
                >
                    Deluxe Barber
                </span>
            )}
        </div>
    );
}
