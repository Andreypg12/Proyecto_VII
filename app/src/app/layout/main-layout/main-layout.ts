import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
type Role = 'CLIENTE' | 'ADMIN';
interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}
interface User {
  nombre: string;
  role: Role;
}
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  cartCount = signal(2);
  currentUser = signal<User | null>(null);
  publicMenu = signal<MenuItem[]>([
    { label: 'Inicio', path: '/', icon: 'home' },
    { label: 'Catálogo', path: '/videojuegos', icon: 'sports_esports' },
    { label: 'Ofertas', path: '/ofertas', icon: 'local_offer' },
    { label: 'Mis órdenes', path: '/ordenes', icon: 'receipt_long', roles: ['CLIENTE', 'ADMIN'] },
  ]);
  adminMaintenanceMenu = signal<MenuItem[]>([
    { label: 'Videojuegos', path: '/admin/videojuegos', icon: 'sports_esports' },
    { label: 'Categorías', path: '/admin/categorias', icon: 'category' },
    { label: 'Plataformas', path: '/admin/plataformas', icon: 'devices' },
  ]);
  adminManagementMenu = signal<MenuItem[]>([
    { label: 'Órdenes', path: '/admin/ordenes', icon: 'shopping_bag' },
    { label: 'Usuarios', path: '/admin/usuarios', icon: 'group' },
    { label: 'Reportes', path: '/admin/reportes', icon: 'bar_chart' },
  ]);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  canShowItem(item: MenuItem): boolean {
    if (!item.roles) return true;
    const user = this.currentUser();
    return !!user && item.roles.includes(user.role);
  }
  loginAsClient(): void {
    this.currentUser.set({ nombre: 'Cliente Demo', role: 'CLIENTE' });
  }
  loginAsAdmin(): void {
    this.currentUser.set({ nombre: 'Admin Demo', role: 'ADMIN' });
  }
  logout(): void {
    this.currentUser.set(null);
  }
}
