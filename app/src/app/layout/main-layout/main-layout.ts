import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import {
    Header,
    MenuItem
} from '../header/header';

import { Footer } from '../footer/footer';


@Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        Header,
        Footer
    ],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.css',
})
export class MainLayout {


    // Menú Principal
    readonly publicMenu: MenuItem[] = [

        {
            label: 'Inicio',
            path: '/',
            icon: 'home'
        },

        {
            label: 'Agenda',
            path: '/citas/agenda',
            icon: 'calendar_month',
            roles: [
                'ADMINISTRADOR',
                'PROFESIONAL'
            ]
        },

    ];


    // Menú Explorar

    readonly menuListados: MenuItem[] = [

        {
            label: 'Usuarios',
            path: '/usuarios',
            icon: 'group',
            roles: [
                'ADMINISTRADOR'
            ]
        },

        {
            label: 'Profesionales',
            path: '/profesionales',
            icon: 'badge',
            roles: [
                'ADMINISTRADOR',
                'CLIENTE'
            ]
        },

        {
            label: 'Categorías Servicio',
            path: '/categoria-servicio',
            icon: 'category',
            roles: [
                'ADMINISTRADOR'
            ]
        },

        {
            label: 'Servicios',
            path: '/servicios',
            icon: 'miscellaneous_services',
        },

        {
            label: 'Especialidades',
            path: '/especialidades',
            icon: 'medical_services',
            roles: [
                'ADMINISTRADOR'
            ]
        },

        {
            label: 'Citas',
            path: '/citas',
            icon: 'event',
            roles: [
                'ADMINISTRADOR',
                'PROFESIONAL',
                'CLIENTE'
            ]
        },

        {
            label: 'Valoraciones',
            path: '/valoraciones',
            icon: 'star',
            roles: [
                'CLIENTE'
            ]
        },

    ];
}