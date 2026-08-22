import {
    AvailabilityResponse,
    Customer,
    Reservation,
    Service,
    Barber,
} from '@/types/booking';

import {
    createClient,
} from '@/lib/supabase/client';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        'NEXT_PUBLIC_API_URL no está configurada',
    );
}

// ============================================================
// OBTENER SERVICIOS
// ============================================================

export async function getServices(): Promise<Service[]> {
    const response = await fetch(
        `${API_URL}/services`,
    );

    if (!response.ok) {
        throw new Error(
            'No se pudieron obtener los servicios',
        );
    }

    return response.json();
}

// ============================================================
// OBTENER DISPONIBILIDAD
// ============================================================

export async function getAvailability(
    date: string,
    serviceId: string,
): Promise<AvailabilityResponse> {
    const response = await fetch(
        `${API_URL}/availability?date=${date}&serviceId=${serviceId}`,
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message ??
            'No se pudo consultar la disponibilidad',
        );
    }

    return response.json();
}

// ============================================================
// BUSCAR O CREAR CLIENTE
// ============================================================

export async function resolveCustomer(
    name: string,
    phone: string,
): Promise<Customer> {
    const response = await fetch(
        `${API_URL}/customers/resolve`,
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json',
            },

            body: JSON.stringify({
                name,
                phone,
            }),
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            Array.isArray(error.message)
                ? error.message.join(', ')
                : error.message ??
                'No se pudo registrar el cliente',
        );
    }

    return response.json();
}

// ============================================================
// CREAR RESERVACIÓN
// ============================================================

export async function createReservation(data: {
    customerId: string;
    serviceId: string;
    date: string;
    startTime: string;
}): Promise<Reservation> {
    const response = await fetch(
        `${API_URL}/reservations`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            Array.isArray(error.message)
                ? error.message.join(', ')
                : error.message ??
                'No se pudo crear la reservación',
        );
    }

    return response.json();
}

// ============================================================
// OBTENER RESERVACIONES POR TELÉFONO
// ============================================================

export async function getReservationsByPhone(
    phone: string,
): Promise<Reservation[]> {
    const response = await fetch(
        `${API_URL}/reservations/customer?phone=${encodeURIComponent(
            phone,
        )}`,
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            Array.isArray(error.message)
                ? error.message.join(', ')
                : error.message ??
                'No se pudieron consultar las reservaciones',
        );
    }

    return response.json();
}

// ============================================================
// CANCELAR RESERVACIÓN
// ============================================================

export async function cancelReservation(
    reservationId: string,
): Promise<Reservation> {
    const response = await fetch(
        `${API_URL}/reservations/${reservationId}/cancel`,
        {
            method: 'PATCH',
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            Array.isArray(error.message)
                ? error.message.join(', ')
                : error.message ??
                'No se pudo cancelar la reservación',
        );
    }

    return response.json();
}

// ============================================================
// OBTENER RESERVACIONES POR FECHA
// ============================================================

export async function getReservationsByDate(
    date: string,
): Promise<Reservation[]> {
    const response = await fetch(
        `${API_URL}/reservations?date=${encodeURIComponent(date)}`,
        {
            headers: {
                ...await getAuthHeaders(),
            },
        },
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            Array.isArray(error.message)
                ? error.message.join(', ')
                : error.message ??
                'No se pudieron obtener las reservaciones',
        );
    }

    return response.json();
}

// ============================================================
// MARCAR RESERVACIÓN COMO COMPLETADA
// ============================================================

export async function completeReservation(
    reservationId: string,
): Promise<Reservation> {
    const response = await fetch(
        `${API_URL}/reservations/${reservationId}/complete`,
        {
            method: 'PATCH',
            headers: {
                ...await getAuthHeaders(),
            },
        },
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            Array.isArray(error.message)
                ? error.message.join(', ')
                : error.message ??
                'No se pudo completar la reservación',
        );
    }

    return response.json();
}

export async function updateService(
    id: string,
    data: {
        name?: string;
        description?: string;
        durationMinutes?: number;
        price?: number;
        isActive?: boolean;
    },
): Promise<Service> {
    const response = await fetch(
        `${API_URL}/services/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type':
                    'application/json',
                ...await getAuthHeaders(),
            },
            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            error.message ??
            'No se pudo actualizar el servicio',
        );
    }

    return response.json();
}

export async function createService(data: {
    name: string;
    description?: string;
    durationMinutes: number;
    price: number;
}): Promise<Service> {
    const response = await fetch(
        `${API_URL}/services`,
        {
            method: 'POST',
            headers: {
                'Content-Type':
                    'application/json',
                ...await getAuthHeaders(),
            },
            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            error.message ??
            'No se pudo crear el servicio',
        );
    }

    return response.json();
}

// ============================================================
// OBTENER TODOS LOS BARBEROS PARA ADMIN
// ============================================================

export async function getAdminBarbers(): Promise<Barber[]> {
    const response = await fetch(
        `${API_URL}/barbers/admin`,
        {
            headers: {
                ...await getAuthHeaders(),
            },
        }
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            error.message ??
            'No se pudieron obtener los barberos',
        );
    }

    return response.json();
}

// ============================================================
// CREAR BARBERO
// ============================================================

export async function createBarber(data: {
    name: string;
}): Promise<Barber> {
    const response = await fetch(
        `${API_URL}/barbers`,
        {
            method: 'POST',

            headers: {
                'Content-Type':
                    'application/json',
                ...await getAuthHeaders(),
            },

            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            error.message ??
            'No se pudo crear el barbero',
        );
    }

    return response.json();
}

// ============================================================
// ACTUALIZAR BARBERO
// ============================================================

export async function updateBarber(
    id: string,
    data: {
        name?: string;
        isActive?: boolean;
    },
): Promise<Barber> {
    const response = await fetch(
        `${API_URL}/barbers/${id}`,
        {
            method: 'PATCH',

            headers: {
                'Content-Type':
                    'application/json',
                ...await getAuthHeaders(),
            },

            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        const error =
            await response.json();

        throw new Error(
            error.message ??
            'No se pudo actualizar el barbero',
        );
    }

    return response.json();
}

export async function getAdminServices(): Promise<Service[]> {
    const response = await fetch(
        `${API_URL}/services/admin`,
        {
            headers: {
                ...await getAuthHeaders(),
            },
        },
    );

    if (!response.ok) {
        const error = await response.json();

        throw new Error(
            error.message ??
            'No se pudieron obtener los servicios',
        );
    }

    return response.json();
}

async function getAuthHeaders() {
    const supabase =
        createClient();

    const {
        data: {
            session,
        },
    } =
        await supabase.auth.getSession();

    if (!session) {
        throw new Error(
            'Sesión no disponible',
        );
    }

    return {
        Authorization:
            `Bearer ${session.access_token}`,
    };
}