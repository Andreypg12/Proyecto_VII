import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';


//Esta linea indica que estamos creando un guard que dice ¿Puede activarse esta ruta?

export const authGuard: CanActivateFn = ( route, state ) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const notification = inject(NotificationService);

    // Ya existe una sesión autenticada

    if (authService.autenticado()) {
        return true;
    }


    // La sesión ya fue revisada y no existe token

    if ( authService.sesionInicializada() && !authService.obtenerToken() ) {

        notification.error( 'Debe iniciar sesión para acceder a este módulo.' );

        return router.createUrlTree(
            [
                '/login'
            ],
            {
                queryParams: {
                    returnUrl: state.url
                }
            }
        );
    }



    // Todavía no sabemos si existe una sesión.
    // Intentamos restaurarla.
    return authService

        .inicializarSesion()

        .pipe(

            map((usuario) => { // usuario es Usuario | null

                if (usuario) {

                    return true;

                }

                notification.error(
                    'Debe iniciar sesión para acceder a este módulo.'
                );

                return router.createUrlTree(
                    [
                        '/login'
                    ],
                    {
                        queryParams: {
                            returnUrl: state.url
                        }
                    }
                );
            })
        );
};