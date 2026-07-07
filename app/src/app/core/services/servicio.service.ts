import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiPaginatedResponse, ApiResponse } from '../models/api-response.model';
import { Servicio, ServicioCreateDto, ServicioUpdateDto } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/servicio`;

  listar() {
    return this.http.get<ApiPaginatedResponse<Servicio>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Servicio>>(`${this.apiUrl}/${id}`);
  }

  crear(data: ServicioCreateDto) {
    return this.http.post<ApiResponse<Servicio>>(this.apiUrl, data);
  }

  actualizar(id: number, data: ServicioUpdateDto) {
    return this.http.put<ApiResponse<Servicio>>(`${this.apiUrl}/${id}`, data);
  }
}
