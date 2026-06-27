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
    private readonly apiUrl = `${environment.apiUrl}/categoriaServicio`;

    listar() {
        return this.http.get<ApiResponse<CategoriaServicio[]>>(this.apiUrl);
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<CategoriaServicio>>(`${this.apiUrl}/${id}`);
    }
}