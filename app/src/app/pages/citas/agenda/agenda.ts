import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

//Rutas
import { Router } from '@angular/router';

//FullCalendar
import {
  CalendarOptions,
  EventClickInfo,
  EventInput,
  FullCalendarModule
} from '@fullcalendar/angular';

//Para backend de citas
import { CitaService } from '../../../core/services/cita.service';
import { Cita } from '../../../core/models/cita.model';


//Plugins
import themePlugin from '@fullcalendar/angular/themes/monarch';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';

@Component({
  selector: 'app-citas-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css'
})
export class CitasAgenda implements OnInit {

  private readonly citaService = inject(CitaService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  calendarOptions: CalendarOptions = {
    plugins: [
      themePlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
    ],

    initialView: 'dayGridMonth',

    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek'
    },

    buttons: {
      today: {
        text: 'Hoy',
        display: 'text'
      },
      dayGridMonth: {
        text: 'Mes',
        display: 'text'
      },
      timeGridWeek: {
        text: 'Semana',
        display: 'text'
      }
    },

    nowIndicator: true,
    height: 'auto',

    events: [],

    dateClick: (info) => {
      this.seleccionarFecha(info.dateStr);
    },

    eventClick: (info: EventClickInfo) => {
      this.abrirDetalleCita(info);
    },
  };

  //Backend

  //Cargar las citas del backend
  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.listar().subscribe({
      next: (response) => {
        const citas = response.data ?? [];

        const eventos: EventInput[] = citas.map(
          (cita: Cita) => this.convertirCitaAEvento(cita)
        );

        /*
         * Creamos un nuevo objeto para que Angular y
         * FullCalendar detecten correctamente el cambio.
         */
        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos
        };

        console.log('Citas recibidas:', citas);
        console.log('Eventos del calendario:', eventos);

        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error al cargar las citas:', error);

        this.error.set(
          'No fue posible cargar las citas desde el servidor.'
        );

        this.loading.set(false);
      }
    });
  }

  //Convertir una cita en un evento de FullCalendar

  private convertirCitaAEvento(cita: Cita): EventInput {
    const color = this.obtenerColorEstado(cita.estado);

    const nombreCliente =
      `${cita.cliente.nombre} ${cita.cliente.apellidos}`;

    const nombreProfesional =
      `${cita.profesional.usuario.nombre} ` +
      `${cita.profesional.usuario.apellidos}`;

    return {
      id: String(cita.id),

      title:
        `${cita.servicio.servicio} - ${nombreCliente}`,

      start: cita.fecha_hora_inicio,

      end: cita.fecha_hora_finalizacion_esperada,

      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',

      /*
       * Aquí guardamos información adicional.
       * No necesariamente se muestra en el calendario,
       * pero estará disponible cuando se seleccione el evento.
       */
      extendedProps: {
        estado: cita.estado,
        modalidad: cita.modalidad,
        comentario: cita.comentario_cliente,
        montoEstimado: cita.monto_estimado,
        cliente: nombreCliente,
        profesional: nombreProfesional,
        servicio: cita.servicio.servicio
      }
    };
  }

  // Asignar colores por estado
  private obtenerColorEstado(estado: string): string {
    switch (estado) {
      case 'PENDIENTE':
        return '#f59e0b';

      case 'ACEPTADA':
        return '#2563eb';

      case 'RECHAZADA':
        return '#dc2626';

      case 'CANCELADA':
        return '#6b7280';

      case 'COMPLETADA':
        return '#16a34a';

      default:
        return '#7c3aed';
    }
  }

  //Abrir detalle al seleccionar una cita
  abrirDetalleCita(info: EventClickInfo): void {
    const idCita = Number(info.event.id);

    this.router.navigate([
      '/citas',
      idCita
    ]);
  }

  seleccionarFecha(fecha: string): void {
    alert(`Fecha seleccionada: ${fecha}`);
  }

  seleccionarCita(id: string, titulo: string): void {
    alert(`Cita seleccionada: ${titulo}\nIdentificador: ${id}`);
  }
}