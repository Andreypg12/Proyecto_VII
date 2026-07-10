import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';

import {
    Cita,
    ConfiguracionCita,
    CreateCitaDto,
    FiltrosCita
} from '../models/cita.model';

@Injectable({
    providedIn: 'root'
})
export class CitaService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/cita`;

    /**
     * Obtiene las opciones necesarias para registrar citas.
     * Las modalidades provienen del enum de Prisma mediante la API.
     */
    obtenerConfiguracion() {
        return this.http.get<
            ApiResponse<ConfiguracionCita>
        >(
            `${this.apiUrl}/configuracion`
        );
    }

    listar(filtros?: FiltrosCita) {
        let params = new HttpParams();

        if (filtros?.estado) {
            params = params.set(
                'estado',
                filtros.estado
            );
        }

        if (filtros?.idProfesional) {
            params = params.set(
                'idProfesional',
                filtros.idProfesional.toString()
            );
        }

        if (filtros?.fechaDesde) {
            params = params.set(
                'fechaDesde',
                filtros.fechaDesde
            );
        }

        if (filtros?.fechaHasta) {
            params = params.set(
                'fechaHasta',
                filtros.fechaHasta
            );
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