import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  CalendarOptions,
  EventClickInfo,
  EventInput,
  EventDisplayInfo,
  FullCalendarModule
} from '@fullcalendar/angular';

//Para backend de citas
import { CitaService } from '../../../core/services/cita.service';
import {
  Cita,
  ConfiguracionCita,
  CreateCitaDto,
  EstadoCita,
  FiltrosCita
} from '../../../core/models/cita.model';

import themePlugin from '@fullcalendar/angular/themes/monarch';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';

@Component({
  selector: 'app-citas-agenda',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
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
  totalCitas = signal(0);
  citasPendientes = signal(0);
  citasHoy = signal(0);

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
      this.seleccionarFecha(
        info.date,
        info.allDay
      );
    },

    eventClick: (info) => {
      this.abrirDetalleCita(info);
    },

    eventContent: (eventInfo: EventDisplayInfo) => this.renderEventContent(eventInfo)
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

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);

        let pendientes = 0;
        let citasHoy = 0;

        for (const cita of citas) {
          const estado = String(cita.estado ?? '').trim().toUpperCase();
          if (estado === 'PENDIENTE') pendientes++;

          const fechaCita = new Date(cita.fecha_hora_inicio);
          if (fechaCita >= hoy && fechaCita < mañana) citasHoy++;
        }

        this.totalCitas.set(citas.length);
        this.citasPendientes.set(pendientes);
        this.citasHoy.set(citasHoy);

        const eventos: EventInput[] = citas.map(
          (cita: Cita) => this.convertirCitaAEvento(cita)
        );

        //Nuevo objeto para que Angular y FullCalendar detecten correctamente el cambio.
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

    //Se normaliza el estado recibido
    const estadoNormalizado = String(cita.estado ?? '')
      .trim()
      .toUpperCase();

    const color = this.obtenerColorEstado(estadoNormalizado);

    const inicio = new Date(cita.fecha_hora_inicio);
    const fin = new Date(cita.fecha_hora_finalizacion_esperada);
    const horaInicio = inicio.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    const horaFin = fin.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
    const rangoHoras = `${horaInicio} - ${horaFin}`;

    const modalidadInfo = this.getModalidadInfo(cita.modalidad);

    const tooltip = [
      `Servicio: ${cita.servicio?.servicio}`,
      `Cliente: ${cita.cliente?.nombre} ${cita.cliente?.apellidos}`,
      `Email: ${cita.cliente?.email}`,
      `Modalidad: ${cita.modalidad}`,
      `Horario: ${rangoHoras}`,
      `Precio: $${cita.monto_estimado?.toLocaleString('es-CR')}`,
      cita.comentario_cliente ? `Comentario: ${cita.comentario_cliente}` : ''
    ].filter(Boolean).join('\n');

    return {
      id: String(cita.id),
      title: cita.servicio?.servicio ?? 'Servicio',
      start: cita.fecha_hora_inicio,
      end: cita.fecha_hora_finalizacion_esperada,
      allDay: false,

      // Forma rectangular también en vista mensual
      display: 'block',
      color,
      contrastColor: '#ffffff',
      extendedProps: {
        estado: estadoNormalizado,
        colorEstado: color,
        modalidad: cita.modalidad,
        modalidadIcon: modalidadInfo.icon,
        modalidadLabel: modalidadInfo.label,
        rangoHoras,
        emailCliente: cita.cliente?.email,
        tooltip
      }
    };
  }

  // ---- Tarjeta de evento ----

  private readonly iconPaths: Record<string, string> = {
    computer:
      '<rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 17v4"></path>',
    location_on:
      '<path d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
    swap_horiz:
      '<path d="M6 7h14M17 3l3 4-3 4M18 17H4M7 21l-3-4 3-4"></path>',
    help:
      '<circle cx="12" cy="12" r="9"></circle><path d="M9.5 9.3a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.9M12 17h.01"></path>',
    schedule:
      '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.3 2"></path>',
    email:
      '<rect x="2.5" y="4.5" width="19" height="15" rx="2"></rect><path d="M3 6.5l9 6.3 9-6.3"></path>'
  };

  private buildIcon(name: string, className: string, size = 12): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.classList.add(className, 'event-icon-svg');
    svg.innerHTML = this.iconPaths[name] ?? this.iconPaths['help'];
    return svg;
  }

  private truncate(text: string, max: number): string {
    const clean = text?.trim() ?? '';
    return clean.length > max ? clean.slice(0, max) + '...' : clean;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    if (!match) return null;
    return {
      r: parseInt(match[1], 16),
      g: parseInt(match[2], 16),
      b: parseInt(match[3], 16)
    };
  }

  private renderEventContent(eventInfo: EventDisplayInfo): { domNodes: HTMLElement[] } {
    const props = eventInfo.event.extendedProps;
    const modalidadIcon: string = props['modalidadIcon'];
    const modalidadLabel: string = props['modalidadLabel'];
    const rangoHoras: string = props['rangoHoras'];
    const email: string | undefined = props['emailCliente'];
    const tooltip: string | undefined = props['tooltip'];
    const colorEstado: string = props['colorEstado'] ?? '#64748b';

    const card = document.createElement('div');
    card.className = 'fc-event-card';
    if (tooltip) {
      card.title = tooltip;
    }

    const rgb = this.hexToRgb(colorEstado);
    if (rgb) {
      card.style.setProperty('--event-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }

    // Densidad automática según duración (afecta sobre todo la vista semanal)
    const inicioEvento = eventInfo.event.start;
    const finEvento = eventInfo.event.end;
    if (inicioEvento && finEvento) {
      const duracionMin = (finEvento.getTime() - inicioEvento.getTime()) / 60000;
      if (duracionMin <= 15) {
        card.classList.add('is-mini');
      } else if (duracionMin <= 30) {
        card.classList.add('is-compact');
      }
    }

    // Header: punto de estado + título + email
    const header = document.createElement('div');
    header.className = 'event-header';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'event-title-group';

    const statusDot = document.createElement('span');
    statusDot.className = 'event-status-dot';
    titleGroup.appendChild(statusDot);

    const titleEl = document.createElement('span');
    titleEl.className = 'event-title';
    titleEl.textContent = this.truncate(eventInfo.event.title, 28);
    titleGroup.appendChild(titleEl);

    header.appendChild(titleGroup);

    if (email) {
      const emailHeaderEl = document.createElement('span');
      emailHeaderEl.className = 'event-email-header';
      emailHeaderEl.textContent = this.truncate(email, 22);
      header.appendChild(emailHeaderEl);
    }

    card.appendChild(header);

    // Hora
    const timeEl = document.createElement('div');
    timeEl.className = 'event-time';
    timeEl.appendChild(this.buildIcon('schedule', 'event-time-icon'));

    const timeText = document.createElement('span');
    timeText.className = 'event-time-text';
    timeText.textContent = rangoHoras;
    timeEl.appendChild(timeText);

    card.appendChild(timeEl);

    // Modalidad + email
    const meta = document.createElement('div');
    meta.className = 'event-meta';

    const modalidadEl = document.createElement('span');
    modalidadEl.className = 'event-modalidad';
    modalidadEl.appendChild(this.buildIcon(modalidadIcon, 'event-modalidad-icon'));

    const modLabel = document.createElement('span');
    modLabel.className = 'event-modalidad-label';
    modLabel.textContent = modalidadLabel;
    modalidadEl.appendChild(modLabel);

    meta.appendChild(modalidadEl);

    card.appendChild(meta);

    return { domNodes: [card] };
  }

  private getModalidadInfo(modalidad: string): { label: string; icon: string } {
    const map: Record<string, { label: string; icon: string }> = {
      'VIRTUAL': { label: 'Virtual', icon: 'computer' },
      'PRESENCIAL': { label: 'Presencial', icon: 'location_on' },
      'HÍBRIDA': { label: 'Híbrida', icon: 'swap_horiz' },
    };
    return map[modalidad] || { label: modalidad || 'No especificada', icon: 'help' };
  }

  private obtenerColorEstado(
    estado: string
  ): string {

    const colores: Record<string, string> = {
      PENDIENTE: '#d97706',

      ACEPTADA: '#16a34a',
      CONFIRMADA: '#16a34a',

      COMPLETADA: '#2563eb',
      FINALIZADA: '#2563eb',

      RECHAZADA: '#dc2626',

      CANCELADA: '#64748b',

      'EN PROCESO': '#7c3aed',
      EN_PROCESO: '#7c3aed'
    };

    return colores[estado] ?? '#64748b';
  }

  //Abrir detalle al seleccionar una cita
  abrirDetalleCita(info: EventClickInfo): void {
    const idCita = Number(info.event.id);
    this.router.navigate(['/citas', idCita]);
  }

  async seleccionarFecha(fechaSeleccionada: Date, esDiaCompleto: boolean): Promise<void> {
    const ahora = new Date();

    const inicioHoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );

    const inicioFechaSeleccionada = new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate()
    );

    if (inicioFechaSeleccionada.getTime() < inicioHoy.getTime()) {
      return;
    }

    const esHoy = inicioFechaSeleccionada.getTime() === inicioHoy.getTime();

    if (esHoy) {
      if (esDiaCompleto) {
        const horaLimite = new Date(
          ahora.getFullYear(),
          ahora.getMonth(),
          ahora.getDate(),
          20, 0, 0
        );
        if (ahora >= horaLimite) return;
      } else {
        if (fechaSeleccionada <= ahora) return;
      }
    }

    const fechaFormulario = this.formatearFechaParametro(fechaSeleccionada);
    const fechaVisible = new Intl.DateTimeFormat('es-CR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(fechaSeleccionada);

    const resultado = await Swal.fire({
      title: 'Crear una cita',
      html: `Seleccionó el día <strong>${fechaVisible}</strong>.<br><br>¿Desea crear una cita para esta fecha?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear cita',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#15803d',
      cancelButtonColor: '#475569',
      reverseButtons: true,
      background: '#0f172a',
      color: '#f8fafc'
    });

    if (!resultado.isConfirmed) return;

    await this.router.navigate(['/citas/nueva'], {
      queryParams: {
        fecha: fechaFormulario,
        hora: esDiaCompleto ? null : this.formatearHoraParametro(fechaSeleccionada)
      }
    });
  }

  private formatearFechaParametro(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private formatearHoraParametro(fecha: Date): string {
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${horas}:${minutos}`;
  }
}