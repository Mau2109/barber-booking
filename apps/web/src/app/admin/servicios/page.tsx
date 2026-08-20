'use client';

import { FormEvent, useEffect, useState } from 'react';

import {
    createService,
    getAdminServices,
    updateService,
} from '@/services/booking.service';

import { Service } from '@/types/booking';

type ServiceForm = {
    name: string;
    description: string;
    durationMinutes: string;
    price: string;
};

const EMPTY_FORM: ServiceForm = {
    name: '',
    description: '',
    durationMinutes: '',
    price: '',
};

export default function AdminServicesPage() {
    // ============================================================
    // ESTADOS
    // ============================================================

    const [services, setServices] =
        useState<Service[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [updatingId, setUpdatingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    // ============================================================
    // FORMULARIO
    // ============================================================

    const [form, setForm] =
        useState<ServiceForm>(
            EMPTY_FORM,
        );

    const [editingService, setEditingService] =
        useState<Service | null>(null);

    // ============================================================
    // CARGAR SERVICIOS
    // ============================================================

    const loadServices = async () => {
        try {
            setLoading(true);
            setError(null);

            const data =
                await getAdminServices();

            setServices(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudieron cargar los servicios',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    // ============================================================
    // CAMBIAR FORMULARIO
    // ============================================================

    const handleChange = (
        field: keyof ServiceForm,
        value: string,
    ) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    // ============================================================
    // LIMPIAR FORMULARIO
    // ============================================================

    const resetForm = () => {
        setForm(EMPTY_FORM);
        setEditingService(null);
        setError(null);
    };

    // ============================================================
    // VALIDAR FORMULARIO
    // ============================================================

    const validateForm = () => {
        const name =
            form.name.trim();

        const durationMinutes =
            Number(
                form.durationMinutes,
            );

        const price =
            Number(form.price);

        if (!name) {
            throw new Error(
                'El nombre del servicio es obligatorio',
            );
        }

        if (
            !Number.isFinite(
                durationMinutes,
            ) ||
            durationMinutes <= 0
        ) {
            throw new Error(
                'La duración debe ser mayor que 0',
            );
        }

        if (
            !Number.isFinite(
                price,
            ) ||
            price < 0
        ) {
            throw new Error(
                'El precio no es válido',
            );
        }

        return {
            name,

            description:
                form.description.trim() ||
                undefined,

            durationMinutes,

            price,
        };
    };

    // ============================================================
    // CREAR O EDITAR SERVICIO
    // ============================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const data =
                validateForm();

            if (editingService) {
                await updateService(
                    editingService.id,
                    data,
                );

                setSuccess(
                    'Servicio actualizado correctamente',
                );
            } else {
                await createService(
                    data,
                );

                setSuccess(
                    'Servicio creado correctamente',
                );
            }

            resetForm();

            await loadServices();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo guardar el servicio',
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // CARGAR SERVICIO EN FORMULARIO PARA EDITAR
    // ============================================================

    const handleEdit = (
        service: Service,
    ) => {
        setEditingService(service);

        setForm({
            name: service.name,

            description:
                service.description ??
                '',

            durationMinutes:
                String(
                    service.durationMinutes,
                ),

            price:
                String(service.price),
        });

        setError(null);
        setSuccess(null);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // ============================================================
    // ACTIVAR / DESACTIVAR SERVICIO
    // ============================================================

    const handleToggleActive =
        async (
            service: Service,
        ) => {
            try {
                setUpdatingId(
                    service.id,
                );

                setError(null);
                setSuccess(null);

                await updateService(
                    service.id,
                    {
                        isActive:
                            !service.isActive,
                    },
                );

                setServices(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                    service.id
                                    ? {
                                        ...item,
                                        isActive:
                                            !item.isActive,
                                    }
                                    : item,
                        ),
                );

                setSuccess(
                    service.isActive
                        ? 'Servicio desactivado'
                        : 'Servicio activado',
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo actualizar el servicio',
                );
            } finally {
                setUpdatingId(null);
            }
        };

    // ============================================================
    // PÁGINA
    // ============================================================

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-8">

                {/* =================================================
                    ENCABEZADO
                ================================================= */}

                <div>
                    <p className="text-sm font-medium text-zinc-500">
                        Administración
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Servicios
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        Administra los servicios disponibles en la barbería.
                    </p>
                </div>

                {/* =================================================
                    MENSAJES
                ================================================= */}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/40 p-4">
                        <p className="text-sm text-emerald-300">
                            {success}
                        </p>
                    </div>
                )}

                {/* =================================================
                    FORMULARIO
                ================================================= */}

                <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">

                    <div className="flex items-center justify-between gap-4">

                        <div>
                            <h2 className="text-xl font-semibold">
                                {editingService
                                    ? 'Editar servicio'
                                    : 'Nuevo servicio'}
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                {editingService
                                    ? 'Modifica los datos del servicio seleccionado.'
                                    : 'Agrega un nuevo servicio a la barbería.'}
                            </p>
                        </div>

                        {editingService && (
                            <button
                                type="button"
                                onClick={
                                    resetForm
                                }
                                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                            >
                                Cancelar edición
                            </button>
                        )}

                    </div>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="mt-6 grid gap-5 md:grid-cols-2"
                    >

                        {/* NOMBRE */}

                        <div>
                            <label
                                htmlFor="service-name"
                                className="mb-2 block text-sm font-medium"
                            >
                                Nombre
                            </label>

                            <input
                                id="service-name"
                                type="text"
                                value={
                                    form.name
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleChange(
                                        'name',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Ej. Corte"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    bg-zinc-950
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-white
                                "
                            />
                        </div>

                        {/* DURACIÓN */}

                        <div>
                            <label
                                htmlFor="service-duration"
                                className="mb-2 block text-sm font-medium"
                            >
                                Duración
                                (minutos)
                            </label>

                            <input
                                id="service-duration"
                                type="number"
                                min="1"
                                value={
                                    form.durationMinutes
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleChange(
                                        'durationMinutes',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="45"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    bg-zinc-950
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-white
                                "
                            />
                        </div>

                        {/* PRECIO */}

                        <div>
                            <label
                                htmlFor="service-price"
                                className="mb-2 block text-sm font-medium"
                            >
                                Precio
                            </label>

                            <input
                                id="service-price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    form.price
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleChange(
                                        'price',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="100"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    bg-zinc-950
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-white
                                "
                            />
                        </div>

                        {/* DESCRIPCIÓN */}

                        <div>
                            <label
                                htmlFor="service-description"
                                className="mb-2 block text-sm font-medium"
                            >
                                Descripción
                            </label>

                            <input
                                id="service-description"
                                type="text"
                                value={
                                    form.description
                                }
                                onChange={(
                                    event,
                                ) =>
                                    handleChange(
                                        'description',
                                        event.target
                                            .value,
                                    )
                                }
                                placeholder="Descripción opcional"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    bg-zinc-950
                                    px-4
                                    py-3
                                    text-white
                                    outline-none
                                    transition
                                    focus:border-white
                                "
                            />
                        </div>

                        {/* BOTÓN */}

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={
                                    saving
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    bg-white
                                    px-4
                                    py-4
                                    font-semibold
                                    text-black
                                    transition
                                    hover:bg-zinc-200
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                    md:w-auto
                                    md:min-w-48
                                "
                            >
                                {saving
                                    ? 'Guardando...'
                                    : editingService
                                        ? 'Guardar cambios'
                                        : 'Crear servicio'}
                            </button>
                        </div>

                    </form>

                </section>

                {/* =================================================
                    LISTA DE SERVICIOS
                ================================================= */}

                <section className="mt-10">

                    <div className="flex items-end justify-between gap-4">

                        <div>
                            <h2 className="text-xl font-semibold">
                                Servicios registrados
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                {
                                    services.length
                                }{' '}
                                servicio(s)
                                registrado(s).
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                loadServices
                            }
                            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                        >
                            Actualizar
                        </button>

                    </div>

                    {/* CARGANDO */}

                    {loading && (
                        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                            <p className="text-zinc-400">
                                Cargando servicios...
                            </p>
                        </div>
                    )}

                    {/* SIN SERVICIOS */}

                    {!loading &&
                        services.length ===
                        0 && (
                            <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                                <p className="text-zinc-400">
                                    No hay servicios registrados.
                                </p>
                            </div>
                        )}

                    {/* TABLA */}

                    {!loading &&
                        services.length >
                        0 && (
                            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">

                                <div className="overflow-x-auto">

                                    <table className="w-full text-left text-sm">

                                        <thead className="bg-zinc-900 text-zinc-400">

                                            <tr>
                                                <th className="px-5 py-4 font-medium">
                                                    Servicio
                                                </th>

                                                <th className="px-5 py-4 font-medium">
                                                    Duración
                                                </th>

                                                <th className="px-5 py-4 font-medium">
                                                    Precio
                                                </th>

                                                <th className="px-5 py-4 font-medium">
                                                    Estado
                                                </th>

                                                <th className="px-5 py-4 text-right font-medium">
                                                    Acciones
                                                </th>
                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-zinc-800 bg-zinc-950">

                                            {services.map(
                                                (
                                                    service,
                                                ) => (
                                                    <tr
                                                        key={
                                                            service.id
                                                        }
                                                    >

                                                        <td className="px-5 py-4">

                                                            <p className="font-semibold">
                                                                {
                                                                    service.name
                                                                }
                                                            </p>

                                                            {service.description && (
                                                                <p className="mt-1 max-w-xs text-xs text-zinc-500">
                                                                    {
                                                                        service.description
                                                                    }
                                                                </p>
                                                            )}

                                                        </td>

                                                        <td className="px-5 py-4 text-zinc-300">
                                                            {
                                                                service.durationMinutes
                                                            }{' '}
                                                            min
                                                        </td>

                                                        <td className="px-5 py-4 font-medium">
                                                            $
                                                            {
                                                                service.price
                                                            }
                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <span
                                                                className={`
                                                                    rounded-full
                                                                    px-2.5
                                                                    py-1
                                                                    text-xs
                                                                    font-semibold
                                                                    ${service.isActive
                                                                        ? 'bg-emerald-950 text-emerald-400'
                                                                        : 'bg-zinc-800 text-zinc-400'
                                                                    }
                                                                `}
                                                            >
                                                                {service.isActive
                                                                    ? 'Activo'
                                                                    : 'Inactivo'}
                                                            </span>

                                                        </td>

                                                        <td className="px-5 py-4">

                                                            <div className="flex justify-end gap-2">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            service,
                                                                        )
                                                                    }
                                                                    className="
                                                                        rounded-lg
                                                                        border
                                                                        border-zinc-700
                                                                        px-3
                                                                        py-2
                                                                        text-xs
                                                                        font-medium
                                                                        transition
                                                                        hover:bg-zinc-800
                                                                    "
                                                                >
                                                                    Editar
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        updatingId ===
                                                                        service.id
                                                                    }
                                                                    onClick={() =>
                                                                        handleToggleActive(
                                                                            service,
                                                                        )
                                                                    }
                                                                    className={`
                                                                        rounded-lg
                                                                        border
                                                                        px-3
                                                                        py-2
                                                                        text-xs
                                                                        font-medium
                                                                        transition
                                                                        disabled:opacity-50
                                                                        ${service.isActive
                                                                            ? 'border-red-900 text-red-400 hover:bg-red-950/40'
                                                                            : 'border-emerald-900 text-emerald-400 hover:bg-emerald-950/40'
                                                                        }
                                                                    `}
                                                                >
                                                                    {updatingId ===
                                                                        service.id
                                                                        ? 'Guardando...'
                                                                        : service.isActive
                                                                            ? 'Desactivar'
                                                                            : 'Activar'}
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                ),
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>
                        )}

                </section>

            </div>
        </main>
    );
}