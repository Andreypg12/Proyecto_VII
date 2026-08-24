import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
    FiltrosReporteCitasEstado,
    ReporteCitasEstado,
    ReporteCitasProfesional,
    ReporteCalificaciones
} from '../../core/models/reporte.model';

import { ApiResponse } from '../../core/models/api-response.model';

@Injectable({
    providedIn: 'root'
})
export class ReporteService {

    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/reporte`;

    //Reporte 1
    obtenerCitasPorEstado(filtros?: FiltrosReporteCitasEstado): Observable<ApiResponse<ReporteCitasEstado>> {

        let params = new HttpParams();

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

        if (filtros?.idProfesional !== undefined) {
            params = params.set(
                'idProfesional',
                filtros.idProfesional.toString()
            );
        }

        if (filtros?.idCategoria !== undefined) {
            params = params.set(
                'idCategoria',
                filtros.idCategoria.toString()
            );
        }

        return this.http.get<ApiResponse<ReporteCitasEstado>>(
            `${this.apiUrl}/citas-estado`,
            { params }
        );
    }

    //Reporte 2
    obtenerCitasPorProfesional( idProfesional?: number ): Observable<ApiResponse<ReporteCitasProfesional[]>> {

        let params = new HttpParams();
        if (idProfesional !== undefined) {
            params = params.set(
                'idProfesional',
                idProfesional.toString()
            );
        }

        return this.http.get<
            ApiResponse<ReporteCitasProfesional[]>
        >(
            `${this.apiUrl}/citas-profesional`,
            { params }
        );
    }

    //Reporte 3
    obtenerCalificaciones(idProfesional?: number): Observable<ApiResponse<ReporteCalificaciones[]>> {

        let params = new HttpParams();

        if (idProfesional !== undefined) {
            params = params.set(
                'idProfesional',
                idProfesional.toString()
            );
        }
        return this.http.get< ApiResponse<ReporteCalificaciones[]> >(
            `${this.apiUrl}/calificaciones`,
            { params }
        );
    }
}