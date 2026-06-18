import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
interface ContentCard {
  title: string;
  description: string;
  icon: string;
}
@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  cards = signal<ContentCard[]>([
    {
      title: 'Videojuegos',
      description: 'Mantenimiento de catálogo, categorías, etiquetas y plataformas.',
      icon: 'sports_esports',
    },
    {
      title: 'Órdenes',
      description: 'Registro de compras y detalle de videojuegos vendidos.',
      icon: 'receipt_long',
    },
    {
      title: 'Usuarios',
      description: 'Gestión de usuarios, roles y acceso al sistema.',
      icon: 'group',
    },
  ]);
}
