import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio } from '../../../core/models/servicio.model';
import { ProfesionalService } from '../../../core/services/profesional.service';

@Component({
  selector: 'app-servicio-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './servicio-detail.html',
  styleUrl: './servicio-detail.css',
})
export class ServicioDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicioService = inject(ServicioService);
    private readonly profesionalService = inject(ProfesionalService);

  servicio = signal<Servicio | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarServicio(Number(id));
    } else {
      this.error.set('ID de servicio no válido');
      this.loading.set(false);
    }
  }

  cargarServicio(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.servicioService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.servicio.set(response.data);
        this.loading.set(false);
        console.log('Servicio cargado:', response);
      },
      error: (err) => {
        console.error('Error al cargar servicio:', err);
        this.error.set('No se pudo cargar el servicio solicitado.');
        this.loading.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/servicios']);
  }

  editar(): void {
    const servicio = this.servicio();
    if (servicio) {
      this.router.navigate(['/servicios/editar', servicio.id]);
    }
  }

  // Helper para obtener el estado del servicio
  getEstadoInfo(estado: boolean): { label: string; icon: string; class: string } {
    return estado
      ? { label: 'Activo', icon: 'check_circle', class: 'active' }
      : { label: 'Inactivo', icon: 'block', class: 'inactive' };
  }

  // Helper para formatear modalidad
  getModalidadInfo(modalidad: string): { label: string; icon: string } {
    const map: Record<string, { label: string; icon: string }> = {
      'VIRTUAL': { label: 'Virtual', icon: 'computer' },
      'PRESENCIAL': { label: 'Presencial', icon: 'location_on' },
      'HÍBRIDA': { label: 'Híbrida', icon: 'swap_horiz' },
    };
    return map[modalidad] || { label: modalidad || 'No especificada', icon: 'help' };
  }

  getImageUrl(imageName: string): string {
    return this.profesionalService.getImageUrl(imageName);
  }

  // Manejar error de carga de imagen
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // Mostrar el placeholder
    const parent = img.parentElement;
    if (parent) {
      const placeholder = parent.querySelector('.image-placeholder');
      if (placeholder) {
        (placeholder as HTMLElement).style.display = 'flex';
      }
    }
  }
}

