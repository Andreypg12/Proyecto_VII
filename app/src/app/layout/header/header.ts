import {
    Component,
    computed,
    HostListener,
    inject,
    input,
    signal
} from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

import { Rol } from '../../core/models/usuario.model';

export interface MenuItem {
    label: string;
    path: string;
    icon: string;
    roles?: Rol[];
}

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
    ],

    templateUrl: './header.html',
    styleUrl: './header.css',
})
export class Header {

    // Autenticación

    private readonly authService = inject(AuthService);
    readonly usuario = this.authService.usuario;
    readonly autenticado = this.authService.autenticado;
    readonly cargandoSesion = this.authService.cargandoSesion;
    readonly sesionInicializada = this.authService.sesionInicializada;
    readonly rol = this.authService.rol;

    // Información Visual para el usuario

    readonly nombreRol = computed(() => {
        const rolActual = this.rol();

        if (rolActual === 'ADMINISTRADOR') { return 'Administrador'; }
        if (rolActual === 'PROFESIONAL') { return 'Profesional'; }
        if (rolActual === 'CLIENTE') { return 'Cliente'; }

        return 'Usuario';
    });


    readonly iniciales = computed(() => {
        const usuarioActual = this.usuario();

        if (!usuarioActual) { return 'US'; }

        const inicialNombre =
            usuarioActual.nombre
                ?.trim()
                .charAt(0)
                .toUpperCase()
            ?? '';

        const inicialApellido =
            usuarioActual.apellidos
                ?.trim()
                .charAt(0)
                .toUpperCase()
            ?? '';

        return (
            inicialNombre +
            inicialApellido
        ) || 'US';
    });


    // Menú actual

    publicMenu = input.required<MenuItem[]>();
    menuListados = input.required<MenuItem[]>();
    readonly publicMenuVisible =
        computed(() =>
            this.publicMenu()
                .filter(
                    item =>
                        this.puedeMostrar(item)
                )
        );

    readonly menuListadosVisible =
        computed(() =>
            this.menuListados()
                .filter(
                    item =>
                        this.puedeMostrar(item)
                )
        );

    readonly mostrarMenuListados =
        computed(
            () =>
                this.menuListadosVisible()
                    .length > 0
        );
    scrolled = signal(false);
    listadosOpen = signal(false);

    setListadosOpen(open: boolean) {
        this.listadosOpen.set(open);
    }

    @HostListener(
        'window:scroll',
        []
    )
    onScroll() {
        this.scrolled.set(window.scrollY > 12);
    }

    puedeMostrar(item: MenuItem): boolean {
        if (!item.roles?.length) {
            return true;
        }
        return this.authService.tieneRol(
            item.roles
        );
    }

    cerrarSesion(): void {
        this.authService.logout();
    }
}