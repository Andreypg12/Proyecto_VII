import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UsuarioService } from '../../../core/services/usuarios.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Usuario } from '../../../core/models/usuario.model';

import { DetalleObjeto, CampoDetalle } from '../../../shared/components/detalle-objeto/detalle-objeto';

@Component({
  selector: 'app-usuario-detail',
  standalone: true,
  imports: [RouterLink, DetalleObjeto],
  templateUrl: './usuario-detail.html',
  styleUrl: './usuario-detail.css',
})
export class UsuarioDetail {
  usuario = signal<Usuario | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  campos: CampoDetalle[] = [
    { etiqueta: 'ID', campo: 'id' },
    { etiqueta: 'Nombre', campo: 'nombre' },
    { etiqueta: 'Apellidos', campo: 'apellidos' },
    { etiqueta: 'Correo', campo: 'email' },
    { etiqueta: 'Rol', campo: 'rol' },
    { etiqueta: 'Estado', campo: 'estado', tipo: 'estado-usuario' },
  ];

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private notification: NotificationService
  ) {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.error.set('ID inválido');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.usuario.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el usuario');
        this.notification.error('No se pudo cargar el usuario');
        this.loading.set(false);
      },
    });
  }
}