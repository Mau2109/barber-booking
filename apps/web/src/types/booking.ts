export interface Service {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    price: string;
    isActive: boolean;
}

export interface Barber {
    id: string;
    name: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AvailabilitySlot {
    start: string;
    end: string;
    available: boolean;
    barbers: Barber[];
}

export interface AvailabilityResponse {
    date: string;

    service: {
        id: string;
        name: string;
        durationMinutes: number;
    };

    slots: AvailabilitySlot[];
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface Reservation {
    id: string;

    customerId: string;
    barberId: string;
    serviceId: string;

    startTime: string;
    endTime: string;

    status:
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED';

    customer: {
        id: string;
        name: string;
        phone: string;
    };

    barber: {
        id: string;
        name: string;
    };

    service: {
        id: string;
        name: string;
        durationMinutes: number;
        price: string;
    };
}