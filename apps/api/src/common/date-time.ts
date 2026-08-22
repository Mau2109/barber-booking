import {
    fromZonedTime,
    toZonedTime,
} from 'date-fns-tz';

// ============================================================
// ZONA HORARIA DE LA BARBERÍA
// ============================================================

export const BARBERSHOP_TIMEZONE =
    'America/Mexico_City';

// ============================================================
// CONVERTIR FECHA/HORA LOCAL DE LA BARBERÍA A UTC
//
// Ejemplo:
//
// 2026-08-22
// 12:00
//
// ↓
//
// Date UTC correspondiente
// ============================================================

export function barberLocalToUtc(
    date: string,
    time: string,
): Date {
    const localDateTime =
        `${date}T${time}:00`;

    return fromZonedTime(
        localDateTime,
        BARBERSHOP_TIMEZONE,
    );
}

// ============================================================
// CONVERTIR UTC A HORA LOCAL DE LA BARBERÍA
// ============================================================

export function utcToBarberLocal(
    date: Date,
): Date {
    return toZonedTime(
        date,
        BARBERSHOP_TIMEZONE,
    );
}