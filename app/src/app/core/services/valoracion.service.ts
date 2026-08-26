import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { CreateValoracionDto, Valoracion } from '../models/valoracion.model';

@Injectable({ providedIn: 'root' })
export class ValoracionService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/valoracion`;

    crear(data: CreateValoracionDto) {
        return this.http.post<ApiResponse<Valoracion>>(this.apiUrl, data);
    }

    obtenerPorCita(idCita: number) {
        return this.http.get<ApiResponse<Valoracion | null>>(`${this.apiUrl}/cita/${idCita}`);
    }
}
