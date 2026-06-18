import { Routes } from "@angular/router";
import { MainLayout } from "./layout/main-layout/main-layout";
import { Home } from "./pages/home/home";
import { UsuariosList } from "./pages/usuarios/usuarios-list/usuarios-list";

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: Home, title: 'Inicio' },
            { path: 'admin/usuarios', component: UsuariosList, title: 'Gestión de usuarios' },
        ],
    },
    {
        path: '**',
        redirectTo: '',
    },
];
