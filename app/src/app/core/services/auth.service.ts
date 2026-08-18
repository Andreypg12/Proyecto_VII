import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
    LoginRequest,
    LoginResponse
} from '../models/usuario.model';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/usuario`;

    private readonly tokenKey = 'token';


    login(data: LoginRequest) {

        return this.http
            .post<LoginResponse>(
                `${this.apiUrl}/login`,
                data
            )
            .pipe(
                tap((response) => {

                    localStorage.setItem(
                        this.tokenKey,
                        response.data.token
                    );

                })
            );
    }


    obtenerToken(): string | null {

        return localStorage.getItem(
            this.tokenKey
        );
    }
}