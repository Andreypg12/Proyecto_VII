export type Rol = 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';

export type EstadoUsuario = 'ACTIVO' | 'BLOQUEADO';

export interface Usuario {
    id: number;
    email: string;
    nombre: string;
    apellidos: string;
    rol: Rol;
    estado: EstadoUsuario;
    createdAt?: string;
    updateAt?: string;
}

export interface UsuarioCreateDto {
    email: string;
    nombre: string;
    apellidos: string;
    password: string;
    rol?: Rol;
}

export interface UsuarioUpdateDto {
    email?: string;
    nombre?: string;
    apellidos?: string;
    password?: string;
    rol?: Rol;
    estado?: EstadoUsuario;
}

export interface UsuarioConfiguracion {
    roles: Rol[];
    estados: EstadoUsuario[];
}