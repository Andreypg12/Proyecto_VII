import { inject } from '@angular/core';
import {
    CanActivateFn,
    Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../models/usuario.model';


export const roleGuard = ( rolesPermitidos: Rol[]): CanActivateFn => {

    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if ( authService.tieneRol( rolesPermitidos)) { return true;}
        return router.createUrlTree([ '/']);
    };
};