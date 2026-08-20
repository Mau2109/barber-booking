import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

import {
    createClient,
} from '@supabase/supabase-js';

import { Request } from 'express';

@Injectable()
export class SupabaseAuthGuard
    implements CanActivate {
    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        const request =
            context
                .switchToHttp()
                .getRequest<Request>();

        // ========================================================
        // OBTENER AUTHORIZATION
        // ========================================================

        const authorization =
            request.headers.authorization;

        if (!authorization) {
            throw new UnauthorizedException(
                'Token de autenticación requerido',
            );
        }

        // Esperamos:
        // Authorization: Bearer TOKEN
        const [type, token] =
            authorization.split(' ');

        if (
            type !== 'Bearer' ||
            !token
        ) {
            throw new UnauthorizedException(
                'Token de autenticación inválido',
            );
        }

        // ========================================================
        // VARIABLES SUPABASE
        // ========================================================

        const supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseKey =
            process.env.SUPABASE_PUBLISHABLE_KEY;

        if (
            !supabaseUrl ||
            !supabaseKey
        ) {
            throw new Error(
                'Configuración de Supabase incompleta',
            );
        }

        // ========================================================
        // CREAR CLIENTE SUPABASE
        // ========================================================

        const supabase =
            createClient(
                supabaseUrl,
                supabaseKey,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                    },
                },
            );

        // ========================================================
        // VALIDAR JWT
        // ========================================================

        const {
            data,
            error,
        } =
            await supabase.auth.getUser(
                token,
            );

        if (
            error ||
            !data.user
        ) {
            throw new UnauthorizedException(
                'Sesión inválida o expirada',
            );
        }

        // ========================================================
        // GUARDAR USUARIO EN REQUEST
        // ========================================================

        (request as any).user =
            data.user;

        return true;
    }
}