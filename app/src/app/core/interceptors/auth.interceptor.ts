import { HttpInterceptorFn } from '@angular/common/http';
import { environment} from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = 
    ( request, next) => {

    const token = localStorage.getItem('token');

    // Solo se agregan JWT a peticiones dirigidas a nuestro API
    if ( token && request.url.startsWith(environment.apiUrl) ) {

        const requestConToken =
            request.clone({
                setHeaders: { Authorization: `Bearer ${token}`}
            });

        return next(requestConToken);
    }

    // Si no existe token, la solicitud continúa normalmente.
    return next(request);
};