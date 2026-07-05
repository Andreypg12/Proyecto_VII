import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Especialidad } from '../models/especialidad.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/especialidad`;

  listar() {
    return this.http.get<ApiResponse<Especialidad[]>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Especialidad>>(`${this.apiUrl}/${id}`);
  }

  activar(id: number) {
    return this.http.put<any>(`${this.apiUrl}/activar/${id}`, {});
  }

  desactivar(id: number) {
    return this.http.put<any>(`${this.apiUrl}/desactivar/${id}`, {});
  }
}