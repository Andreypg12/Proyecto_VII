import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Usuario } from '../models/usuario.model';
import {UsuarioConfiguracion} from '../models/usuario.model';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private readonly http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/usuario`;

    obtenerConfiguracion() {return this.http.get<ApiResponse<UsuarioConfiguracion>>(`${this.apiUrl}/config`);}

    listar(buscar?: string, rol?: string) {
        const params: any = {};

        if (buscar && buscar.trim() !== '') {
            params.buscar = buscar.trim();
        }

        if (rol && rol.trim() !== '') {
            params.rol = rol;
        }

        return this.http.get<ApiResponse<Usuario[]>>(this.apiUrl, { params });
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
    }

    activar(id: number) {
        return this.http.put<any>(`${this.apiUrl}/activar/${id}`, {});
    }

    bloquear(id: number) {
        return this.http.put<any>(`${this.apiUrl}/bloquear/${id}`, {});
    }
}