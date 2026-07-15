// src/app/core/services/ubicacion.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ProvinciaResponse {
    idProvincia: number;
    descripcion: string;
}

export interface CantonResponse {
    idCanton: number;
    descripcion: string;
}

export interface DistritoResponse {
    idDistrito: number;
    descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'https://api-geo-cr.vercel.app';

    obtenerProvincias(): Observable<ProvinciaResponse[]> {
        return this.http.get<any>(`${this.baseUrl}/provincias`).pipe(
            map((response) => {
                // La respuesta tiene la estructura: { status, statusCode, message, data: [...] }
                console.log('📦 Respuesta de provincias:', response);

                // Extraer el array de datos
                const provincias = response?.data || [];

                // Mapear a la estructura esperada por el frontend
                return provincias.map((p: any) => ({
                    id: p.idProvincia,
                    nombre: p.descripcion
                }));
            })
        );
    }

    obtenerCantones(idProvincia: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/provincias/${idProvincia}/cantones`).pipe(
            map((response) => {
                console.log(`📦 Cantones para provincia ${idProvincia}:`, response);

                const cantones = response?.data || [];

                return cantones.map((c: any) => ({
                    id: c.idCanton,
                    nombre: c.descripcion
                }));
            })
        );
    }

    obtenerDistritos(idProvincia: number, idCanton: number): Observable<any[]> {
        return this.http.get<any>(`${this.baseUrl}/cantones/${idCanton}/distritos`).pipe(
            map((response) => {
                console.log(`📦 Distritos para cantón ${idCanton}:`, response);

                const distritos = response?.data || [];

                return distritos.map((d: any) => ({
                    id: d.idDistrito,
                    nombre: d.descripcion
                }));
            })
        );
    }
}