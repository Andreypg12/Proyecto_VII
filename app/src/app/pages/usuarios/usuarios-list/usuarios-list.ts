import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FiltrosGenerales } from '../../../shared/components/filtros-generales/filtros-generales';
import { TablaListado, ColumnaTabla } from '../../../shared/components/tabla-listado/tabla-listado';

import { UsuarioService } from '../../../core/services/usuarios.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [RouterLink, FiltrosGenerales, MatIconModule, TablaListado],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})
export class UsuariosList {
  usuarios = signal<any[]>([]);

  buscar = signal('');
  rol = signal<string | undefined>(undefined);

  loading = signal(false);
  error = signal<string | null>(null);

  columnas: ColumnaTabla[] = [
    { titulo: 'Nombre', campo: 'nombreCompleto' },
    { titulo: 'Correo', campo: 'email' },
    { titulo: 'Rol', campo: 'rol' },
    { titulo: 'Estado', campo: 'estado', tipo: 'estado-usuario' },
  ];

  constructor( private usuarioService: UsuarioService, private notification: NotificationService) {
    this.cargarUsuarios();
  }

  usuariosFiltrados = computed(() => {

    const texto = this.buscar().trim().toLowerCase();
    const rolSeleccionado = this.rol();

    return this.usuarios().filter((usuario) => {
      const nombre = usuario.nombreCompleto?.toLowerCase() ?? '';
      const email = usuario.email?.toLowerCase() ?? '';
      const rolUsuario = usuario.rol?.toLowerCase() ?? '';

      //valida conicidencias para filtrar usuarios
      const coincideBusqueda = texto.length === 0 || nombre.includes(texto) || email.includes(texto) || rolUsuario.includes(texto);
      const coincideRol = rolSeleccionado === undefined || usuario.rol === rolSeleccionado;

      //Si no estan bien las dos entonces rechaza al usuario (No lo muestra en la tabla) y sigue con los otros
      return coincideBusqueda && coincideRol;
    });
  });

  cargarUsuarios(): void {

    //Activa estado de carga y limpia errores
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (res) => {

        //Traiga todo el objeto completo y ademas haga una nueva propieda en la cual une nombre y apellidos en un solo campo.
        const data = res.data.map((usuario: any) => ({...usuario, nombreCompleto: `${usuario.nombre} ${usuario.apellidos}`,}));
        this.usuarios.set(data);
        this.loading.set(false);
      
      },
      error: () => {
        this.error.set('Error al cargar usuarios');
        this.notification.error('Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  //Disparadores del computed
  onBuscarChange(valor: string): void {
    this.buscar.set(valor);
  }
  onRolChange(valor: string | undefined): void {
    this.rol.set(valor);
  }


  async cambiarEstado(usuario: any): Promise<void> {

    // Si el usuario está 'BLOQUEADO', asumimos que el botón quiere hacer lo opuesto: 'activar'.
    const debeActivar = usuario.estado === 'BLOQUEADO';
    //Se guarda en accion lo que esta en debeActivar
    const accion = debeActivar ? 'activar' : 'bloquear';

    //Modal para confirmar que quiere hacer el proceso
    const confirmado = await this.notification.confirmar(
      `${debeActivar ? 'Activar' : 'Bloquear'} usuario`,
      `¿Desea ${accion} al usuario "${usuario.nombreCompleto}"?`,
      debeActivar ? 'Activar' : 'Bloquear'
    );

    if (!confirmado) return;

    //Dependiendo de lo que se dijo, activa / desactiva
    const peticion = debeActivar ? this.usuarioService.activar(usuario.id) : this.usuarioService.bloquear(usuario.id);

    //Se ejecuta lo de activar o desactivar
    //Cuando termina si todo sale bien pasa por next y sino pasa por error.
    peticion.subscribe({
      next: () => {
        this.notification.success( `Usuario ${debeActivar ? 'activado' : 'bloqueado'} correctamente`);
        this.cargarUsuarios();
      },

      error: () => { this.notification.error(`Error al ${accion} el usuario`);},
    });
  }
}