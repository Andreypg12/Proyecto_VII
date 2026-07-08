import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';

import {
    Cita,
    CreateCitaDto,
    FiltrosCita
} from '../models/cita.model';

@Injectable({
    providedIn: 'root'
})
export class CitaService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/cita`;

    listar(filtros?: FiltrosCita) {

        const params: any = {};

        if (filtros?.estado) {
            params.estado = filtros.estado;
        }

        if (filtros?.idProfesional) {
            params.idProfesional =
                filtros.idProfesional.toString();
        }

        if (filtros?.fechaDesde) {
            params.fechaDesde = filtros.fechaDesde;
        }

        if (filtros?.fechaHasta) {
            params.fechaHasta = filtros.fechaHasta;
        }

        return this.http.get<ApiResponse<Cita[]>>(
            this.apiUrl,
            { params }
        );
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<Cita>>(
            `${this.apiUrl}/${id}`
        );
    }

    crear(data: CreateCitaDto) {
        return this.http.post<ApiResponse<Cita>>(
            this.apiUrl,
            data
        );
    }
}