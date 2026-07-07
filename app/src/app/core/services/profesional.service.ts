// core/services/videojuego.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiPaginatedResponse, ApiResponse } from '../models/api-response.model';
import { Profesional, ProfesionalCreateDto, ProfesionalUpdateDto } from '../models/profesional.model';

@Injectable({ providedIn: 'root' })
export class ProfesionalService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profesional`;

  listar() {
    return this.http.get<ApiPaginatedResponse<Profesional>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Profesional>>(`${this.apiUrl}/${id}`);
  }

  crear(data: ProfesionalCreateDto) {
    return this.http.post<ApiResponse<Profesional>>(this.apiUrl, data);
  }

  actualizar(id: number, data: ProfesionalUpdateDto) {
    return this.http.put<ApiResponse<Profesional>>(`${this.apiUrl}/${id}`, data);
  }

  getImageUrl(imageName: string): string {
    return `${environment.imageUrl}/${imageName}`;
  }
}
