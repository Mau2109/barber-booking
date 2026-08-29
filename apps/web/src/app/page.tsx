import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Home() {
    return (
        <main className="flex flex-1 flex-col">
            {/* HERO con foto del local de fondo */}
            <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-5 py-16 text-center sm:min-h-[90vh] sm:px-6">
                {/* Foto de fondo */}
                <Image
                    src="/hero-barberia.jpeg"
                    alt="Interior de Deluxe Barber"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />

                {/* Overlay oscuro para contraste y legibilidad */}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40"
                    aria-hidden="true"
                />
                <div
                    className="absolute inset-0 bg-background/30"
                    aria-hidden="true"
                />

                {/* Contenido */}
                <div className="relative">
                    <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.15em] text-accent sm:tracking-[0.2em]">
                        Tlaxiaco, Oaxaca
                    </p>

                    <h1
                        className="animate-fade-up mt-5 max-w-2xl text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-6xl"
                        style={{ animationDelay: "0.05s" }}
                    >
                        Deluxe Barber
                    </h1>

                    <p
                        className="animate-fade-up mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-text-muted sm:text-lg"
                        style={{ animationDelay: "0.1s" }}
                    >
                        Reserva tu cita en menos de un minuto. Sin filas, sin llamadas,
                        sin sorpresas.
                    </p>

                    <p
                        className="animate-fade-up mt-3 flex items-center justify-center gap-1.5 text-sm text-text-subtle"
                        style={{ animationDelay: "0.12s" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
                            <path
                                d="M12 21s7-6.5 7-11.5a7 7 0 1 0-14 0C5 14.5 12 21 12 21Z"
                                stroke="currentColor"
                                strokeWidth="1.6"
                            />
                            <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
                        </svg>
                        Chalcatongo de Hidalgo, Tlaxiaco, Oaxaca
                    </p>

                    <div
                        className="animate-fade-up mt-9"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <Link href="/reservar">
                            <Button size="lg" className="px-10">
                                Reservar cita
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FRANJA DE CONFIANZA */}
            <section className="border-t border-border">
                <div className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-border px-6 py-8 text-center">
                    <div>
                        <p className="font-display text-2xl font-semibold text-text-primary">
                            +5
                        </p>
                        <p className="mt-1 text-xs text-text-muted">años de oficio</p>
                    </div>
                    <div>
                        <p className="font-display text-2xl font-semibold text-text-primary">
                            100%
                        </p>
                        <p className="mt-1 text-xs text-text-muted">a tu gusto</p>
                    </div>
                    <div>
                        <p className="font-display text-2xl font-semibold text-text-primary">
                            24/7
                        </p>
                        <p className="mt-1 text-xs text-text-muted">reserva online</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
