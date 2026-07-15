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

import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional } from '../../../core/models/profesional.model';

@Component({
  selector: 'app-profesional-detail',
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
  templateUrl: './profesional-detail.html',
  styleUrl: './profesional-detail.css',
})
export class ProfesionalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly profesionalService = inject(ProfesionalService);

  profesional = signal<Profesional | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtro para servicios activos
  serviciosActivos = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.cargarProfesional(Number(id));
    } else {
      this.error.set('ID de profesional no válido');
      this.loading.set(false);
    }
  }

  cargarProfesional(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.profesionalService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.profesional.set(response.data);
        this.loading.set(false);
        console.log('✅ Profesional cargado:', response);
      },
      error: (err) => {
        console.error('❌ Error al cargar profesional:', err);
        this.error.set('No se pudo cargar el profesional solicitado.');
        this.loading.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/profesionales']);
  }

  editar(): void {
    const profesional = this.profesional();
    if (profesional) {
      this.router.navigate(['/profesionales/editar', profesional.id]);
    }
  }

  toggleServiciosFiltro(): void {
    this.serviciosActivos.update(valor => !valor);
  }

  // Helper para obtener el estado del profesional
  getEstadoInfo(estado: string): { label: string; icon: string; class: string } {
    const map: Record<string, { label: string; icon: string; class: string }> = {
      'ACTIVO': { label: 'Activo', icon: 'check_circle', class: 'active' },
      'INACTIVO': { label: 'Inactivo', icon: 'block', class: 'inactive' },
      'BLOQUEADO': { label: 'Bloqueado', icon: 'lock', class: 'blocked' },
    };
    return map[estado] || { label: estado || 'Desconocido', icon: 'help', class: 'unknown' };
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

  // Helper para estado del servicio
  getEstadoServicioInfo(estado: boolean): { label: string; icon: string; class: string } {
    return estado
      ? { label: 'Activo', icon: 'check_circle', class: 'active' }
      : { label: 'Inactivo', icon: 'block', class: 'inactive' };
  }

  getServiciosFiltrados() {
    const profesional = this.profesional();
    if (!profesional) return [];

    if (this.serviciosActivos()) {
      return profesional.servicios?.filter(s => s.estado === true) || [];
    }
    return profesional.servicios || [];
  }

  getTotalServicios() {
    const profesional = this.profesional();
    return profesional?.servicios?.length || 0;
  }

  getServiciosActivos() {
    const profesional = this.profesional();
    return profesional?.servicios?.filter(s => s.estado === true).length || 0;
  }

  getImageUrl(imageName: string): string {
    return this.profesionalService.getImageUrl(imageName);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}