import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
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
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  publicMenu = input.required<MenuItem[]>();
  adminMaintenanceMenu = input.required<MenuItem[]>();
  adminManagementMenu = input.required<MenuItem[]>();
  currentUser = input<User | null>(null);
  cartCount = input(0);
  isAdmin = input(false);
  canShowItem = input.required<(item: MenuItem) => boolean>();
  loginClient = output<void>();
  loginAdmin = output<void>();
  logoutUser = output<void>();
}
