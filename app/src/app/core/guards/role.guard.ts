import { inject } from '@angular/core';

import {
    CanActivateFn,
    Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

import { NotificationService } from '../services/notification.service';

import { Rol } from '../models/usuario.model';


export const roleGuard = (rolesPermitidos: Rol[]): CanActivateFn => {

    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        const notification = inject(NotificationService);

        if (authService.tieneRol( rolesPermitidos ) ) {
            return true;
        }

        notification.error( 'No tiene permisos para acceder a este módulo.' );

        return router.createUrlTree(['/' ]);
    };
};