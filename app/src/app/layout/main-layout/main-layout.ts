import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

  publicMenu = signal<MenuItem[]>([
    {
      label: 'Inicio',
      path: '/',
      icon: 'home'
    },
  ]);

  menuListados = signal<MenuItem[]>([
    {
      label: 'Usuarios',
      path: '/usuarios',
      icon: 'group'
    },
    {
      label: 'Profesionales',
      path: '/profesionales',
      icon: 'badge'
    },
    {
      label: 'Categorías Servicio',
      path: '/categoria-servicio',
      icon: 'category'
    },
    {
      label: 'Servicios',
      path: '/servicios',
      icon: 'miscellaneous_services'
    },
    {
      label: 'Especialidades',
      path: '/especialidades',
      icon: 'medical_services'
    },
    {
      label: 'Citas',
      path: '/citas',
      icon: 'event'
    },
    {
      label: 'Valoraciones',
      path: '/valoraciones',
      icon: 'star'
    },
    {
      label: 'Ubicaciones',
      path: '/ubicaciones',
      icon: 'location_on'
    },
  ]);
}