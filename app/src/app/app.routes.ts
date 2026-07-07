import { Routes } from "@angular/router";
import { MainLayout } from "./layout/main-layout/main-layout";
import { Home } from "./pages/home/home";
import { NotFound } from './pages/not-found/not-found';

//Pages
import { CategoriaServicioList } from './pages/categoria-servicio/categoria-servicio-list/categoria-servicio-list';
import { CategoriaServicioDetail } from './pages/categoria-servicio/categoria-servicio-detail/categoria-servicio-detail';
import { EspecialidadList } from './pages/especialidades/especialidad-list/especialidad-list';
import { EspecialidadDetail } from './pages/especialidades/especialidad-detail/especialidad-detail';
import { UsuariosList } from './pages/usuarios/usuarios-list/usuarios-list';
import { UsuarioDetail } from './pages/usuarios/usuario-detail/usuario-detail';

import { ServicioList } from "./pages/servicios/servicio-list/servicio-list";
import { ServicioCreatePage } from "./pages/servicios/servicios-create-page/servicios-create-page";

import { ProfesionalesList } from "./pages/profesionales/profesionales-list/profesionales-list";
import { ServicioEditPage } from "./pages/servicios/servicios-edit-page/servicios-edit-page";
import { ProfesionalCreatePage } from "./pages/profesionales/profesionales-create-page/profesionales-create-page";
import { ProfesionalEditPage } from "./pages/profesionales/profesionales-edit-page/profesionales-edit-page";

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: Home, title: 'Inicio' },
            { path: 'usuarios', component: UsuariosList, title: 'Usuarios' },
            { path: 'usuarios/:id', component: UsuarioDetail, title: 'Detalle usuario' },
            { path: 'categoria-servicio', component: CategoriaServicioList, title: 'Categorías de servicio' },
            { path: 'categoria-servicio/:id', component: CategoriaServicioDetail, title: 'Detalle categoría servicio' },
            { path: 'especialidades', component: EspecialidadList, title: 'Especialidades' },
            { path: 'especialidades/:id', component: EspecialidadDetail, title: 'Detalle especialidad' },
            {
                path: '',
                component: Home,
                title: 'Inicio'
            },
            {
                path: 'admin/usuarios',
                component: UsuariosList,
                title: 'Gestión de usuarios'
            },
            {
                path: 'categoria-servicio',
                component: CategoriaServicioList,
                title: 'Categorías de servicio'
            },
            {
                path: 'categoria-servicio/:id',
                component: CategoriaServicioDetail,
                title: 'Detalle categoría servicio'
            },
            {
                path: 'servicios',
                component: ServicioList,
                title: 'Servicios'
            },
            {
                path: 'servicios/crear',
                component: ServicioCreatePage,
                title: 'Registrar servicio'
            },
            {
                path: 'servicios/editar/:id',
                component: ServicioEditPage,
                title: 'Actualizar servicio'
            },
            {
                path: 'profesionales',
                component: ProfesionalesList,
                title: 'Profesionales'
            },
            {
                path: 'profesionales/crear',
                component: ProfesionalCreatePage,
                title: 'Actualizar profesional'
            },
            {
                path: 'profesionales/editar/:id',
                component: ProfesionalEditPage,
                title: 'Registrar profesional'
            },
        ],
    },
    {
        path: '**',
        component: NotFound,
    },
];
