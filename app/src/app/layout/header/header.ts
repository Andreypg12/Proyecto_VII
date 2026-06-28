import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
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
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  publicMenu = input.required<MenuItem[]>();

  listados = [
  { nombre: 'Usuarios', ruta: '/usuarios', icono: 'group' },
  { nombre: 'Profesionales', ruta: '/profesionales', icono: 'badge' },
  { nombre: 'Servicios', ruta: '/servicios', icono: 'miscellaneous_services' },
  { nombre: 'Categorías Servicio', ruta: '/categoria-servicio', icono: 'category' },
  { nombre: 'Especialidades', ruta: '/especialidades', icono: 'medical_services' },
  { nombre: 'Citas', ruta: '/citas', icono: 'event' },
  { nombre: 'Valoraciones', ruta: '/valoraciones', icono: 'star' },
  { nombre: 'Ubicaciones', ruta: '/ubicaciones', icono: 'location_on' },
];
}