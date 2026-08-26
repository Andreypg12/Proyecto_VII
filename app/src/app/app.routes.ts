import { Routes } from "@angular/router";
import { MainLayout } from "./layout/main-layout/main-layout";
import { Home } from "./pages/home/home";
import { NotFound } from './pages/not-found/not-found';

// Pages
import { CategoriaServicioList } from './pages/categoria-servicio/categoria-servicio-list/categoria-servicio-list';
import { CategoriaServicioDetail } from './pages/categoria-servicio/categoria-servicio-detail/categoria-servicio-detail';
import { EspecialidadList } from './pages/especialidades/especialidad-list/especialidad-list';
import { EspecialidadDetail } from './pages/especialidades/especialidad-detail/especialidad-detail';
import { UsuariosList } from './pages/usuarios/usuarios-list/usuarios-list';
import { UsuarioDetail } from './pages/usuarios/usuario-detail/usuario-detail';

import { ServicioList } from "./pages/servicios/servicio-list/servicio-list";
import { ServicioCreatePage } from "./pages/servicios/servicios-create-page/servicios-create-page";
import { ServicioEditPage } from "./pages/servicios/servicios-edit-page/servicios-edit-page";

import { ProfesionalesList } from "./pages/profesionales/profesionales-list/profesionales-list";
import { ProfesionalCreatePage } from "./pages/profesionales/profesionales-create-page/profesionales-create-page";
import { ProfesionalEditPage } from "./pages/profesionales/profesionales-edit-page/profesionales-edit-page";
import { ServicioDetail } from "./pages/servicios/servicio-detail/servicio-detail";
import { ProfesionalDetail } from "./pages/profesionales/profesional-detail/profesional-detail";

import { CitasList } from "./pages/citas/citas-list/citas-list";
import { CitaDetail } from "./pages/citas/cita-detail/cita-detail";
import { CitaCreate } from "./pages/citas/cita-create/cita-create";
import { CitaCreateComplete } from "./pages/citas/cita-create-complete/cita-create-complete";

import { Login } from './pages/usuarios/login/login';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Perfil } from './pages/usuarios/perfil/perfil';
import { Registro } from './pages/registro/registro';

import { Reportes } from './pages/reportes/reportes'

//Full calendar proceso
import { CitasAgenda } from './pages/citas/agenda/agenda';

export const routes: Routes = [

    {
        path: '',
        component: MainLayout,

        children: [

            // Inicio y autenticación
            { path: '', component: Home, title: 'Inicio' },
            { path: 'login', component: Login, title: 'Iniciar sesión | TechHire' },
            { path: 'registro', component: Registro, title: 'Crear cuenta | TechHire'},
            { path: 'perfil', component: Perfil, title: 'Mi perfil | TechHire', canActivate: [authGuard] },

            // Usuarios
            { path: 'usuarios', component: UsuariosList, title: 'Usuarios', canActivate: [authGuard, roleGuard(['ADMINISTRADOR'])] },
            { path: 'usuarios/:id', component: UsuarioDetail, title: 'Detalle usuario', canActivate: [authGuard, roleGuard(['ADMINISTRADOR'])] },

            // Categorías y servicios
            { path: 'categoria-servicio', component: CategoriaServicioList, title: 'Categorías de servicio', canActivate: [authGuard, roleGuard(['ADMINISTRADOR'])] },
            { path: 'categoria-servicio/:id', component: CategoriaServicioDetail, title: 'Detalle categoría servicio', canActivate: [authGuard, roleGuard(['ADMINISTRADOR'])] },

            // Especialidades
            { path: 'especialidades', component: EspecialidadList, title: 'Especialidades', canActivate: [authGuard, roleGuard(['ADMINISTRADOR', 'PROFESIONAL'])] },
            { path: 'especialidades/:id', component: EspecialidadDetail, title: 'Detalle especialidad', canActivate: [authGuard, roleGuard(['ADMINISTRADOR', 'PROFESIONAL'])] },

            // Servicios
            { path: 'servicios', component: ServicioList, title: 'Servicios' },
            { path: 'servicios/crear', component: ServicioCreatePage, title: 'Registrar servicio', canActivate: [authGuard, roleGuard(['PROFESIONAL'])] },
            { path: 'servicios/editar/:id', component: ServicioEditPage, title: 'Actualizar servicio', canActivate: [authGuard, roleGuard(['PROFESIONAL'])] },
            { path: 'servicios/:id', component: ServicioDetail, title: 'Servicio' },

            // Profesionales
            { path: 'profesionales', component: ProfesionalesList, title: 'Profesionales' },
            { path: 'profesionales/crear', component: ProfesionalCreatePage, title: 'Registrar profesional', canActivate: [authGuard, roleGuard(['ADMINISTRADOR','PROFESIONAL'])] },
            { path: 'profesionales/editar/:id', component: ProfesionalEditPage, title: 'Actualizar profesional', canActivate: [authGuard, roleGuard(['PROFESIONAL'])] },
            { path: 'profesionales/:id', component: ProfesionalDetail, title: 'Profesional' },

            // Citas
            { path: 'citas', component: CitasList, title: 'Citas', canActivate: [authGuard] },
            { path: 'citas/nueva', component: CitaCreate, title: 'Registrar cita', canActivate: [authGuard, roleGuard(['CLIENTE'])] },
            { path: 'citas/nueva/:servicioId', component: CitaCreateComplete, title: 'Reservar cita', canActivate: [authGuard, roleGuard(['CLIENTE'])] },
            { path: 'citas/agenda', component: CitasAgenda, title: 'Agenda FullCalendar', canActivate: [authGuard, roleGuard(['ADMINISTRADOR', 'PROFESIONAL'])] },
            { path: 'citas/:id', component: CitaDetail, title: 'Detalle de cita', canActivate: [authGuard] },

            // Reportes
            {path: 'reportes', component: Reportes, title: 'Reportes | TechHire', canActivate: [authGuard, roleGuard(['ADMINISTRADOR', 'PROFESIONAL'])]},
        ]
    },

    {path: '**', component: NotFound}
];