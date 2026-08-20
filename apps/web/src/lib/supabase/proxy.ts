import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },

                setAll(cookiesToSet) {
                    // Actualizar cookies de la petición
                    cookiesToSet.forEach(
                        ({ name, value }) =>
                            request.cookies.set(
                                name,
                                value,
                            ),
                    );

                    response = NextResponse.next({
                        request,
                    });

                    // Actualizar cookies de la respuesta
                    cookiesToSet.forEach(
                        ({
                            name,
                            value,
                            options,
                        }) =>
                            response.cookies.set(
                                name,
                                value,
                                options,
                            ),
                    );
                },
            },
        },
    );

    // ========================================================
    // VERIFICAR AUTENTICACIÓN
    // ========================================================

    const { data } =
        await supabase.auth.getClaims();

    const isAuthenticated =
        !!data?.claims;

    const pathname =
        request.nextUrl.pathname;

    // ========================================================
    // PROTEGER RUTAS /admin
    // ========================================================

    const isAdminRoute =
        pathname.startsWith('/admin');

    const isLoginRoute =
        pathname === '/admin/login';

    // Si intenta entrar al admin sin sesión,
    // mandarlo al login.
    if (
        isAdminRoute &&
        !isLoginRoute &&
        !isAuthenticated
    ) {
        const url =
            request.nextUrl.clone();

        url.pathname =
            '/admin/login';

        return NextResponse.redirect(url);
    }

    // ========================================================
    // EVITAR VOLVER AL LOGIN SI YA INICIÓ SESIÓN
    // ========================================================

    if (
        isLoginRoute &&
        isAuthenticated
    ) {
        const url =
            request.nextUrl.clone();

        url.pathname =
            '/admin/agenda';

        return NextResponse.redirect(url);
    }

    return response;
}