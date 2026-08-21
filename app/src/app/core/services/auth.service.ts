import {
    computed,
    inject,
    Injectable,
    signal
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
    catchError,
    finalize,
    map,
    Observable,
    of,
    shareReplay,
    switchMap,
    tap
} from 'rxjs';

import { environment } from '../../../environments/environment';

import {
    LoginRequest,
    LoginResponse,
    PerfilResponse,
    Rol,
    Usuario
} from '../models/usuario.model';

import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly apiUrl = `${environment.apiUrl}/usuario`;

    private readonly tokenKey = 'token';

    private readonly tokenSignal =
        signal<string | null>(
            this.leerTokenAlmacenado()
        );
    readonly token = this.tokenSignal.asReadonly();


    //Autenticación
    private readonly usuarioSignal = signal<Usuario | null>(null);
    readonly usuario = this.usuarioSignal.asReadonly();

    readonly autenticado = computed(() =>
                this.token() !== null &&
                this.usuario() !== null
        );

    readonly rol = 
        computed(
            () => this.usuario()?.rol ?? null
        )

        tieneRol( rolesPermitidos: Rol[] ): boolean {
            const rolActual =this.rol();
            return (
                rolActual !== null &&
                rolesPermitidos.includes(
                    rolActual
                )
            );
        }

    private readonly sesionInicializadaSignal = signal(false);

    readonly sesionInicializada = this.sesionInicializadaSignal.asReadonly();
    private readonly cargandoSesionSignal = signal(false);
    readonly cargandoSesion = this.cargandoSesionSignal.asReadonly();

    private solicitudPerfilActual: Observable<Usuario | null> | null = null;


    login(data: LoginRequest): Observable<Usuario> {

        this.cargandoSesionSignal.set(true);

        return this.http
            .post<LoginResponse>(
                `${this.apiUrl}/login`,
                data
            )
            .pipe(

                tap((response) => {
                    this.guardarToken(
                        response.data.token
                    );
                }),

                switchMap(() =>
                    this.obtenerPerfil()
                ),

                tap((usuario) => {
                    this.usuarioSignal.set( usuario );
                    this.sesionInicializadaSignal .set(true);
                }),

                finalize(() => {this.cargandoSesionSignal.set(false);})
            );
    }

    obtenerPerfil(): Observable<Usuario> {

        return this.http
            .get<PerfilResponse>(
                `${this.apiUrl}/perfil`
            )
            .pipe(
                map((response) => response.data )
            );
    }

    inicializarSesion():
        Observable<Usuario | null> {

        if (this.sesionInicializada()) {
            return of( this.usuario());
        }

        const token =this.token();

        if (!token) {
            this.usuarioSignal.set(null);
            this.sesionInicializadaSignal.set(true);
            return of(null);
        }

        return this.cargarPerfil();
    }

    cargarPerfil():
        Observable<Usuario | null> {

        if (this.solicitudPerfilActual) {
            return this.solicitudPerfilActual;
        }

        const token =this.token();

        if (!token) {
            this.usuarioSignal.set(null);
            this.sesionInicializadaSignal.set(true);
            return of(null);
        }

        this.cargandoSesionSignal.set(true);

        this.solicitudPerfilActual =
    this.obtenerPerfil()
        .pipe(

            tap((usuario) => {

                this.usuarioSignal.set(
                    usuario
                );
            }),

            map(
                (usuario):
                    Usuario | null =>
                    usuario
            ),

            catchError(() => {
                this.limpiarSesion();
                return of(null);
            }),

            finalize(() => {
                this.cargandoSesionSignal.set(false);
                this.sesionInicializadaSignal.set(true);
                this.solicitudPerfilActual =null;
            }),

            shareReplay({
                bufferSize: 1,
                refCount: false
            })
        );

        return this.solicitudPerfilActual;
    }

    logout(redirigir = true): void {

    this.limpiarSesion();
    if (redirigir) {
        void this.router.navigate([
            '/login'
        ]);
    }
}


    obtenerToken(): string | null { return this.token();}

    private guardarToken(token: string): void {
        const tokenLimpio = token.trim();

        if (!tokenLimpio) {
            throw new Error('El token recibido no es válido');
        }

        localStorage.setItem(this.tokenKey, tokenLimpio);
        this.tokenSignal.set( tokenLimpio );
    }

    private leerTokenAlmacenado():
        string | null {

        const token = localStorage.getItem( this.tokenKey);

        if (!token) {
            return null;
        }

        const tokenLimpio = token.trim();

        return tokenLimpio.length > 0 ? tokenLimpio : null;
    }

    private limpiarSesion(): void {

        localStorage.removeItem(this.tokenKey);

        this.tokenSignal.set(null);
        this.usuarioSignal.set(null);
        this.cargandoSesionSignal.set(false);
        this.sesionInicializadaSignal.set(true);
        this.solicitudPerfilActual = null;
    }



}