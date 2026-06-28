import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { CategoriaServicio } from '../models/categoriaServicio.model';

@Injectable({
    providedIn: 'root'
})
export class CategoriaServicioService {
    private readonly http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/categoriaServicio`;

    listar(buscar?: string, estado?: boolean) {
        let params: any = {};

        if (buscar && buscar.trim() !== '') {
            params.buscar = buscar.trim();
        }

        if (estado !== undefined) {
            params.estado = estado;
        }

        return this.http.get<any>(this.apiUrl, { params });
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<CategoriaServicio>>(`${this.apiUrl}/${id}`);
    }

    cambiarEstado(id: number, estado: boolean) {
        return this.http.patch<any>(`${this.apiUrl}/categoria-servicio/${id}/estado`, {
            estado,
        });
    }
}