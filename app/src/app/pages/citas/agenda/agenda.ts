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

    // Hace que los eventos mensuales sean rectángulos
    eventDisplay: 'block',

    // Muestra también la hora final
    displayEventEnd: true,

    // Evita que demasiadas citas deformen una celda
    dayMaxEventRows: 3,
    moreLinkClick: 'popover',

    // Horario útil de la agenda semanal
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',

    // Oculta la fila "todo el día"
    allDaySlot: false,

    nowIndicator: true,
    height: 'auto',

    events: [],

    dateClick: (info) => {
      this.seleccionarFecha(info.dateStr);
    },

    eventClick: (info) => {
      this.abrirDetalleCita(info);
    }
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

        console.table(
          citas.map((cita: Cita) => ({
            id: cita.id,
            estadoOriginal: cita.estado,
            estadoNormalizado: String(cita.estado ?? '')
              .trim()
              .toUpperCase()
          }))
        );

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
  const estadoNormalizado = String(cita.estado ?? '')
    .trim()
    .toUpperCase();

  const color = this.obtenerColorEstado(estadoNormalizado);

  return {
    id: String(cita.id),

    title: this.obtenerTituloCita(cita),

    start: cita.fecha_hora_inicio,
    end: cita.fecha_hora_finalizacion_esperada,

    allDay: false,

    // Forma rectangular también en vista mensual
    display: 'block',

    // Propiedades de color de FullCalendar 7
    color,
    contrastColor: '#ffffff',

    extendedProps: {
      estado: estadoNormalizado,
      modalidad: cita.modalidad,
      comentario: cita.comentario_cliente,
      montoEstimado: cita.monto_estimado,
      cita
    }
  };
}

private obtenerTituloCita(cita: Cita): string {
  const servicio =
    cita.servicio?.servicio ??
    'Servicio';

  const nombreCliente =
    cita.cliente
      ? `${cita.cliente.nombre} ${cita.cliente.apellidos}`
      : 'Cliente';

  return `${servicio} - ${nombreCliente}`;
}

  // Asignar colores por estado
  private obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      PENDIENTE: '#f59e0b',

      ACEPTADA: '#2563eb',
      CONFIRMADA: '#2563eb',

      'EN PROCESO': '#7c3aed',
      EN_PROCESO: '#7c3aed',

      COMPLETADA: '#16a34a',
      FINALIZADA: '#16a34a',

      RECHAZADA: '#dc2626',
      CANCELADA: '#6b7280'
    };

    return colores[estado] ?? '#64748b';
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