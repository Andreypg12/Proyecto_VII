import { inject } from '@angular/core'
import {
    HttpErrorResponse,
    HttpInterceptorFn,
} from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { NotificationService } from '../services/notification.service'

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
    const noti = inject(NotificationService)

    console.log('Request URL:', request.url)

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            let message = 'Se presentó un error inesperado'

            if (error.error instanceof ErrorEvent) {
                message = `Error del cliente: ${error.error.message}`
            } else {
                switch (error.status) {
                    case 0:
                        message = 'No se pudo conectar con el servidor'
                        break
                    case 400:
                        message = 'Solicitud incorrecta'
                        break
                    case 401:
                        message = 'No autorizado'
                        break
                    case 403:
                        message = 'Acceso denegado'
                        break
                    case 404:
                        message = 'Recurso no encontrado'
                        break
                    case 422:
                        message = 'Los datos enviados no son válidos'
                        break
                    case 500:
                        message = 'Error interno del servidor'
                        break
                    case 503:
                        message = 'Servicio no disponible'
                        break
                }
            }
            noti.error(message, `Error ${error.status}`, 5000)
            return throwError(() => error)
        })
    )
}